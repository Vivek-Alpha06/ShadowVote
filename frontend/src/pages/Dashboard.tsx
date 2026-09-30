import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contractService } from '../lib/contractService';
import { categoryMeta, type Election, type ElectionCategory } from '../types';
import ElectionCard from '../components/ElectionCard';
import Spinner from '../components/Spinner';
import { useWallet, WALLET_INSTALL_URL } from '../hooks/useWallet';
import ChainPanel from '../components/ChainPanel';
import { PageShell, PageHeader } from '../components/Motion';
import CategoryIcon from '../components/CategoryIcon';
import {
  Vote,
  ClipboardList,
  Activity,
  ShieldCheck,
  KeyRound,
  Search,
  CheckCircle2,
  Layers,
  Plus,
} from 'lucide-react';

type Filter = 'active' | 'ended' | 'all';

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

  const presentCategories = useMemo(() => {
    const seen = new Set<ElectionCategory>();
    elections.forEach((e) => seen.add(e.category));
    return [...seen];
  }, [elections]);

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
    { label: 'Total Elections', value: elections.length, badge: 'All-Time', icon: ClipboardList, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { label: 'Open Now', value: active.length, badge: 'Live Voting', icon: Activity, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Ballots Cast', value: totalVotes, badge: 'ZK Shielded', icon: ShieldCheck, color: 'text-[#202952] bg-[#dfe7f9] border-[#cdd0e5]' },
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <PageHeader
          eyebrow="Midnight Preview · Zero-Knowledge Governance"
          title="Elections Hub"
          subtitle="Explore live community elections or deploy your own private ballot — voting choices stay confidential, tallies stay verifiable."
          actions={
            <Link to="/create" className="button accent text-xs !py-3 !px-6 shrink-0 inline-flex items-center gap-1.5 font-bold">
              <Plus className="w-4 h-4" />
              <span>Create Election</span>
            </Link>
          }
        />

        {/* Stats Strip */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="credix-card p-6 bg-white border border-[#cdd0e5] shadow-credix"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="tag !text-[10px] !py-0.5 !px-2.5">
                    {s.badge}
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#2e335b] font-heading">
                  {loading ? '—' : s.value}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#2e335b]/70">
                  {s.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6">
          <ChainPanel />
        </div>

        {!connected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="credix-card mt-6 p-6 border border-amber-300 bg-amber-50/70 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-amber-900 font-semibold text-xs sm:text-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4 text-amber-800" />
                </div>
                <span>Connect your Lace Midnight wallet to deploy elections or cast confidential votes.</span>
              </div>
              <button onClick={() => connect()} disabled={connecting} className="button accent sm text-xs font-bold">
                {connecting ? 'Waiting for Lace…' : 'Connect Wallet'}
              </button>
            </div>

            {error && (
              <p className="mt-3 border-t border-amber-200 pt-3 text-xs text-rose-700">
                {error.message}{' '}
                {error.code === 'NOT_INSTALLED' && (
                  <a
                    href={WALLET_INSTALL_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-bold underline text-[#2e335b]"
                  >
                    Install Lace Wallet ↗
                  </a>
                )}
              </p>
            )}
          </motion.div>
        )}

        {/* Search Bar */}
        <div className="relative mt-8">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#2e335b]/50" aria-hidden>
            <Search className="w-4 h-4" />
          </span>
          <input
            type="search"
            className="input pl-11 pr-24 py-3 bg-white border-[#cdd0e5] shadow-credix"
            placeholder="Search elections by name, description, or candidate…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search elections"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold px-3 py-1.5 rounded-full bg-[#dfe7f9] text-[#2e335b] hover:bg-[#cdd0e5]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Tabs & Category Chips */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#cdd0e5]/70 pb-4">
          <div className="inline-flex rounded-full border border-[#cdd0e5] bg-[#dfe7f9]/70 p-1">
            {[
              { value: 'active', label: 'Active Ballots', icon: Activity },
              { value: 'ended', label: 'Ended', icon: CheckCircle2 },
              { value: 'all', label: 'All Votes', icon: Layers },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as Filter)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    filter === f.value
                      ? 'bg-white text-[#2e335b] shadow-sm'
                      : 'text-[#2e335b]/70 hover:text-[#2e335b]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{f.label}</span>
                  <span className="ml-1 opacity-75 font-mono">
                    (
                    {f.value === 'active'
                      ? active.length
                      : f.value === 'ended'
                        ? ended.length
                        : elections.length}
                    )
                  </span>
                </button>
              );
            })}
          </div>

          {presentCategories.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {(['all', ...presentCategories] as const).map((c) => {
                const on = category === c;
                const meta = c === 'all' ? null : categoryMeta(c);
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-3.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      on
                        ? 'border-[#2e335b] bg-[#2e335b] text-white shadow-sm'
                        : 'border-[#cdd0e5] bg-white text-[#2e335b]/75 hover:bg-[#dfe7f9]'
                    }`}
                  >
                    {meta ? (
                      <>
                        <CategoryIcon category={c} className="w-3 h-3" />
                        <span>{meta.label}</span>
                      </>
                    ) : (
                      'All Categories'
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Elections Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Spinner label="Syncing elections with Midnight Preview indexer…" />
            </div>
          ) : shown.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="credix-card grid place-items-center px-6 py-20 text-center bg-white border border-[#cdd0e5]"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#dfe7f9] border border-[#cdd0e5] flex items-center justify-center text-[#202952] mb-3">
                {query ? <Search className="w-7 h-7 text-[#202952]/70" /> : <Vote className="w-7 h-7 text-[#202952]/70" />}
              </div>
              <p className="mt-2 text-xl font-bold text-[#2e335b] font-heading">
                {query
                  ? `No elections found matching “${query.trim()}”`
                  : category === 'all'
                  ? `No ${filter === 'all' ? '' : filter} elections currently listed`
                  : `No ${categoryMeta(category).label.toLowerCase()} polls available`}
              </p>
              <p className="mt-2 max-w-md text-xs sm:text-sm text-[#2e335b]/75 leading-relaxed">
                {query
                  ? 'Try checking for spelling errors or clearing your query.'
                  : filter === 'ended'
                    ? 'Elections appear here automatically once their voting deadline passes and tallies are published.'
                    : 'Be the first to deploy a private election on Midnight Preview.'}
              </p>
              {query ? (
                <button onClick={() => setQuery('')} className="button ghost sm mt-5 text-xs font-bold">
                  Clear Search
                </button>
              ) : (
                <Link to="/create" className="button accent sm mt-6 text-xs font-bold inline-flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Election</span>
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
