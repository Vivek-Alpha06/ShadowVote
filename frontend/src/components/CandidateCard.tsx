import type { Candidate } from '../types';

interface Props {
  candidate: Candidate;
  selected: boolean;
  disabled?: boolean;
  onSelect: (index: number) => void;
}

/**
 * Selectable candidate row.
 *
 * Sized for thumbs after user feedback:
 *
 *   "Candidate selection radio buttons are way too small on mobile
 *    touchscreens. I accidentally tapped candidate 2 when trying to select
 *    candidate 3."  -- Rahul Sharma, 3 stars
 *
 *   "Consider making the candidate radio buttons slightly larger on mobile
 *    touchscreens for easier selection."  -- Arpan Ghosh
 *
 * The whole row was already the hit target, so the miss was vertical: rows sat
 * close enough together that a thumb landing between two of them hit the
 * wrong one. A vote is irreversible, so a mis-tap here is not a small error.
 * Rows are now a minimum 64px tall (above the 44px touch guidance with room
 * to spare), the radio is larger, and the caller spaces them further apart.
 */
export default function CandidateCard({ candidate, selected, disabled, onSelect }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(candidate.index)}
      aria-pressed={selected}
      className={`flex min-h-[4rem] w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-0 ${
        selected
          ? 'border-white/40 bg-white/[0.07] shadow-glow'
          : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
      }`}
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
          selected ? 'border-white/40' : 'border-slate-500'
        }`}
        aria-hidden
      >
        {selected && <span className="h-3 w-3 rounded-full bg-white" />}
      </span>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-white/20 to-white/5 text-lg font-bold text-slate-100">
        {candidate.name.charAt(0).toUpperCase()}
      </span>
      {/* break-words, not truncate: a long name must stay readable rather than
          disappear behind an ellipsis when it is what you are voting for. */}
      <span className="min-w-0 break-words font-semibold text-slate-100">{candidate.name}</span>
    </button>
  );
}
