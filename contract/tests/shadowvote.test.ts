// ShadowVote contract tests.
//
// These drive the COMPILED contract through the compact-runtime simulator, so
// they exercise the real circuits and real ledger transitions — no mocks. They
// require `npm run compile` to have produced `managed/shadowvote` first.
//
// Run: npm test  (from the contract/ workspace)

import { describe, it, expect, beforeAll } from 'vitest';
import { randomBytes } from 'node:crypto';
import {
  createConstructorContext,
  createCircuitContext,
  sampleContractAddress,
  type CircuitContext,
} from '@midnight-ntwrk/compact-runtime';

import { Contract, ledger, pureCircuits } from '../managed/shadowvote/contract/index.js';
import { witnesses, createPrivateState, type ShadowVotePrivateState } from '../src/witnesses.js';

/** Zswap coin public key — irrelevant to these circuits, but required by the context. */
const COIN_PUBLIC_KEY = '0'.repeat(64);

/**
 * A single voter's view of the contract.
 *
 * The private state (their secret key) is what makes each simulator distinct:
 * it is the witness the circuits read, and it never appears on-chain.
 */
class Voter {
  readonly contract = new Contract<ShadowVotePrivateState>(witnesses);
  context: CircuitContext<ShadowVotePrivateState>;

  constructor(
    readonly address: string,
    secretKey: Uint8Array,
    /** Reuse another voter's ledger to share one election between voters. */
    sharedState?: unknown,
  ) {
    const initial = this.contract.initialState(
      createConstructorContext(createPrivateState(secretKey), COIN_PUBLIC_KEY),
    );
    this.context = createCircuitContext(
      address,
      COIN_PUBLIC_KEY,
      (sharedState ?? initial.currentContractState) as never,
      initial.currentPrivateState,
    );
  }

  /** Public ledger state as the chain would see it. */
  get ledger() {
    return ledger(this.context.currentQueryContext.state);
  }

  createElection(name: string, description: string, candidates: bigint, endTime: bigint): bigint {
    const r = this.contract.impureCircuits.createElection(
      this.context,
      name,
      description,
      candidates,
      endTime,
    );
    this.context = r.context;
    return r.result;
  }

  castVote(electionId: bigint, candidateIndex: bigint): void {
    const r = this.contract.impureCircuits.castVote(this.context, electionId, candidateIndex);
    this.context = r.context;
  }

  closeElection(electionId: bigint): void {
    const r = this.contract.impureCircuits.closeElection(this.context, electionId);
    this.context = r.context;
  }

  /** Adopt another voter's ledger, so both act on the same public state. */
  syncFrom(other: Voter): void {
    this.context = createCircuitContext(
      this.address,
      COIN_PUBLIC_KEY,
      other.context.currentQueryContext.state as never,
      this.context.currentPrivateState,
    );
  }
}

const ADDRESS = sampleContractAddress();
const ALICE_KEY = randomBytes(32);
const BOB_KEY = randomBytes(32);
const FUTURE = BigInt(Date.now() + 60 * 60 * 1000);

const newVoter = (key: Uint8Array) => new Voter(ADDRESS, key);

describe('ShadowVote contract', () => {
  let alice: Voter;

  beforeAll(() => {
    alice = newVoter(ALICE_KEY);
  });

  it('creates an election with >= 2 candidates and returns a monotonic id', () => {
    const id = alice.createElection('Test election', 'desc', 3n, FUTURE);
    expect(id).toBe(1n);

    const l = alice.ledger;
    expect(l.names.lookup(id)).toBe('Test election');
    expect(l.candidateCounts.lookup(id)).toBe(3n);
    expect(l.totalVotes.lookup(id)).toBe(0n);
    // Status is an enum; OPEN is the zero value.
    expect(Number(l.statuses.lookup(id))).toBe(0);

    // Ids increment rather than being caller-supplied.
    const second = alice.createElection('Second', 'desc', 2n, FUTURE);
    expect(second).toBe(2n);
  });

  it('rejects an election with fewer than two candidates', () => {
    expect(() => alice.createElection('Too few', 'desc', 1n, FUTURE)).toThrow(
      /at least two candidates/i,
    );
  });

  it('prevents the same voter from voting twice in one election', () => {
    const voter = newVoter(ALICE_KEY);
    const id = voter.createElection('Double vote check', 'desc', 3n, FUTURE);

    voter.castVote(id, 1n);
    expect(voter.ledger.totalVotes.lookup(id)).toBe(1n);

    // The nullifier is now in `voted`, so a second attempt must fail.
    expect(() => voter.castVote(id, 2n)).toThrow(/already voted/i);
    expect(voter.ledger.totalVotes.lookup(id)).toBe(1n);
  });

  it('rejects a vote for a candidate index outside the election', () => {
    const voter = newVoter(ALICE_KEY);
    const id = voter.createElection('Range check', 'desc', 2n, FUTURE);
    // Valid indices are 0 and 1.
    expect(() => voter.castVote(id, 2n)).toThrow(/invalid candidate/i);
  });

  it('keeps the voter→candidate link private while tallies stay public', () => {
    const a = newVoter(ALICE_KEY);
    const id = a.createElection('Privacy check', 'desc', 2n, FUTURE);
    a.castVote(id, 0n);

    const b = newVoter(BOB_KEY);
    b.syncFrom(a);
    b.castVote(id, 0n);

    const l = b.ledger;

    // PUBLIC: the tally is visible and correct.
    expect(l.tallies.lookup(pureCircuits.tallyKey(id, 0n))).toBe(2n);
    expect(l.totalVotes.lookup(id)).toBe(2n);

    // PRIVATE: two voters appear only as two opaque nullifiers. Nothing on the
    // ledger maps a nullifier to a candidate index — the `voted` set is the
    // ONLY per-voter record, and it carries no choice.
    const nullifiers = [...l.voted];
    expect(nullifiers).toHaveLength(2);

    const aliceNul = pureCircuits.nullifier(id, ALICE_KEY);
    const bobNul = pureCircuits.nullifier(id, BOB_KEY);
    expect(l.voted.member(aliceNul)).toBe(true);
    expect(l.voted.member(bobNul)).toBe(true);

    // A nullifier is unlinkable to the secret that produced it: the same voter
    // gets a DIFFERENT nullifier in a different election, so votes cannot be
    // correlated across elections.
    const otherElection = pureCircuits.nullifier(id + 1n, ALICE_KEY);
    expect(Buffer.from(otherElection).equals(Buffer.from(aliceNul))).toBe(false);

    // And the secret key itself never reaches the ledger.
    const serialized = JSON.stringify([...l.voted].map((n) => Buffer.from(n).toString('hex')));
    expect(serialized).not.toContain(Buffer.from(ALICE_KEY).toString('hex'));
  });

  it('only lets the organizer close an election', () => {
    const organizer = newVoter(ALICE_KEY);
    const id = organizer.createElection('Close check', 'desc', 2n, FUTURE);

    const stranger = newVoter(BOB_KEY);
    stranger.syncFrom(organizer);
    expect(() => stranger.closeElection(id)).toThrow(/only the organizer/i);

    organizer.closeElection(id);
    expect(Number(organizer.ledger.statuses.lookup(id))).toBe(1); // CLOSED

    // A closed election accepts no further votes.
    const late = newVoter(BOB_KEY);
    late.syncFrom(organizer);
    expect(() => late.castVote(id, 0n)).toThrow(/closed/i);
  });
});
