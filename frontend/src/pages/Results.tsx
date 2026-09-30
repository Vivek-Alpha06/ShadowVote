import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contractService } from '../lib/contractService';
import { PageShell } from '../components/Motion';
import type { Election, ElectionResults } from '../types';
import Spinner from '../components/Spinner';
import ResultCard from '../components/ResultCard';
import StatusBadge from '../components/StatusBadge';
import Timer from '../components/Timer';
import { formatDate } from '../lib/format';
import CopyLinkButton from '../components/ShareActions';
import { downloadCsv, resultsToCsv } from '../lib/exportResults';
import { getSession } from '../lib/chainSession';

export default function Results() {
  const { id = '' } = useParams();
  const [election, setElection] = useState<Election | null>(null);
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [e, r] = await Promise.all([
      contractService.getElection(id),
      contractService.getResults(id),
    ]);
    setElection(e);
    setResults(r);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!results || results.revealed) return;
    if (Date.now() < results.endTime) return;

    const intervalId = window.setInterval(refresh, 5_000);
    return () => window.clearInterval(intervalId);
  }, [results, refresh]);

  if (loading) return <Spinner label="Tallying verified on-chain results…" />;
  if (!election || !results)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-4xl">🤷</p>
        <h1 className="mt-4 text-2xl font-bold text-white">Results not found</h1>
        <Link to="/results" className="btn-ghost mt-6">
          ← Back to results overview
        </Link>
      </div>
    );

  const shareUrl = window.location.href;
  const ranked = results.results ? [...results.results].sort((a, b) => b.votes - a.votes) : [];

  const tweetText = results.winner
    ? `🗳️ Verified election results for "${election.name}" on @shadow_vote (built on @midnightntwrk Preview)!\n🏆 Winner: ${results.winner.name} with ${results.winner.votes} of ${results.totalVotes} confidential votes.\nCheck on-chain tally: ${shareUrl}`
    : `🗳️ Sealed election tally for "${election.name}" on @shadow_vote (built on @midnightntwrk Preview)!\nCheck details: ${shareUrl}`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/results" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
          <span>←</span> Back to all results
        </Link>

        <div className="mb-6 mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{election.name}</h1>
            <p className="mt-1 text-sm text-zinc-400">{election.description}</p>
          </div>
          <StatusBadge status={results.status} />
        </div>

        {results.revealed ? (
          <>
            {/* Winner banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-2xl border border-violet-500/40 bg-gradient-to-br from-violet-950/30 via-[#0e0f17] to-[#0a0b10] p-7 text-center shadow-[0_0_40px_rgba(139,92,246,0.18)] mb-6"
            >
              {/* Radial glow background */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.25),transparent_70%)]" />

              {results.winner ? (
                <div className="relative z-10">
                  <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/20 border border-amber-400/40 text-2xl text-amber-300 shadow-sm">
                    🏆
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
                    Election Winner
                  </p>
                  <p className="mt-1.5 text-3xl sm:text-4xl font-extrabold text-white">
                    {results.winner.name}
                  </p>
                  <p className="mt-2 text-sm text-zinc-300">
                    Received <span className="font-bold text-violet-300">{results.winner.votes}</span> of{' '}
                    <span className="font-bold text-zinc-100">{results.totalVotes}</span> total confidential votes ({results.totalVotes > 0 ? Math.round((results.winner.votes / results.totalVotes) * 100) : 0}%)
                  </p>
                </div>
              ) : (
                <div className="relative z-10">
                  <p className="text-2xl font-bold text-zinc-200">
                    {results.totalVotes === 0 ? 'No votes were cast' : 'It’s a tie'}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">No single winner could be determined.</p>
                </div>
              )}
              <p className="relative z-10 mt-4 text-[11px] font-medium text-zinc-500 border-t border-white/[0.06] pt-3">
                Voting closed {formatDate(results.endTime)} · Verified on Midnight Preview Ledger
              </p>
            </motion.div>

            {/* Tally breakdown cards */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Certified Candidate Tallies
              </h2>
              {ranked.map((r, i) => (
                <ResultCard
                  key={r.index}
                  result={r}
                  total={results.totalVotes}
                  isWinner={results.winner?.index === r.index}
                  rank={i + 1}
                />
              ))}
            </div>

            {/* Organizer & Sharing tools */}
            <div className="glass mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="text-sm max-w-md">
                <p className="font-bold text-zinc-200">Share or archive certified results</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Export contains the immutable contract address, election ID, and cryptographic timestamp for independent auditing.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <CopyLinkButton url={shareUrl} label="Copy Link" />
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost inline-flex items-center gap-1.5 text-xs font-semibold"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-sky-400" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Post to X
                </a>
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(election, resultsToCsv(election, results, getSession()?.contractAddress ?? null))
                  }
                  className="btn-primary text-xs"
                >
                  ⬇ Export CSV
                </button>
              </div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass overflow-hidden p-8 text-center"
          >
            <p className="text-5xl">🔒</p>
            <p className="mt-3 text-2xl font-bold text-white">Results are sealed</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400 leading-relaxed">
              Tallies stay cryptographically sealed while voting is active — preventing early-voter bandwagon bias. They unlock automatically the moment the deadline expires.
            </p>

            <div className="mt-5 flex flex-col items-center gap-1">
              <Timer endTime={results.endTime} onEnd={refresh} />
              <p className="text-xs text-zinc-500">Scheduled unlock: {formatDate(results.endTime)}</p>
            </div>

            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <p className="text-3xl font-extrabold text-white">{results.totalVotes}</p>
              <p className="text-xs text-zinc-400 font-medium">
                {results.totalVotes === 1 ? 'ballot' : 'ballots'} counted so far
              </p>
            </div>

            <Link to={`/election/${election.id}`} className="btn-primary mt-6">
              Go to Vote Screen →
            </Link>
          </motion.div>
        )}

        {/* Privacy summary */}
        <div className="glass mt-8 p-6">
          <h3 className="mb-2 flex items-center gap-2 font-bold text-white text-sm">
            🔒 How these results stay confidential & auditable
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Candidate selections were evaluated in client-side zero-knowledge proofs. While the final totals are public and verifiable against the Midnight Preview indexer, the connection between any individual wallet address and candidate choice is mathematically non-existent.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
