import { AnimatePresence, motion } from 'framer-motion';
import type { Candidate } from '../types';
import { STAGE_META, TX_STAGES, stageIndex, type TxStage } from '../lib/txStages';

interface Props {
  open: boolean;
  candidate: Candidate | null;
  submitting: boolean;
  /** Current stage while submitting; null before the first stage arrives. */
  stage: TxStage | null;
  /** Set when the last attempt failed. The modal stays open so the ballot survives. */
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Stage checklist.
 *
 * Testers reported a 20-25 second silent proving phase on mobile and assumed
 * the tab had crashed. Naming the current step — and showing which steps are
 * already done — is the difference between waiting and force-quitting.
 */
function StageList({ stage }: { stage: TxStage | null }) {
  const current = stage ? stageIndex(stage) : 0;

  return (
    <ol className="mt-4 space-y-2" role="status" aria-live="polite">
      {TX_STAGES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const meta = STAGE_META[s];

        return (
          <li
            key={s}
            className={`flex items-start gap-3 rounded-xl border p-2.5 transition-colors ${
              active
                ? 'border-shadow-purple/40 bg-shadow-purple/10'
                : 'border-transparent bg-transparent'
            }`}
          >
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center" aria-hidden>
              {done ? (
                <span className="text-sm text-emerald-400">✓</span>
              ) : active ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-shadow-purple border-t-transparent" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-slate-600" />
              )}
            </span>
            <span className="min-w-0">
              <span
                className={`block text-sm font-semibold ${
                  active ? 'text-slate-100' : done ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {meta.label}
              </span>
              {active && <span className="block text-xs text-slate-400">{meta.detail}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function VoteModal({
  open,
  candidate,
  submitting,
  stage,
  error,
  onConfirm,
  onClose,
}: Props) {
  // A failed attempt must not discard the ballot. Testers who hit an RPC
  // timeout had to re-select their candidate and re-run the whole proof, so
  // the modal now holds its selection and offers a retry in place.
  const failed = Boolean(error) && !submitting;

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
            className="glass max-h-[90vh] w-full max-w-md overflow-y-auto p-6"
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl text-2xl ${
                failed
                  ? 'bg-rose-500/20'
                  : 'bg-gradient-to-br from-shadow-purple to-shadow-blue shadow-glow'
              }`}
            >
              {failed ? '⚠️' : '🔒'}
            </div>

            <h2 className="text-xl font-bold text-slate-100">
              {failed ? 'That vote did not go through' : 'Confirm your private vote'}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              You are voting for{' '}
              <span className="font-semibold text-shadow-violet">{candidate.name}</span>.
              {failed ? (
                <> Your choice is still selected — you can try again without starting over.</>
              ) : (
                <>
                  {' '}
                  This choice is sealed as a zero-knowledge proof — the tally updates, but{' '}
                  <span className="text-slate-200">no one can link this vote to you</span>.
                </>
              )}
            </p>

            {/*
              The candidate name appears here and ONLY here: on the voter's own
              screen, before submission, so they can confirm what they picked.
              It is a private circuit input and is never published, never logged,
              and never rendered anywhere an observer could reach.
            */}
            {!submitting && !failed && (
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
            )}

            {submitting && <StageList stage={stage} />}

            {failed && (
              <div
                className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3"
                role="alert"
              >
                <p className="whitespace-pre-line text-xs text-rose-200">{error}</p>
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button onClick={onClose} disabled={submitting} className="btn-ghost flex-1">
                Cancel
              </button>
              <button onClick={onConfirm} disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Working…' : failed ? 'Try again' : 'Cast Secret Vote'}
              </button>
            </div>

            {submitting && (
              <p className="mt-3 text-center text-xs text-slate-500">
                Keep this tab open. Proving runs on your device and can take 20&ndash;30 seconds on
                a phone.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
