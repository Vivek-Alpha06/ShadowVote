import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contractService } from '../lib/contractService';
import { categoryMeta, type Election, type ElectionCategory } from '../types';
import ElectionCard from '../components/ElectionCard';
import Spinner from '../components/Spinner';
import { useWallet, WALLET_INSTALL_URL } from '../hooks/useWallet';
import ChainPanel from '../components/ChainPanel';
import { PageShell, PageHeader, Reveal } from '../components/Motion';

type Filter = 'active' | 'ended' | 'all';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'ended', label: 'Ended' },
  { value: 'all', label: 'All' },
];

export default function Dashboard() {
  const { connected, connecting, connect, error } = useWallet();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('active');
  const [category, setCategory] = useState<ElectionCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const refresh = useCallback(async () => {
    setElections(await contractService.listElections());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const { active, ended, totalVotes } = useMemo(
    () => ({
      active: elections.filter((e) => e.status === 'OPEN'),
      ended: elections.filter((e) => e.status === 'CLOSED'),
      totalVotes: elections.reduce((sum, e) => sum + e.totalVotes, 0),
    }),
    [elections],
  );

  /** Only offer category chips that actually match something. */
  const presentCategories = useMemo(() => {
    const seen = new Set<ElectionCategory>();
    elections.forEach((e) => seen.add(e.category));
    return [...seen];
  }, [elections]);

  /**
   * Text search over name and description.
   *
   *   "There is no search bar or filter by status on the home page. When
   *    scrolling through many elections, finding my college poll was
   *    difficult."  -- Amitav Sen, 4 stars
   *
   * Status and type filters already existed; what was missing was finding a
   * specific election by name once the list grew past a screenful. Searching
   * runs over already-loaded public metadata — it costs nothing and reaches
   * the chain not at all.
   */
  const shown = useMemo(() => {
    const byStatus = filter === 'active' ? active : filter === 'ended' ? ended : elections;
    const byCategory = category === 'all' ? byStatus : byStatus.filter((e) => e.category === category);

    const q = query.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.candidates.some((c) => c.name.toLowerCase().includes(q)),
    );
  }, [filter, category, query, active, ended, elections]);

  const stats = [
    { label: 'Elections', value: elections.length, accent: 'text-slate-100' },
    { label: 'Open now', value: active.length, accent: 'text-emerald-300' },
    { label: 'Votes cast', value: totalVotes, accent: 'text-zinc-300' },
  ];

  return (
    <PageShell>
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        eyebrow="Private ballots · Public tally"
        title="Elections"
        subtitle="Anyone can start a vote and anyone can take part — ballots stay private, results stay public."
        actions={
          <Link to="/create" className="btn-primary shrink-0">
            + Create
          </Link>
        }
      />

      {/* Stats */}
      <div className="mt-7 grid grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <Reveal key={s.label} index={i + 3} className="glass p-4 text-center sm:p-5">
            <p className={`text-2xl font-extrabold tabular-nums sm:text-3xl ${s.accent}`}>
              {loading ? '—' : s.value}
            </p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              {s.label}
            </p>
          </Reveal>
        ))}
      </div>

      <ChainPanel />

      {!connected && (
        <div className="glass mt-6 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-amber-200">
              🔑 Connect your wallet to create elections and cast votes.
            </span>
            <button onClick={() => connect()} disabled={connecting} className="btn-ghost">
              {connecting ? 'Waiting for wallet…' : 'Connect Wallet'}
            </button>
          </div>

          {error && (
            <p className="mt-3 border-t border-white/5 pt-3 text-rose-300">
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
        </div>
      )}

      {/* Search — only worth the space once there is enough to get lost in. */}
      {elections.length > 3 && (
        <div className="relative mt-7">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden>
            🔍
          </span>
          <input
            type="search"
            className="input pl-9"
            placeholder="Search elections by name, description or candidate…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search elections"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              clear
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.02] p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                filter === f.value
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {f.label} (
              {f.value === 'active'
                ? active.length
                : f.value === 'ended'
                  ? ended.length
                  : elections.length}
              )
            </button>
          ))}
        </div>

        {/* Category chips appear only once there is something to filter. */}
        {presentCategories.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {(['all', ...presentCategories] as const).map((c) => {
              const on = category === c;
              const meta = c === 'all' ? null : categoryMeta(c);
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    on
                      ? 'border-white/40 bg-white/10 text-slate-100'
                      : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200'
                  }`}
                >
                  {meta ? `${meta.icon} ${meta.label}` : 'All types'}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <Spinner label="Loading elections…" />
        ) : shown.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass grid place-items-center px-6 py-20 text-center"
          >
            <p className="text-4xl">{query ? '🔍' : '🗳️'}</p>
            <p className="mt-3 font-semibold text-slate-200">
              {query
                ? `Nothing matches “${query.trim()}”`
                : category === 'all'
                ? `No ${filter === 'all' ? '' : filter} elections`
                : `No ${categoryMeta(category).label.toLowerCase()}s here`}
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-400">
              {query
                ? 'Try a different word, or clear the search.'
                : category !== 'all'
                ? 'Try another type, or clear the filter.'
                : filter === 'ended'
                  ? 'Elections appear here once their voting window closes.'
                  : 'Create the first one to get started.'}
            </p>
            {query && (
              <button onClick={() => setQuery('')} className="btn-ghost mt-5">
                Clear search
              </button>
            )}
            {!query && category === 'all' && filter !== 'ended' && (
              <Link to="/create" className="btn-primary mt-5">
                Create an election
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((e) => (
              <ElectionCard key={e.id} election={e} onEnd={refresh} />
            ))}
          </div>
        )}
      </div>
    </div>
    </PageShell>
  );
}
