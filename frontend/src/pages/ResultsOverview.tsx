import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contractService } from '../lib/contractService';
import type { Election } from '../types';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import Timer from '../components/Timer';
import { formatDate } from '../lib/format';

// Public results overview: anyone can browse every election, but a tally only
// becomes readable once that election's voting window has closed.
export default function ResultsOverview() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setElections(await contractService.listElections());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const { declared, pending } = useMemo(
    () => ({
      declared: elections.filter((e) => e.status === 'CLOSED'),
      pending: elections.filter((e) => e.status === 'OPEN'),
    }),
    [elections],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Results</h1>
        <p className="mt-1 text-slate-400">
          Tallies are sealed while voting is open and published automatically the moment an
          election's time limit runs out.
        </p>
      </div>

      {loading ? (
        <Spinner label="Loading results…" />
      ) : elections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass grid place-items-center py-20 text-center"
        >
          <p className="text-4xl">📊</p>
          <p className="mt-3 font-semibold text-slate-200">No elections yet</p>
          <p className="mt-1 text-sm text-slate-400">Create one, then results will appear here.</p>
          <Link to="/create" className="btn-primary mt-5">
            + Create Election
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-10">
          <Section
            title="Declared"
            hint="Voting has ended — full tallies and the winner are public."
            empty="No election has finished yet."
            elections={declared}
            revealed
          />
          <Section
            title="Sealed"
            hint="Voting is still open — only turnout is visible until the deadline."
            empty="Nothing is currently being voted on."
            elections={pending}
            revealed={false}
            onEnd={refresh}
          />
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  empty,
  elections,
  revealed,
  onEnd,
}: {
  title: string;
  hint: string;
  empty: string;
  elections: Election[];
  revealed: boolean;
  onEnd?: () => void;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100">
          <span>{revealed ? '📢' : '🔒'}</span>
          {title}
          <span className="text-sm font-normal text-slate-500">({elections.length})</span>
        </h2>
        <p className="mt-0.5 text-sm text-slate-400">{hint}</p>
      </div>

      {elections.length === 0 ? (
        <div className="glass px-5 py-8 text-center text-sm text-slate-500">{empty}</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {elections.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
            >
              <Link to={`/election/${e.id}/results`} className="glass glass-hover block h-full p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold leading-tight text-slate-100">{e.name}</h3>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mb-4 line-clamp-2 text-sm text-slate-400">{e.description}</p>

                <div className="mb-3 text-sm">
                  {revealed ? (
                    <span className="text-slate-400">Ended {formatDate(e.endTime)}</span>
                  ) : (
                    <span className="flex items-center gap-2 text-slate-400">
                      Unlocks in <Timer endTime={e.endTime} onEnd={onEnd} />
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-xs text-slate-500">
                    {e.totalVotes} vote{e.totalVotes === 1 ? '' : 's'} cast
                  </span>
                  <span className="text-sm font-semibold text-shadow-purple">
                    {revealed ? 'View results →' : 'View status →'}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
