import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  ShieldCheck,
  KeyRound,
  Zap,
  BarChart3,
  Vote,
  FileCheck,
  Check,
  CheckCircle2,
  ArrowRight,
  Plus,
  Building2,
  Code,
  Scale,
} from 'lucide-react';

// Interactive Tab Interface Data
const TABS_DATA = [
  {
    id: 'privacy',
    label: 'Compact Contracts',
    icon: ShieldCheck,
    title: 'AI & Compact Smart Contracts',
    description: 'When you cast a vote, the candidate index is supplied exclusively as a private circuit input (witness). The zero-knowledge proof generated on your device proves you made a valid choice without ever revealing which candidate you selected.',
    img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/68000dde57255acc721d728f_Illustations%20Tabs%20(3).jpg',
    metric: '100% Confidential',
    badge: 'Compact DSL VM',
    detail: 'Automated circuit constraints prevent state tampering, invalid candidate choices, and unauthorized ballot creation.',
  },
  {
    id: 'nullifier',
    label: 'One-Tap Voting',
    icon: KeyRound,
    title: 'One-Tap Shielded Voting',
    description: 'A cryptographic nullifier is computed on-chain as nullifier(electionId, secretKey). The smart contract checks whether this hash was previously used, preventing double voting while making it mathematically impossible to link back to your public wallet address.',
    img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/68000ddd9478ab3943fe4972_Illustations%20Tabs%20(4).jpg',
    metric: 'Zero Identity Leakage',
    badge: 'Lace Native',
    detail: 'Witness encryption is evaluated locally inside browser RAM. Your wallet signature is never linked to your selection.',
  },
  {
    id: 'compact',
    label: 'Multi-Option',
    icon: Zap,
    title: 'Multi-Option Ballot Architecture',
    description: 'ShadowVote runs on verified Compact circuits compiled directly for the Midnight Network runtime. Ledger transitions enforce election deadlines, organizer rights, and tally privacy on-chain.',
    img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/68000ddd6568234936d9b18e_Illustations%20Tabs%20(2).jpg',
    metric: 'On-Chain Verifiable',
    badge: 'Preview Testnet',
    detail: 'Configure custom duration deadlines, voting windows, and multi-option selection rules in one seamless interface.',
  },
  {
    id: 'tally',
    label: 'Telemetry',
    icon: BarChart3,
    title: 'Real-Time Turnout Telemetry',
    description: 'To prevent strategic bandwagon effects during voting, candidate vote tallies remain sealed while the election is active. Once the countdown expires, final results are trustlessly decrypted and permanently recorded.',
    img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/68000dddfa56f7104d3fd8db_Illustations%20Tabs%20(1).jpg',
    metric: 'Tamper-Resistant',
    badge: 'Sealed Ballots',
    detail: 'Voters can track aggregate turnout percentage live while individual choices stay sealed until countdown timer concludes.',
  },
];

// Testimonial Data with Clean Professional Vector Icons
const TESTIMONIALS = [
  {
    quote: 'ShadowVote solved our DAO’s biggest governance headache: whale intimidation and bandwagon voting. Having provable private ballots on Midnight is a game-changer.',
    author: 'Elena R.',
    role: 'DeFi Governance Lead',
    icon: Scale,
    iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    quote: 'The UX is remarkably fast. Generating the ZK proof client-side and watching the transaction settle on Midnight Preview takes just seconds with Lace.',
    author: 'Marcus K.',
    role: 'Web3 Core Contributor',
    icon: Code,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    quote: 'No paperwork, no centralized servers, and mathematical voter privacy. We ran our board elections with 100% confidence in the audit trail.',
    author: 'Sarah M.',
    role: 'DAO Council Member',
    icon: Building2,
    iconColor: 'text-violet-600 bg-violet-50 border-violet-200',
  },
  {
    quote: 'Being able to verify the smart contract state directly on the Midnight Explorer while voter choices stay secret is the holy grail of decentralized democracy.',
    author: 'David L.',
    role: 'Protocol Auditor',
    icon: ShieldCheck,
    iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
  },
];

