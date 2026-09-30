import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { contractService } from '../lib/contractService';
import { PageShell, PageHeader } from '../components/Motion';
import { useWallet } from '../hooks/useWallet';
import { useToast } from '../hooks/useToast';
import ConnectWallet from '../components/ConnectWallet';
import ChainPanel from '../components/ChainPanel';
import { formatDate } from '../lib/format';
import { ELECTION_CATEGORIES, categoryMeta, type ElectionCategory } from '../types';
import CategoryIcon from '../components/CategoryIcon';
import { Send, CheckCircle2, ArrowLeft, Plus, Trash2 } from 'lucide-react';

type Unit = 'minutes' | 'hours' | 'days';

const UNIT_MS: Record<Unit, number> = {
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000,
};

const DURATION_PRESETS = [
  { label: '1 Hour', duration: 1, unit: 'hours' as Unit },
  { label: '6 Hours', duration: 6, unit: 'hours' as Unit },
  { label: '24 Hours', duration: 24, unit: 'hours' as Unit },
  { label: '3 Days', duration: 3, unit: 'days' as Unit },
  { label: '7 Days', duration: 7, unit: 'days' as Unit },
];

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
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ name, category, description, candidates, duration, unit }),
      );
      setDraftSaved(true);
      const t = setTimeout(() => setDraftSaved(false), 1500);
      return () => clearTimeout(t);
    } catch {
      /* ignore */
    }
  }, [name, category, description, candidates, duration, unit]);

  const setCandidate = (i: number, v: string) =>
    setCandidates((c) => c.map((x, idx) => (idx === i ? v : x)));
  const addCandidate = () => setCandidates((c) => [...c, '']);
  const removeCandidate = (i: number) =>
    setCandidates((c) => (c.length <= 2 ? c : c.filter((_, idx) => idx !== i)));

  const validCandidates = candidates.map((c) => c.trim()).filter(Boolean);
  const durationMs = duration * UNIT_MS[unit];

  const blankRows = candidates
    .map((c, i) => (c.trim().length === 0 ? i : null))
    .filter((x): x is number => x !== null);

  const duplicateRows = candidates
    .map((c, i) => {
      const trimmed = c.trim();
      if (!trimmed) return null;
      const first = candidates.findIndex((x) => x.trim() === trimmed);
      return first !== -1 && first < i ? i : null;
    })
    .filter((x): x is number => x !== null);

  const errors: string[] = [];
  if (!name.trim()) errors.push('An election title is required.');
  if (blankRows.length > 0) {
    errors.push(
      blankRows.length === 1
        ? `Candidate ${blankRows[0] + 1} is empty.`
        : `${blankRows.length} candidate rows are empty.`,
    );
  }
  if (duplicateRows.length > 0) {
    errors.push('Two or more candidates share the exact same name.');
  }
  if (validCandidates.length < 2) {
    errors.push('An election needs at least two distinct candidates.');
  }
  if (duration <= 0 || !Number.isFinite(duration)) {
    errors.push('The voting duration must be at least 1 minute.');
  }

  const canSubmit = errors.length === 0 && Boolean(address);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !address) return;

    setSubmitting(true);
    try {
      const created = await contractService.createElection(
        {
          name: name.trim(),
          category,
          description: description.trim(),
          candidateNames: validCandidates,
          endTime: Date.now() + durationMs,
        },
        address,
      );

      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }

      toast.success('Election deployed to Midnight Preview');
      navigate(`/election/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deploy election.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-4">
          <Link to="/dashboard" className="text-xs font-bold text-[#2e335b]/70 hover:text-[#2e335b] inline-flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Elections Hub</span>
          </Link>
        </div>

        <PageHeader
          eyebrow="Ballot Studio · Deploy On-Chain"
          title="Create New Election"
          subtitle="Deploy a private, tamper-resistant ballot to Midnight Preview. Voter choices remain zero-knowledge shielded while turnout is verifiable."
        />

        <div className="mt-8">
          <ChainPanel />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 credix-card p-6 sm:p-8 bg-white border border-[#cdd0e5] shadow-credix space-y-6">
            <div className="flex items-center justify-between border-b border-[#cdd0e5]/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2e335b]">
                Election Configuration
              </span>
              {draftSaved && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Auto-saved</span>
                </span>
              )}
            </div>

            {/* Category Pills */}
            <div>
              <label className="label">Ballot Category</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {ELECTION_CATEGORIES.map((c) => {
                  const on = category === c.value;
                  return (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        on
                          ? 'border-[#2e335b] bg-[#2e335b] text-white shadow-sm'
                          : 'border-[#cdd0e5] bg-[#f5f4fd] text-[#2e335b]/75 hover:bg-[#dfe7f9]'
                      }`}
                    >
                      <CategoryIcon category={c.value} className="w-3.5 h-3.5" />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="election-name" className="label">
                Election Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="election-name"
                type="text"
                className="input"
                placeholder="e.g. Treasury Grant Allocation Q2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="election-desc" className="label">
                Description &amp; Rules
              </label>
              <textarea
                id="election-desc"
                rows={3}
                className="w-full rounded-2xl bg-white border border-[#cdd0e5] px-4 py-3 text-sm text-[#2e335b] placeholder:text-[#2e335b]/40 outline-none focus:border-[#2e335b] focus:ring-4 focus:ring-[#dfe7f9]"
                placeholder="Provide voting context, eligible criteria, or candidate proposals…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={400}
              />
            </div>

            {/* Candidates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label !mb-0">
                  Candidates / Options <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-[#2e335b]/60">Minimum 2 required</span>
              </div>

              <div className="space-y-2.5">
                {candidates.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs font-bold text-[#2e335b]/60 font-mono">
                      #{i + 1}
                    </span>
                    <input
                      type="text"
                      className="input !py-2 !px-4 text-xs"
                      placeholder={`Candidate #${i + 1} Name`}
                      value={c}
                      onChange={(e) => setCandidate(i, e.target.value)}
                    />
                    {candidates.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeCandidate(i)}
                        className="grid h-8 w-8 place-items-center rounded-full border border-[#cdd0e5] bg-[#f5f4fd] text-[#2e335b] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-colors"
                        title="Remove candidate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addCandidate}
                className="button ghost sm mt-3 text-xs w-full inline-flex items-center justify-center gap-1.5 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Candidate</span>
              </button>
            </div>

            {/* Duration */}
            <div>
              <label className="label">Voting Duration</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {DURATION_PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => {
                      setDuration(p.duration);
                      setUnit(p.unit);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                      duration === p.duration && unit === p.unit
                        ? 'border-[#2e335b] bg-[#2e335b] text-white shadow-sm'
                        : 'border-[#cdd0e5] bg-[#f5f4fd] text-[#2e335b]/75 hover:bg-[#dfe7f9]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  className="input !w-32 !py-2 !px-3 text-xs"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <select
                  className="rounded-full border border-[#cdd0e5] bg-white px-4 py-2 text-xs font-bold text-[#2e335b] outline-none"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as Unit)}
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
                <span className="text-xs text-[#2e335b]/60">
                  Ends {formatDate(Date.now() + durationMs)}
                </span>
              </div>
            </div>

            {/* Error List */}
            {errors.length > 0 && name.trim() && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 space-y-1">
                <p className="font-bold">Please resolve the following:</p>
                {errors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-3 border-t border-[#cdd0e5]/60">
              {!connected ? (
                <div className="space-y-3">
                  <p className="text-xs text-[#2e335b]/70">Connect your Lace wallet to deploy this election:</p>
                  <ConnectWallet />
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="button accent text-sm w-full !py-3.5 inline-flex items-center justify-center gap-2 font-bold"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Deploying to Midnight Preview…' : 'Deploy Election On-Chain'}</span>
                </button>
              )}
            </div>
          </form>

          {/* Live Preview Panel */}
          <div className="lg:col-span-5 credix-card p-6 bg-white border border-[#cdd0e5] shadow-credix sticky top-28 space-y-5">
            <div className="flex items-center justify-between border-b border-[#cdd0e5]/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2e335b]">
                Live Ballot Preview
              </span>
              <span className="tag !text-[10px] !py-0.5 !px-2.5 flex items-center gap-1.5">
                <CategoryIcon category={category} className="w-3 h-3 text-[#202952]" />
                <span>{categoryMeta(category).label}</span>
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#2e335b] font-heading">
                {name.trim() || 'Untitled Election'}
              </h3>
              <p className="text-xs text-[#2e335b]/70 mt-1.5 leading-relaxed">
                {description.trim() || 'No description provided.'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#2e335b]">
                Candidate Options:
              </p>
              {validCandidates.length === 0 ? (
                <p className="text-xs italic text-[#2e335b]/50">Enter at least 2 candidates...</p>
              ) : (
                validCandidates.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#cdd0e5] bg-[#f5f4fd] text-xs font-semibold text-[#2e335b]"
                  >
                    <span>{c}</span>
                    <span className="opacity-60 font-mono">#{i + 1}</span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-[#cdd0e5]/60 text-xs space-y-2 text-[#2e335b]/75">
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="font-bold text-[#2e335b]">Midnight Preview</span>
              </div>
              <div className="flex justify-between">
                <span>Privacy Mode:</span>
                <span className="font-bold text-emerald-700">Zero-Knowledge Shielded</span>
              </div>
              <div className="flex justify-between">
                <span>Voting Closes:</span>
                <span className="font-mono text-[#2e335b]">{formatDate(Date.now() + durationMs)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
