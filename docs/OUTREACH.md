# Outreach & Onboarding

Copy-paste material for recruiting and onboarding real Preprod testers.

- **Live demo:** https://shadow-vote-frontend-one.vercel.app/
- **Feedback form:** https://docs.google.com/forms/d/1McCwyY8gsHOxkFK3IasCRYNmYI_OMeXqolxa9JibAGY/viewform
- **X profile:** https://x.com/shadow_vote
- **Preprod contract:** `8e60d089f565d4aef839646e8c8c5443ff0f57f2d999e278fc714c2c7efc143d`
- **Rosters to fill:** [../USERS.md](../USERS.md) · [../LAUNCH_USERS.md](../LAUNCH_USERS.md)

One rule for all of it: **never promise a reward for an address.** Paid
addresses are not users, they show up as a dead row on the explorer, and a
reviewer can tell the difference. Ask for a test and a complaint instead.

---

## a) Discord / Telegram message

*92 words.*

> Built **ShadowVote** — private voting on Midnight. The tally is public and
> verifiable, but nobody can see *how* you voted. Not the organizer, not me,
> not anyone reading the chain.
>
> Live on Preprod: https://shadow-vote-frontend-one.vercel.app/
>
> To try it (~3 min):
> 1. Point Lace at Preprod, faucet some tNIGHT, register it for DUST
> 2. Open an election and vote — the ZK proof builds in your browser
> 3. **History → Verify on explorer** shows your transaction on-chain
>
> Tested it? Drop your `mn_addr_…` here or DM me. Bugs and "this part confused
> me" are the most useful replies.

**Follow-up reply** — post this as a reply under your own message, so the main
post stays short:

> Feedback form if you'd rather not type it out here (wallet + what confused
> you, 60 seconds):
> https://docs.google.com/forms/d/1McCwyY8gsHOxkFK3IasCRYNmYI_OMeXqolxa9JibAGY/viewform

**Where to post it:** Midnight Discord (builders / show-and-tell channels),
Cardano dev Telegram groups, university blockchain and CS society servers,
hackathon alumni groups, ZK study groups.

---

## b) X post

*276 characters — fits in a single post without Premium.*

> ShadowVote is live on @MidnightNtwrk Preprod 🌒
>
> Secret ballots on a public chain: the result is verifiable, your vote is not
> traceable to you.
>
> Connect Lace, vote, verify on the explorer:
> https://shadow-vote-frontend-one.vercel.app/
>
> Testing? Reply with your Preprod address 👇

**Posting notes**

- Reply to your own post with a 20-second screen recording of the vote flow —
  a post with motion pulls meaningfully more testers than a link alone.
- Tag `#Midnight` `#ZK` `#privacy`, and quote-post it into any Midnight
  challenge thread.
