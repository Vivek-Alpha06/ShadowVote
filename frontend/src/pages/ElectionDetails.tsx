import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { contractService } from '../lib/contractService';
import { PageShell } from '../components/Motion';
import { categoryMeta, type Election } from '../types';
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
import type { TxStage } from '../lib/txStages';
import CopyLinkButton from '../components/ShareActions';
import CategoryIcon from '../components/CategoryIcon';
import {
  Vote,
  Lock,
  Trophy,
  BarChart3,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

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
  const [stage, setStage] = useState<TxStage | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
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

  useEffect(() => {
    if (connected || !submitting) return;
    setSubmitting(false);
    setStage(null);
    setVoteError(
      'Your wallet disconnected while the ZK proof was generating, so the vote was not submitted. Reconnect to retry — your selection is preserved.',
    );
  }, [connected, submitting]);

  async function confirmVote() {
    if (selected === null || !address) return;
    setSubmitting(true);
    setVoteError(null);
    setStage(null);
    try {
      await contractService.castVote(id, selected, address, setStage);
      toast.success('Your private vote was cast on-chain');
      setModalOpen(false);
      setVoted(true);
      await refresh();
    } catch (err) {
      setVoteError(err instanceof Error ? err.message : 'The vote could not be submitted.');
    } finally {
      setSubmitting(false);
      setStage(null);
    }
  }

  function closeVoteModal() {
    setModalOpen(false);
    setVoteError(null);
    setStage(null);
  }

  async function handleClose() {
    if (!address) return;
    setClosing(true);
    try {
      await contractService.closeElection(id, address);
      toast.success('Voting ended — results are now published on-chain');
      navigate(`/election/${id}/results`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not end voting');
    } finally {
      setClosing(false);
    }
  }

  if (loading) return (
    <div className="py-24 flex justify-center">
      <Spinner label="Fetching election details from Midnight Preview indexer…" />
    </div>
  );

  if (!election) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl text-center py-20 credix-card p-10 bg-white border border-[#cdd0e5]">
          <div className="w-16 h-16 rounded-2xl bg-[#dfe7f9] border border-[#cdd0e5] flex items-center justify-center text-[#202952] mx-auto mb-3">
            <Vote className="w-8 h-8 text-[#202952]/70" />
          </div>
          <h2 className="text-2xl font-bold text-[#2e335b] font-heading mt-4">Election Not Found</h2>
          <p className="mt-2 text-xs sm:text-sm text-[#2e335b]/75">
            This election could not be found on the Midnight Preview ledger.
          </p>
          <Link to="/dashboard" className="button accent sm mt-6 text-xs font-bold inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Elections Hub</span>
          </Link>
        </div>
      </PageShell>
    );
  }

  const isClosed = election.status === 'CLOSED';
  const cat = categoryMeta(election.category);
  const selectedCandidate = selected !== null ? election.candidates[selected] ?? null : null;

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-xs font-bold text-[#2e335b]/70 hover:text-[#2e335b] inline-flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Elections Hub</span>
          </Link>
          <CopyLinkButton />
        </div>

        {/* Hero Card */}
        <div className="credix-card p-6 sm:p-8 bg-white border border-[#cdd0e5] shadow-credix">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="tag !text-[11px] flex items-center gap-1.5">
                <CategoryIcon category={election.category} className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </span>
              <span className="text-xs text-[#2e335b]/60 font-mono">Ballot #{election.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={election.status} />
              <Timer endTime={election.endTime} onEnd={refresh} />
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#2e335b] font-heading leading-tight">
            {election.name}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#2e335b]/80 max-w-3xl leading-relaxed">
            {election.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-6 pt-5 border-t border-[#cdd0e5]/60 text-xs text-[#2e335b]/75">
            <span>
              <strong>Organizer:</strong> <code className="font-mono">{election.organizer ? election.organizer.slice(0, 10) + '…' : 'Public'}</code>
            </span>
            <span>
              <strong>Created:</strong> {formatDate(election.createdAt)}
            </span>
            <span>
              <strong>Ends:</strong> {formatDate(election.endTime)}
            </span>
            <span className="font-bold text-[#2e335b]">
              {election.totalVotes} ballot{election.totalVotes === 1 ? '' : 's'} recorded
            </span>
          </div>
        </div>

        {/* Voting Terminal & Privacy Panels */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Candidates Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-[#2e335b] font-heading">
                Cast Your Confidential Ballot
              </h2>
              <span className="text-xs text-[#2e335b]/60">Choose one candidate</span>
            </div>

            {isClosed ? (
              <div className="credix-card p-8 text-center bg-white border border-[#cdd0e5]">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#2e335b] font-heading mt-2">Voting Has Ended</h3>
                <p className="text-xs sm:text-sm text-[#2e335b]/75 mt-1">
                  Ballots for this election are closed and official tallies have been decrypted.
                </p>
                <Link to={`/election/${id}/results`} className="button accent sm mt-5 text-xs font-bold inline-flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>View Final Results</span>
                </Link>
              </div>
            ) : voted ? (
              <div className="credix-card p-8 text-center bg-emerald-50/70 border border-emerald-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-emerald-900 font-heading mt-2">Your Ballot Has Been Cast</h3>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                  Your nullifier hash was verified and permanently counted. Your candidate choice remains mathematically hidden.
                </p>
                <Link to={`/election/${id}/results`} className="button ghost sm mt-5 text-xs font-bold inline-flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Track Election Status</span>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {election.candidates.map((c) => (
                    <CandidateCard
                      key={c.index}
                      candidate={c}
                      selected={selected === c.index}
                      onSelect={(idx) => setSelected(idx)}
                    />
                  ))}
                </div>

                <div className="pt-4">
                  {!connected ? (
                    <div className="credix-card p-6 bg-white border border-[#cdd0e5] space-y-3">
                      <p className="text-xs text-[#2e335b]/80">Connect your Lace wallet to cast your private vote:</p>
                      <ConnectWallet />
                    </div>
                  ) : (
                    <button
                      onClick={() => setModalOpen(true)}
                      disabled={selected === null}
                      className="button accent text-sm w-full !py-3.5 inline-flex items-center justify-center gap-2 font-bold"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{selected === null ? 'Select an Option Above' : 'Proceed to Secret Vote'}</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sidebar Column: Privacy Details & Organizer Actions */}
          <div className="lg:col-span-5 space-y-6">
            <PrivacyNote />

            {/* Organizer End Voting Controls */}
            {connected && !isClosed && (
              <div className="credix-card p-6 bg-white border border-[#cdd0e5] shadow-sm">
                <span className="tag !text-[10px] mb-2">Organizer Tools</span>
                <h4 className="text-sm font-bold text-[#2e335b] font-heading mt-1">
                  Election Administration
                </h4>
                <p className="text-xs text-[#2e335b]/70 mt-1 leading-relaxed">
                  If you are the designated election organizer, you can end voting early to publish final tallies.
                </p>
                <button
                  onClick={handleClose}
                  disabled={closing}
                  className="button ghost sm mt-4 text-xs w-full hover:border-rose-300 hover:text-rose-700"
                >
                  {closing ? 'Ending Voting…' : 'End Voting & Decrypt Results'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <VoteModal
        open={modalOpen}
        candidate={selectedCandidate}
        submitting={submitting}
        stage={stage}
        error={voteError}
        onConfirm={confirmVote}
        onClose={closeVoteModal}
      />
    </PageShell>
  );
}
