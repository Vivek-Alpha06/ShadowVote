import type { Candidate } from '../types';

interface Props {
  candidate: Candidate;
  selected: boolean;
  disabled?: boolean;
  onSelect: (index: number) => void;
}

export default function CandidateCard({ candidate, selected, disabled, onSelect }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(candidate.index)}
      aria-pressed={selected}
      className={`group relative flex min-h-[4.25rem] w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? 'border-violet-500/80 bg-violet-950/25 shadow-[0_0_25px_rgba(139,92,246,0.25)] ring-1 ring-violet-500/50'
          : 'border-white/[0.08] bg-[#0c0d12]/70 hover:border-violet-500/40 hover:bg-[#111219]'
      }`}
    >
      {/* Radio Indicator */}
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all duration-200 ${
          selected
            ? 'border-violet-400 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]'
            : 'border-zinc-600 bg-zinc-900 group-hover:border-zinc-400'
        }`}
        aria-hidden
      >
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>

      {/* Candidate Index Badge / Avatar */}
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold transition-colors ${
          selected
            ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm'
            : 'bg-gradient-to-br from-white/10 to-white/5 text-zinc-300 group-hover:from-white/15'
        }`}
      >
        #{String(candidate.index + 1).padStart(2, '0')}
      </span>

      {/* Candidate Name & Info */}
      <div className="min-w-0 flex-1">
        <span className="block break-words text-base font-semibold text-zinc-100">
          {candidate.name}
        </span>
        <span className="text-[11px] text-zinc-500">Candidate choice #{candidate.index + 1}</span>
      </div>

      {/* Selected check badge */}
      {selected && (
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-violet-400/40 bg-violet-500/20 px-2.5 py-1 text-xs font-semibold text-violet-200">
          Selected ✓
        </span>
      )}
    </button>
  );
}
