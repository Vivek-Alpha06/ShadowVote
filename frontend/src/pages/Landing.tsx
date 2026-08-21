import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet, WALLET_INSTALL_URL } from '../hooks/useWallet';

const features = [
  {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    badge: 'Zero-Knowledge',
    title: 'Private by Architecture',
    body: 'Your candidate choice is evaluated inside a local ZK-SNARK witness. No link between your wallet and your vote ever reaches the ledger.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    badge: 'Compact Contract',
    title: 'Public Mathematical Verifiability',
    body: 'Anyone can query the public tally directly from the indexer and verify state proofs without trusting the organizer or any central coordinator.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    badge: 'Unlinkable Nullifiers',
    title: 'Guaranteed Double-Vote Prevention',
    body: 'Cryptographic nullifiers ensure each voter can cast precisely one ballot per election while maintaining mathematical un-linkability.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    badge: 'Preprod Testnet',
    title: 'Serverless On-Chain Execution',
    body: 'State and computation live entirely on Midnight. No central backend, no API keys to revoke, and zero third-party telemetry.',
  },
];

const stats = [
  { value: '100%', label: 'Voter Confidentiality' },
  { value: '0', label: 'Central Database Dependencies' },
  { value: '< 2s', label: 'Local ZK-Proof Generation' },
  { value: 'Preprod', label: 'Live Network Verified' },
];

const codeSnippet = `// ShadowVote.compact — Zero-Knowledge Nullifier Verification
export circuit castVote(
  electionId: Field,
  candidateIndex: Uint<64>
): [] {
  assert(statuses.member(electionId) && statuses.lookup(electionId) == Status.OPEN);
  
  // Voter secret key is read only in the local witness prover
  const sk = localSecretKey();
  const nul = nullifier(electionId, sk);
  
  // Ensure the nullifier has never been spent
  assert(!voted.member(nul));
  voted.insert(nul);
  
  // Increment public candidate tally anonymously
  const key = tallyKey(electionId, candidateIndex);
  tallies.insert(key, tallies.lookup(key) + 1);
}`;

