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
  const to =
    election.status === 'CLOSED'
      ? `/election/${election.id}/results`
      : `/election/${election.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
    >
      <Link to={to} className="glass glass-hover block h-full p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-tight text-slate-100">{election.name}</h3>
          <StatusBadge status={election.status} />
        </div>
        <span className="mb-3 inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-xs font-semibold text-slate-400">
          <span aria-hidden>{categoryMeta(election.category).icon}</span>
          {categoryMeta(election.category).label}
        </span>
        <p className="mb-4 line-clamp-2 text-sm text-slate-400">{election.description}</p>
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>{election.candidates.length} candidates</span>
          <Timer endTime={election.endTime} onEnd={onEnd} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-xs text-slate-500">
            {election.totalVotes} vote{election.totalVotes === 1 ? '' : 's'} cast
          </span>
          <span className="text-sm font-semibold text-shadow-purple">
            {election.status === 'CLOSED' ? 'View results →' : 'Vote →'}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
