// ===========================================================================
// ShadowVote on-chain client
// ---------------------------------------------------------------------------
// Deploys / joins the compiled ShadowVote.compact contract and drives its five
// circuits against the real network. Every state-changing call produces a real
// transaction hash.
//
// TWO THINGS WORTH KNOWING ABOUT THE CONTRACT'S SHAPE:
//
// 1. Candidate NAMES are not a ledger field — the contract stores only
//    `candidateCounts`. To keep all election data genuinely on-chain we pack
//    {description, candidates[]} as JSON into the `descriptions` map, which is
//    an `Opaque<'string'>` and so accepts arbitrary text. See packMeta/unpackMeta.
//
// 2. Reads are FREE. `getCandidateVotes` and `hasVoted` exist as circuits, but
//    calling them would cost a transaction. The same values are derivable from
//    public ledger state plus the pure circuits (`nullifier`, `tallyKey`), so
//    reads go through the indexer and never submit anything.
// ===========================================================================

import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
// Imported through midnight-js-protocol — the same specifier midnight-js's own
// types use. compact-js identifies contracts by a Symbol TypeId, so pulling it
// from a second specifier risks a duplicate module whose Symbol won't match
// ("Cannot read properties of undefined (reading 'Symbol()')").
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js/effect';
import {
  Contract,
  ledger as readLedger,
  pureCircuits,
  Status,
  type Ledger,
} from '../generated/shadowvote/index.js';
import type { Election, ElectionStatus } from '../types';

/** Key under which this dApp's private state is stored. */
export const PRIVATE_STATE_ID = 'shadowvote';

export interface ShadowVotePrivateState {
  readonly secretKey: Uint8Array;
}

/** The witness the circuit calls to obtain the voter's secret key. */
export const witnesses = {
  localSecretKey: ({
    privateState,
  }: {
    privateState: ShadowVotePrivateState;
  }): [ShadowVotePrivateState, Uint8Array] => [privateState, privateState.secretKey],
};

/** 32-byte voter secret, generated once and kept only in private state. */
export function createPrivateState(): ShadowVotePrivateState {
  return { secretKey: crypto.getRandomValues(new Uint8Array(32)) };
}

// --- on-chain metadata packing ---------------------------------------------

interface PackedMeta {
  d: string; // description
  c: string[]; // candidate names, index-ordered
  k?: string; // category ("kind") — optional, absent on pre-category elections
}

export function packMeta(
  description: string,
  candidates: string[],
  category?: string,
): string {
  return JSON.stringify({ d: description, c: candidates, k: category } satisfies PackedMeta);
}

export function unpackMeta(raw: string, candidateCount: number): PackedMeta {
  try {
    const parsed = JSON.parse(raw) as Partial<PackedMeta>;
    if (Array.isArray(parsed.c)) {
      return { d: parsed.d ?? '', c: parsed.c, k: parsed.k };
    }
  } catch {
    /* not JSON — an election created outside this UI */
  }
  // Fall back to positional labels so foreign elections still render.
  return {
    d: raw,
    c: Array.from({ length: candidateCount }, (_, i) => `Candidate ${i + 1}`),
  };
}

// --- deploy / join ----------------------------------------------------------

export type ShadowVoteContract = Awaited<ReturnType<typeof deployShadowVote>>;

/**
 * midnight-js 4.x takes a compact-js `CompiledContract`, NOT the generated
 * `new Contract(witnesses)` — the option is `compiledContract`. Passing the raw
 * generated class leaves compact-js's Effect context unresolved and fails deep
 * inside `getContractContext`.
 *
 * `withCompiledFileAssets` names where ZK artifacts live; in the browser the
 * FetchZkConfigProvider does the actual fetching from ZK_CONFIG_BASE, so this
 * is the relative tag that pairs with it.
 */
function compiledContract() {
  return CompiledContract.make('shadowvote', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets('shadowvote'),
  );
}

/**
 * The voter's persisted identity, or a new one on first use.
 *
 * This MUST be read back before falling back to `createPrivateState()`. The
 * secret key is the voter's whole identity: it derives the per-election
 * nullifier that prevents double voting, and the organizer commitment that
 * proves who may close an election.
 *
 * Passing a freshly generated key as `initialPrivateState` on every join minted
 * a NEW identity each session — so the same person could vote repeatedly (each
 * session produced a different nullifier), and lost the ability to close
 * elections they had created. Generating it is strictly a first-run action.
 */
