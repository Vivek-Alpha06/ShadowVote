# ShadowVote

[![CI](https://github.com/Vivek-Alpha06/ShadowVote/actions/workflows/ci.yml/badge.svg)](https://github.com/Vivek-Alpha06/ShadowVote/actions/workflows/ci.yml)

> Tagline: Vote Privately. Verify Publicly. Privacy-preserving decentralized elections on the Midnight blockchain.

## Live Demo & Links
- **Live Preprod Demo:** [https://shadow-vote-frontend-one.vercel.app/](https://shadow-vote-frontend-one.vercel.app/)
- **Demo Video (MVP Walkthrough):** [https://youtu.be/F7ObiswjYpo](https://youtu.be/F7ObiswjYpo)
- **Product X (Twitter) Profile:** [https://x.com/shadow_vote](https://x.com/shadow_vote)

## Contract Address
- **Network:** Midnight Preprod
- **Contract Address:** `8e60d089f565d4aef839646e8c8c5443ff0f57f2d999e278fc714c2c7efc143d`

## License
This project is licensed under the [MIT License](LICENSE).

## What This Product Does
ShadowVote runs elections where nobody can see how you voted — not the organizer, not other voters, not anyone reading the chain — yet everyone can verify the result is correct.

A single contract manages many elections. Anyone with a wallet can create one (name, description, candidates, deadline) and anyone can vote in it exactly once. Vote counts accumulate publicly, but the link between a voter and their choice is never written down anywhere.

The problem it solves: on ordinary public blockchains, every vote is readable forever, so wallet history reveals political preference and coercion becomes possible. Universities, DAOs, clubs, and communities need secret ballots, which a transparent ledger cannot provide on its own. Midnight lets a voter prove their ballot is valid and unique without revealing their choice.

## Privacy Model
- **What is PUBLIC (on-chain, anyone can see):**
  - Election id, name, description, candidate count, deadline, and status (OPEN/CLOSED).
  - Per-candidate vote tallies and total turnout.
  - The organizer's commitment — a hash, not an address.
  - One opaque nullifier per voter per election.
- **What is PRIVATE (private witness, never on-chain):**
  - The voter's secret key — supplied by the `localSecretKey()` witness, which lives only in the prover and browser-local private state.
  - Which candidate the voter chose — a private circuit input.
  - Any link between the wallet address and the ballot.
- **What the user PROVES without revealing:**
  - *"I am eligible, I have not already voted in this election, and my vote is for a valid candidate"* — without revealing who they are or who they voted for.

## Tech Stack
- **Blockchain:** Midnight Preprod
- **Contract Language:** Compact `0.23` (compiler `0.31.1`)
- **Runtime:** Node.js 22+, Docker (proof server)
- **SDK:** `@midnight-ntwrk/midnight-js` 4.1.1, `compact-runtime` 0.16.0, `ledger-v8`
- **Wallet:** Lace (Midnight-enabled), via the DApp connector API v4
- **Frontend:** React 18, Vite 5, TypeScript, TailwindCSS, Framer Motion
- **Tests:** Vitest, driving the compiled contract through the compact-runtime simulator

## Prerequisites
- **Lace wallet:** Midnight-enabled browser extension, set to the target network (Preprod or Preview).
- **Node.js v22:** Verify with `node --version`.
- **Docker:** Required to run the local proof server.
- **Compact compiler:** Install the toolchain to compile Compact files.

## Setup & Run Locally
1. Clone and install dependencies:
   ```bash
   git clone https://github.com/Vivek-Alpha06/ShadowVote.git
   cd ShadowVote
   npm install
   ```
2. Install the Compact compiler:
   ```bash
   curl --proto '=https' --tlsv1.2 -LsSf \
     https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
   # Restart your terminal or source profile, then update:
   compact update
   ```
3. Compile the contract:
   ```bash
   npm run compile
   ```
4. Start the local proof server (Docker must be running):
   ```bash
   docker run -d -p 6300:6300 --name shadowvote-proof \
     midnightntwrk/proof-server:latest midnight-proof-server -v
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Run Tests
Run the contract test suite driving the real compiled circuits through the simulator:
```bash
npm test --workspace contract
```

## CI/CD
GitHub Actions runs on every push to `main` and pull requests.
- **Contract Job:** Installs the Compact compiler, compiles the contract, verifies ZK assets, and runs the Vitest suite.
- **Frontend Job:** Type-checks and builds the React frontend, verifying build artifacts.

## Usage Guide
See [docs/USAGE.md](docs/USAGE.md) for a step-by-step user walkthrough.