- Pin it on [@shadow_vote](https://x.com/shadow_vote) for the duration.

---

## c) Direct DM template (college / developer contacts)

> Hey <name> — I built a thing and I need people to break it.
>
> **ShadowVote** runs elections where the count is public but individual votes
> are mathematically unlinkable to the voter. It is a zero-knowledge dApp on
> Midnight's Preprod testnet, and it is live:
> https://shadow-vote-frontend-one.vercel.app/
>
> Would you give it ~5 minutes? Install the Lace wallet extension, switch it to
> Preprod, grab free test tokens, and cast one vote. Walkthrough here if you
> get stuck:
> https://github.com/Vivek-Alpha06/ShadowVote/blob/main/docs/USAGE.md
>
> Two things I would love back:
>
> 1. Your Preprod wallet address (`mn_addr_…`) so I can log you as a verified
>    tester — it is a test wallet with no real funds, and it only ever proves
>    you participated, never who you voted for.
> 2. The one moment where you thought *"wait, what do I do now?"* — that is the
>    feedback I actually need.
>
> No tokens, no airdrop, nothing to sign beyond the vote itself. I genuinely
> want to know whether it makes sense to someone who did not build it.

**Variant for non-technical contacts** — replace the middle paragraph with:

> Think of it as a ballot box anyone can audit but nobody can peek into. It
> runs in the browser; the only setup is a free wallet extension. Happy to
> walk you through it on a call if that is easier.

---

## Level 6 Onboarding Script

Send this to each of the 20 Level 6 users, one at a time. The point of doing it
personally is that you are present when they get stuck — which is exactly
where the feedback comes from.

### Step 1 — Install the wallet

1. Install the **Lace** wallet extension (Midnight-enabled build) in Chrome or
   any Chromium browser.
2. Create a new wallet and save the recovery phrase somewhere safe.
3. Open Lace's network setting and switch it to **Preprod**. This matters: a
   contract only exists on the network it was deployed to, so a wallet on the
   wrong network sees an empty app.

### Step 2 — Get test tokens (the step everyone misses)

4. Copy your **unshielded** address from Lace (`mn_addr_…`).
5. Request **tNIGHT** from the Midnight faucet for that address. These are test
   tokens with no real value.
6. In Lace, **register your NIGHT for DUST generation.** Fees are paid in DUST,
   and DUST accrues gradually from registered NIGHT — holding tNIGHT alone pays
   for nothing. Give it a few minutes.

> If a vote later fails with "cannot pay the fee", it is almost always this
> step. Wait a little longer and retry.

### Step 3 — Use the product

7. Open https://shadow-vote-frontend-one.vercel.app/
8. Click **Connect Wallet** and approve in Lace. Your address appears top
   right. The app attaches to the contract on its own — free, no signature.
9. Browse **Elections**. Reading is completely free: no wallet, no tokens and
   no signing are needed to see any election or tally.
10. Open an election, pick a candidate, confirm. You will see **"Generating
    zero-knowledge proof…"** — that is your own machine proving your vote is
    valid without revealing your choice. Then sign in Lace.
11. Turnout goes up by one. Nothing anywhere records that *you* chose *that*
    candidate. You can vote once per election; a second attempt is rejected by
    the contract itself.
12. *(Optional)* Hit **+ Create** to run your own vote — name, description, two
    or more candidates, a deadline. Only the wallet that created an election
    can close it, and closing is what publishes the tally.
13. Open **History → Verify on explorer ↗** and confirm your own transaction on
    the public block explorer. You never have to take the app's word for
    anything.

### Step 4 — Confirm your wallet address

14. Copy your Preprod address from Lace and send it back to me, with the
    transaction link from step 13 if you have it.
15. I add you to `LAUNCH_USERS.md` in the public repo. To be explicit about
    what that means:
    - It records that your wallet **participated**.
    - It cannot record **how you voted** — that link is never written down,
      on-chain or off.
    - It is a Preprod test wallet; nothing of value is exposed.
16. Last ask: fill the 60-second feedback form —
    https://docs.google.com/forms/d/1McCwyY8gsHOxkFK3IasCRYNmYI_OMeXqolxa9JibAGY/viewform
    — or just reply with the one point where the flow confused you. Every entry
    in `docs/FEEDBACK.md` came from someone answering that question.

---

## Demo Video Checklist

Target 3–5 minutes, screen recording with voiceover. Shoot it in this order;
every item below is something a reviewer is looking for.

**Open on proof, not on marketing**

- [ ] Show the **Preprod contract address** on screen, large and readable:
      `8e60d089f565d4aef839646e8c8c5443ff0f57f2d999e278fc714c2c7efc143d`
- [ ] Show that same address in the app footer *and* on
      `explorer.preprod.midnight.network`, side by side, so the deployment is
      independently visible rather than merely claimed.
- [ ] Show Lace's network selector reading **Preprod**.
- [ ] State the one-line pitch: public result, private ballot.

**Full product flow, unedited**

- [ ] **Connect wallet** — click it, approve in Lace, show the address land in
      the top right.
- [ ] **Browse without a wallet** — briefly show that elections and tallies are
      readable with nothing connected. Free reads are a real feature.
- [ ] **Create an election** — fill the form, submit, approve in Lace, and wait
      for it to land on-chain. Do not cut the wait; the wait is the evidence it
      is a real transaction.
- [ ] **Cast a vote** — pick a candidate and confirm. Let **"Generating
      zero-knowledge proof…"** sit on screen and narrate what the machine is
      doing. Then sign.
- [ ] **Turnout increments** — show the count move.
- [ ] **Close the election** — from the organizer wallet, then show the sealed
      tally becoming public and the winner appearing.

**Prove the privacy model end to end**

- [ ] **Double-vote attempt:** try to vote a second time from the same wallet
      and show the contract rejecting it. This is the nullifier working.
- [ ] **Open the transaction on the explorer** and scroll the public data on
      camera: the tally is there, the nullifier is there, and **the candidate
      choice is not**. This is the single most important shot in the video.
- [ ] **Show that nullifiers are unlinkable:** point out that the same wallet
      produces a different nullifier in a different election, so ballots cannot
      be joined together across votes.
- [ ] Optionally show the `localSecretKey()` witness in `ShadowVote.compact` to
      make the point that the voter's key never leaves the prover.

**Close**

- [ ] Scroll `USERS.md` / `LAUNCH_USERS.md` — real Preprod testers.
- [ ] Show `docs/FEEDBACK.md`, naming one change that shipped because a user
      asked for it.
- [ ] End with the demo URL and the contract address on screen together.

**Recording hygiene**

- [ ] One take per flow; never splice a failed transaction into a success.
- [ ] Never show a seed phrase or the contents of `contract/.env`.
- [ ] Keep browser zoom high enough that addresses stay legible at 720p.
