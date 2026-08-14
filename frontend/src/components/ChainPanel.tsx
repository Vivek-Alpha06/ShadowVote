import { useCallback, useEffect, useState } from 'react';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { useWallet } from '../hooks/useWallet';
import {
  openSession,
  getSession,
  subscribe,
  savedContractAddress,
  contractForNetwork,
  supportedNetworks,
  type ChainSession,
} from '../lib/chainSession';
import { shortAddress } from '../lib/format';
import { getLog, subscribeLog, resetLog, formatLog, logError } from '../lib/activityLog';

/**
 * The wallet handle we last auto-joined for.
 *
 * Module-level, NOT a ref: React StrictMode remounts this component in dev, and
 * a ref would be recreated by that remount — firing a second auto-join that
 * races the first. Module scope survives the remount.
 *
 * Keyed on the wallet handle rather than a plain boolean so that CONNECTING A
 * DIFFERENT ACCOUNT re-joins. A bare flag meant the second account never
 * attached to the contract at all, and since every read needs a session, the
 * app showed that account an empty list — while the elections sat in plain
 * sight on the public ledger.
 */
let autoJoinedFor: unknown = null;

/**
 * Join the on-chain ShadowVote contract, or deploy a new one.
 *
 * Joining is free and happens automatically. Deploying submits a real
 * transaction and costs a fee, so it stays an explicit user action.
 */
export default function ChainPanel() {
  const { api, connected, networkId } = useWallet();
  const [session, setSession] = useState<ChainSession | null>(getSession());
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joinAddress, setJoinAddress] = useState('');

  useEffect(() => subscribe(() => setSession(getSession())), []);

  const saved = savedContractAddress();
  const shipped = contractForNetwork(networkId);
  /**
   * Is there anything to join on this network? An address is only valid on the
   * chain it was deployed to, so "no contract here" is a real state — not an
   * error. Unknown network (null) counts as matching so the panel does not flash
   * a warning while the wallet is still reporting.
   */
  const networkMatches = !networkId || shipped !== null;

  const open = useCallback(
    async (opts: { contractAddress?: string; forceDeploy?: boolean }) => {
      if (!api) return;
      setBusy(true);
      setError(null);
      resetLog(); // each attempt gets a clean log
      try {
        await openSession({
          api: api as ConnectedAPI,
          ...opts,
          onStep: setStep,
        });
      } catch (err) {
        logError('openSession failed', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setBusy(false);
        setStep(null);
      }
    },
    [api],
  );

  /**
   * Join the contract automatically once the wallet is connected.
   *
   * Joining is NOT an on-chain action — `findDeployedContract` submits no
   * transaction and costs no fee; it only binds the local circuits and private
   * state to an existing address. So there is nothing for a user to consent to,
   * and making them click a button first is pure friction.
   *
   * Deploying is the opposite (a real, paid transaction) and stays manual:
   * `open({})` resolves to saved-or-shipped and can never deploy, because only
   * `forceDeploy` takes that branch.
   *
   * The ref makes this fire at most once per mount — a retry loop here would
   * hammer the wallet, and a second attempt racing the first is exactly what
   * wedges Lace's message channel.
   */
  useEffect(() => {
    if (!connected || !api || session || busy) return;
    if (autoJoinedFor === api || !networkMatches) return;
    autoJoinedFor = api;
    void open({});
  }, [connected, api, session, busy, networkMatches, open]);

  if (!connected) return null;

  // Connected and joined: render nothing.
  //
  // Now that joining is automatic and free, this panel used to show a contract
  // address, a copy button and a "use another" control — plumbing that a voter
  // never needs and that pushed the actual elections down the page. The address
  // is still reachable, as an explorer link in the footer.
  if (session) return null;

  // --- not yet on a contract -----------------------------------------------
  return (
    <div className="glass mb-6 p-4 text-sm">
      {busy ? (
        <>
          <div className="flex items-center gap-3">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-shadow-purple border-t-transparent" />
            <div>
              <p className="font-semibold text-slate-200">{step ?? 'Working…'}</p>
              <p className="text-xs text-slate-500">
                Approve the transaction in your wallet. Proving can take a minute.
              </p>
            </div>
          </div>
          <ActivityLog />
        </>
      ) : (
        <>
          <p className="font-semibold text-amber-200">⛓ Not connected to a contract yet</p>
          {networkMatches ? (
            <p className="mt-1 text-slate-400">
              Join the deployed ShadowVote contract on <strong>{networkId ?? 'this network'}</strong>
              , or deploy your own. Deploying submits a real transaction and costs a fee.
            </p>
          ) : (
            <p className="mt-1 text-amber-300/90">
              Your wallet is on <strong>{networkId}</strong>, where this build has no deployed
              contract. It ships one for <strong>{supportedNetworks().join(', ')}</strong> — switch
              networks to join it, or deploy your own on {networkId}.
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {saved ? (
              <button onClick={() => open({ contractAddress: saved })} className="btn-primary">
                Rejoin {shortAddress(saved, 10, 6)}
              </button>
            ) : (
              shipped && (
                <button onClick={() => open({ contractAddress: shipped })} className="btn-primary">
                  Join {shortAddress(shipped, 10, 6)}
                </button>
              )
            )}
            <button onClick={() => open({ forceDeploy: true })} className="btn-ghost">
              Deploy a new contract
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (joinAddress.trim()) open({ contractAddress: joinAddress.trim() });
            }}
            className="mt-3 flex gap-2"
          >
            <input
              className="input py-1.5 text-xs"
              placeholder="or paste an existing contract address…"
              value={joinAddress}
              onChange={(e) => setJoinAddress(e.target.value)}
            />
            <button type="submit" disabled={!joinAddress.trim()} className="btn-ghost px-3 text-xs">
              Join
            </button>
          </form>
        </>
      )}

      {error && (
        <>
          <p className="mt-3 whitespace-pre-line break-words border-t border-white/5 pt-3 text-xs text-rose-300">
            {error}
          </p>
          <ActivityLog />
        </>
      )}
    </div>
  );
}

/**
 * Live, copyable record of the current operation. Shown during work and after
 * a failure — the last line is where it actually stopped.
 */
function ActivityLog() {
  const [, force] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => subscribeLog(() => force((n) => n + 1)), []);

  const entries = getLog();
  if (entries.length === 0) return null;

  return (
    <div className="mt-3 border-t border-white/5 pt-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Activity log
        </span>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(formatLog());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="text-xs font-semibold text-shadow-purple hover:underline"
        >
          {copied ? '✓ Copied' : 'Copy log'}
        </button>
      </div>
      <div className="max-h-56 overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-2 font-mono text-[10px] leading-relaxed">
        {entries.map((e, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap break-words ${
              e.level === 'error' ? 'text-rose-300' : 'text-slate-400'
            }`}
          >
            <span className="text-slate-600">[{(e.elapsed / 1000).toFixed(1)}s]</span> {e.message}
          </div>
        ))}
      </div>
    </div>
  );
}
