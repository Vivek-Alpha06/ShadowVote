// ===========================================================================
// ShadowVote contract service — ON-CHAIN
// ---------------------------------------------------------------------------
// Every method here talks to the deployed ShadowVote.compact contract on
// Midnight. There is no local store and no simulation: writes submit real
// transactions (and return their hashes), reads query the public ledger
// through the indexer.
//
// Reads are free. `getCandidateVotes` and `hasVoted` exist as circuits, but
// calling them would cost a transaction for information already derivable from
// public ledger state plus the pure circuits — so they go through the indexer.
//
// Privacy: the candidate choice is a private circuit input. On-chain a voter
// appears only as `nullifier(electionId, secretKey)`, unlinkable to their
// wallet, which is also what prevents double voting.
// ===========================================================================

import type {
  CreateElectionInput,
  Election,
  ElectionResults,
  CandidateResult,
} from '../types';
import { requireSession, getSession } from './chainSession';
import { addTxRecord } from './txHistory';

// The Midnight SDK (WASM + Node-oriented deps) is loaded ON DEMAND. A static
// import would pull the whole stack into the initial bundle, so any failure in
// it would blank the entire app before React mounts. Loading it lazily means
// the UI always renders and SDK problems surface at the point of use.
type ChainModule = typeof import('./shadowvoteChain');
let chainModule: ChainModule | null = null;

async function chain(): Promise<ChainModule> {
  if (!chainModule) chainModule = await import('./shadowvoteChain');
  return chainModule;
}

async function latestSubmittedHash(): Promise<string | null> {
  const { submittedTxHashes } = await import('./midnightProviders');
  return submittedTxHashes[0] ?? null;
}

/** Transaction hashes produced by this app, newest first. */
export interface TxRecord {
  hash: string;
  action: string;
  at: number;
}

export const txLog: TxRecord[] = [];

function recordTx(action: string, hash: string | null, electionId?: string): string | null {
  if (!hash) return null;
  const at = Date.now();
  txLog.unshift({ hash, action, at });

  // Also persist it. The in-memory log above dies with the tab, and a
  // transaction hash is the one durable receipt a user has that their vote
  // really happened — it must survive a reload.
  const session = getSession();
  addTxRecord(session?.info.coinPublicKey, {
    hash,
    action,
    at,
    networkId: session?.info.config.networkId,
    electionId,
  });
  return hash;
}

/**
 * Refuse a write the wallet cannot pay for, BEFORE proving it.
 *
 * Without this the sequence is: ~7s generating a proof, ~12s round-tripping the
 * wallet, then an opaque `Wallet.InsufficientFunds` from deep inside the
 * balancer. Checking first turns twenty wasted seconds into an immediate,
 * actionable message.
 *
 * Note this guards WRITES only. Reads and joining cost nothing and must never
 * be gated on funds — doing that once made the whole app look empty to anyone
 * without DUST.
 */
async function assertCanPay(): Promise<void> {
  const { api } = requireSession();
  const { assertCanPayFees } = await import('./midnightProviders');
  await assertCanPayFees(api);
}

/**
 * Turn the balancer's opaque dust failure into something a user can act on.
 *
 * The SDK surfaces `Wallet.InsufficientFunds / "could not balance dust"` from
 * inside an Effect fiber, which reaches the UI as a wall of `_id=FiberFailure`
 * noise. Worse, it is genuinely confusing: the RECORDED fee for these
 * transactions is 0-1 units, yet balancing fails — because the wallet reserves
 * a margin far above the final fee before it will sign.
 *
 * Deliberately NOT a pre-emptive threshold check: any number picked here would
 * be a guess, and guessing high would block transactions that would have
 * succeeded. Reacting to the real failure cannot produce a false block.
 */
async function withDustDiagnostics<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    const text = err instanceof Error ? err.message : String(err);
    if (!/insufficient\s*fund|could not balance dust/i.test(text)) throw err;

    const { api } = requireSession();
    const { readFunds } = await import('./midnightProviders');
    const funds = await readFunds(api).catch(() => null);

    throw new Error(
      'Not enough DUST to pay for this transaction yet.\n\n' +
        (funds
          ? `Your balance: ${funds.dust.toLocaleString()} DUST ` +
            `(capacity ${funds.dustCap.toLocaleString()}).\n\n`
          : '') +
        'This is a timing problem, not a broken wallet. DUST regenerates ' +
        'continuously from the NIGHT you have registered, and the wallet reserves ' +
        'a margin well above the actual fee before it will sign — so a low balance ' +
        'fails even though the fee itself is tiny.\n\n' +
        'Wait a few minutes for more DUST to accrue, then try again.',
    );
  }
}

/** Circuit callers live under `.callTx` on a deployed contract. */
function circuits(): Record<string, (...args: unknown[]) => Promise<unknown>> {
  const { contract } = requireSession();
  const c = contract as { callTx?: Record<string, (...a: unknown[]) => Promise<unknown>> };
  if (!c.callTx) throw new Error('Deployed contract exposes no callTx interface');
  return c.callTx;
}

async function ledgerState() {
  const { providers, contractAddress } = requireSession();
  const { readState } = await chain();
  const l = await readState(providers, contractAddress);
  if (!l) throw new Error('Contract state not found on chain — is the address correct?');
  return l;
}

