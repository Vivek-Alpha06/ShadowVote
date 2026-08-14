# How to Use ShadowVote

Run a secret ballot where nobody can see how you voted, but everybody can check
the result.

---

## What You Need

| | |
|---|---|
| **A browser** | Chrome or a Chromium browser |
| **The Lace wallet** | The Midnight-enabled extension, set to the **Preview** network |
| **tNIGHT** | Free test tokens from the Preview faucet |
| **DUST** | Generated from your tNIGHT — see step 2, this is the step people miss |

There is no account to create and no email to give. Your wallet is your login.

---

## Step-by-Step Guide

### 1. Get test tokens

Open the Preview faucet and request tNIGHT for your wallet's **unshielded**
address (it starts with `mn_addr_preview…`). These are test tokens with no real
value.

### 2. Turn your tNIGHT into DUST

This is the step that trips most people up.

**Holding tNIGHT is not enough to do anything.** Transaction fees are paid in
DUST, and DUST is *generated* by NIGHT that you have registered for the purpose.
In Lace, register your NIGHT for DUST generation, then wait — DUST accrues
gradually rather than appearing at once.

If a vote fails saying it cannot pay a fee, this is almost always why. Wait a
little longer and try again.

### 3. Connect your wallet

Open the app and click **Connect Wallet**. Approve the request in Lace.

Your address appears in the top right once connected. The app then attaches to
the voting contract automatically — that step is free and does not ask you to
sign anything.

### 4. Browse the elections

The **Elections** page lists everything running. You can filter by *Active* or
*Ended*, and by type — election, survey, poll, referendum, governance.

**Browsing costs nothing.** You can read every election, every tally and every
result without a wallet, without tokens, and without signing anything.

### 5. Create your own vote (optional)

Click **+ Create** and fill in:

- **Type** — election, survey, poll, and so on. Cosmetic; every type behaves identically.
- **Name and description** — public, so keep anything sensitive out of them.
- **Candidates** — at least two.
- **Voting window** — how long voting stays open.

Click **Create Election** and approve in your wallet. This submits a real
transaction.

### 6. Cast your vote

Open an election, pick your candidate, and confirm.

You will see **"Generating zero-knowledge proof…"**. Your browser is building a
mathematical proof that your vote is valid, *without* including your choice in
anything that gets published. Then your wallet asks you to sign.

Once it lands, the turnout goes up by one. Nothing anywhere records that *you*
chose *that* candidate.

You can vote **once per election**. A second attempt is rejected by the
contract.

### 7. Close an election and see results

Per-candidate results stay sealed while voting is open — a live running count
pressures late voters and, in a small election, can expose them by comparing
readings.

Only the wallet that **created** an election can close it. Once closed, the full
tally and winner become public.

### 8. Verify anything

Go to **History** to see every transaction your wallet has made, each with a
**Verify on explorer ↗** link. That opens the public block explorer, where
anyone can confirm your transaction is real. The contract itself is linked in
the footer.

You never have to take the app's word for anything.

---

## What Gets Proved (and What Stays Private)

When you vote, you prove three things at once:

1. You know a valid voter secret
2. You have **not** already voted in this election
3. Your choice is one of the real candidates

**Anyone can see:**

- That an election exists, and its name, description, candidates and deadline
- That *a* vote was cast, and the total number of votes
- The final tally and winner after closing
- An anonymous **nullifier** — a one-way fingerprint of (this election, this voter)

**Nobody can see:**

- Which candidate you chose
- Which wallet cast which vote
- Your voting history across elections

The nullifier is what makes this work. It is the same value every time *you*
vote in *this* election, so a second vote is caught — but it is a completely
different value in every other election, so your ballots cannot be linked
together, and it cannot be traced back to your wallet.

---

## Troubleshooting

**"No DUST to pay the transaction fee"**
Register your NIGHT for DUST generation in Lace and wait for it to accrue. DUST
fills gradually. Holding NIGHT alone pays no fees.

**The app shows no elections**
Check that Lace is on **Preview**. A contract address only exists on the network
it was deployed to, so a wallet on another network has nothing to read.

**Wallet connect does nothing, or hangs**
Reload the page. If the wallet was mid-request when something interrupted it,
its message channel can wedge, and only a reload clears it.

**"Only the organizer can close this election"**
Closing is restricted to the wallet that created the election, because closing
publishes the tally.

**"This wallet has already voted in this election"**
Working as intended — one vote per voter per election.

**A vote seems stuck after signing**
Check **History**. If the transaction is listed, it went through and the display
is just behind; open the explorer link to confirm it on-chain.

**The proof is slow**
Normal. Proof generation takes a few seconds and runs entirely on your machine —
that local work is exactly what keeps your choice private.
