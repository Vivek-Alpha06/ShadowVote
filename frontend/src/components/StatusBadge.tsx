import type { ElectionStatus } from '../types';

export default function StatusBadge({ status }: { status: ElectionStatus }) {
  const open = status === 'OPEN';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        open
          ? 'bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/30'
          : 'bg-slate-400/10 text-slate-400 ring-1 ring-slate-400/20'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
      {open ? 'Voting open' : 'Result declared'}
    </span>
  );
}
