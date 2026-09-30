import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TABS = [
  {
    id: 0,
    title: 'AI & Compact Smart Contracts',
    desc: 'Formally verified zero-knowledge state machines written in Compact DSL.',
    img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/68000dde57255acc721d728f_Illustations%20Tabs%20(3).jpg',
    tag: 'Compact DSL VM',
    stat: '100% Verifiable',
    detail: 'Automated circuit constraints prevent state tampering, invalid candidate choices, and unauthorized ballot creation.',
  },
  {
    id: 1,
    title: 'One-Tap Shielded Voting',
    desc: 'Connect your Lace wallet, compute private witness, and submit ballot in seconds.',
    img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/68000ddd9478ab3943fe4972_Illustations%20Tabs%20(4).jpg',
    tag: 'Lace Native',
    stat: '< 1.2s Proving',
    detail: 'Witness encryption is evaluated locally inside browser memory. Your wallet signature is never linked to your selection.',
  },
  {
    id: 2,
    title: 'Multi-Option Ballot Architecture',
    desc: 'Deploy multi-candidate options, binary referendums, and custom governance parameters.',
    img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/68000ddd6568234936d9b18e_Illustations%20Tabs%20(2).jpg',
    tag: 'Flexible Schema',
    stat: 'Up to 32 Candidates',
    detail: 'Configure custom duration deadlines, voting windows, and multi-option selection rules in one seamless interface.',
  },
  {
    id: 3,
    title: 'Real-Time Turnout Telemetry',
    desc: 'Live participation metrics via Subsquid GraphQL indexer without unsealing choices.',
    img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/68000dddfa56f7104d3fd8db_Illustations%20Tabs%20(1).jpg',
    tag: 'GraphQL Subscriptions',
    stat: '0 Choice Leaks',
    detail: 'Voters can track aggregate turnout percentage live while individual choices stay sealed until the countdown timer concludes.',
  },
];

