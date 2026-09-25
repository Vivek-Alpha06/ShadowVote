import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contractService } from '../lib/contractService';
import { PageShell } from '../components/Motion';
import { useWallet } from '../hooks/useWallet';
import { useToast } from '../hooks/useToast';
import ConnectWallet from '../components/ConnectWallet';
import ChainPanel from '../components/ChainPanel';
import { formatDate } from '../lib/format';
import { ELECTION_CATEGORIES, type ElectionCategory } from '../types';

type Unit = 'minutes' | 'hours' | 'days';

const UNIT_MS: Record<Unit, number> = {
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000,
};

/**
 * Draft persistence.
 *
 *   "Cannot edit or delete an election draft before deploying on-chain. If I
 *    made a typo in candidate names, I had to re-enter all fields from
 *    scratch."  -- Barnali Das, 2 stars
 *
 * Kept in localStorage, in this browser only: a draft is not yet an election
 * and has no business touching the chain or any server. It is cleared the
 * moment the election is actually created.
 */
const DRAFT_KEY = 'shadowvote:create:draft';

interface Draft {
  name: string;
  category: ElectionCategory;
  description: string;
  candidates: string[];
  duration: number;
  unit: Unit;
}

function loadDraft(): Partial<Draft> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<Draft>) : {};
  } catch {
    // A corrupt or unavailable store must never block the form.
    return {};
  }
}

