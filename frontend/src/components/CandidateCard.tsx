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
      className={`group relative flex min-h-[4.5rem] w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? 'border-[#2e335b] bg-[#dfe7f9] shadow-md ring-2 ring-[#2e335b]/20'
          : 'border-[#cdd0e5] bg-white hover:border-[#9ba5ea] hover:bg-[#f5f4fd]'
      }`}
    >
      {/* Radio Indicator */}
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all duration-200 ${
          selected
            ? 'border-[#2e335b] bg-[#2e335b]'
            : 'border-[#cdd0e5] bg-white group-hover:border-[#2e335b]'
        }`}
        aria-hidden
      >
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>

      {/* Candidate Index Badge */}
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xs font-bold transition-colors ${
          selected
            ? 'bg-[#2e335b] text-white shadow-sm'
            : 'bg-[#dfe7f9] text-[#2e335b] group-hover:bg-[#cdd0e5]'
        }`}
      >
        #{String(candidate.index + 1).padStart(2, '0')}
      </span>

      {/* Candidate Name */}
      <div className="min-w-0 flex-1">
        <span className="block break-words text-base font-bold text-[#2e335b] font-heading">
          {candidate.name}
        </span>
        <span className="text-xs text-[#2e335b]/60">Option #{candidate.index + 1}</span>
      </div>

      {/* Selected check badge */}
      {selected && (
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#2e335b] bg-[#2e335b] px-3 py-1 text-xs font-bold text-white shadow-sm">
          Selected ✓
        </span>
      )}
    </button>
  );
}
