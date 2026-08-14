// Witness implementations for ShadowVote.
//
// A "witness" is the off-chain (private) counterpart to the `witness`
// declarations in shadowvote.compact. The circuit asks for the voter's
// secret key; this code supplies it from private state and it NEVER leaves
// the prover — only the derived nullifier is disclosed on-chain.

export type ShadowVotePrivateState = {
  readonly secretKey: Uint8Array; // 32 bytes
};

export const createPrivateState = (secretKey: Uint8Array): ShadowVotePrivateState => ({
  secretKey,
});

// The witness map must match the `witness` declarations in the contract.
// Signature convention: (context) => [newPrivateState, returnValue].
export const witnesses = {
  localSecretKey: ({
    privateState,
  }: {
    privateState: ShadowVotePrivateState;
  }): [ShadowVotePrivateState, Uint8Array] => [privateState, privateState.secretKey],
};
