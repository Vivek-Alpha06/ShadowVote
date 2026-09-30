import type { ElectionStatus } from '../types';

export default function StatusBadge({ status }: { status: ElectionStatus }) {
  const open = status === 'OPEN';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase ${
        open
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm'
          : 'bg-[#dfe7f9] text-[#2e335b]/70 border border-[#cdd0e5]'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${open ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
      {open ? 'Live Voting' : 'Ended'}
    </span>
  );
}
