import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryMeta, type Election } from '../types';
import StatusBadge from './StatusBadge';
import Timer from './Timer';

export default function ElectionCard({
  election,
  onEnd,
}: {
  election: Election;
  /** Called when this election's countdown reaches zero, so the list can refresh. */
  onEnd?: () => void;
}) {
  const isClosed = election.status === 'CLOSED';
  const to = isClosed ? `/election/${election.id}/results` : `/election/${election.id}`;
  const cat = categoryMeta(election.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        to={to}
        className="group relative block h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0d12]/80 p-5 backdrop-blur-xl transition-all duration-300 hover:border-violet-500/50 hover:bg-[#111219] hover:shadow-[0_0_30px_rgba(139,92,246,0.18)]"
      >
        {/* Subtle top edge glow */}
        <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-48 rounded-full bg-violet-600/10 blur-2xl group-hover:bg-violet-600/20 transition-all duration-300" />

        <div className="relative z-10 flex items-start justify-between gap-3 mb-2.5">
          <h3 className="text-lg font-bold leading-snug text-zinc-100 group-hover:text-white transition-colors">
            {election.name}
          </h3>
          <StatusBadge status={election.status} />
        </div>

        <div className="relative z-10 mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-xs font-semibold text-zinc-400">
            <span aria-hidden>{cat.icon}</span>
            {cat.label}
          </span>
          <span className="text-xs text-zinc-500">ID #{election.id}</span>
        </div>

        <p className="relative z-10 mb-4 line-clamp-2 text-sm text-zinc-400 leading-relaxed">
          {election.description}
        </p>

        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <span>👥</span>
            <span>{election.candidates.length} candidates</span>
          </span>
          <Timer endTime={election.endTime} onEnd={onEnd} />
        </div>

        <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            {election.totalVotes} ballot{election.totalVotes === 1 ? '' : 's'} recorded
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300 group-hover:text-violet-200 group-hover:translate-x-0.5 transition-all">
            {isClosed ? 'View Tallies →' : 'Cast Vote →'}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
