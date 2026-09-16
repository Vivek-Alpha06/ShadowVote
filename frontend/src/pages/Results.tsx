import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contractService } from '../lib/contractService';
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

  /**
   * Keep polling after the deadline until the tally actually appears.
   *
   *   "When an election ended, the page did not auto-refresh the results. I
   *    had to manually reload the browser 3 times before the tally card
   *    appeared."  -- Debasmita Roy, 3 stars
   *
   * The Timer already fired one refresh at T=0, which was the bug: the
   * deadline passing and the ledger reporting the election closed are not the
   * same instant, so that single refresh reliably read a still-sealed state
   * and then stopped. Poll instead, and stop as soon as results are revealed.
   */
  useEffect(() => {
    if (!results || results.revealed) return;
    if (Date.now() < results.endTime) return;

    const id = window.setInterval(refresh, 5_000);
    return () => window.clearInterval(id);
  }, [results, refresh]);

  if (loading) return <Spinner label="Tallying results…" />;
  if (!election || !results)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-4xl">🤷</p>
        <h1 className="mt-4 text-2xl font-bold">Results not found</h1>
        <Link to="/results" className="btn-ghost mt-6">
          ← Back to results
        </Link>
      </div>
    );

  const shareUrl = window.location.href;
  const ranked = results.results ? [...results.results].sort((a, b) => b.votes - a.votes) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/results" className="text-sm text-slate-400 hover:text-slate-200">
        ← All results
      </Link>

      <div className="mb-6 mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{election.name}</h1>
          <p className="mt-1 text-slate-400">{election.description}</p>
        </div>
        <StatusBadge status={results.status} />
      </div>

      {results.revealed ? (
        <>
          {/* Winner banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass mb-6 overflow-hidden p-6 text-center shadow-glow"
          >
            {results.winner ? (
              <>
                <p className="text-sm uppercase tracking-wide text-slate-400">Winner</p>
                <p className="mt-1 text-3xl font-extrabold gradient-text">{results.winner.name}</p>
                <p className="mt-2 text-slate-400">
                  {results.winner.votes} of {results.totalVotes} votes
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-200">
                  {results.totalVotes === 0 ? 'No votes were cast' : 'It’s a tie'}
                </p>
                <p className="mt-1 text-slate-400">No single winner could be determined.</p>
              </>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Voting ended {formatDate(results.endTime)}
            </p>
          </motion.div>

          {/* Tally breakdown */}
          <div className="space-y-3">
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

          {/* Organizer tools. Everything here is public ledger state — a tally
              contains nothing that could identify a voter. */}
          <div className="glass mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="text-sm">
              <p className="font-semibold text-slate-200">Share or archive this result</p>
              <p className="text-slate-400">
                The export carries the contract address and election id, so anyone you send it to
                can check it against the chain instead of taking your word for it.
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <CopyLinkButton url={shareUrl} label="Copy results link" />
              <button
                type="button"
                onClick={() =>
                  downloadCsv(election, resultsToCsv(election, results, getSession()?.contractAddress ?? null))
                }
                className="btn-primary"
              >
                ⬇ Download CSV
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Sealed — voting is still open, so no per-candidate counts exist yet. */
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass overflow-hidden p-8 text-center"
        >
          <p className="text-5xl">🔒</p>
          <p className="mt-3 text-2xl font-bold text-slate-100">Results are sealed</p>
          <p className="mx-auto mt-2 max-w-md text-slate-400">
            Counts stay hidden until voting ends — nobody, including the organizer, can see a
            running tally. They unlock automatically at the deadline.
          </p>

          <div className="mt-5 flex flex-col items-center gap-1">
            <Timer endTime={results.endTime} onEnd={refresh} />
            <p className="text-sm text-slate-500">Unlocks {formatDate(results.endTime)}</p>
          </div>

          <div className="mt-6 border-t border-white/5 pt-5">
            <p className="text-3xl font-extrabold text-slate-100">{results.totalVotes}</p>
            <p className="text-sm text-slate-400">
              {results.totalVotes === 1 ? 'vote' : 'votes'} cast so far
            </p>
          </div>

          <Link to={`/election/${election.id}`} className="btn-primary mt-6">
            Go vote →
          </Link>
        </motion.div>
      )}

      {/* Privacy summary */}
      <div className="glass mt-8 p-6">
        <h3 className="mb-2 flex items-center gap-2 font-bold text-slate-100">
          🔒 How these results stay honest
        </h3>
        <p className="text-sm text-slate-400">
          Once voting ends the tallies are public and verifiable by anyone. Yet no one — not even
          the organizer — can determine which candidate any individual voter selected, or link a
          wallet to a vote. That is the ShadowVote guarantee:{' '}
          <span className="text-slate-200">private inputs, publicly verifiable outcomes.</span>
        </p>
      </div>
    </div>
  );
}
