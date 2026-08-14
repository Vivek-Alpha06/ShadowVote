import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contractService } from '../lib/contractService';
import type { Election } from '../types';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import Timer from '../components/Timer';
import CandidateCard from '../components/CandidateCard';
import VoteModal from '../components/VoteModal';
import PrivacyNote from '../components/PrivacyNote';
import ConnectWallet from '../components/ConnectWallet';
import { useWallet } from '../hooks/useWallet';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../lib/format';

export default function ElectionDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { address, connected } = useWallet();
  const toast = useToast();

  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing] = useState(false);

  const refresh = useCallback(async () => {
    const e = await contractService.getElection(id);
    setElection(e);
    setVoted(e && address ? await contractService.hasVoted(id, address) : false);
    setLoading(false);
  }, [id, address]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function confirmVote() {
    if (selected === null || !address) return;
    setSubmitting(true);
    try {
      await contractService.castVote(id, selected, address);
      toast.success('Your private vote was cast 🔒');
      setModalOpen(false);
      setVoted(true);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Vote failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClose() {
    if (!address) return;
    setClosing(true);
    try {
      await contractService.closeElection(id, address);
      toast.success('Voting ended — results are now public');
      navigate(`/election/${id}/results`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not end voting');
    } finally {
      setClosing(false);
    }
  }

  if (loading) return <Spinner label="Loading election…" />;
  if (!election)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-4xl">🤷</p>
        <h1 className="mt-4 text-2xl font-bold">Election not found</h1>
        <Link to="/dashboard" className="btn-ghost mt-6">
          ← Back to dashboard
        </Link>
      </div>
    );

  const isClosed = election.status === 'CLOSED';
  const isCreator = Boolean(address) && contractService.isOrganizer(election, address!);
  const selectedCandidate =
    selected !== null ? election.candidates.find((c) => c.index === selected) ?? null : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">
        ← All elections
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">{election.name}</h1>
          <StatusBadge status={election.status} />
        </div>
        <p className="text-slate-400">{election.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
          <Timer endTime={election.endTime} onEnd={refresh} />
          <span>Ends {formatDate(election.endTime)}</span>
          <span>{election.totalVotes} votes cast</span>
        </div>
      </motion.div>

      {/* Voting area */}
      <div className="mt-8">
        {isClosed ? (
          <div className="glass p-6 text-center">
            <p className="text-slate-300">Voting has ended for this election.</p>
            <Link to={`/election/${id}/results`} className="btn-primary mt-4">
              View Results →
            </Link>
          </div>
        ) : voted ? (
          <div className="glass flex flex-col items-center gap-2 p-8 text-center">
            <span className="text-4xl">✅</span>
            <p className="font-semibold text-slate-100">You've voted in this election</p>
            <p className="text-sm text-slate-400">
              Your choice is private and can't be changed. Results are published when the timer runs
              out.
            </p>
          </div>
        ) : !connected ? (
          <ConnectWallet title="Connect your wallet to cast a private vote" />
        ) : (
          <>
            <h2 className="mb-3 font-bold text-slate-100">Select a candidate</h2>
            <div className="space-y-3">
              {election.candidates.map((c) => (
                <CandidateCard
                  key={c.index}
                  candidate={c}
                  selected={selected === c.index}
                  onSelect={setSelected}
                />
              ))}
            </div>
            <button
              onClick={() => setModalOpen(true)}
              disabled={selected === null}
              className="btn-primary mt-5 w-full"
            >
              {selected === null ? 'Select a candidate to vote' : 'Cast Secret Vote'}
            </button>
          </>
        )}
      </div>

      {/* Creator-only control: ending early publishes the tally, so a bystander
          must not be able to trigger it. */}
      {!isClosed && isCreator && (
        <div className="glass mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="text-sm">
            <p className="font-semibold text-slate-200">You created this election</p>
            <p className="text-slate-400">
              It closes on its own at the deadline. You can also end it now to publish the result
              early.
            </p>
          </div>
          <button onClick={handleClose} disabled={closing} className="btn-ghost">
            {closing ? 'Ending…' : 'End voting now'}
          </button>
        </div>
      )}

      <div className="mt-6">
        <PrivacyNote />
      </div>

      <VoteModal
        open={modalOpen}
        candidate={selectedCandidate}
        submitting={submitting}
        onConfirm={confirmVote}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