async function persistedPrivateState(
  providers: MidnightProviders,
): Promise<ShadowVotePrivateState> {
  const existing = (await providers.privateStateProvider.get(
    PRIVATE_STATE_ID as never,
  )) as ShadowVotePrivateState | null;
  if (existing?.secretKey && existing.secretKey.length === 32) return existing;
  return createPrivateState();
}

export async function deployShadowVote(providers: MidnightProviders) {
  return deployContract(providers as never, {
    compiledContract: compiledContract(),
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: await persistedPrivateState(providers),
  } as never);
}

export async function joinShadowVote(providers: MidnightProviders, contractAddress: string) {
  return findDeployedContract(providers as never, {
    compiledContract: compiledContract(),
    contractAddress,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: await persistedPrivateState(providers),
  } as never);
}

/** Pull the deploy/call transaction hash out of whatever shape the SDK returns. */
export function txHashOf(result: unknown): string | null {
  const r = result as {
    public?: { txHash?: string; txId?: string };
    txHash?: string;
    deployTxData?: { public?: { txHash?: string } };
  };
  return (
    r?.deployTxData?.public?.txHash ?? r?.public?.txHash ?? r?.public?.txId ?? r?.txHash ?? null
  );
}

export function contractAddressOf(deployed: unknown): string | null {
  const d = deployed as {
    deployTxData?: { public?: { contractAddress?: string } };
    contractAddress?: string;
  };
  return d?.deployTxData?.public?.contractAddress ?? d?.contractAddress ?? null;
}

// --- reads (free — no transaction) ------------------------------------------

/** Fetch and decode the full public ledger state. */
export async function readState(
  providers: MidnightProviders,
  contractAddress: string,
): Promise<Ledger | null> {
  const state = await providers.publicDataProvider.queryContractState(contractAddress);
  return state ? readLedger(state.data) : null;
}

function toStatus(s: Status): ElectionStatus {
  return s === Status.CLOSED ? 'CLOSED' : 'OPEN';
}

/**
 * Project ledger state into the UI's Election shape.
 *
 * NOTE ON SEALED RESULTS: `endTimes` is on-chain, but the contract has no
 * time-triggered close — `statuses` only changes via closeElection. So an
 * election past its deadline is reported CLOSED here (and its results shown)
 * even though the ledger still says OPEN until someone closes it.
 */
export function toElections(l: Ledger): Election[] {
  const elections: Election[] = [];

  for (const [id, name] of l.names) {
    const idStr = id.toString();
    const candidateCount = Number(l.candidateCounts.member(id) ? l.candidateCounts.lookup(id) : 0n);
    const rawMeta = l.descriptions.member(id) ? l.descriptions.lookup(id) : '';
    const meta = unpackMeta(rawMeta, candidateCount);
    const endTime = Number(l.endTimes.member(id) ? l.endTimes.lookup(id) : 0n);
    const onChainStatus = l.statuses.member(id) ? toStatus(l.statuses.lookup(id)) : 'OPEN';

    elections.push({
      id: idStr,
      name,
      description: meta.d,
      // Elections created before categories existed carry no `k`; treat those
      // as plain elections rather than showing an empty badge.
      category: (meta.k as Election['category']) || 'election',
      candidates: Array.from({ length: candidateCount }, (_, index) => ({
        index,
        name: meta.c[index] ?? `Candidate ${index + 1}`,
      })),
      organizer: l.organizers.member(id) ? hex(l.organizers.lookup(id)) : '',
      createdAt: 0,
      endTime,
      // Deadline passed counts as closed for display, even if not yet on-chain.
      status: onChainStatus === 'CLOSED' || Date.now() >= endTime ? 'CLOSED' : 'OPEN',
      totalVotes: Number(l.totalVotes.member(id) ? l.totalVotes.lookup(id) : 0n),
    });
  }

  return elections.sort((a, b) => Number(b.id) - Number(a.id));
}

/** Per-candidate tallies, read straight from the public ledger. */
export function readTallies(l: Ledger, electionId: string, candidateCount: number): number[] {
  const id = BigInt(electionId);
  return Array.from({ length: candidateCount }, (_, i) => {
    const key = pureCircuits.tallyKey(id, BigInt(i));
    return l.tallies.member(key) ? Number(l.tallies.lookup(key)) : 0;
  });
}

/** Has this wallet's secret key already voted? Derived from the nullifier set. */
export function readHasVoted(l: Ledger, electionId: string, secretKey: Uint8Array): boolean {
  return l.voted.member(pureCircuits.nullifier(BigInt(electionId), secretKey));
}

/** Organizer commitment for a secret key — compare against `organizers`. */
export function organizerKeyHex(secretKey: Uint8Array): string {
  return hex(pureCircuits.organizerKey(secretKey));
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
