# ShadowVote — Brand Brief

The identity the product ships with today, written down so the X profile, the
banner, the README and the app stop drifting apart.

---

## Tagline

> **Vote Privately. Verify Publicly.**

One line, two halves, and the whole product is in the tension between them.
Use it verbatim everywhere — app hero, X bio, README, video intro.

Long form, when a sentence is needed instead of a slogan:

> Secret ballots on a public blockchain — the result is verifiable by anyone,
> the ballot is traceable by no one.

---

## Three Key Messages

**1. The result is auditable. The ballot is not.**
Every other on-chain vote makes you pick one: a transparent tally you can
verify, or a secret ballot you have to trust someone about. ShadowVote refuses
the trade. The tally, the turnout and the winner are public ledger state that
anyone can read on the explorer. The link between a wallet and a choice is not
hidden, encrypted or access-controlled — it is *never written down anywhere*.
Nothing to leak, subpoena, or later regret.

**2. One vote each, with nobody checking a list of who you are.**
Double-voting is blocked by a nullifier: a one-way fingerprint of *this voter,
this election*. It is identical if you vote twice in the same election, so the
second attempt is rejected by the contract itself. It is completely different
in every other election, so your ballots cannot be joined together across
votes, and it cannot be walked back to your wallet. No registry of voters, no
organizer who has to be trusted to forget.

**3. The proof is built on your machine, and you never trust ours.**
The zero-knowledge proof is generated in your own browser; your voter secret
never leaves it. Reading is free and needs no wallet, so anyone can audit an
election without participating in it. Every transaction in the app carries a
link to the public block explorer, because a privacy product that asks you to
take its word for things has missed the point.

---

## Color Palette

The shipped UI is deliberately monochrome — a ballot box should look like
infrastructure, not a casino. Colour appears only where it carries meaning.

### Primary — greyscale ink

| Role | Hex | Use |
|---|---|---|
| **Void** | `#0C0C0E` | Page ground. The near-black the whole product sits on. |
| **Slate** | `#14151B` | Cards, panels, raised surfaces. |
| **Edge** | `#27272A` | Borders, dividers, hairlines. |
| **Muted** | `#71717A` | Secondary text, labels, timestamps. |
| **Mist** | `#D4D4D8` | Body text on dark. |
| **Moonlight** | `#FFFFFF` | Headings, primary buttons, the logo mark. |

### Accent — one, used sparingly

| Role | Hex | Use |
|---|---|---|
| **Signal Violet** | `#8B5CF6` | Primary action, active state, the proof-generating moment, logo highlight. |
| Violet (light) | `#A855F7` | Hover/lift on the accent only. |

Rule: **one accent per screen.** If two things are violet, neither reads as
the action.

### Semantic — status only, never decoration

| Role | Hex | Use |
|---|---|---|
| Open / success | `#22D3EE` | Election open, transaction confirmed. |
| Closed / rest | `#71717A` | Election ended, disabled state. |
| Error | `#FECDD3` | Rejected vote, missing DUST, failed transaction. |

Contrast: Mist on Void is ~12:1 and Moonlight on Void ~19:1 — both clear
WCAG AA for body text. Never put Muted `#71717A` on Slate `#14151B` for
anything a user has to read.

---

## X Profile Bio

*129 characters.*

> Secret ballots on a public chain. Vote privately, verify publicly —
> zero-knowledge elections on @MidnightNtwrk. Live on Preprod 🌒

Pinned post: the Level 6 launch post from
[OUTREACH.md § b](OUTREACH.md#b-x-post), with the demo video attached.

Profile link field: `https://shadow-vote-frontend-one.vercel.app/`

---

## X Banner Concept

**Dimensions:** 1500 × 500 px. Assume the avatar covers the lower-left ~200 px
circle and mobile crops the outer edges — keep everything that matters inside
the centre band.

**The idea:** a ballot in two states, side by side, with the difference being
the point.

- **Ground:** Void `#0C0C0E`, with a very faint vertical gradient to `#14151B`
  at the bottom. No texture, no noise, no mesh gradient.
- **Left third:** a ballot slip rendered in Mist, with a legible tick beside
  one candidate — then the same slip immediately to its right, identical in
  outline but with the marked row dissolving into a column of monospace hex
  characters (the nullifier). One object, two states, reading left to right:
  *choice → proof*. Keep the dissolve tight and mechanical, not smoky.
- **Centre:** the tagline in a clean grotesque, `Vote Privately.` in Moonlight
  and `Verify Publicly.` in Mist, stacked, generous letter-spacing. This is
  the only large type on the banner.
- **Right third:** a thin crescent moon arc in Signal Violet at maybe 40%
  opacity, bleeding off the right edge — the only colour in the frame, and the
  only nod to Midnight.
- **Bottom right, small, in Muted:** `shadowvote · midnight preprod`.

**What to avoid:** stock padlocks, hooded figures, "anonymous" masks, glowing
blue circuit boards, and the word *ShadowVote* set in anything resembling a
hacker font. The product is civic infrastructure that happens to be private —
it should look like a voting commission, not a dark-web forum.

---

## Voice

- Plain, flat, specific. "Nobody can see how you voted" beats "military-grade
  privacy."
- Never claim more than the contract does. The honest limits — anyone with
  DUST can vote today, eligibility gating is next — belong in
  [../PROPOSAL.md](../PROPOSAL.md), not hidden.
- Say *secret ballot*, not *anonymous voting*: voters are identified as
  participants; only their choices are secret. The distinction is the product.

---

## Brand Assets

| Asset | Status | Location |
|---|---|---|
| Logo mark (SVG, monochrome) | shipped in-app | [`frontend/src/components/Logo.tsx`](../frontend/src/components/Logo.tsx) |
| App favicon | shipped | [`frontend/public/favicon.svg`](../frontend/public/favicon.svg) |
| X avatar (400 × 400) | to create | — |
| X banner (1500 × 500) | to create, per concept above | — |
| Demo video thumbnail | to create | — |
| Screenshots | shipped | [`../screenshots/`](../screenshots/) |
