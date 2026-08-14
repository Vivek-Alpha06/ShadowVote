import { AnimatePresence, motion } from 'framer-motion';
import type { Candidate } from '../types';

interface Props {
  open: boolean;
  candidate: Candidate | null;
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function VoteModal({ open, candidate, submitting, onConfirm, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && candidate && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={submitting ? undefined : onClose}
        >
          <motion.div
            className="glass w-full max-w-md p-6"
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-shadow-purple to-shadow-blue text-2xl shadow-glow">
              🔒
            </div>
            <h2 className="text-xl font-bold text-slate-100">Confirm your private vote</h2>
            <p className="mt-2 text-sm text-slate-400">
              You are voting for{' '}
              <span className="font-semibold text-shadow-violet">{candidate.name}</span>. This
              choice is sealed as a zero-knowledge proof — the tally updates, but{' '}
              <span className="text-slate-200">no one can link this vote to you</span>.
            </p>

            {/*
              The candidate name appears here and ONLY here: on the voter's own
              screen, before submission, so they can confirm what they picked.
              It is a private circuit input and is never published, never logged,
              and never rendered anywhere an observer could reach.
            */}
            <div className="mt-4 rounded-xl border border-shadow-purple/30 bg-shadow-purple/10 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-shadow-violet">
                <span aria-hidden>🛡️</span>
                Proved without revealing your input
              </p>
              <p className="mt-1 text-xs text-slate-400">
                The proof is generated in your browser. On-chain, this vote appears only as an
                anonymous nullifier and a +1 on a public tally.
              </p>
            </div>

            {submitting && (
              <div
                className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                role="status"
                aria-live="polite"
              >
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-shadow-purple border-t-transparent" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Generating zero-knowledge proof…
                  </p>
                  <p className="text-xs text-slate-500">
                    This takes a moment, then your wallet will ask you to sign.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button onClick={onClose} disabled={submitting} className="btn-ghost flex-1">
                Cancel
              </button>
              <button onClick={onConfirm} disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Proving…' : 'Cast Secret Vote'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
