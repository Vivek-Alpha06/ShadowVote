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
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
        selected
          ? 'border-shadow-purple bg-shadow-purple/10 shadow-glow'
          : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
      }`}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
          selected ? 'border-shadow-purple' : 'border-slate-500'
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-shadow-purple" />}
      </span>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-shadow-purple/30 to-shadow-blue/30 font-bold text-slate-100">
        {candidate.name.charAt(0).toUpperCase()}
      </span>
      <span className="font-semibold text-slate-100">{candidate.name}</span>
    </button>
  );
}