/**
 * Reads run on every page, including before a contract is joined. Returning
 * empty there keeps the UI usable (and lets ChainPanel prompt to deploy)
 * instead of throwing on mount. Writes still throw — see requireSession().
 */
async function ledgerStateOrNull() {
  if (!getSession()) return null;
  return ledgerState();
}

function computeResults(election: Election, tallies: number[]): ElectionResults {
  const revealed = election.status === 'CLOSED';

  if (!revealed) {
    return {
      electionId: election.id,
      totalVotes: election.totalVotes,
      status: election.status,
      endTime: election.endTime,
      revealed: false,
      results: null,
      winner: null,
    };
  }

  const results: CandidateResult[] = election.candidates.map((c) => ({
    index: c.index,
    name: c.name,
    votes: tallies[c.index] ?? 0,
  }));
  const sorted = [...results].sort((a, b) => b.votes - a.votes);
  const top = sorted[0];
  const tied = sorted.length > 1 && sorted[1].votes === top?.votes;

  return {
    electionId: election.id,
    totalVotes: election.totalVotes,
    status: election.status,
    endTime: election.endTime,
    revealed: true,
    results,
    winner: !top || top.votes === 0 || tied ? null : top,
  };
}

export const contractService = {
  /** True once a wallet is connected and a contract deployed/joined. */
  isReady(): boolean {
    return getSession() !== null;
  },

  async listElections(): Promise<Election[]> {
    const l = await ledgerStateOrNull();
    if (!l) return [];
    return (await chain()).toElections(l);
  },

  async getElection(id: string): Promise<Election | null> {
    const l = await ledgerStateOrNull();
    if (!l) return null;
    return (await chain()).toElections(l).find((e) => e.id === id) ?? null;
  },

  /** Submits a real transaction. Open to any connected wallet. */
  async createElection(input: CreateElectionInput, _wallet: string): Promise<Election> {
    const candidates = input.candidateNames.map((n) => n.trim()).filter(Boolean);
    if (candidates.length < 2) throw new Error('An election needs at least two candidates');
    if (input.endTime <= Date.now()) throw new Error('End time must be in the future');
    await assertCanPay();

    // Candidate names are not a ledger field, so pack them (with the
    // description) into the `descriptions` map, which accepts arbitrary text.
    const { packMeta, txHashOf, toElections } = await chain();
    const result = await withDustDiagnostics(() =>
      circuits().createElection(
        input.name.trim(),
        packMeta(input.description.trim(), candidates, input.category),
        BigInt(candidates.length),
        // MILLISECONDS, deliberately. The app stores and reads this field as a
        // JS epoch in ms throughout: `toElections` passes the ledger value
        // straight through and compares it with `Date.now()`. Do not
        // "helpfully" convert to seconds — that yields dates in 1970 and marks
        // every election expired.
        BigInt(Math.floor(input.endTime)),
      ),
    );

    recordTx('Create election', txHashOf(result) ?? (await latestSubmittedHash()));

    // The circuit returns the new id; fall back to the newest on-chain entry.
    const returned = (result as { public?: { result?: bigint } })?.public?.result;
    const elections = toElections(await ledgerState());
    const id = returned !== undefined ? returned.toString() : (elections[0]?.id ?? '');
    const created = elections.find((e) => e.id === id);
    if (!created) throw new Error('Election was submitted but could not be read back yet.');
    return created;
  },

  /** Free read — derived from the on-chain nullifier set. */
  async hasVoted(electionId: string, _wallet: string): Promise<boolean> {
    const s = getSession();
    if (!s) return false;
    const { readHasVoted } = await chain();
    return readHasVoted(await ledgerState(), electionId, s.secretKey);
  },

  /** Submits a real transaction; the candidate choice stays a private input. */
  async castVote(electionId: string, candidateIndex: number, _wallet: string): Promise<void> {
    await assertCanPay();
    const { txHashOf } = await chain();
    const result = await withDustDiagnostics(() =>
      circuits().castVote(BigInt(electionId), BigInt(candidateIndex)),
    );
    recordTx('Cast vote', txHashOf(result) ?? (await latestSubmittedHash()), electionId);
  },

  /**
   * Submits a real transaction. The CONTRACT enforces organizer-only here —
   * a non-organizer's transaction will be rejected by the circuit's assert.
   */
  async closeElection(electionId: string, _wallet: string): Promise<void> {
    const { txHashOf } = await chain();
    const result = await circuits().closeElection(BigInt(electionId));
    recordTx('Close election', txHashOf(result) ?? (await latestSubmittedHash()));
  },

  async getResults(electionId: string): Promise<ElectionResults | null> {
    const l = await ledgerStateOrNull();
    if (!l) return null;
    const { toElections, readTallies } = await chain();
    const election = toElections(l).find((e) => e.id === electionId);
    if (!election) return null;
    return computeResults(election, readTallies(l, electionId, election.candidates.length));
  },

  /**
   * Compares the on-chain organizer commitment against this wallet's key.
   * Synchronous by necessity (called during render), so it uses the already
   * resolved chain module and returns false until that module has loaded.
   */
  isOrganizer(election: Election, _wallet: string): boolean {
    const s = getSession();
    if (!s || !chainModule) return false;
    return election.organizer === chainModule.organizerKeyHex(s.secretKey);
  },
};
