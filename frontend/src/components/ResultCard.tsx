import { motion } from 'framer-motion';
import type { CandidateResult } from '../types';
import { pct } from '../lib/format';

interface Props {
  result: CandidateResult;
  total: number;
  isWinner: boolean;
  rank: number;
}

export default function ResultCard({ result, total, isWinner, rank }: Props) {
  const percentage = pct(result.votes, total);
  return (
    <div
      className={`rounded-2xl border p-4 ${
        isWinner ? 'border-white/30 bg-white/[0.04]' : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-sm font-bold text-slate-300">
            #{rank}
          </span>
          <span className="font-semibold text-slate-100">{result.name}</span>
          {isWinner && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-zinc-200">
              🏆 Winner
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-slate-300">
          {result.votes} · {percentage}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className={`h-full rounded-full ${
            isWinner
              ? 'bg-gradient-to-r from-white to-zinc-500'
              : 'bg-white/20'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
