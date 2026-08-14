import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum Status { OPEN = 0, CLOSED = 1 }

export type Witnesses<PS> = {
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  createElection(context: __compactRuntime.CircuitContext<PS>,
                 name_0: string,
                 description_0: string,
                 candidateCount_0: bigint,
                 endTime_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  castVote(context: __compactRuntime.CircuitContext<PS>,
           electionId_0: bigint,
           candidateIndex_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeElection(context: __compactRuntime.CircuitContext<PS>,
                electionId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getCandidateVotes(context: __compactRuntime.CircuitContext<PS>,
                    electionId_0: bigint,
                    candidateIndex_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  hasVoted(context: __compactRuntime.CircuitContext<PS>, electionId_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type ProvableCircuits<PS> = {
  createElection(context: __compactRuntime.CircuitContext<PS>,
                 name_0: string,
                 description_0: string,
                 candidateCount_0: bigint,
                 endTime_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  castVote(context: __compactRuntime.CircuitContext<PS>,
           electionId_0: bigint,
           candidateIndex_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeElection(context: __compactRuntime.CircuitContext<PS>,
                electionId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getCandidateVotes(context: __compactRuntime.CircuitContext<PS>,
                    electionId_0: bigint,
                    candidateIndex_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  hasVoted(context: __compactRuntime.CircuitContext<PS>, electionId_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
  organizerKey(sk_0: Uint8Array): Uint8Array;
  nullifier(electionId_0: bigint, sk_0: Uint8Array): Uint8Array;
  tallyKey(electionId_0: bigint, candidateIndex_0: bigint): Uint8Array;
}

export type Circuits<PS> = {
  organizerKey(context: __compactRuntime.CircuitContext<PS>, sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  nullifier(context: __compactRuntime.CircuitContext<PS>,
            electionId_0: bigint,
            sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  tallyKey(context: __compactRuntime.CircuitContext<PS>,
           electionId_0: bigint,
           candidateIndex_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  createElection(context: __compactRuntime.CircuitContext<PS>,
                 name_0: string,
                 description_0: string,
                 candidateCount_0: bigint,
                 endTime_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  castVote(context: __compactRuntime.CircuitContext<PS>,
           electionId_0: bigint,
           candidateIndex_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeElection(context: __compactRuntime.CircuitContext<PS>,
                electionId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getCandidateVotes(context: __compactRuntime.CircuitContext<PS>,
                    electionId_0: bigint,
                    candidateIndex_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  hasVoted(context: __compactRuntime.CircuitContext<PS>, electionId_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
  readonly electionCount: bigint;
  names: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): string;
    [Symbol.iterator](): Iterator<[bigint, string]>
  };
  descriptions: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): string;
    [Symbol.iterator](): Iterator<[bigint, string]>
  };
  candidateCounts: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): bigint;
    [Symbol.iterator](): Iterator<[bigint, bigint]>
  };
  endTimes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): bigint;
    [Symbol.iterator](): Iterator<[bigint, bigint]>
  };
  statuses: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Status;
    [Symbol.iterator](): Iterator<[bigint, Status]>
  };
  organizers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Uint8Array;
    [Symbol.iterator](): Iterator<[bigint, Uint8Array]>
  };
  totalVotes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): bigint;
    [Symbol.iterator](): Iterator<[bigint, bigint]>
  };
  tallies: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  voted: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
