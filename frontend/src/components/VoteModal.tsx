import { AnimatePresence, motion } from 'framer-motion';
import type { Candidate } from '../types';
import { STAGE_META, TX_STAGES, stageIndex, type TxStage } from '../lib/txStages';
import { Lock, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

interface Props {
  open: boolean;
  candidate: Candidate | null;
  submitting: boolean;
  stage: TxStage | null;
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
        <div className="flex items-center justify-between text-xs font-bold text-[#2e335b]">
          <span>Zero-Knowledge Pipeline</span>
          <span className="text-indigo-600 font-mono">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#dfe7f9]">
          <motion.div
            className="h-full bg-[#2e335b] rounded-full"
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
              className={`flex items-start gap-3 rounded-xl border p-3 transition-all duration-200 ${
                active
                  ? 'border-[#2e335b] bg-[#dfe7f9] shadow-sm'
                  : done
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-[#cdd0e5] bg-[#f5f4fd]'
              }`}
            >
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center" aria-hidden>
                {done ? (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                ) : active ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2e335b] border-t-transparent" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[#cdd0e5]" />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-xs font-bold ${
                    active ? 'text-[#2e335b]' : done ? 'text-emerald-900' : 'text-[#2e335b]/60'
                  }`}
                >
                  {meta.label}
                </span>
                {active && <span className="block text-[11px] text-[#2e335b]/75 mt-0.5">{meta.detail}</span>}
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
          className="fixed inset-0 z-[90] grid place-items-center bg-[#2e335b]/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={submitting ? undefined : onClose}
        >
          <motion.div
            className="credix-card relative max-h-[90vh] w-full max-w-md overflow-y-auto p-7 bg-white border border-[#cdd0e5] shadow-2xl text-[#2e335b]"
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${
                failed
                  ? 'bg-rose-100 border border-rose-300'
                  : 'bg-[#dfe7f9] border border-[#cdd0e5]'
              }`}
            >
              {failed ? <AlertTriangle className="w-6 h-6 text-rose-600" /> : <Lock className="w-6 h-6 text-[#202952]" />}
            </div>

            <h2 className="text-xl font-bold text-[#2e335b] font-heading">
              {failed ? 'Transaction Interrupted' : 'Confirm Secret Ballot'}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-[#2e335b]/75 leading-relaxed">
              You are voting for{' '}
              <span className="font-bold text-[#2e335b] bg-[#dfe7f9] px-2 py-0.5 rounded-md">
                {candidate.name}
              </span>
              .
              {failed ? (
                <> Your selection is preserved — you can retry submitting without re-selecting.</>
              ) : (
                <>
                  {' '}
                  This choice is evaluated in a client-side zero-knowledge witness —{' '}
                  <span className="font-semibold text-[#2e335b]">no one can deanonymize your vote on-chain</span>.
                </>
              )}
            </p>

            {!submitting && !failed && (
              <div className="mt-4 rounded-2xl border border-[#cdd0e5] bg-[#f5f4fd] p-4">
                <p className="flex items-center gap-2 text-xs font-bold text-[#2e335b] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Midnight Cryptographic Witness</span>
                </p>
                <p className="mt-1 text-xs text-[#2e335b]/70 leading-relaxed">
                  Your voter secret key generates a unique nullifier hash. The ballot updates public totals, but candidate selection remains 100% private.
                </p>
              </div>
            )}

            {submitting && <StageList stage={stage} />}

            {failed && (
              <div
                className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4"
                role="alert"
              >
                <p className="whitespace-pre-line text-xs font-medium text-rose-800">{error}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button onClick={onClose} disabled={submitting} className="button ghost flex-1 text-xs !py-3">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={submitting}
                className="button accent flex-1 text-xs !py-3"
              >
                {submitting ? 'Generating Proof…' : failed ? 'Retry Submission' : 'Cast Secret Ballot'}
              </button>
            </div>

            {submitting && (
              <p className="mt-3 text-center text-[11px] text-[#2e335b]/60">
                Please keep this tab active. Zero-knowledge proof is being constructed on your device.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
