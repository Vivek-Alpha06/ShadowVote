# Product Proposal

<!--
  Fill each section in yourself — this is your product idea, in your words.
  The bracketed notes are prompts, not answers. Delete them as you go.
-->

## What is the product, and who uses it?

ShadowVote is a decentralized, privacy-preserving voting system built on Midnight, enabling secure and transparent elections while protecting voter anonymity. It is designed for organizations, universities, DAOs, and any group needing to conduct fair elections without compromising participant privacy.

<!-- Prompt: name the product, what it does in one or two sentences, and who
     specifically uses it (e.g. university student unions, DAO members, club
     committees). Be concrete about the user, not just the technology. -->

## Why Midnight specifically?

On a fully transparent blockchain like Cardano or Ethereum, a secret ballot is impossible. Every transaction, input, and state change is public. If a voting application registers votes on-chain, anyone can link the voter's wallet address to their choice of candidate by analyzing transaction history. This violates voter privacy, makes coercion and vote-buying possible, and exposes political preferences permanently. 

Midnight solves this by separating the public ledger state from private witnesses. The voter can generate a zero-knowledge proof locally in their browser showing that they own an eligible credential and have not already voted (by presenting a unique, unlinkable nullifier), while their choice of candidate and their wallet identity remain entirely private. The contract only updates the public ledger with the incremented tallies and the voter's nullifier, keeping the ballot completely secret.

## Data Model

| Data Point | Type | Disclosed To |
|------------|------|--------------|
| Election details (ID, name, description, candidates) | Public ledger | Everyone |
| Election status (open/closed) and timing | Public ledger | Everyone |
| Aggregate results (tally per candidate) | Public ledger | Everyone |
| Vote counts and turnout metrics | Public ledger | Everyone |
| Organizer commitment hash | Public ledger | Everyone |
| Voter eligibility list (e.g., token holders, addresses) | Public ledger | Everyone (pseudonymous) |
| Voter nullifier (per election) | Public ledger | Everyone (unlinkable) |
| Encrypted ballot data | Private input | Only recipient |
| Wallet-to-ballot link | Never recorded | No one |
| Private secret key and credentials | Private witness | No one |

Yes, achieving Mainnet readiness by Level 6 is realistic. The core anonymous voting and nullifier verification logic is already implemented, fully compiled, and successfully tested. 

However, to transition from our current MVP to a production-ready Mainnet deployment, we will address the following known gaps:
1. **Eligibility Gating:** Currently, any wallet with DUST can cast a vote in any election. For a real-world election, we will integrate a system of whitelist credentials (e.g., token-based gating or signed organizer certificates) that voters must prove possession of.
2. **Robust Identity Verification:** At present, the voter's secret key is generated locally per-browser, allowing a user to potentially vote multiple times using different browser profiles. For Mainnet, we aim to bind eligibility to unique Midnight identities or external decentralized identifiers (DIDs).
3. **Automated Closing and Time Gating:** Currently, elections are closed manually by the organizer. We will explore time-triggered close gates or validator-supported oracle inputs to enforce election deadlines on-chain without requiring manual organizer intervention.

These improvements can be incrementally added to the contract and dApp architecture before Level 6.