export default function CreateElection() {
  const navigate = useNavigate();
  const { address, connected } = useWallet();
  const toast = useToast();

  const [draft] = useState(loadDraft);
  const [name, setName] = useState(draft.name ?? '');
  const [category, setCategory] = useState<ElectionCategory>(draft.category ?? 'election');
  const [description, setDescription] = useState(draft.description ?? '');
  const [candidates, setCandidates] = useState<string[]>(
    draft.candidates?.length ? draft.candidates : ['', ''],
  );
  const [duration, setDuration] = useState(draft.duration ?? 24);
  const [unit, setUnit] = useState<Unit>(draft.unit ?? 'hours');
  const [submitting, setSubmitting] = useState(false);

  // Save on every edit so a failed transaction, a reload, or a closed tab all
  // leave the work intact.
  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ name, category, description, candidates, duration, unit }),
      );
    } catch {
      /* private mode or a full quota — not worth interrupting the user over */
    }
  }, [name, category, description, candidates, duration, unit]);

  const setCandidate = (i: number, v: string) =>
    setCandidates((c) => c.map((x, idx) => (idx === i ? v : x)));
  const addCandidate = () => setCandidates((c) => [...c, '']);
  const removeCandidate = (i: number) =>
    setCandidates((c) => (c.length <= 2 ? c : c.filter((_, idx) => idx !== i)));

  const validCandidates = candidates.map((c) => c.trim()).filter(Boolean);
  const durationMs = duration * UNIT_MS[unit];

  /**
   * Inline validation, added after user feedback:
   *
   *   "Form validation in election creation is missing checks — if you
   *    accidentally leave a candidate name blank, the deployment transaction
   *    fails on-chain and wastes gas."  -- Swati Maji, 2 stars
   *
   * The old behaviour was arguably worse than reported: a blank row was
   * silently dropped by `.filter(Boolean)`, so the election deployed with
   * fewer candidates than the organizer intended and nothing said so. Every
   * problem is now named, next to the field that causes it, BEFORE a
   * transaction is built — nothing here costs gas to discover.
   */
  const trimmed = candidates.map((c) => c.trim());
  const blankRows = trimmed
    .map((c, i) => (c ? -1 : i))
    .filter((i) => i >= 0);
  const duplicateRows = trimmed
    .map((c, i) =>
      c && trimmed.findIndex((o) => o.toLowerCase() === c.toLowerCase()) !== i ? i : -1,
    )
    .filter((i) => i >= 0);

  const errors: string[] = [];
  if (name.trim().length > 0 && name.trim().length <= 2)
    errors.push('The election name needs at least 3 characters.');
  if (blankRows.length > 0)
    errors.push(
      blankRows.length === 1
        ? `Candidate ${blankRows[0] + 1} is empty. Fill it in or remove the row.`
        : `Candidates ${blankRows.map((i) => i + 1).join(', ')} are empty. Fill them in or remove those rows.`,
    );
  if (duplicateRows.length > 0)
    errors.push(
      'Two candidates have the same name. Voters pick by name, so each one must be distinct.',
    );
  if (validCandidates.length < 2) errors.push('An election needs at least two candidates.');
  if (!(durationMs > 0)) errors.push('The voting window must be longer than zero.');

  const canSubmit = connected && name.trim().length > 2 && errors.length === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !address) return;
    setSubmitting(true);
    try {
      const election = await contractService.createElection(
        {
          name,
          description,
          category,
          candidateNames: validCandidates,
          endTime: Date.now() + durationMs,
        },
        address,
      );
      // The draft has become a real election; keep no stale copy of it.
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* nothing to clean up if the store is unavailable */
      }
      toast.success('Election created — voting is open');
      navigate(`/election/${election.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create election');
    } finally {
      setSubmitting(false);
    }
  }

  if (!connected) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="mb-2 text-center text-2xl font-bold">Create an election</h1>
        <p className="mb-6 text-center text-slate-400">
          Anyone can run an election — you just need a wallet to sign it.
        </p>
        <ConnectWallet title="Connect your wallet to create an election" />
      </div>
    );
  }

  return (
    <PageShell>
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Create an election</h1>
      <p className="mb-6 mt-1 text-slate-400">
        Creating submits a real transaction on Midnight. Metadata is public; individual votes stay
        private.
      </p>

      <ChainPanel />

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass mt-8 space-y-6 p-6"
      >
        <div>
          <label className="label">Election name</label>
          <input
            className="input"
            placeholder="e.g. Student Council President 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
        </div>

        <div>
          <label className="label">Type</label>
          <div className="flex flex-wrap gap-2">
            {ELECTION_CATEGORIES.map((c) => {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  aria-pressed={active}
                  className={
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ' +
                    (active
                      ? 'border-white/40 bg-white/10 text-slate-100'
                      : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200')
                  }
                >
                  <span aria-hidden>{c.icon}</span>
                  {c.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Labels this vote for people browsing. Every type behaves identically on-chain — ballots
            stay private either way.
          </p>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[90px] resize-y"
            placeholder="What is this election about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={280}
          />
        </div>

        <div>
          <label className="label">Candidates</label>
          <div className="space-y-2">
            {candidates.map((c, i) => {
              const isBlank = blankRows.includes(i);
              const isDuplicate = duplicateRows.includes(i);
              const bad = isBlank || isDuplicate;
              return (
                <div key={i}>
                  <div className="flex gap-2">
                    <input
                      className={`input ${bad ? 'border-rose-400/60 focus:border-rose-400' : ''}`}
                      placeholder={`Candidate ${i + 1}`}
                      value={c}
                      onChange={(e) => setCandidate(i, e.target.value)}
                      maxLength={60}
                      aria-invalid={bad}
                    />
                    <button
                      type="button"
                      onClick={() => removeCandidate(i)}
                      disabled={candidates.length <= 2}
                      className="btn-ghost px-3 disabled:opacity-30"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                  {/* Named at the field, not just in a summary — a blank row
                      used to be silently dropped and deploy with one fewer
                      candidate than intended. */}
                  {isBlank && (
                    <p className="mt-1 text-xs text-rose-300">
                      This candidate is empty. Fill it in, or remove the row.
                    </p>
                  )}
                  {isDuplicate && (
                    <p className="mt-1 text-xs text-rose-300">
                      Same name as an earlier candidate — each one must be distinct.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addCandidate}
            className="mt-2 text-sm font-semibold text-white hover:underline"
          >
            + Add candidate
          </button>
        </div>

        <div>
          <label className="label">Voting window</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={999}
              className="input"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
            <select
              className="input w-40"
              value={unit}
              onChange={(e) => setUnit(e.target.value as Unit)}
            >
              <option value="minutes">minutes</option>
              <option value="hours">hours</option>
              <option value="days">days</option>
            </select>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {durationMs > 0 ? (
              <>
                Voting closes and results unlock automatically on{' '}
                <span className="text-slate-300">{formatDate(Date.now() + durationMs)}</span>.
              </>
            ) : (
              'Set how long voting stays open.'
            )}
          </p>
        </div>

        {/* Everything wrong with the form, before a transaction is built.
            Discovering these on-chain cost testers real gas. */}
        {errors.length > 0 && name.trim().length > 0 && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3">
            <p className="text-xs font-semibold text-rose-200">
              Fix these before creating — none of it costs gas to correct here:
            </p>
            <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs text-rose-300">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" disabled={!canSubmit || submitting} className="btn-primary w-full">
          {submitting ? 'Creating…' : 'Create Election'}
        </button>

        <p className="text-center text-xs text-slate-500">
          Your draft is kept in this browser until the election is created, so a failed transaction
          never makes you retype it.
        </p>
      </motion.form>
    </div>
    </PageShell>
  );
}
