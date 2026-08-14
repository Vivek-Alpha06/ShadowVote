import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contractService } from '../lib/contractService';
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

export default function CreateElection() {
  const navigate = useNavigate();
  const { address, connected } = useWallet();
  const toast = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ElectionCategory>('election');
  const [description, setDescription] = useState('');
  const [candidates, setCandidates] = useState<string[]>(['', '']);
  const [duration, setDuration] = useState(24);
  const [unit, setUnit] = useState<Unit>('hours');
  const [submitting, setSubmitting] = useState(false);

  const setCandidate = (i: number, v: string) =>
    setCandidates((c) => c.map((x, idx) => (idx === i ? v : x)));
  const addCandidate = () => setCandidates((c) => [...c, '']);
  const removeCandidate = (i: number) =>
    setCandidates((c) => (c.length <= 2 ? c : c.filter((_, idx) => idx !== i)));

  const validCandidates = candidates.map((c) => c.trim()).filter(Boolean);
  const durationMs = duration * UNIT_MS[unit];
  const canSubmit =
    connected && name.trim().length > 2 && validCandidates.length >= 2 && durationMs > 0;

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
                      ? 'border-shadow-purple bg-shadow-purple/20 text-slate-100'
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
            {candidates.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input"
                  placeholder={`Candidate ${i + 1}`}
                  value={c}
                  onChange={(e) => setCandidate(i, e.target.value)}
                  maxLength={60}
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
            ))}
          </div>
          <button
            type="button"
            onClick={addCandidate}
            className="mt-2 text-sm font-semibold text-shadow-purple hover:underline"
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

        <button type="submit" disabled={!canSubmit || submitting} className="btn-primary w-full">
          {submitting ? 'Creating…' : 'Create Election'}
        </button>
      </motion.form>
    </div>
  );
}