export default function Landing() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchElectionId, setSearchElectionId] = useState('');
  
  // Interactive Live ZK Simulator inside Dashboard Showcase
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(0);
  const [simProving, setSimProving] = useState(false);
  const [simStep, setSimStep] = useState<'idle' | 'witness' | 'nullifier' | 'proven'>('idle');
  const [proofHash, setProofHash] = useState<string | null>(null);

  // Responsive desktop check
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // =========================================================================
  // DEDICATED SCROLL-DRIVEN STICKY SHOWCASE SECTION CHOREOGRAPHY
  // min-height: 135vh -> sticky 100vh -> continuous states -> zero free/blank space
  // =========================================================================
  const showcaseContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: showcaseContainerRef,
    offset: ['start start', 'end end'],
  });

  // Buttery-smooth spring physics for natural 60fps inertia
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 24,
    restDelta: 0.001,
  });

  // 1. Dashboard X Position:
  // Starts centered at 0px on landing, then glides right (+380px)
  const cardX = useTransform(
    smoothProgress,
    [0, 0.35, 1],
    isDesktop ? [0, 380, 390] : [0, 0, 0]
  );

  // 2. Dashboard Y Position:
  // Starts at 15px on landing, then settles gracefully (+30px) in balanced alignment with left text
  const cardY = useTransform(
    smoothProgress,
    [0, 0.35, 1],
    isDesktop ? [15, 30, 35] : [5, 15, 20]
  );

  // 3. Dashboard Scale:
  // Large on landing (1.0 across max-w-6xl), scales to 0.83 on the right
  const cardScale = useTransform(
    smoothProgress,
    [0, 0.35, 1],
    isDesktop ? [1.0, 0.84, 0.82] : [1.0, 0.92, 0.88]
  );

  // 4. Dashboard Tilt:
  // Upright at initial open (0deg), then turns toward the left (-12deg) as it moves right
  const cardRotateY = useTransform(smoothProgress, [0, 0.35, 1], [0, -12, -13]);
  const cardRotateX = useTransform(smoothProgress, [0, 0.35, 1], [0, 5, 6]);
  const cardRotateZ = useTransform(smoothProgress, [0, 0.35, 1], [0, 1.0, 1.2]);

  // Dynamic ambient purple/indigo blur glow follows dashboard
  const glowX = useTransform(
    smoothProgress,
    [0, 0.35, 1],
    isDesktop ? [0, 380, 390] : [0, 0, 0]
  );
  const glowY = useTransform(
    smoothProgress,
    [0, 0.35, 1],
    isDesktop ? [15, 30, 35] : [5, 15, 20]
  );
  const glowScale = useTransform(smoothProgress, [0, 0.35, 1], [1.1, 1.15, 1.0]);
  const glowOpacity = useTransform(smoothProgress, [0, 0.35, 1], [0.45, 0.85, 0.6]);

  // 5. Background Sky Animation to White Blend
  const skyBlendOpacity = useTransform(smoothProgress, [0, 0.15, 0.45], [0, 0.5, 1.0]);

  // 6. Left-Hand Side Protocol Feature Panel (Smooth entrance from left, perfect vertical centering, zero cropping)
  const leftOpacity = useTransform(smoothProgress, [0.04, 0.28], [0, 1]);
  const leftX = useTransform(
    smoothProgress,
    [0.04, 0.28],
    isDesktop ? [-35, 0] : [0, 0]
  );
  const leftScale = useTransform(smoothProgress, [0.04, 0.28], [0.95, 1]);

  const runProofSimulator = () => {
    if (simProving) return;
    setSimProving(true);
    setSimStep('witness');
    setTimeout(() => {
      setSimStep('nullifier');
      setTimeout(() => {
        setSimStep('proven');
        setProofHash('0x9f8b4a7e' + Math.random().toString(16).substring(2, 10) + '...8e60');
        setSimProving(false);
      }, 700);
    }, 700);
  };

  return (
    <div className="relative overflow-hidden bg-[#f5f4fd]">
      {/* Signature OVO Credix Background Sky Video spanning behind hero and fading slowly to white */}
      <div className="bg-holder">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c%2F6806b1a9934255cdbea583c4_7031039_Above_Abstract_3840x2160_1-poster-00001.jpg"
          className="bg-video"
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
        {/* Dynamic Scroll-Driven White Blend Layer */}
        <motion.div
          style={{ opacity: skyBlendOpacity }}
          className="absolute inset-0 bg-[#f5f4fd] pointer-events-none"
        />
        <div className="bg-overlay" />
      </div>

      {/* =========================================================================
          SECTION 1: HERO TOP SCREEN (Headline, Pure White Typography & CTA Pill)
          ========================================================================= */}
      <section className="relative z-10 px-4 sm:px-6 pt-20 sm:pt-24 pb-2 sm:pb-4 text-center">
        <div className="relative mx-auto max-w-4xl">
          {/* Eyebrow Tag in Pure White */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex justify-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 backdrop-blur-md border border-white/30 text-white shadow-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Midnight Preview Network · Zero-Knowledge Governance
            </span>
          </motion.div>

          {/* Hero Headline in Pure Radiant White */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-[1.08] drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
          >
            Your Vote. Your Shield. <br />
            <span className="text-white font-extrabold drop-shadow-[0_4px_24px_rgba(255,255,255,0.45)]">
              Your Future is here.
            </span>
          </motion.h1>

          {/* Subtitle in Pure Crisp White */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-base sm:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] font-medium"
          >
            Built on a foundation of trust and cryptographic zero-knowledge security, we ensure that your governance decisions and ballot choices are always protected.
          </motion.p>

          {/* Search / Action Form Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto"
          >
            <div className="relative w-full flex items-center bg-white/95 backdrop-blur-md rounded-full border border-white/40 p-1.5 shadow-2xl">
              <input
                type="text"
                placeholder="Enter election title or ID to participate..."
                value={searchElectionId}
                onChange={(e) => setSearchElectionId(e.target.value)}
                className="w-full bg-transparent px-4 py-2.5 text-sm font-medium text-[#2e335b] placeholder:text-[#2e335b]/50 outline-none"
              />
              <Link
                to={searchElectionId.trim() ? `/election/${searchElectionId.trim()}` : '/dashboard'}
                className="button accent text-xs !py-2.5 !px-6 whitespace-nowrap inline-flex items-center gap-1.5"
              >
                <span>{searchElectionId.trim() ? 'Open Ballot' : 'Browse Elections'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <Link
              to="/create"
              className="button whitespace-nowrap text-xs !py-3 !px-6 bg-white/90 backdrop-blur-md hover:bg-white text-[#2e335b] border border-white/40 shadow-lg inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Election</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: DEDICATED SCROLL-DRIVEN STICKY SHOWCASE (135vh - ZERO DEAD SPACE)
          The Dashboard is pinned -> moves right & settles -> Permanent protocol overview on left
          ========================================================================= */}
      <section ref={showcaseContainerRef} className="relative min-h-[135vh] -mt-16 sm:-mt-24">
        {/* Sticky 100vh Viewport Container */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center z-20 px-4 sm:px-8">
          <div className="relative w-full max-w-7xl mx-auto h-full flex items-center justify-center">
            
            {/* ------------------------------------------------------------------
                LEFT-HAND SIDE: TEXT POSITIONED IN BALANCED OPTICAL ALIGNMENT (ZERO CROPPING)
                ------------------------------------------------------------------ */}
            <motion.div
              style={{
                opacity: leftOpacity,
                x: leftX,
                scale: leftScale,
              }}
              className="absolute left-4 sm:left-8 lg:left-6 xl:left-8 top-1/2 -translate-y-1/2 w-full max-w-sm lg:max-w-md xl:max-w-lg flex flex-col justify-center text-left z-30 pointer-events-auto"
            >
              {/* Micro Step Indicator */}
              <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                <span className="tag !text-[10px] !py-0.5 !px-2.5">
                  Zero-Knowledge Protocol
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span>Client RAM Circuit</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#202952] font-heading leading-tight tracking-tight">
                Confidential Governance, Anytime, Wherever You Are
              </h2>
              <div className="h-[2px] w-12 bg-[#2e335b]/20 my-2 sm:my-2.5 rounded-full" />
              <p className="text-xs sm:text-sm text-[#2e335b]/80 leading-relaxed font-medium">
                Cast votes with 100% cryptographic confidentiality. Your candidate selection is processed purely inside device RAM and is never broadcast in cleartext across the network.
              </p>

              <div className="mt-3 sm:mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-[#202952]">
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-xl border border-[#cdd0e5] shadow-xs">
                  <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span className="text-[11px] sm:text-xs">Client-Side RAM Prover</span>
                </div>
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-xl border border-[#cdd0e5] shadow-xs">
                  <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span className="text-[11px] sm:text-xs">Lace Wallet Signed</span>
                </div>
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-xl border border-[#cdd0e5] shadow-xs">
                  <span className="h-4 w-4 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-300 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span className="text-[11px] sm:text-xs">SHA-256 Nullifiers</span>
                </div>
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-xl border border-[#cdd0e5] shadow-xs">
                  <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span className="text-[11px] sm:text-xs">0 DUST Gas Fees</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <Link to="/dashboard" className="button accent text-xs !py-2 !px-4 sm:!py-2.5 sm:!px-5 shadow-md font-bold inline-flex items-center gap-1.5">
                  <span>Browse Active Ballots</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link to="/create" className="button text-xs !py-2 !px-4 sm:!py-2.5 sm:!px-5 shadow-md font-bold bg-white text-[#2e335b] border border-[#cdd0e5] hover:bg-[#dfe7f9] inline-flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Deploy Election</span>
                </Link>
              </div>
            </motion.div>

            {/* ------------------------------------------------------------------
                RIGHT-HAND SIDE: PINNED 3D TILTING SHOWCASE DASHBOARD
                ------------------------------------------------------------------ */}
            <div className="relative perspective-container flex items-center justify-center pointer-events-auto">
              {/* Dynamic back glow */}
              <motion.div
                style={{
                  x: glowX,
                  y: glowY,
                  scale: glowScale,
                  opacity: glowOpacity,
                }}
                className="blue-blur"
              />

              {/* The Dashboard Mockup Element */}
              <motion.div
                style={{
                  x: cardX,
                  y: cardY,
                  scale: cardScale,
                  rotateY: cardRotateY,
                  rotateX: cardRotateX,
                  rotateZ: cardRotateZ,
                  transformPerspective: 1400,
                  transformStyle: 'preserve-3d',
                }}
                className="credix-card p-6 sm:p-8 lg:p-9 bg-white border-2 border-[#cdd0e5] shadow-2xl relative z-20 w-full max-w-5xl xl:max-w-6xl min-h-[520px] sm:min-h-[560px] flex flex-col justify-between"
              >
                {/* Window Topbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cdd0e5]/60 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-400 inline-block shadow-xs" />
                      <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-xs" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-xs" />
                    </div>
                    <div className="text-xs font-bold text-[#2e335b] bg-[#dfe7f9] px-3.5 py-1 rounded-full border border-[#cdd0e5]/60">
                      ShadowVote ZK Engine · Live Verification
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-[#2e335b]/80">
                    <span className="inline-flex items-center gap-1.5 bg-[#f5f4fd] px-2.5 py-1 rounded-full border border-[#cdd0e5]">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                      Midnight Preview Testnet
                    </span>
                    <span>Contract: <code className="font-mono text-[11px] bg-[#dfe7f9] px-2 py-0.5 rounded border border-[#cdd0e5]">8e60d0...c143d</code></span>
                  </div>
                </div>

                {/* Interactive Ballot & ZK Proof Simulation Panel */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left flex-1">
                  {/* Left Column: Sample Ballot */}
                  <div className="md:col-span-6 bg-[#f5f4fd] p-5 sm:p-6 rounded-2xl border border-[#cdd0e5]/80 flex flex-col justify-between shadow-inner">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="tag !text-[10px] !py-0.5 !px-2.5">Ballot #01 · Active</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Voting Open · 4d 18h left</span>
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#2e335b] font-heading leading-snug">
                        Midnight Grant Allocation 2026
                      </h3>
                      <p className="text-xs text-[#2e335b]/75 mt-1.5 leading-relaxed">
                        Select a candidate proposal to simulate client-side zero-knowledge witness generation:
                      </p>

                      <div className="mt-4 space-y-2.5">
                        {[
                          { idx: 0, name: 'Proposal A: Shielded DeFi Protocol', desc: 'Zero-knowledge private swaps & lending pools' },
                          { idx: 1, name: 'Proposal B: Identity & Nullifier Registry', desc: 'Sybil-resistant double-voting protection' },
                          { idx: 2, name: 'Proposal C: Developer Tooling & SDK', desc: 'Compact circuit templates, CLI & testing suite' },
                        ].map((opt) => (
                          <button
                            key={opt.idx}
                            onClick={() => setSelectedCandidate(opt.idx)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                              selectedCandidate === opt.idx
                                ? 'bg-[#2e335b] text-white border-[#2e335b] shadow-md scale-[1.01]'
                                : 'bg-white text-[#2e335b] border-[#cdd0e5] hover:bg-[#dfe7f9]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 text-left">
                              <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 font-bold ${selectedCandidate === opt.idx ? 'border-white bg-white text-[#2e335b]' : 'border-[#cdd0e5] bg-[#f5f4fd]'}`}>
                                {selectedCandidate === opt.idx && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </span>
                              <div>
                                <p className="font-bold leading-tight">{opt.name}</p>
                                <p className={`text-[10px] mt-0.5 ${selectedCandidate === opt.idx ? 'text-white/75' : 'text-[#2e335b]/60'}`}>{opt.desc}</p>
                              </div>
                            </div>
                            <span className={`font-mono text-[11px] px-2 py-0.5 rounded ${selectedCandidate === opt.idx ? 'bg-white/20 text-white' : 'bg-[#dfe7f9] text-[#2e335b]'}`}>
                              #{opt.idx + 1}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#cdd0e5]/70 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-[#2e335b]/70 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span>Confidential RAM Mode</span>
                      </div>
                      <button
                        onClick={runProofSimulator}
                        disabled={simProving}
                        className="button sm accent text-xs !py-2 !px-4 shadow-md font-bold inline-flex items-center gap-1.5"
                      >
                        {simProving ? (
                          'Proving Circuit…'
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            <span>Generate ZK Proof</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Interactive Cryptographic Proof Pipeline */}
                  <div className="md:col-span-6 bg-[#2e335b] text-white p-5 sm:p-6 rounded-2xl border border-[#3e4475] flex flex-col justify-between shadow-xl">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="tag-dark !text-[10px] !py-0.5 !px-2.5">ZK-SNARK Pipeline</span>
                        <span className="font-mono text-[11px] text-indigo-300 font-semibold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">Compact Circuit</span>
                      </div>

                      <div className="space-y-3 mt-3">
                        <div className={`p-3 rounded-xl border text-xs transition-all ${simStep === 'witness' ? 'bg-indigo-950/80 border-indigo-400 shadow-md ring-2 ring-indigo-400/40' : 'bg-white/5 border-white/10'}`}>
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-white">1. Private Witness Encryption</span>
                            <span className="font-mono text-[11px] text-emerald-400 font-bold">
                              {selectedCandidate !== null ? `Proposal #${selectedCandidate + 1}` : 'Pending'}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                            Encrypted strictly inside device RAM. Candidate choice is never broadcast in cleartext across the network.
                          </p>
                        </div>

                        <div className={`p-3 rounded-xl border text-xs transition-all ${simStep === 'nullifier' ? 'bg-indigo-950/80 border-indigo-400 shadow-md ring-2 ring-indigo-400/40' : 'bg-white/5 border-white/10'}`}>
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-white">2. Nullifier Proof Generation</span>
                            <span className="font-mono text-[11px] text-amber-300 font-bold">
                              {simStep === 'nullifier' || simStep === 'proven' ? 'SHA-256 Hash' : 'Standby'}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                            Prevents double voting on Midnight ledger while mathematically breaking any link to your public address.
                          </p>
                        </div>

                        <div className={`p-3 rounded-xl border text-xs transition-all ${simStep === 'proven' ? 'bg-emerald-950/70 border-emerald-400 shadow-md ring-2 ring-emerald-400/40' : 'bg-white/5 border-white/10'}`}>
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-white">3. ZK Proof Verified &amp; Settled</span>
                            <span className="font-mono text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                              {proofHash ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                                  <span>Valid (0.8s)</span>
                                </>
                              ) : (
                                'Ready'
                              )}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                            {proofHash ? `Hash: ${proofHash}` : 'Ready for client-side zero-knowledge execution.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70 font-mono">
                      <span>Ledger: Midnight</span>
                      <span>Proof Time: &lt; 1.2s</span>
                      <span>Gas: 0 DUST</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: ELEVATED ECOSYSTEM MARQUEE & PROTOCOL COMMAND STRIP
          ========================================================================= */}
      <section className="py-8 px-4 sm:px-6 bg-[#edf1fa] border-y border-[#cdd0e5]">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Live Status Command Capsule */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#cdd0e5] shadow-md">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <div>
                <h4 className="text-sm font-bold text-[#202952] font-heading">
                  Midnight Preview Network · Confidential Protocol v1.0
                </h4>
                <p className="text-xs text-[#2e335b]/70 font-medium">
                  Zero-Knowledge zk-SNARK Circuits Verified On-Chain
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 bg-[#dfe7f9] text-[#202952] px-3.5 py-1.5 rounded-full border border-[#cdd0e5] shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                <span>100% Client-Side RAM</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-900 px-3.5 py-1.5 rounded-full border border-indigo-200 shadow-xs">
                <KeyRound className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                <span>Unlinkable Nullifiers</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-xs">
                <Zap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>0 DUST Gas Fees</span>
              </span>
            </div>
          </div>

          {/* Ecosystem Tech Badges Strip */}
          <div className="relative overflow-hidden py-2">
            <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 text-xs font-bold text-[#202952]/75">
              {['MIDNIGHT PREVIEW', 'SUBSQUID GRAPHQL', 'COMPACT VM CIRCUITS', 'LACE WALLET', 'CARDANO WASM', 'HALO2 / PLONK'].map((item) => (
                <div key={item} className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-[#cdd0e5] flex items-center gap-2 shadow-xs hover:border-[#202952] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="tracking-wider">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: 6-ITEM FEATURE GRID (OVO Credix .simple-feature-container with 3D Tilt)
          ========================================================================= */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 bg-[#f5f4fd] overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="tag mb-3">Midnight ZK-SNARKs</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#202952] font-heading tracking-tight">
              Private Voting Architecture Built for Midnight Network
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#2e335b]/75 leading-relaxed">
              ShadowVote provides complete end-to-end ballot confidentiality, Sybil-resistant double-voting prevention, and trustless on-chain verification.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Client-Side Witness Encryption',
                desc: 'Your ballot selection is encrypted inside your browser RAM. Your chosen candidate is never sent in cleartext across network RPC nodes.',
              },
              {
                icon: KeyRound,
                title: 'Nullifier Double-Vote Shield',
                desc: 'Deterministic cryptographic nullifiers prevent double voting while mathematically decoupling your ballot from your Lace wallet address.',
              },
              {
                icon: BarChart3,
                title: 'Sealed Pre-Deadline Tallies',
                desc: 'Accumulated vote tallies remain sealed while the election is active, preventing social bias, voter coercion, and bandwagoning.',
              },
              {
                icon: Zap,
                title: 'Sub-Second ZK Proving',
                desc: 'Optimized client-side Compact proving routines execute in under 1.2 seconds with zero DUST gas fee overhead on Midnight Preview.',
              },
              {
                icon: Vote,
                title: 'Custom Ballot Creation',
                desc: 'Deploy elections with custom duration timers, multiple candidate options, and specialized governance parameters in single clicks.',
              },
              {
                icon: FileCheck,
                title: 'On-Chain Verifiable Audits',
                desc: 'Every election deployment, ballot nullifier, and decrypted outcome is permanently anchored on the Midnight Preview blockchain explorer.',
              },
            ].map((f, i) => {
              const fromLeft = i % 3 === 0;
              const fromRight = i % 3 === 2;
              const FeatureIcon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{
                    opacity: 0,
                    x: fromLeft ? -60 : fromRight ? 60 : 0,
                    y: !fromLeft && !fromRight ? 40 : 0,
                  }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  whileHover={{
                    y: -8,
                    scale: 1.025,
                    rotateY: fromLeft ? 3 : fromRight ? -3 : 0,
                    rotateX: -2,
                    boxShadow: '0 20px 40px rgba(46, 51, 91, 0.12)',
                    borderColor: '#9ba5ea',
                  }}
                  transition={{
                    duration: 0.65,
                    delay: (i % 3) * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    transformPerspective: 1000,
                    transformStyle: 'preserve-3d',
                  }}
                  className="simple-feature-container cursor-pointer transition-colors group"
                >
                  <div className="simple-feature-icon-holder shadow-xs transition-transform duration-300 group-hover:scale-110">
                    <FeatureIcon className="w-6 h-6 text-[#2e335b]" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#202952] font-heading mb-2">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#2e335b]/75 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: "CONFIDENTIAL GOVERNANCE PROTOCOLS" (OVO Credix .services-card with 3D Outset Panels)
          ========================================================================= */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 overflow-hidden">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Section Heading */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2"
          >
            <div className="space-y-3 max-w-2xl text-left">
              <span className="tag">Zero-Knowledge Security</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#202952] font-heading tracking-tight">
                Shielded Ballots with Mathematical Integrity
              </h2>
              <p className="text-sm sm:text-base text-[#2e335b]/75 leading-relaxed">
                Eliminate voter intimidation, strategic bandwagoning, and vote-buying with privacy-preserving Compact smart contracts on Midnight.
              </p>
            </div>
            <Link to="/create" className="button accent !py-3 !px-7 text-xs font-bold whitespace-nowrap shadow-lg inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy Custom Ballot</span>
            </Link>
          </motion.div>

          {/* Row 1 / Service Card 1 (Left Content + Right 3D Outset Code Panel) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.65 }}
            className="services-card text-left"
          >
            <div className="space-y-4">
              <span className="tag">Compact Smart Contracts</span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#202952] font-heading leading-tight">
                Cryptographic State Verification via Compact DSL
              </h3>
              <div className="h-[2px] w-14 bg-[#2e335b]/20 my-2 rounded-full" />
              <p className="text-sm sm:text-base text-[#2e335b]/75 leading-relaxed">
                Formally verified smart contracts enforce ballot validity directly on the Midnight ledger without exposing sensitive voter records or choices to external validators.
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  'Private witness input evaluation strictly inside client device RAM',
                  'Smart contract asserts valid election status and open duration window',
                  'Collision-resistant nullifier insertion prevents duplicate submissions',
                  'Instant client verification with zero reliance on trusted central servers',
                ].map((item) => (
                  <div key={item} className="list-holder">
                    <div className="list-icon-holder shadow-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#202952] leading-tight">{item}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <Link to="/dashboard" className="button accent text-xs !py-3 !px-6 shadow-md font-bold inline-flex items-center gap-1.5">
                  <span>Browse Active Elections</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 3D Perspective Outset Code Panel */}
            <motion.div
              whileHover={{
                scale: 1.03,
                rotateY: -6,
                rotateX: 4,
                boxShadow: '0 24px 50px rgba(46, 51, 91, 0.16)',
              }}
              transition={{ duration: 0.4 }}
              style={{
                transformPerspective: 1200,
                transformStyle: 'preserve-3d',
              }}
              className="service-image-holder p-6 bg-gradient-to-br from-white to-[#dfe7f9] border border-[#cdd0e5] shadow-xl relative cursor-pointer"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#cdd0e5]/60 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-bold text-[#202952]">Compact Circuit Engine</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                  <Check className="w-3 h-3 text-emerald-700" />
                  <span>Verified 0x8e60</span>
                </span>
              </div>
              <div className="font-mono text-xs bg-[#2e335b] text-indigo-100 p-5 rounded-2xl space-y-2 overflow-x-auto shadow-inner">
                <p className="text-pink-300 font-bold">// Compact Circuit Verification</p>
                <p><span className="text-violet-300">export circuit</span> vote(eId: Bytes, choice: Witness): Void &#123;</p>
                <p className="pl-4 text-emerald-300">assert(elections.lookup(eId).status == OPEN);</p>
                <p className="pl-4">val n = nullifier(eId, ownSecretKey());</p>
                <p className="pl-4 text-emerald-300">assert(!nullifiers.member(n));</p>
                <p className="pl-4">nullifiers.insert(n);</p>
                <p className="pl-4">tallies.increment(eId, choice);</p>
                <p>&#125;</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Row 2 / Service Card 2 (Inverted: Left 3D Metrics Panel + Right Content) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.65 }}
            className="services-card inverted text-left"
          >
            {/* 3D Perspective Outset Metrics Panel */}
            <motion.div
              whileHover={{
                scale: 1.03,
                rotateY: 6,
                rotateX: -4,
                boxShadow: '0 24px 50px rgba(46, 51, 91, 0.25)',
              }}
              transition={{ duration: 0.4 }}
              style={{
                transformPerspective: 1200,
                transformStyle: 'preserve-3d',
              }}
              className="service-image-holder p-6 bg-[#2e335b] text-white border border-[#3e4475] shadow-2xl relative cursor-pointer"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <span className="text-xs font-bold text-white">Turnout &amp; Cryptographic Telemetry</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                  Live Synchronized
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-3xl font-black text-white">0%</p>
                  <p className="text-xs text-white/70 mt-1 font-medium">Choice Leakage</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-3xl font-black text-indigo-300">100%</p>
                  <p className="text-xs text-white/70 mt-1 font-medium">Verifiable Tallies</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-3xl font-black text-emerald-400">0 DUST</p>
                  <p className="text-xs text-white/70 mt-1 font-medium">Read Transaction Cost</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-3xl font-black text-amber-300">&lt; 1.2s</p>
                  <p className="text-xs text-white/70 mt-1 font-medium">Proof Generation</p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              <span className="tag">Sybil Resistance</span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#202952] font-heading leading-tight">
                Zero Identity Leakage. Complete Double-Voting Protection.
              </h3>
              <div className="h-[2px] w-14 bg-[#2e335b]/20 my-2 rounded-full" />
              <p className="text-sm sm:text-base text-[#2e335b]/75 leading-relaxed">
                Each vote generates a single-use cryptographic nullifier linked to the ballot instance. The protocol guarantees one-person-one-vote without tracking voter identities or transaction history.
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  'Unlinkable nullifier hashes computed deterministically on-chain',
                  'Tallies automatically decrypt upon election countdown completion',
                  'Seamless Lace Wallet connection with one-click cryptographic signing',
                  'Permanent audit history indexed via real-time Subsquid GraphQL',
                ].map((item) => (
                  <div key={item} className="list-holder">
                    <div className="list-icon-holder shadow-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#202952] leading-tight">{item}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <Link to="/create" className="button text-xs !py-3 !px-6 shadow-md font-bold inline-flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Deploy Custom Ballot</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5.5: "ZERO-KNOWLEDGE TECHNICAL PILLARS" (OVO Credix 3-Col Service Grid + Shades + 3D Tilt)
          ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#edf1fa] overflow-hidden border-y border-[#cdd0e5]/60">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header with decorative shades */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-2">
            <div className="space-y-3 max-w-2xl text-left">
              <span className="tag">Core Capabilities</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#202952] font-heading tracking-tight">
                Architected for Confidential Web3 Governance
              </h2>
              <p className="text-sm sm:text-base text-[#2e335b]/80 leading-relaxed">
                From decentralized DAO treasury allocations to university elections, ShadowVote delivers institutional-grade ballot privacy on Midnight.
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

          {/* 3 Column Service Illustrated Grid with 3D Tilt Hover */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                title: 'Pre-Deadline Sealed Accumulators',
                desc: 'Vote tallies remain mathematically sealed until the timer expires, ensuring voters make unbiased decisions without seeing live leaderboards.',
                img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/680008fa41036056d7b7776a_Illusttaions%20(1).jpg',
                badge: 'Anti-Bandwagoning',
              },
              {
                title: 'Ephemeral Browser Prover',
                desc: 'Zero-knowledge witness generation runs entirely in your local browser sandbox, leaving zero plaintext footprint on external servers.',
                img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/680008f63ac466f286bbda15_Illusttaions%20(3).jpg',
                badge: 'Client-Side Privacy',
              },
              {
                title: 'Trustless Mathematical Verification',
                desc: 'Anyone can independently verify the final tally and proof validity using open-source Compact VM verification keys.',
                img: 'https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/680008f78cba24814f8fe8ed_Illusttaions%20(2).jpg',
                badge: 'Public Verifiability',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                whileHover={{
                  y: -10,
                  scale: 1.035,
                  rotateY: idx === 0 ? 3 : idx === 2 ? -3 : 0,
                  rotateX: -2,
                }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                style={{
                  transformPerspective: 1000,
                  transformStyle: 'preserve-3d',
                }}
                className="credix-card p-6 flex flex-col justify-between hover:shadow-2xl transition-all cursor-pointer bg-white"
              >
                <div>
                  <div className="rounded-2xl overflow-hidden border border-[#cdd0e5] mb-5 aspect-[4/3] bg-white relative">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-108"
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
          SECTION 6: "HOW SHADOWVOTE WORKS UNDER THE HOOD" (Interactive Tab Switcher + 3D Preview)
          ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#f5f4fd] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl space-y-10"
        >
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="tag">Interactive Architecture</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#202952] font-heading tracking-tight">
              How ShadowVote Works Under the Hood
            </h2>
            <p className="text-sm sm:text-base text-[#2e335b]/80 leading-relaxed">
              A comprehensive breakdown of the zero-knowledge proving pipeline and Compact smart contracts powering confidential voting.
            </p>
          </div>

          {/* Interactive Tabbed Box matching OVO Credix Features */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center credix-card p-6 sm:p-10 bg-white border border-[#cdd0e5] shadow-xl">
            {/* Left Tab Menu List */}
            <div className="lg:col-span-5 space-y-3">
              {TABS_DATA.map((tab, idx) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(idx)}
                    className={`tab-link-2 ${activeTab === idx ? 'active' : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${activeTab === idx ? 'bg-[#2e335b] text-white border-[#2e335b]' : 'bg-[#dfe7f9] text-[#2e335b] border-[#cdd0e5]'}`}>
                        <TabIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm sm:text-base font-bold text-[#202952] font-heading">
                        {tab.title}
                      </span>
                    </div>
                    <p className="text-xs text-[#2e335b]/75 mt-1 leading-relaxed pl-9">
                      {tab.description}
                    </p>
                    <div className="active-line" />
                  </button>
                );
              })}
            </div>

            {/* Right Active Tab 3D Preview Pane */}
            <div className="lg:col-span-7">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl overflow-hidden border border-[#cdd0e5] shadow-lg bg-[#f5f4fd] p-6 space-y-5 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="tag !text-[10px]">{TABS_DATA[activeTab].badge}</span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full shadow-xs">
                    {TABS_DATA[activeTab].metric}
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden border border-[#cdd0e5] aspect-[16/9] bg-white relative shadow-sm">
                  <img
                    src={TABS_DATA[activeTab].img}
                    alt={TABS_DATA[activeTab].title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <p className="text-xs sm:text-sm text-[#2e335b]/85 font-medium leading-relaxed">
                  {TABS_DATA[activeTab].detail}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 6.5: 2-COLUMN HIGH-IMPACT FEATURE CARDS (Sub-Second Proofs & Autonomous Settlement)
          ========================================================================= */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.6 }}
            className="simple-card-holder cursor-pointer text-left"
          >
            <div className="aspect-[16/10] overflow-hidden border-b border-[#cdd0e5] bg-white">
              <img
                src="https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/68001c4e7733c299d00c3e25_Grid%20Images%20(2).jpg"
                alt="Quick Proof Generation"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-7 space-y-3">
              <span className="tag !text-[10px]">Client-Side WASM</span>
              <h4 className="text-xl sm:text-2xl font-bold text-[#202952] font-heading">
                Sub-Second Client-Side Prover
              </h4>
              <div className="h-[2px] w-12 bg-[#2e335b]/20 my-2 rounded-full" />
              <p className="text-xs sm:text-sm text-[#2e335b]/75 leading-relaxed">
                Optimized WebAssembly zero-knowledge proving routines compile directly in your browser, generating valid SNARK proofs in under 1.2 seconds without requiring remote proof servers.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.6 }}
            className="simple-card-holder cursor-pointer text-left"
          >
            <div className="aspect-[16/10] overflow-hidden border-b border-[#cdd0e5] bg-white">
              <img
                src="https://cdn.prod.website-files.com/67f82974e65f89a3c0ca8b7c/68001c4ec44bbd64e680539f_Grid%20Images%20(1).jpg"
                alt="Autonomous Settlement"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-7 space-y-3">
              <span className="tag !text-[10px]">Trustless Decryption</span>
              <h4 className="text-xl sm:text-2xl font-bold text-[#202952] font-heading">
                Autonomous On-Chain Outcome Settlement
              </h4>
              <div className="h-[2px] w-12 bg-[#2e335b]/20 my-2 rounded-full" />
              <p className="text-xs sm:text-sm text-[#2e335b]/75 leading-relaxed">
                Once the blockchain block timestamp passes the election deadline, the smart contract automatically enables tally disclosure, ensuring permanent, tamper-proof governance results.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: TESTIMONIALS / DAO REVIEWS (OVO Credix .testimonials-holder)
          ========================================================================= */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <span className="tag mb-3">Community Reviews</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#202952] font-heading">
              Trusted by Web3 Builders &amp; Governance Leads
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#2e335b]/75">
              Read real feedback from testers and community delegates who voted on Midnight Preview.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => {
              const fromLeft = i % 2 === 0;
              const AuthorIcon = t.icon;
              return (
                <motion.div
                  key={t.author}
                  initial={{ opacity: 0, x: fromLeft ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{
                    duration: 0.65,
                    delay: (i % 2) * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="credix-card p-7 flex flex-col justify-between bg-white border border-[#cdd0e5] shadow-md hover:shadow-xl transition-shadow"
                >
                  <p className="text-sm text-[#2e335b]/85 leading-relaxed italic mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#cdd0e5]/60">
                    <span className={`p-2 rounded-xl border flex items-center justify-center ${t.iconColor}`}>
                      <AuthorIcon className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#202952]">{t.author}</h4>
                      <p className="text-[11px] text-[#2e335b]/60">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: BOTTOM HIGH-IMPACT CTA BANNER (OVO Credix .cta-wrapper)
          ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
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
              <Link to="/create" className="button bg-white text-[#2e335b] font-bold text-sm !py-3.5 !px-8 hover:scale-105 shadow-xl inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Deploy Your First Election</span>
              </Link>
              <Link to="/dashboard" className="button ghost text-white border-white/40 text-sm !py-3.5 !px-8 hover:bg-white/10 inline-flex items-center gap-2">
                <span>Explore Live Ballots</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
