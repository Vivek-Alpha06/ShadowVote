import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { NETWORK_LABEL_OVERRIDE } from '../lib/networkPreference';
import { PageShell, PageHeader, Reveal } from '../components/Motion';
import ConnectWallet from '../components/ConnectWallet';
import { getSession, subscribe } from '../lib/chainSession';
import { readTxHistory, subscribeTxHistory, clearTxHistory, type TxRecord } from '../lib/txHistory';
import { explorerTxUrl, explorerBase } from '../lib/explorer';
import { formatDate } from '../lib/format';
import {
  Vote,
  Send,
  CheckCircle2,
  Activity,
  FileText,
  Inbox,
  Check,
  ExternalLink,
  Copy,
  ArrowRight,
} from 'lucide-react';

export default function History() {
  const { connected, networkId } = useWallet();
  const [, force] = useState(0);
  const [session, setSession] = useState(getSession());
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => subscribeTxHistory(() => force((n) => n + 1)), []);
  useEffect(() => subscribe(() => setSession(getSession())), []);

  const wallet = session?.info.coinPublicKey ?? null;
  const records: TxRecord[] = useMemo(() => readTxHistory(wallet), [wallet]);

  const network = session?.info.config.networkId ?? networkId ?? 'preview';
  const hasExplorer = explorerBase(network) !== null;

  const handleCopy = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  const getActionBadge = (action: string) => {
    if (action.toLowerCase().includes('vote')) return { icon: Vote, label: 'Cast Confidential Vote', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (action.toLowerCase().includes('create')) return { icon: Send, label: 'Election Deployment', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (action.toLowerCase().includes('close')) return { icon: CheckCircle2, label: 'Tally Publication', color: 'text-purple-700 bg-purple-50 border-purple-200' };
    return { icon: Activity, label: action, color: 'text-[#202952] bg-[#dfe7f9] border-[#cdd0e5]' };
  };

  if (!connected) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg px-4 py-20 text-center credix-card p-8 bg-white border border-[#cdd0e5]">
          <div className="w-16 h-16 rounded-2xl bg-[#dfe7f9] border border-[#cdd0e5] flex items-center justify-center text-[#202952] mx-auto mb-3">
            <FileText className="w-8 h-8 text-[#202952]/70" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#2e335b] font-heading">Transaction History</h1>
          <p className="mt-2 mb-6 text-xs sm:text-sm text-[#2e335b]/75">
            Connect your Lace wallet to view your verified on-chain Midnight transactions.
          </p>
          <ConnectWallet title="Connect Lace Wallet" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <PageHeader
          eyebrow="On-Chain Ledger History"
          title="Transaction History"
          subtitle={
            <>
              Every transaction submitted by this wallet on the{' '}
              <span className="text-[#2e335b] font-bold font-mono">Midnight {NETWORK_LABEL_OVERRIDE ?? network}</span>{' '}
              blockchain. Each is an immutable, verifiable cryptographic record.
            </>
          }
          actions={
            records.length > 0 ? (
              <button
                onClick={() => {
                  clearTxHistory(wallet);
                  force((n) => n + 1);
                }}
                className="button ghost sm text-xs"
                title="Clears local cache only — transactions remain permanent on-chain"
              >
                Clear Local History
              </button>
            ) : null
          }
        />

        {network && !hasExplorer && records.length > 0 && (
          <p className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
            Explorer not currently indexed for <strong>{NETWORK_LABEL_OVERRIDE ?? network}</strong>. Hashes can still be queried directly through the indexer.
          </p>
        )}

        {records.length === 0 ? (
          <div className="credix-card mt-8 p-10 text-center bg-white border border-[#cdd0e5]">
            <div className="w-16 h-16 rounded-2xl bg-[#dfe7f9] border border-[#cdd0e5] flex items-center justify-center text-[#202952] mx-auto mb-3">
              <Inbox className="w-8 h-8 text-[#202952]/70" />
            </div>
            <p className="mt-3 text-lg font-bold text-[#2e335b] font-heading">No Local Transactions Yet</p>
            <p className="mt-1 text-xs text-[#2e335b]/75">
              When you deploy an election or cast a confidential zero-knowledge vote, it will be logged here with its transaction hash.
            </p>
            <Link to="/dashboard" className="button accent sm mt-6 text-xs font-bold inline-flex items-center gap-1.5">
              <span>Explore Live Elections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {records.map((r, i) => {
              const badge = getActionBadge(r.action);
              const Icon = badge.icon;
              const txUrl = explorerTxUrl(r.hash, network);

              return (
                <Reveal key={r.hash + r.at} index={i}>
                  <div className="credix-card p-5 bg-white border border-[#cdd0e5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center ${badge.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#2e335b] text-sm sm:text-base font-heading">
                            {r.action}
                          </span>
                          <span className="tag !text-[10px] !py-0.5 !px-2">
                            {badge.label}
                          </span>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#2e335b]/70">
                          <span className="font-mono text-[#2e335b]">{r.hash.slice(0, 14)}…{r.hash.slice(-8)}</span>
                          <span>•</span>
                          <span>{formatDate(r.at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleCopy(r.hash)}
                        className="button ghost sm text-xs !py-1.5 !px-3 inline-flex items-center gap-1 font-semibold"
                        title="Copy full transaction hash"
                      >
                        {copiedHash === r.hash ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Hash</span>
                          </>
                        )}
                      </button>

                      {txUrl && (
                        <a
                          href={txUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="button sm text-xs !py-1.5 !px-3 inline-flex items-center gap-1 font-semibold"
                        >
                          <span>Explorer</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
    </div>
  </PageShell>
);
}
