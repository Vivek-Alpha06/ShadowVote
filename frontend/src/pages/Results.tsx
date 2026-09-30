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
import CopyLinkButton from '../components/ShareActions';
import { downloadCsv, resultsToCsv } from '../lib/exportResults';
import { getSession } from '../lib/chainSession';
import {
  Trophy,
  Scale,
  Inbox,
  Lock,
  Download,
  Share2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

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

  if (loading) return (
    <div className="py-24 flex justify-center">
      <Spinner label="Tallying verified on-chain results…" />
    </div>
  );

  if (!election || !results)
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-20 text-center credix-card p-8 bg-white border border-[#cdd0e5]">
          <div className="w-16 h-16 rounded-2xl bg-[#dfe7f9] border border-[#cdd0e5] flex items-center justify-center text-[#202952] mx-auto mb-3">
            <AlertCircle className="w-8 h-8 text-[#202952]/70" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#2e335b] font-heading">Results Not Found</h1>
          <Link to="/results" className="button ghost sm mt-6 text-xs inline-flex items-center gap-1.5 font-bold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Results Overview</span>
          </Link>
        </div>
      </PageShell>
    );

  const shareUrl = window.location.href;
  const ranked = results.results ? [...results.results].sort((a, b) => b.votes - a.votes) : [];

  const tweetText = results.winner
    ? `Verified election results for "${election.name}" on ShadowVote (built on Midnight Network Preview)!\nWinner: ${results.winner.name} with ${results.winner.votes} of ${results.totalVotes} confidential votes.\nCheck on-chain tally: ${shareUrl}`
    : `Sealed election tally for "${election.name}" on ShadowVote (built on Midnight Network Preview)!\nCheck details: ${shareUrl}`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link to="/results" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2e335b]/70 hover:text-[#2e335b] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all results</span>
        </Link>

        <div className="mb-6 mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#2e335b] font-heading">{election.name}</h1>
            <p className="mt-1 text-sm text-[#2e335b]/75">{election.description}</p>
          </div>
          <StatusBadge status={results.status} />
        </div>

        {results.revealed ? (
          <>
            {/* Winner banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="credix-card-dark p-8 text-center mb-6 bg-[#2e335b] border border-[#3e4475] shadow-xl"
            >
              {results.winner ? (
                <div>
                  <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/20 border border-amber-300 text-3xl text-amber-300 shadow-sm">
                    <Trophy className="w-8 h-8 text-amber-300" />
                  </div>
                  <span className="tag-dark !text-[11px] mb-2">
                    Official Winner Certified
                  </span>
                  <p className="mt-2 text-3xl sm:text-5xl font-extrabold text-white font-heading">
                    {results.winner.name}
                  </p>
                  <p className="mt-2 text-sm text-white/80 font-medium font-mono">
                    Secured {results.winner.votes} of {results.totalVotes} confidential ballots (
                    {results.totalVotes > 0
                      ? Math.round((results.winner.votes / results.totalVotes) * 100)
                      : 0}
                    %)
                  </p>
                </div>
              ) : results.totalVotes === 0 ? (
                <div className="py-4">
                  <Inbox className="w-10 h-10 text-white/60 mx-auto mb-2" />
                  <p className="mt-2 text-lg font-bold text-white">No ballots were cast in this election</p>
                </div>
              ) : (
                <div className="py-4">
                  <Scale className="w-10 h-10 text-indigo-300 mx-auto mb-2" />
                  <p className="mt-2 text-xl font-bold text-white">Tie between top candidates</p>
                </div>
              )}
            </motion.div>

            {/* Candidate Standings */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#2e335b]">
                Official Candidate Tallies
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

            {/* Actions: CSV & X Sharing */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#cdd0e5]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    downloadCsv(
                      election,
                      resultsToCsv(election, results, getSession()?.contractAddress ?? null),
                    )
                  }
                  className="button ghost sm text-xs inline-flex items-center gap-1.5 font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button accent sm text-xs inline-flex items-center gap-1.5 font-bold"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share to X</span>
                </a>
              </div>
              <CopyLinkButton />
            </div>
          </>
        ) : (
          /* Sealed State */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="credix-card p-8 sm:p-12 text-center bg-white border border-[#cdd0e5] shadow-credix"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#dfe7f9] border border-[#cdd0e5] flex items-center justify-center text-[#202952] mx-auto mb-3">
              <Lock className="w-8 h-8 text-[#202952]/70" />
            </div>
            <h2 className="text-2xl font-bold text-[#2e335b] font-heading mt-3">
              Ballot Tallies Are Sealed
            </h2>
            <p className="mt-2 max-w-md mx-auto text-sm text-[#2e335b]/75 leading-relaxed">
              To guarantee impartiality and eliminate voting bias, candidate totals remain mathematically shielded until voting has closed.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#cdd0e5] bg-[#dfe7f9] px-4 py-2 text-xs font-bold text-[#2e335b]">
              <span>Deadline:</span>
              <Timer endTime={results.endTime} onEnd={refresh} />
            </div>
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}