export default function Landing() {
  const { connected, connecting, connect, error } = useWallet();
  const [copiedCode, setCopiedCode] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="relative overflow-hidden selection:bg-white selection:text-black">
      {/* Background subtle monochrome grid */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-60" />
      <div className="pointer-events-none absolute top-[-5%] left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-white/[0.04] blur-[120px] rounded-full" />

      {/* ---------------------------------------------------------------- Hero Section */}
      <section className="relative pt-28 pb-20 px-4 max-w-6xl mx-auto text-center">
        {/* Geometric Dotted Sphere / Concentric Rotating Rings (Optimus Style) */}
        <div className="pointer-events-none absolute right-[-5%] sm:right-[5%] top-12 sm:top-16 w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] opacity-70 z-0 select-none">
          {/* Outer slow clockwise dotted ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-dashed border-white/20"
            style={{ strokeDasharray: '4 8' }}
          />

          {/* Middle counter-clockwise dotted ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-8 rounded-full border border-dotted border-white/30"
          />

          {/* Perspective 3D Orbit Ring */}
          <motion.div
            animate={{ rotateX: [65, 75, 65], rotateZ: [0, 360] }}
            transition={{ rotateZ: { duration: 25, repeat: Infinity, ease: 'linear' }, rotateX: { duration: 8, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute inset-4 rounded-full border border-white/25"
            style={{ transformStyle: 'preserve-3d' }}
          />

          {/* Inner concentric dotted sphere mesh */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-20 rounded-full border border-dashed border-zinc-500/40"
          />

          {/* Ambient center focal light */}
          <div className="absolute inset-28 rounded-full bg-white/[0.04] blur-2xl" />

          {/* Orbiting Satellite Dot */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 flex items-start justify-center"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_#ffffff] -translate-y-1.5" />
          </motion.div>
        </div>

        <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/90 backdrop-blur-xl mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-medium tracking-wider text-zinc-300 uppercase">
            Midnight Preprod Network
          </span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.05]"
        >
          Vote Privately. <br />
          <span className="gradient-text">Verify Publicly.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative z-10 mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          The decentralized, zero-knowledge ballot protocol. Proof of vote validity is generated locally in your browser — zero wallet or candidate correlation on-chain.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          {connected ? (
            <Link to="/dashboard" className="btn-primary">
              Launch App & Dashboard →
            </Link>
          ) : (
            <button
              onClick={() => connect()}
              disabled={connecting}
              className="btn-primary"
            >
              {connecting ? 'Connecting Wallet…' : 'Connect Lace Wallet'}
            </button>
          )}
          <Link to="/dashboard" className="btn-ghost">
            Explore Live Elections
          </Link>
          <a
            href="https://x.com/shadow_vote"
            target="_blank"
            rel="noreferrer noopener"
            className="btn-ghost inline-flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @shadow_vote
          </a>
        </motion.div>

        {error && (
          <p className="mt-4 text-xs text-zinc-400">
            {error.message}{' '}
            {error.code === 'NOT_INSTALLED' && (
              <a href={WALLET_INSTALL_URL} target="_blank" rel="noreferrer noopener" className="underline text-white font-medium">
                Get Lace Wallet ↗
              </a>
            )}
          </p>
        )}

        {/* -------------------------------------------------------- Interactive Code Terminal Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 text-left max-w-3xl mx-auto glass-card border border-zinc-800 rounded-xl overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-[#0c0c0e]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="ml-2 text-xs font-mono text-zinc-400">ShadowVote.compact</span>
            </div>
            <button
              onClick={copyCode}
              className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              {copiedCode ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="p-4 font-mono text-xs text-zinc-300 bg-[#050505] overflow-x-auto leading-relaxed">
            <pre>
              <code>
                {codeSnippet.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row">
                    <span className="table-cell pr-4 select-none text-zinc-600 text-right">{idx + 1}</span>
                    <span className="table-cell">
                      {line.includes('//') ? (
                        <span className="text-zinc-500 italic">{line}</span>
                      ) : line.includes('export circuit') || line.includes('assert') ? (
                        <span className="text-white font-semibold">{line}</span>
                      ) : line.includes('localSecretKey') || line.includes('nullifier') || line.includes('tallies') ? (
                        <span className="text-zinc-400">{line}</span>
                      ) : (
                        line
                      )}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------- Stats Counter Strip */}
      <section className="border-y border-zinc-900 bg-[#050507] py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, idx) => (
            <div key={idx}>
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{s.value}</p>
              <p className="mt-0.5 text-xs text-zinc-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ Feature Cards Grid */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Architecture Highlights</h2>
          <p className="mt-2 text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Engineered for Absolute Privacy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card glass-hover p-6 border border-zinc-800/80"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  {f.icon}
                </div>
                <span className="tech-badge">{f.badge}</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- Comparison Matrix */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="glass-card p-6 sm:p-8 border border-zinc-800">
          <h3 className="text-lg font-bold text-white text-center mb-6">
            The ShadowVote Privacy Guarantee
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-2 mb-3 text-white font-semibold text-sm">
                <span>✓</span> Publicly Visible & Verifiable
              </div>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>• Election parameters and candidate lists</li>
                <li>• Real-time public vote counts</li>
                <li>• Anonymous per-election nullifiers</li>
                <li>• Zero-knowledge validity proofs</li>
              </ul>
            </div>

            <div className="p-5 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-2 mb-3 text-zinc-300 font-semibold text-sm">
                <span>✕</span> Permanently Hidden & Private
              </div>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>• The voter's candidate selection</li>
                <li>• Any link between wallet and ballot</li>
                <li>• Local private witness secret keys</li>
                <li>• Historical voter preference</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- Bottom CTA Banner */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <div className="glass-card p-10 border border-zinc-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Deploy or Join a Private Election
          </h2>
          <p className="mt-2 text-zinc-400 text-sm max-w-md mx-auto">
            Experience zero-knowledge voting directly on Midnight Preprod.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/create" className="btn-primary">
              Create Election
            </Link>
            <Link to="/dashboard" className="btn-ghost">
              View Elections
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
