import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryMeta, type Election } from '../types';
import StatusBadge from './StatusBadge';
import Timer from './Timer';
import CategoryIcon from './CategoryIcon';
import { Users, ArrowRight } from 'lucide-react';

export default function ElectionCard({
  election,
  onEnd,
}: {
  election: Election;
  onEnd?: () => void;
}) {
  const isClosed = election.status === 'CLOSED';
  const to = isClosed ? `/election/${election.id}/results` : `/election/${election.id}`;
  const cat = categoryMeta(election.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        to={to}
        className="group relative block h-full credix-card p-6 bg-white border border-[#cdd0e5] shadow-credix hover:border-[#9ba5ea] hover:shadow-credix-hover transition-all duration-300"
      >
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="text-lg font-bold leading-snug text-[#2e335b] font-heading group-hover:text-[#6366f1] transition-colors">
            {election.name}
          </h3>
          <StatusBadge status={election.status} />
        </div>

        <div className="mb-3 flex items-center gap-2">
          <span className="tag !text-[10px] !py-0.5 !px-2.5 flex items-center gap-1.5">
            <CategoryIcon category={election.category} className="w-3 h-3 text-[#202952]" />
            <span>{cat.label}</span>
          </span>
          <span className="text-xs text-[#2e335b]/60">ID #{election.id}</span>
        </div>

        <p className="mb-4 line-clamp-2 text-xs sm:text-sm text-[#2e335b]/75 leading-relaxed">
          {election.description}
        </p>

        <div className="flex items-center justify-between text-xs text-[#2e335b]/75">
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5 text-[#2e335b]/70" />
            <span>{election.candidates.length} candidates</span>
          </span>
          <Timer endTime={election.endTime} onEnd={onEnd} />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#cdd0e5]/60 pt-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2e335b]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {election.totalVotes} ballot{election.totalVotes === 1 ? '' : 's'} cast
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#6366f1] group-hover:translate-x-1 transition-transform">
            {isClosed ? 'View Results' : 'Cast Vote'}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
