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

function StageList({ stage }: { stage: TxStage | null }) {
  const current = stage ? stageIndex(stage) : 0;
  const progressPercent = Math.min(100, Math.round(((current + 1) / TX_STAGES.length) * 100));

  return (
    <div className="mt-4 space-y-3">
      {/* Visual progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
          <span>Zero-Knowledge Execution</span>
          <span className="text-violet-400 font-mono">{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
            initial={{ width: '10%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <ol className="space-y-2" role="status" aria-live="polite">
        {TX_STAGES.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const meta = STAGE_META[s];

          return (
            <li
              key={s}
              className={`flex items-start gap-3 rounded-xl border p-2.5 transition-all duration-200 ${
                active
                  ? 'border-violet-500/40 bg-violet-950/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                  : done
                    ? 'border-emerald-500/20 bg-emerald-950/10'
                    : 'border-white/[0.04] bg-white/[0.01]'
              }`}
            >
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center" aria-hidden>
                {done ? (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                    ✓
                  </span>
                ) : active ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-zinc-700" />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-xs font-bold tracking-tight ${
                    active ? 'text-violet-200' : done ? 'text-zinc-300' : 'text-zinc-600'
                  }`}
                >
                  {meta.label}
                </span>
                {active && <span className="block text-[11px] text-zinc-400 mt-0.5">{meta.detail}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
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
  const failed = Boolean(error) && !submitting;

  return (
    <AnimatePresence>
      {open && candidate && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center bg-black/80 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={submitting ? undefined : onClose}
        >
          <motion.div
            className="glass relative max-h-[90vh] w-full max-w-md overflow-y-auto p-6 border border-white/[0.12] shadow-2xl"
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl text-2xl ${
                failed
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                  : 'bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/40 shadow-glow'
              }`}
            >
              {failed ? '⚠️' : '🔒'}
            </div>

            <h2 className="text-xl font-bold text-white">
              {failed ? 'Transaction Interrupted' : 'Confirm Confidential Ballot'}
            </h2>

            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              You are voting for{' '}
              <span className="font-semibold text-white bg-white/[0.08] px-2 py-0.5 rounded-md">
                {candidate.name}
              </span>
              .
              {failed ? (
                <> Your selection is preserved — you can retry submitting without re-selecting.</>
              ) : (
                <>
                  {' '}
                  This choice is evaluated in a client-side zero-knowledge witness —{' '}
                  <span className="text-zinc-200 font-medium">no one can deanonymize your vote on-chain</span>.
                </>
              )}
            </p>

            {!submitting && !failed && (
              <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-950/20 p-3.5">
                <p className="flex items-center gap-2 text-xs font-bold text-violet-300 uppercase tracking-wider">
                  <span aria-hidden>🛡️</span>
                  Midnight Cryptographic Witness
                </p>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Your voter secret key generates a unique nullifier hash. The ballot updates public totals, but candidate selection remains 100% private.
                </p>
              </div>
            )}

            {submitting && <StageList stage={stage} />}

            {failed && (
              <div
                className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5"
                role="alert"
              >
                <p className="whitespace-pre-line text-xs font-medium text-rose-200">{error}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button onClick={onClose} disabled={submitting} className="btn-ghost flex-1">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={submitting}
                className="btn-violet flex-1"
              >
                {submitting ? 'Generating Proof…' : failed ? 'Retry Submission' : 'Cast Secret Ballot'}
              </button>
            </div>

            {submitting && (
              <p className="mt-3 text-center text-[11px] text-zinc-500">
                Please keep this tab active. Zero-knowledge proof is being constructed on your device.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
