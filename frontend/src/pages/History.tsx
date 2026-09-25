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

/**
 * Every transaction this wallet has submitted, with a link out to the block
 * explorer so anyone can verify it independently rather than taking this app's
 * word for it.
 */
export default function History() {
  const { connected, networkId } = useWallet();
  const [, force] = useState(0);
  const [session, setSession] = useState(getSession());

  useEffect(() => subscribeTxHistory(() => force((n) => n + 1)), []);
  useEffect(() => subscribe(() => setSession(getSession())), []);

  const wallet = session?.info.coinPublicKey ?? null;
  const records: TxRecord[] = useMemo(() => readTxHistory(wallet), [wallet]);

  // The session's id comes from the wallet's own getConfiguration() and is the
  // authoritative one; the hook's copy can still be null right after connecting.
  const network = session?.info.config.networkId ?? networkId ?? null;
  const hasExplorer = explorerBase(network) !== null;

  if (!connected) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="mb-2 text-center text-2xl font-bold">Transaction history</h1>
        <p className="mb-6 text-center text-slate-400">
          Your history is stored per wallet, so connect the one you want to see.
        </p>
        <ConnectWallet title="Connect your wallet to see its history" />
      </div>
    );
  }

  return (
    <PageShell>
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader
        eyebrow="Verifiable record"
        title="Transaction history"
        subtitle={
          <>
            Every transaction this wallet has submitted. Each one is a public, verifiable record on
            the {NETWORK_LABEL_OVERRIDE ?? network ?? 'Midnight'} chain.
          </>
        }
        actions={
          records.length > 0 ? (
          <button
            onClick={() => {
              clearTxHistory(wallet);
              force((n) => n + 1);
            }}
            className="btn-ghost text-xs"
            title="Removes the local list only — the transactions stay on-chain forever"
          >
            Clear local list
            </button>
          ) : null
        }
      />

      {/*
        Only warn once we actually KNOW the network. Before the session resolves,
        `network` is null — and rendering this then produced the nonsense
        "No block explorer is known for , ..." with an empty name, which read as
        a fault rather than as "still loading".
      */}
      {network && !hasExplorer && records.length > 0 && (
        <p className="mt-4 rounded-lg border border-amber-400/25 bg-amber-400/10 p-3 text-sm text-amber-200">
          No block explorer is known for <strong>{NETWORK_LABEL_OVERRIDE ?? network}</strong>, so the
          verify links are hidden.
          The hashes below are still real — you can look them up through the indexer.
        </p>
      )}

      {records.length === 0 ? (
        <div className="glass mt-8 p-8 text-center">
          <p className="text-slate-300">No transactions yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Creating an election or casting a vote will record one here.
          </p>
          <Link to="/dashboard" className="btn-primary mt-5 inline-block">
            Browse elections
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {records.map((tx, i) => {
            const url = explorerTxUrl(tx.hash, tx.networkId ?? network);
            return (
              <Reveal
                key={tx.hash}
                index={Math.min(i, 8)}
                inView
                className="glass glass-hover p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-slate-100">{tx.action}</p>
                  <span className="text-xs text-slate-500">{formatDate(tx.at)}</span>
                </div>

                <p className="mt-2 break-all font-mono text-xs text-zinc-300">{tx.hash}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary px-3 py-1.5 text-xs"
                    >
                      Verify on explorer ↗
                    </a>
                  )}
                  <button
                    onClick={() => navigator.clipboard?.writeText(tx.hash)}
                    className="btn-ghost px-3 py-1.5 text-xs"
                  >
                    Copy hash
                  </button>
                  {tx.electionId && (
                    <Link
                      to={`/election/${tx.electionId}`}
                      className="btn-ghost px-3 py-1.5 text-xs"
                    >
                      View election #{tx.electionId}
                    </Link>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-500">
        History is stored in this browser, per wallet. Clearing it removes the list — never the
        transactions, which are permanent on-chain.
      </p>
    </div>
    </PageShell>
  );
}