export default function Features() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-[#f5f4fd] text-[#2e335b] pt-24 pb-20 overflow-x-hidden">
      {/* =========================================================================
          HERO FEATURES SECTION (OVO Credix .hero-features)
          ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-16 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-5 text-left"
          >
            <div className="inline-flex items-center gap-2">
              <span className="tag">Features &amp; ZK Privacy</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Midnight Preview
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#202952] font-heading tracking-tight leading-[1.1]">
              Confidential Governance You Can Trust
            </h1>

            <p className="text-base sm:text-lg text-[#2e335b]/80 leading-relaxed font-medium">
              Built on a foundation of trust and cryptographic zero-knowledge security, we ensure that your ballot choices and governance decisions are always strictly protected.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/create" className="button accent !py-3.5 !px-8 text-sm shadow-xl font-bold">
                + Deploy Custom Ballot
              </Link>
              <Link to="/dashboard" className="button ghost !py-3.5 !px-7 text-sm font-semibold">
                Explore Live Ballots ↗
              </Link>
            </div>
          </motion.div>

          {/* Right 3D Perspective Graphic Wrapper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative perspective-container flex justify-center"
          >
            <div className="blue-blur" />
            <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white border-2 border-[#cdd0e5] p-6 shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
              <div className="flex items-center justify-between pb-4 border-b border-[#cdd0e5]/60 mb-5">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                </div>
                <span className="text-xs font-bold text-[#202952] bg-[#dfe7f9] px-3 py-1 rounded-full border border-[#cdd0e5]">
                  ShadowVote Zero-Knowledge Engine
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#f5f4fd] border border-[#cdd0e5]">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-[#202952]">Compact Circuit Status</span>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">✓ Active</span>
                  </div>
                  <p className="text-xs text-[#2e335b]/75">
                    ZK-SNARK witness execution happens strictly in memory. Double voting is mathematically prohibited.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3.5 rounded-xl bg-white border border-[#cdd0e5] shadow-xs">
                    <p className="text-xs text-[#2e335b]/60 font-semibold">Choice Privacy</p>
                    <p className="text-lg font-black text-[#202952] mt-0.5">100% Sealed</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#cdd0e5] shadow-xs">
                    <p className="text-xs text-[#2e335b]/60 font-semibold">Proving Speed</p>
                    <p className="text-lg font-black text-indigo-700 mt-0.5">&lt; 1.2s</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#2e335b] text-white flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Midnight Preview Testnet</span>
                  </div>
                  <span className="font-mono text-xs text-indigo-200">0 DUST Gas</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          ECOSYSTEM & TECH PARTNER MARQUEE STRIP
          ========================================================================= */}
      <section className="py-6 px-4 sm:px-6 bg-[#edf1fa] border-y border-[#cdd0e5]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-[#202952]/75">
          {['MIDNIGHT PREVIEW', 'LACE WALLET', 'COMPACT VM CIRCUITS', 'SUBSQUID GRAPHQL', 'CARDANO WASM', 'HALO2 / PLONK ZK'].map((item) => (
            <div key={item} className="px-4 py-2 rounded-xl bg-white/80 border border-[#cdd0e5] flex items-center gap-2 shadow-xs hover:border-[#202952] transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="tracking-wider">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: "SET THE PRODUCT DIRECTION" (Services Cards 1 & 2 with Checklists)
          ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
            <div className="space-y-3 max-w-2xl">
              <span className="tag">Product Direction</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202952] font-heading">
                Set the Governance Direction
              </h2>
              <p className="text-sm sm:text-base text-[#2e335b]/80 leading-relaxed">
                A smarter cryptographic system built for DAOs, protocols, enterprises, and communities who demand verifiable privacy—not trust.
              </p>
            </div>
            <Link to="/create" className="button !py-3 !px-6 text-xs font-bold whitespace-nowrap">
              + Deploy First Ballot
            </Link>
          </div>

          {/* Service Card 1 (Left Content + Right Outset UI Mockup) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="services-card"
          >
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#202952] font-heading leading-snug">
                Unlock Insights with ShadowVote ZK Prover and its power
              </h3>
              <p className="text-sm text-[#2e335b]/80 leading-relaxed">
                A zero-knowledge execution environment built for high-throughput private voting without cleartext leaks across the network.
              </p>

              <div className="space-y-2 pt-2">
                {[
                  'Zero plaintext exposure across public peer-to-peer broadcasts',
                  'Client-side witness generation inside isolated browser RAM',
                  'Compact ZK circuit enforces single-vote constraints',
                  'Instant verification without relying on trusted central relayers',
                ].map((item) => (
                  <div key={item} className="list-holder">
                    <div className="list-icon-holder">✓</div>
                    <p className="text-xs sm:text-sm font-semibold text-[#202952] leading-tight">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="service-image-holder p-5 bg-[#f5f4fd]">
              <div className="flex items-center justify-between pb-3 border-b border-[#cdd0e5] mb-4">
                <span className="text-xs font-bold text-[#202952]">Compact Prover Pipeline</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  ✓ Verified
                </span>
              </div>
              <div className="font-mono text-xs bg-[#2e335b] text-indigo-100 p-4 rounded-xl space-y-1.5 shadow-inner overflow-x-auto">
                <p className="text-pink-300">// Compact Circuit Verification</p>
                <p><span className="text-violet-300">export circuit</span> vote(eId: Bytes, choice: Witness): Void &#123;</p>
                <p className="pl-4">assert(elections.lookup(eId).status == OPEN);</p>
                <p className="pl-4">val n = nullifier(eId, ownSecretKey());</p>
                <p className="pl-4">assert(!nullifiers.member(n));</p>
                <p className="pl-4">nullifiers.insert(n);</p>
                <p className="pl-4">tallies.increment(eId, choice);</p>
                <p>&#125;</p>
              </div>
            </div>
          </motion.div>

          {/* Service Card 2 (Inverted: Left Outset Mockup + Right Content) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="services-card inverted"
          >
            <div className="service-image-holder p-6 bg-[#2e335b] text-white">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <span className="text-xs font-bold text-white">Turnout &amp; Integrity Metrics</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                  Live Sync
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-black text-white">0%</p>
                  <p className="text-xs text-white/70 mt-1">Choice Leakage</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-black text-indigo-300">100%</p>
                  <p className="text-xs text-white/70 mt-1">Verifiable Tallies</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-black text-emerald-400">0 DUST</p>
                  <p className="text-xs text-white/70 mt-1">Read Query Cost</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-black text-amber-300">&lt; 1.2s</p>
                  <p className="text-xs text-white/70 mt-1">Proof Generation</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#202952] font-heading leading-snug">
                Built for teams who move fast and govern fair, always on time!
              </h3>
              <p className="text-sm text-[#2e335b]/80 leading-relaxed">
                Eliminate voter intimidation, vote-buying, and strategic bandwagoning with sealed pre-deadline tallies and unforgeable nullifier commitments.
              </p>

              <div className="space-y-2 pt-2">
                {[
                  'Deterministic nullifiers prevent Sybil double-voting',
                  'Sealed tallies until countdown timer expiry',
                  'Native Lace wallet connection with one-click signing',
                  'Permanent block explorer audit trail anchored on Midnight',
                ].map((item) => (
                  <div key={item} className="list-holder">
                    <div className="list-icon-holder">✓</div>
                    <p className="text-xs sm:text-sm font-semibold text-[#202952] leading-tight">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: "DESIGNED FOR CONVENIENCE" + SHADES + 3-COL SERVICE GRID
          ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#edf1fa]">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header with decorative shades */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
            <div className="space-y-3 max-w-2xl">
              <span className="tag">Ecosystem Architecture</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202952] font-heading">
                Designed for Convenience, Built for Your Cryptographic Future
              </h2>
              <p className="text-sm sm:text-base text-[#2e335b]/80 leading-relaxed">
                Governance should be simple, private, and accessible whenever you need it—from municipal ballots to decentralized treasury allocations.
              </p>
            </div>

            {/* OVO Credix Signature Decorative Shades */}
            <div className="shades-holder hidden sm:flex">
              {[35, 55, 75, 45, 65, 80, 50, 70, 40, 60].map((h, i) => (
                <div
                  key={i}
                  className="shades"
                  style={{
                    height: `${h}px`,
                    animationDelay: `${i * 0.15}s`,
                    opacity: 0.4 + (i % 5) * 0.12,
                  }}
                />
              ))}
            </div>
          </div>

          {/* 3 Column Service Illustrated Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Sealed Tallies',
                desc: 'Candidate tallies remain cryptographically sealed until countdown completion, eliminating bandwagon manipulation.',
                img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/680008fa41036056d7b7776a_Illusttaions%20(1).jpg',
                badge: 'Bandwagon Shield',
              },
              {
                title: 'Ephemeral Sessions',
                desc: 'Zero-knowledge witness evaluation happens strictly within client-side memory without ever touching cleartext network wires.',
                img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/680008f63ac466f286bbda15_Illusttaions%20(3).jpg',
                badge: 'Client RAM Prover',
              },
              {
                title: 'Mathematical Audit',
                desc: 'Every outcome is accompanied by a verifiable zero-knowledge proof that any community delegate or auditor can check.',
                img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/680008f78cba24814f8fe8ed_Illusttaions%20(2).jpg',
                badge: '100% Verifiable',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="credix-card p-6 flex flex-col justify-between hover:shadow-xl transition-all"
              >
                <div>
                  <div className="rounded-2xl overflow-hidden border border-[#cdd0e5] mb-5 aspect-[4/3] bg-white">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="tag !text-[10px] mb-2">{item.badge}</span>
                  <h3 className="text-xl font-bold text-[#202952] font-heading mt-1 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#2e335b]/80 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: "MOST LOVED FEATURES" (Horizontal Tab Switcher with Visual Pane)
          ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="tag">Core Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202952] font-heading">
              Most Loved Governance Features
            </h2>
            <p className="text-sm text-[#2e335b]/80 leading-relaxed">
              Engineered from the ground up for absolute security, voter anonymity, and high-performance consensus.
            </p>
          </div>

          {/* Interactive Tabbed Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center credix-card p-6 sm:p-10 bg-white">
            {/* Left Tab List Menu */}
            <div className="lg:col-span-5 space-y-3">
              {TABS.map((tab, idx) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(idx)}
                  className={`tab-link-2 ${activeTab === idx ? 'active' : ''}`}
                >
                  <div className="text-sm sm:text-base font-bold text-[#202952] font-heading">
                    {tab.title}
                  </div>
                  <p className="text-xs text-[#2e335b]/75 mt-1 leading-relaxed">
                    {tab.desc}
                  </p>
                  <div className="active-line" />
                </button>
              ))}
            </div>

            {/* Right Active Tab Preview */}
            <div className="lg:col-span-7">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl overflow-hidden border border-[#cdd0e5] shadow-lg bg-[#f5f4fd] p-6 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <span className="tag !text-[10px]">{TABS[activeTab].tag}</span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                    {TABS[activeTab].stat}
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden border border-[#cdd0e5] aspect-[16/9] bg-white">
                  <img
                    src={TABS[activeTab].img}
                    alt={TABS[activeTab].title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="text-xs sm:text-sm text-[#2e335b]/80 font-medium leading-relaxed">
                  {TABS[activeTab].detail}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: "YEARLY TOTAL INVESTMENT" (Full-Width Service Card with Illustration)
          ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="services-card"
          >
            <div className="space-y-4">
              <span className="tag">End-to-End Cryptography</span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#202952] font-heading leading-tight">
                Quantum-Resistant Cryptographic Guarantees
              </h3>
              <div className="h-[2px] w-14 bg-[#2e335b]/20 my-3 rounded-full" />
              <p className="text-sm sm:text-base text-[#2e335b]/80 leading-relaxed">
                Your peace of mind matters. That’s why we combine state-of-the-art zero-knowledge proofs, nullifier commitments, and real-time ledger verification to protect every single participant.
              </p>
              <div className="pt-3">
                <Link to="/create" className="button accent text-xs !py-3 !px-6 shadow-md font-bold">
                  + Create Custom Ballot
                </Link>
              </div>
            </div>

            <div className="service-image-holder aspect-[16/10] bg-white">
              <img
                src="https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/68001b6189c0f3d340829a6b_Illustation.jpg"
                alt="Total Investment Protection"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: 2-COLUMN GRID CARDS (Quick Transfers & Analytics)
          ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="simple-card-holder"
          >
            <div className="aspect-[16/10] overflow-hidden border-b border-[#cdd0e5] bg-white">
              <img
                src="https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/68001c4e7733c299d00c3e25_Grid%20Images%20(2).jpg"
                alt="Quick Proof Generation"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-7 space-y-3 text-left">
              <span className="tag !text-[10px]">High Throughput</span>
              <h4 className="text-xl sm:text-2xl font-bold text-[#202952] font-heading">
                Sub-Second Proof Generation
              </h4>
              <div className="h-[2px] w-12 bg-[#2e335b]/20 my-2 rounded-full" />
              <p className="text-xs sm:text-sm text-[#2e335b]/75 leading-relaxed">
                Optimized WASM proving routines run blazingly fast in any modern web browser with zero setup overhead or server dependence.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="simple-card-holder"
          >
            <div className="aspect-[16/10] overflow-hidden border-b border-[#cdd0e5] bg-white">
              <img
                src="https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/68001c4ec44bbd64e680539f_Grid%20Images%20(1).jpg"
                alt="Autonomous Settlement"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-7 space-y-3 text-left">
              <span className="tag !text-[10px]">Smart Resolution</span>
              <h4 className="text-xl sm:text-2xl font-bold text-[#202952] font-heading">
                Autonomous Outcome Settlement
              </h4>
              <div className="h-[2px] w-12 bg-[#2e335b]/20 my-2 rounded-full" />
              <p className="text-xs sm:text-sm text-[#2e335b]/75 leading-relaxed">
                Automated result unsealing and cryptographic verification as soon as election block timestamps pass the voting deadline.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: BOTTOM HIGH-IMPACT CTA BANNER (With Looping Cloud Video)
          ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-6xl credix-card-dark p-8 sm:p-16 text-center relative overflow-hidden bg-[#2e335b] shadow-2xl"
        >
          {/* Cloud Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c%2F6806b1a9934255cdbea583c4_7031039_Above_Abstract_3840x2160_1-poster-00001.jpg"
            className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
          >
            <source
              src="https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c%2F6806b1a9934255cdbea583c4_7031039_Above_Abstract_3840x2160_1-transcode.mp4"
              type="video/mp4"
            />
            <source
              src="https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c%2F6806b1a9934255cdbea583c4_7031039_Above_Abstract_3840x2160_1-transcode.webm"
              type="video/webm"
            />
          </video>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#202952]/90 via-[#2e335b]/50 to-[#202952]/80" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="tag-dark">Get Started Today</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
              Take Control of Governance Today
            </h2>
            <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto leading-relaxed">
              Join thousands of voters and decentralized organizations who trust ShadowVote for private, tamper-resistant ballots on Midnight.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link to="/create" className="button bg-white text-[#2e335b] font-bold text-sm !py-3.5 !px-8 hover:scale-105 shadow-xl">
                + Deploy Your First Election
              </Link>
              <Link to="/dashboard" className="button ghost text-white border-white/40 text-sm !py-3.5 !px-8 hover:bg-white/10">
                Explore Live Ballots ↗
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
