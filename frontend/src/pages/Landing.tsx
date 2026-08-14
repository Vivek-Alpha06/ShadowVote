import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet, WALLET_INSTALL_URL } from '../hooks/useWallet';

const features = [
  {
    icon: '🕵️',
    title: 'Private by default',
    body: 'Your candidate choice is sealed in a zero-knowledge proof. No wallet-to-vote link ever touches the chain.',
  },
  {
    icon: '🔍',
    title: 'Publicly verifiable',
    body: 'Anyone can confirm the election exists, that votes were cast, and the final winner — without trusting an organizer.',
  },
  {
    icon: '🚫',
    title: 'No double voting',
    body: 'A per-election nullifier guarantees one ballot per voter, while keeping them anonymous.',
  },
  {
    icon: '🌐',
    title: 'No backend',
    body: 'State lives entirely on Midnight. No central database, no server that can tamper with results.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Connect your wallet',
    body: 'Your wallet signs the transaction. It is never linked to the choice you make.',
  },
  {
    n: '02',
    title: 'Cast your ballot',
    body: 'Your choice becomes a zero-knowledge proof in your browser. Only the proof is submitted.',
  },
  {
    n: '03',
    title: 'Verify the outcome',
    body: 'Tallies are public on-chain. Check any transaction yourself in the block explorer.',
  },
];

export default function Landing() {
  const { connected, connecting, connect, error } = useWallet();

  return (
    <div>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        {/* Ambient glows. Purely decorative, so they must not eat clicks. */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-shadow-purple/20 blur-3xl animate-pulse-slow" />
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-shadow-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-64 h-72 w-72 rounded-full bg-shadow-cyan/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-24 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass inline-flex items-center gap-2 px-4 py-1.5 text-sm text-slate-300"
          >
            <span className="h-2 w-2 rounded-full bg-shadow-purple animate-pulse" />
            Built on Midnight — private inputs, public outcomes
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl"
          >
            Vote <span className="gradient-text">Privately</span>.
            <br />
            Verify <span className="gradient-text">Publicly</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-400"
          >
            Secret ballots for universities, DAOs, clubs and communities — where every vote stays
            secret forever, yet anyone can verify the result.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            {connected ? (
              <Link to="/dashboard" className="btn-primary text-base">
                Go to Dashboard →
              </Link>
            ) : (
              <button
                onClick={() => connect()}
                disabled={connecting}
                className="btn-primary text-base"
              >
                {connecting ? 'Waiting for wallet…' : 'Connect Wallet'}
              </button>
            )}
            <Link to="/dashboard" className="btn-ghost text-base">
              Explore Elections
            </Link>
          </motion.div>

          {error && (
            <p className="mx-auto mt-4 max-w-md text-sm text-rose-300">
              {error.message}{' '}
              {error.code === 'NOT_INSTALLED' && (
                <a
                  href={WALLET_INSTALL_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-semibold underline hover:text-rose-200"
                >
                  Wallet setup guide ↗
                </a>
              )}
            </p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 text-xs text-slate-600"
          >
            No account. No email. No server holding your ballot.
          </motion.p>
        </div>
      </section>

      {/* ------------------------------------------------------------ Features */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass glass-hover p-5"
            >
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-2xl">
                {f.icon}
              </div>
              <h3 className="mb-1.5 font-bold text-slate-100">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- How it works */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-center text-2xl font-bold text-slate-100 sm:text-3xl">How it works</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-400">
          Three steps, no accounts, nothing to trust but the maths.
        </p>

        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass relative overflow-hidden p-6"
            >
              <span className="pointer-events-none absolute -right-2 -top-4 select-none text-7xl font-extrabold text-white/[0.04]">
                {s.n}
              </span>
              <h3 className="relative font-bold text-slate-100">{s.title}</h3>
              <p className="relative mt-2 text-sm text-slate-400">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- Privacy explainer */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="glass p-8">
          <h2 className="text-center text-2xl font-bold text-slate-100">
            The ShadowVote privacy guarantee
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400">
            You can prove you cast a valid vote{' '}
            <span className="font-semibold text-slate-200">
              without revealing which candidate you chose
            </span>
            .
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-emerald-300">
                👁 Observers CAN see
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>✓ The election exists</li>
                <li>✓ A vote was submitted</li>
                <li>✓ The final tally &amp; winner</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-shadow-purple/30 bg-shadow-purple/5 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-shadow-violet">
                🚫 Observers CANNOT see
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>✕ Which candidate you chose</li>
                <li>✕ Your voter preference</li>
                <li>✕ Your voting history</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- Final CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-20 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass relative overflow-hidden p-10 text-center"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full bg-shadow-purple/20 blur-3xl" />
          <h2 className="relative text-2xl font-bold text-slate-100 sm:text-3xl">
            Run your first private vote
          </h2>
          <p className="relative mx-auto mt-2 max-w-lg text-slate-400">
            Elections are live on Midnight right now. Creating one takes under a minute.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/create" className="btn-primary">
              Create an election
            </Link>
            <Link to="/dashboard" className="btn-ghost">
              Browse elections
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
