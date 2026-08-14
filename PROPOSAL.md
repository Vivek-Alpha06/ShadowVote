# Product Proposal

<!--
  Fill each section in yourself — this is your product idea, in your words.
  The bracketed notes are prompts, not answers. Delete them as you go.
-->

## What is the product, and who uses it?

[I WILL FILL THIS IN]

<!-- Prompt: name the product, what it does in one or two sentences, and who
     specifically uses it (e.g. university student unions, DAO members, club
     committees). Be concrete about the user, not just the technology. -->

## Why Midnight specifically?

[I WILL FILL THIS IN — what does Midnight do that a transparent chain could not do well for this product?]

<!-- Prompt: the honest test is "what breaks on Ethereum?". For a secret ballot
     the answer is that every vote is permanently readable, so wallet history
     reveals political preference and coercion becomes possible. Midnight lets a
     voter PROVE their ballot is valid and unique without revealing the choice. -->

## Data Model

| Data Point | Type | Disclosed To |
|------------|------|--------------|
| [example] | Public ledger | Everyone |
| [example] | Private witness | No one |

[I WILL FILL IN THE ROWS]

<!-- Prompt: the rows below reflect what ShadowVote.compact actually does today.
     Verify them against the contract, edit freely, and delete this comment.

     | Election id, name, description   | Public ledger   | Everyone |
     | Candidate count, deadline, status| Public ledger   | Everyone |
     | Per-candidate tally, turnout     | Public ledger   | Everyone |
     | Organizer commitment (a hash)    | Public ledger   | Everyone |
     | Voter nullifier (per election)   | Public ledger   | Everyone (unlinkable) |
     | Voter secret key                 | Private witness | No one   |
     | Chosen candidate                 | Private input   | No one   |
     | Wallet ↔ ballot link             | Never recorded  | No one   |
-->

## Mainnet Feasibility

[I WILL FILL THIS IN — is this realistic to reach Mainnet by Level 6?]

<!-- Prompt: be honest about what is unfinished. Known gaps worth addressing:

     - Voter identity is currently per-BROWSER, not per-person: the secret key
       is generated locally, so a determined user can vote again from a fresh
       browser profile. Real elections need eligibility tied to something
       harder to duplicate.
     - No eligibility gating — anyone with a wallet can vote in any election.
     - Elections must be closed manually by the organizer; the contract has no
       time-triggered close.
-->
