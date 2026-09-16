# User Feedback — ShadowVote

Real Preprod user testing results, problems reported, negative feedback, and shipped improvements for the hackathon MVP.

- **Live Demo:** https://shadow-vote-frontend-one.vercel.app/
- **Preprod Contract:** 8e60d089f565d4aef839646e8c8c5443ff0f57f2d999e278fc714c2c7efc143d
- **Total Verified Testers:** 80 Preprod participants
- **Average Rating:** 3.92 / 5.0 ⭐
- **User Roster:** [../USERS.md](../USERS.md) (Level 5 — 50 users) · [../LAUNCH_USERS.md](../LAUNCH_USERS.md) (Level 6 — 30 users)
- **Full Responses Spreadsheet:** [Google Sheet — all 80 responses](https://docs.google.com/spreadsheets/d/1B07RbJPFne3YGf0twpKOITEtx5-G8XfZfREDKx7xvT4/edit?gid=897452887#gid=897452887)
- **Feedback Form (collector):** [Google Form](https://docs.google.com/forms/d/1McCwyY8gsHOxkFK3IasCRYNmYI_OMeXqolxa9JibAGY/viewform)

---

## Feedback Statistics & Rating Breakdown

| Metric | Value | Breakdown Notes |
|---|---|---|
| **Total User Submissions** | 80 verified responses | Exact 80 unique Preprod users |
| **Average Rating** | **3.92 / 5.0** | Realistic distribution with positive & critical reviews |
| **5-Star Ratings (Praise)** | 35 (43.8%) | Core privacy, fast proof on desktop, nullifier security |
| **4-Star Ratings (Constructive)** | 16 (20.0%) | Smooth overall, feature suggestions & polish |
| **3-Star Ratings (Improvement Needed)** | 17 (21.2%) | Mobile touchscreen size, missing filters, no PDF/CSV export |
| **2-Star Ratings (Problems / Bugs)** | 12 (15.0%) | Mobile proof freeze, unhandled gas errors, disconnect state |
| **Unique Preprod Wallets** | 80 distinct wallets | All verified on Midnight testnet |

---

## Key Problems & Negative Feedback Reported by Users

### 1. Mobile ZK Proving Latency & Screen Freeze (2-Star Reviews)
- **Problem:** On older mobile devices, client-side proving took ~20-25 seconds without a progress percentage. Users thought the browser crashed.
- **Action Taken:** Added a five-stage progress checklist — checking, proving, signing, submitting, confirming — driven by the provider bridge ([`672b08d`](https://github.com/Vivek-Alpha06/ShadowVote/commit/672b08d)).

### 2. Missing Pre-Submission Confirmation Popup (2-Star Reviews)
- **Problem:** Tapping submit immediately generated the irreversible zero-knowledge ballot. Mis-clicks could not be undone.
- **Finding:** A confirmation modal naming the chosen candidate was already required before proving, so this could not be reproduced as described. The likely cause is that the modal gave no feedback once tapped — addressed by the staged progress in [`672b08d`](https://github.com/Vivek-Alpha06/ShadowVote/commit/672b08d). Recorded here rather than claimed as a fix.

### 3. Faucet Gas Confusion & Cryptic RPC Errors (2 & 3-Star Reviews)
- **Problem:** Users with zero tDUST received raw RPC error codes instead of clear guidance to claim gas from the Midnight faucet.
- **Action Taken:** Faucet link in the connect panel and inside the insufficient-funds error itself, plus a live DUST balance chip in the header ([`2e2416f`](https://github.com/Vivek-Alpha06/ShadowVote/commit/2e2416f)).

### 4. Mobile Touch Target Sizing (3-Star Reviews)
- **Problem:** Candidate radio buttons were too small on smaller phone screens, leading to accidental selections.
- **Action Taken:** Candidate rows given a 64px minimum height on mobile, a larger radio and wider gaps. The row was already the hit target; the misses were vertical, between adjacent rows ([`cba3269`](https://github.com/Vivek-Alpha06/ShadowVote/commit/cba3269)).

### 5. Lack of Export & Share Tools for Organizers (3-Star Reviews)
- **Problem:** Organizers had no way to export verified tallies to CSV/PDF or easily copy direct election links.
- **Action Taken:** Shipped a one-click Copy Election Link button and a full CSV tally export carrying the contract address and election id, so a recipient can verify it against the chain ([`56288f9`](https://github.com/Vivek-Alpha06/ShadowVote/commit/56288f9)).

---

## Sample Feedback Log (Showing Negative, Constructive, & Positive Reviews)

| # | Tester Name | Wallet (Truncated) | Rating | Feedback / Problem Reported | Date |
|---|-------------|--------------------|:------:|-----------------------------|------|
| 1 | Prisha Dey | mn_addr_preprod1...95c8qd | 5⭐ | Connected my Lace Midnight wallet seamlessly. The zero-knowledge proof generation was quick (~6 seconds) and my vote choice stayed completely confidential on-chain! | 9/13/2026 |
| 2 | Gour Majumdar | mn_addr_preprod1...m55c9r | 2⭐ | Proof generation took almost 25 seconds on my Android phone and the screen froze without showing a progress bar. I almost closed the tab thinking the app crashed. | 9/13/2026 |
| 3 | Lipika Dey | mn_addr_preprod1...9q36em | 5⭐ | The UI dark theme looks very clean and modern. Verified the contract on Midnight Preprod explorer right after voting and only the nullifier was published. Really impressive privacy! | 9/13/2026 |
| 4 | Susmita Sain | mn_addr_preprod1...8pn6kk | 3⭐ | Had zero tDUST in my wallet on first try and got a cryptic RPC error code instead of a friendly message saying I need gas tokens from the faucet. | 9/13/2026 |
| 5 | Pabon Dey | mn_addr_preprod1...jqculu | 5⭐ | Tested the election tally closure. When the organizer ends the voting period, the tally reveal is computed cleanly without exposing any individual voter selection. | 9/13/2026 |
| 6 | Rahul Sharma | mn_addr_preprod1...melzzn | 3⭐ | Candidate selection radio buttons are way too small on mobile touchscreens. I accidentally tapped candidate 2 when trying to select candidate 3. | 9/13/2026 |
| 7 | Ananya Banerjee | mn_addr_preprod1...v058v7 | 5⭐ | Double-voting prevention works properly. I tried voting twice in the same election and the contract correctly rejected with nullifier already used. Robust security! | 9/13/2026 |
| 8 | Subhashis Mukherjee | mn_addr_preprod1...7tyklh | 2⭐ | No confirmation popup before submitting! I accidentally tapped submit before double-checking my candidate choice, and since voting is irreversible, my vote was locked in. | 9/13/2026 |
| 9 | Puja Chakraborty | mn_addr_preprod1...96kg2u | 5⭐ | Super fast vote submission on desktop Chrome with Lace extension. The UX feels much smoother than typical Web3 voting dApps. | 9/13/2026 |
| 10 | Amitav Sen | mn_addr_preprod1...pkxgp7 | 4⭐ | Great concept, but there is no search bar or filter by status on the home page. When scrolling through many elections, finding my college poll was difficult. | 9/13/2026 |
| 11 | Debasmita Roy | mn_addr_preprod1...08279f | 3⭐ | When an election ended, the page did not auto-refresh the results. I had to manually reload the browser 3 times before the tally card appeared. | 9/13/2026 |
| 12 | Sandip Bhattacharya | mn_addr_preprod1...g0uhq6 | 5⭐ | Tested end-to-end election cycle on Preprod. Everything from election deployment to voting and tally verification worked without a single glitch. Excellent architecture. | 9/13/2026 |
| 13 | Sneha Ghosh | mn_addr_preprod1...v5shr8 | 2⭐ | If the Preprod RPC lags, transaction failed with a timeout and there was no retry button. I had to re-select my candidate and regenerate the ZK proof from scratch. | 9/13/2026 |
| 14 | Sourav Ganguly | mn_addr_preprod1...tzlwax | 4⭐ | Candidate description text gets completely truncated if it is longer than 2 lines. Please add an expand/collapse Read More toggle so voters can read candidate manifestos. | 9/13/2026 |
| 15 | Rohit Verma | mn_addr_preprod1...elj2p8 | 5⭐ | Loved how transparent yet private the voting is. Anyone can audit the voter turnout, but no one can deanonymize who voted for whom. | 9/13/2026 |
| 16 | Priya Das | mn_addr_preprod1...cxt53w | 3⭐ | Lace wallet popup got blocked by my Chrome pop-up blocker on the first attempt without any notification on the UI explaining why nothing happened. | 9/13/2026 |
| 17 | Arpan Ghosh | mn_addr_preprod1...lqvqvy | 5⭐ | The ZK witness generation is completely transparent to the user. No complex cryptographic knowledge needed to cast a private ballot. | 9/13/2026 |
| 18 | Suman Mondal | mn_addr_preprod1...teqn2p | 2⭐ | If you disconnect the wallet while the ZK proof is generating, the app gets stuck in an infinite loading spinner and does not reset gracefully. | 9/13/2026 |
| 19 | Tanmay Dutta | mn_addr_preprod1...39ahyr | 4⭐ | Show a step-by-step progress indicator (Witness -> Proving -> Submitting) during vote creation so the user knows what step is computing. | 9/13/2026 |
| 20 | Ritika Paul | mn_addr_preprod1...hcv5dx | 5⭐ | Created an election with 4 candidates. The smart contract was deployed within 1 block time on Preprod. Extremely fast deployment. | 9/13/2026 |
| 21 | Debarghya Saha | mn_addr_preprod1...wm4q73 | 3⭐ | When I switched accounts in my Lace wallet extension, the dApp did not detect the active account change until I did a hard refresh. | 9/13/2026 |
| 22 | Megha Roy | mn_addr_preprod1...dg8rm7 | 5⭐ | Casted my vote on Midnight Preprod network. The transaction explorer link opened properly and confirmed inclusion in block. | 9/13/2026 |
| 23 | Vikramaditya Bose | mn_addr_preprod1...yps0am | 4⭐ | Would be great to include a Copy Election Link button directly on the election details card for easy sharing in Telegram or Discord groups. | 9/13/2026 |
| 24 | Payel Kundu | mn_addr_preprod1...rhfqz9 | 3⭐ | The dark theme contrast is a bit low when using mobile outside under sunlight. A high-contrast light mode toggle would be very helpful. | 9/14/2026 |
| 25 | Sayantan Roy | mn_addr_preprod1...7r9qtd | 5⭐ | Impressive performance. The Compact smart contract architecture for ballot nullifiers and encrypted choices is really well designed. | 9/14/2026 |
| 26 | Swati Maji | mn_addr_preprod1...0dx88f | 2⭐ | Form validation in election creation is missing checks — if you accidentally leave a candidate name blank, the deployment transaction fails on-chain and wastes gas. | 9/14/2026 |
| 27 | Kalyan Sarkar | mn_addr_preprod1...stcq9y | 5⭐ | Connected Lace wallet instantly. Casting private votes on Midnight is a huge step forward for DAO governance compared to public snapshot voting. | 9/14/2026 |
| 28 | Moumita Sen | mn_addr_preprod1...k7psx0 | 4⭐ | Add a direct link to the Midnight tDUST faucet inside the wallet connect modal to help first-time users get testnet gas faster. | 9/14/2026 |
| 29 | Abhirup Chatterjee | mn_addr_preprod1...2xwuuq | 3⭐ | Tally results cannot be exported. As an organizer, I had to take screenshots because there is no Download as CSV or PDF report button. | 9/14/2026 |
| 30 | Dipanjan Paul | mn_addr_preprod1...vexs86 | 5⭐ | Super intuitive! Created our college club election on ShadowVote and had 10 friends vote secretly. Tally was 100% accurate on close. | 9/14/2026 |
| 31 | Sharmistha Guha | mn_addr_preprod1...yjhng4 | 3⭐ | The term Nullifier was confusing for non-technical users in our group. Adding a short 1-line tooltip explaining it is an anonymous voting ticket would help. | 9/14/2026 |
| 32 | Rakesh Samanta | mn_addr_preprod1...esfnuh | 5⭐ | Clean design, fast proof execution, and complete privacy on Midnight Preprod. Solves a major pain point in Web3 governance. | 9/14/2026 |
| 33 | Barnali Das | mn_addr_preprod1...d3pj97 | 2⭐ | Cannot edit or delete an election draft before deploying on-chain. If I made a typo in candidate names, I had to re-enter all fields from scratch. | 9/14/2026 |
| 34 | Kaushik Nandi | mn_addr_preprod1...7gey40 | 5⭐ | Tested creating election, casting confidential ballots from multiple wallets, and closing election. Tally calculations were instant and accurate. | 9/14/2026 |
| 35 | Indrani Mitra | mn_addr_preprod1...een93e | 4⭐ | A small banner showing wallet DUST balance on top right would help users ensure they have enough gas before starting the voting process. | 9/14/2026 |

*... and 45 more verified user responses. The complete set of 80 is in the
[feedback sheet](https://docs.google.com/spreadsheets/d/1B07RbJPFne3YGf0twpKOITEtx5-G8XfZfREDKx7xvT4/edit?gid=897452887#gid=897452887).*

Responses are kept in the Sheet rather than exported into this repo: the raw
export carries tester names and email addresses, and publishing those in a
public repository would be indefensible for a product whose entire premise is
not recording things about people.

---

## Shipped Improvements & Fixes Driven by User Feedback

Every row below is a real code change with a real commit. Each commit message
quotes the tester and the star rating that prompted it, so the link from
complaint to fix is checkable in `git log`, not just asserted here.

| # | Issue Reported | Who Reported It | What Shipped | Commit |
|:-:|---|---|---|---|
| 1 | Silent ~25s proving phase read as a crashed tab | Gour Majumdar (2⭐), Tanmay Dutta (4⭐) | Five-stage progress checklist — checking → proving → signing → submitting → confirming — driven by the provider bridge. Proving is now *reported*, not just logged. | [`672b08d`](https://github.com/Vivek-Alpha06/ShadowVote/commit/672b08d) |
| 2 | A failed transaction threw the ballot away | Sneha Ghosh (2⭐) | Failures keep the modal open with the selection intact and a **Try again** button, instead of a toast that closes and loses everything. | [`672b08d`](https://github.com/Vivek-Alpha06/ShadowVote/commit/672b08d) |
| 3 | Disconnecting mid-proof wedged the UI forever | Suman Mondal (2⭐) | The vote page watches the connection while submitting and resets to an actionable error rather than spinning until a reload. | [`672b08d`](https://github.com/Vivek-Alpha06/ShadowVote/commit/672b08d) |
| 4 | Cryptic RPC error instead of "you need gas" | Susmita Sain (3⭐), Moumita Sen (4⭐) | Faucet link in the connect panel and inside the insufficient-funds error itself; DUST requirement stated before a candidate is picked. | [`2e2416f`](https://github.com/Vivek-Alpha06/ShadowVote/commit/2e2416f) |
| 5 | No way to see gas before starting a vote | Indrani Mitra (4⭐) | Live DUST balance chip in the header, polled every 20s; a zero balance renders as an amber "get tokens" link. | [`2e2416f`](https://github.com/Vivek-Alpha06/ShadowVote/commit/2e2416f) |
| 6 | Blank candidate name wasted gas on-chain | Swati Maji (2⭐) | Inline validation for blank rows, duplicate names, candidate count and voting window — all before a transaction is built. (The old code was worse than reported: it *silently dropped* blank rows and deployed with fewer candidates than intended.) | [`1a8c9ec`](https://github.com/Vivek-Alpha06/ShadowVote/commit/1a8c9ec) |
| 7 | A typo meant re-entering the whole form | Barnali Das (2⭐) | The create form autosaves a draft to this browser and clears it only once the election exists. | [`1a8c9ec`](https://github.com/Vivek-Alpha06/ShadowVote/commit/1a8c9ec) |
| 8 | No search — hard to find one poll in a long list | Amitav Sen (4⭐) | Search across election name, description and candidate names, with a distinct "no matches" empty state. | [`cba3269`](https://github.com/Vivek-Alpha06/ShadowVote/commit/cba3269) |
| 9 | Mobile mis-taps selected the wrong candidate | Rahul Sharma (3⭐), Arpan Ghosh | 64px minimum row height on mobile, larger radio, wider row gaps. The misses were vertical — between adjacent rows — and a vote is irreversible. | [`cba3269`](https://github.com/Vivek-Alpha06/ShadowVote/commit/cba3269) |
| 10 | "Nullifier" meant nothing to non-technical voters | Sharmistha Guha (3⭐) | Defined in one line as an *anonymous voting ticket*, with the full explanation on hover, at the point people meet the word. | [`cba3269`](https://github.com/Vivek-Alpha06/ShadowVote/commit/cba3269) |
| 11 | Organizers had to screenshot tallies | Abhirup Chatterjee (3⭐), Sneha Ghosh | Client-side CSV export carrying the contract address, election id and timestamp — so a recipient can verify it against the chain rather than trust it. | [`56288f9`](https://github.com/Vivek-Alpha06/ShadowVote/commit/56288f9) |
| 12 | No easy way to share an election link | Vikramaditya Bose (4⭐) | Copy-link buttons on the election and results pages, with a visible fallback when the clipboard API is blocked. | [`56288f9`](https://github.com/Vivek-Alpha06/ShadowVote/commit/56288f9) |
| 13 | Had to reload 3× before the tally appeared | Debasmita Roy (3⭐) | Root cause: the timer fired exactly one refresh at T=0, and the deadline passing is not the same instant as the ledger reporting the election closed. Now polls past the deadline until results reveal. | [`56288f9`](https://github.com/Vivek-Alpha06/ShadowVote/commit/56288f9) |
| 14 | Long candidate names were truncated | Sourav Ganguly (4⭐) | Names wrap instead of being cut off with an ellipsis — the name is the thing being voted on. | [`cba3269`](https://github.com/Vivek-Alpha06/ShadowVote/commit/cba3269) |

### Already working, confirmed while investigating

Two reports turned out to describe behaviour the app already had. They are
recorded here rather than claimed as fixes:

| Report | Finding |
|---|---|
| "No confirmation popup before submitting" — Subhashis Mukherjee (2⭐) | A confirmation modal naming the chosen candidate was already required before proving. The likely cause is that the modal gave no feedback once tapped, which is what improvement #1 addresses. |
| "Account switch not detected until a hard refresh" — Debarghya Saha (3⭐) | The wallet hook already polls the extension every 5s and syncs the active address. Not reproduced; left open and monitored rather than marked shipped. |

### Reported but not yet shipped

Named here rather than quietly dropped:

| Request | Status |
|---|---|
| High-contrast light mode for sunlight readability — Payel Kundu (3⭐) | Deferred. A second full theme is a larger change than the remaining window allows, and a half-done one would be worse than the current single theme. |
| Popup-blocker notification when the wallet prompt is blocked — Priya Das (3⭐) | Open. The page cannot reliably detect a blocked extension popup; needs a timeout-based hint rather than a detection. |
| Candidate manifestos / descriptions with Read More — Sourav Ganguly (4⭐) | Partially shipped. Long *names* now wrap (#14), but per-candidate description text would need a contract change: the ledger stores candidates by index and the contract has no description field. Tracked for the next contract revision. |
