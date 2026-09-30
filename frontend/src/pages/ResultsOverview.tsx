import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contractService } from '../lib/contractService';
import type { Election } from '../types';
import Spinner from '../components/Spinner';
import { PageShell, PageHeader } from '../components/Motion';
import StatusBadge from '../components/StatusBadge';
import Timer from '../components/Timer';
import { formatDate } from '../lib/format';
import { BarChart3, Plus } from 'lucide-react';

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
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <PageHeader
          eyebrow="Cryptographic Ledger Results"
          title="Results &amp; Verification Hub"
          subtitle="Tallies stay sealed while voting is live to prevent early-voter bandwagon effect. They unlock and publish automatically once the deadline expires."
        />

        {loading ? (
          <div className="py-24 flex justify-center">
            <Spinner label="Loading certified results from Midnight Preview indexer…" />
          </div>
        ) : elections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="credix-card grid place-items-center py-20 px-6 text-center bg-white border border-[#cdd0e5]"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#dfe7f9] border border-[#cdd0e5] flex items-center justify-center text-[#202952] mb-3">
              <BarChart3 className="w-8 h-8 text-[#202952]/70" />
            </div>
            <p className="mt-2 text-xl font-bold text-[#2e335b] font-heading">No Elections Registered Yet</p>
            <p className="mt-1 text-xs sm:text-sm text-[#2e335b]/75 max-w-md">
              Deploy an election on Midnight Preview, and certified tallies will populate here.
            </p>
            <Link to="/create" className="button accent sm mt-6 text-xs font-bold inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Election</span>
            </Link>
          </motion.div>
        ) : (
          <div className="mt-10 space-y-12">
            <Section
              title="Declared Results"
              badge="Certified On-Chain"
              hint="Voting has closed — final candidate tallies and winners are public and verifiable."
              empty="No elections have reached completion yet."
              elections={declared}
              revealed
            />
            <Section
              title="Sealed In-Progress Polls"
              badge="ZK Shielded"
              hint="Voting is active — per-candidate counts remain sealed until the deadline."
              empty="No active voting polls at the moment."
              elections={pending}
              revealed={false}
              onEnd={refresh}
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}

function Section({
  title,
  badge,
  hint,
  empty,
  elections,
  revealed,
  onEnd,
}: {
  title: string;
  badge: string;
  hint: string;
  empty: string;
  elections: Election[];
  revealed: boolean;
  onEnd?: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cdd0e5]/70 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#2e335b] font-heading">{title}</h2>
            <span className="tag !text-[10px] !py-0.5 !px-2.5">{badge}</span>
          </div>
          <p className="mt-1 text-xs text-[#2e335b]/70">{hint}</p>
        </div>
        <span className="text-xs font-bold text-[#2e335b]/60">
          {elections.length} {elections.length === 1 ? 'ballot' : 'ballots'}
        </span>
      </div>

      {elections.length === 0 ? (
        <div className="credix-card mt-4 p-8 text-center bg-white border border-[#cdd0e5] text-xs text-[#2e335b]/60">
          {empty}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {elections.map((e) => (
            <Link
              key={e.id}
              to={`/election/${e.id}/results`}
              className="group credix-card p-5 bg-white border border-[#cdd0e5] hover:border-[#9ba5ea] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-[#2e335b] font-heading group-hover:text-[#6366f1] transition-colors">
                    {e.name}
                  </h3>
                  <StatusBadge status={e.status} />
                </div>
                <p className="line-clamp-2 text-xs text-[#2e335b]/70">{e.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#cdd0e5]/60 pt-3 text-xs text-[#2e335b]/75">
                <span className="font-semibold">
                  {e.totalVotes} ballot{e.totalVotes === 1 ? '' : 's'}
                </span>
                {revealed ? (
                  <span>Ended {formatDate(e.endTime)}</span>
                ) : (
                  <Timer endTime={e.endTime} onEnd={onEnd} />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
