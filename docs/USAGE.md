# How to Use ShadowVote

Run a secret ballot where nobody can see how you voted, but everybody can check
the result.

---

## What You Need

| | |
|---|---|
| **A browser** | Chrome or a Chromium browser |
| **The Lace wallet** | The Midnight-enabled extension, set to the **Preprod** network |
| **tNIGHT** | Free test tokens from the Midnight faucet |
| **DUST** | Generated from your tNIGHT — see step 2, this is the step people miss |

There is no account to create and no email to give. Your wallet is your login.

---

## Getting Started on Preprod

The short version, for anyone who just wants to get in. Each point expands
into a full step further down.

| | What to do | Costs anything? |
|---|---|---|
| 1 | Install **Lace** (the Midnight-enabled build) in Chrome. | No |
| 2 | Switch Lace's network to **Preprod**. | No |
| 3 | Copy your **unshielded** address (`mn_addr_…`) and faucet some **tNIGHT**. | No — test tokens, no real value |
| 4 | In Lace, **register your NIGHT for DUST generation**, then wait a few minutes. | No |
| 5 | Open the [live demo](https://shadow-vote-frontend-one.vercel.app/) and click **Connect Wallet**. | No |
| 6 | Vote in an election. | A small DUST fee |

**Why Preprod, and why it matters.** A contract only exists on the network it
was deployed to. ShadowVote lives on Preprod at
`8e60d089f565d4aef839646e8c8c5443ff0f57f2d999e278fc714c2c7efc143d`, so a wallet
pointed at any other network will load the app and show you nothing at all —
no error, just an empty list. If the Elections page looks bare, check the
network selector in Lace first.

**Preprod is a test network.** The tokens have no value, and nothing here
touches real money. Use a wallet you created for testing.

**What is free and what is not.** Reading costs nothing: every election,
tally and result is public and readable with no wallet connected at all.
Connecting a wallet is free too, and so is attaching to the contract. You only
pay a fee when you write to the chain — creating an election, casting a vote,
or closing one.

---

## Step-by-Step Guide

### 1. Get test tokens

Open the Midnight faucet and request tNIGHT for your wallet's **unshielded**
address (it starts with `mn_addr_…`). Copy it from Lace while Lace is set to
Preprod, so you are funding the address the app will actually use. These are
test tokens with no real value.

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

## Your First Transaction

Your first write to the chain is worth walking through slowly, because it looks
different from anything a normal web app does — and because a few seconds of
apparent nothing is the part that trips people up.

**Start with a vote, not an election.** Voting is the cheaper, faster action
and it exercises the whole privacy machine. Pick any open election from the
list.

**What happens, in order:**

1. **You pick a candidate and confirm.** Nothing has left your machine yet.
2. **"Generating zero-knowledge proof…" appears.** This is the unfamiliar
   part. Your browser is building a mathematical proof that your vote is
   valid — that you hold a voter secret, that you have not already voted here,
   and that your pick is a real candidate — while leaving your choice out of
   everything that gets published. It takes a few seconds and runs entirely on
   your own computer. That local work is exactly what keeps your vote private,
   so the wait is the feature.
3. **Lace asks you to sign.** Review it and approve. This is the point where
   the DUST fee is paid.
4. **The transaction is submitted and waits to be confirmed.** Expect
   seconds-to-a-minute. The app is waiting for the network to report it as
   final, not hanging.
5. **Turnout goes up by one.** Not the per-candidate count — those stay sealed
   while voting is open — just the total number of people who voted.
6. **You can verify it yourself.** Open **History**, find the transaction, and
   click **Verify on explorer ↗**. The public block explorer will show your
   transaction is real. Scroll the data on it: you will find the nullifier and
   the turnout, and you will not find which candidate you chose. Nobody will,
   ever.

**If it fails, it is almost certainly the fee.** "Cannot pay the transaction
fee" means your DUST has not accrued yet. Holding tNIGHT is not enough — NIGHT
has to be registered for DUST generation in Lace, and then DUST fills in
gradually rather than all at once. Wait a few more minutes and try again.

**If it seems stuck after you signed,** check **History** before retrying. If
the transaction is listed there, it went through and the display is simply
behind; the explorer link will confirm it. Do not re-submit — a second vote in
the same election is rejected by the contract anyway.

**After that first vote,** try the other direction: hit **+ Create**, run your
own two-candidate poll with a short deadline, and close it when the window
ends. Creating and closing are the only actions restricted to a specific
wallet — yours — and closing is what turns a sealed tally into a public
result.

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
Check that Lace is on **Preprod**. A contract address only exists on the network
it was deployed to, so a wallet on another network has nothing to read. This is
the single most common cause of "the app looks broken".

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

---

## Where This Guide Came From

Most of the warnings above exist because a real tester hit that exact wall on
Preprod and told us about it — the DUST step, the wrong-network empty screen,
the wedged wallet connection, the "is the proof frozen?" pause.

Every change this guide reflects is logged in
[FEEDBACK.md](FEEDBACK.md). If something here still does not
make sense, that is a documentation bug worth reporting: open an issue, or
reply on [@shadow_vote](https://x.com/shadow_vote).
