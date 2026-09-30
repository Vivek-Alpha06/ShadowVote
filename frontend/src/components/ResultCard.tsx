import { motion } from 'framer-motion';
import type { CandidateResult } from '../types';
import { pct } from '../lib/format';
import { Trophy } from 'lucide-react';

interface Props {
  result: CandidateResult;
  total: number;
  isWinner: boolean;
  rank: number;
}

export default function ResultCard({ result, total, isWinner, rank }: Props) {
  const percentage = pct(result.votes, total);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.05 }}
      className={`credix-card p-5 border transition-all ${
        isWinner
          ? 'border-[#2e335b] bg-[#dfe7f9]/50 shadow-md ring-1 ring-[#2e335b]/20'
          : 'border-[#cdd0e5] bg-white'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`grid h-8 w-8 place-items-center rounded-xl border text-xs font-bold ${
            isWinner
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : 'bg-[#dfe7f9] border-[#cdd0e5] text-[#2e335b]'
          }`}>
            {isWinner ? <Trophy className="w-4 h-4 text-amber-700" /> : `#${rank}`}
          </span>
          <span className="font-bold text-[#2e335b] text-base font-heading">{result.name}</span>
          {isWinner && (
            <span className="tag !text-[10px] !py-0.5 !px-2.5 flex items-center gap-1 font-bold">
              <Trophy className="w-3 h-3 text-emerald-700" />
              <span>Certified Winner</span>
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-base font-extrabold text-[#2e335b] font-mono">
            {result.votes} {result.votes === 1 ? 'vote' : 'votes'}
          </span>
          <span className="ml-2 text-xs font-bold text-indigo-700 font-mono">
            ({percentage}%)
          </span>
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#dfe7f9] p-0.5 border border-[#cdd0e5]/70">
        <motion.div
          className={`h-full rounded-full ${
            isWinner
              ? 'bg-[#2e335b] shadow-sm'
              : 'bg-[#9ba5ea]'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2 + rank * 0.05 }}
        />
      </div>
    </motion.div>
  );
}
