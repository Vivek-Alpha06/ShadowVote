import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet, WALLET_INSTALL_URL, NETWORK_LABELS } from '../hooks/useWallet';
import { runDiagnostic } from '../lib/midnightConnector';

/**
 * Inline connect panel. The Connect button is ALWAYS offered, an in-flight
 * attempt always shows which step it is on and can always be cancelled, and
 * failures report what the page actually saw rather than guessing at a cause.
 */
export default function ConnectWallet({ title }: { title?: string }) {
  const {
    connect,
    reloadAndConnect,
    cancel,
    connecting,
    step,
    available,
    detecting,
    walletName,
    diagnostics,
    error,
    clearError,
  } = useWallet();

  const wallets = diagnostics.wallets;

  if (connecting) {
    return (
      <div className="glass flex flex-col items-center gap-3 p-8 text-center">
        <span className="text-4xl">⏳</span>
        <p className="font-semibold text-slate-100">
          Waiting for your wallet… <Elapsed />
        </p>
        <p className="max-w-sm text-sm text-slate-400">
          {step ?? 'Opening wallet…'}
          <br />
          <span className="text-slate-500">
            Check the extension popup — it may be behind this window, or need you to click the Lace
            icon in your toolbar.
          </span>
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          <button onClick={() => reloadAndConnect()} className="btn-primary">
            Reload &amp; retry
          </button>
          <button onClick={cancel} className="btn-ghost">
            Cancel
          </button>
        </div>
        <p className="max-w-sm text-xs text-slate-500">
          Stuck for more than ~10s usually means the wallet's background worker went to sleep.
          Reloading re-injects a live connector.
        </p>
      </div>
    );
  }

  return (
    <div className="glass flex flex-col items-center gap-3 p-8 text-center">
      <span className="text-4xl">🔑</span>
      <p className="font-semibold text-slate-100">{title ?? 'Connect your wallet'}</p>
      <p className="max-w-sm text-sm text-slate-400">
        {available
          ? 'Approve the connection in your wallet. Your address identifies you to the contract only as an anonymous nullifier.'
          : detecting
            ? 'Looking for a Midnight wallet in this browser…'
            : 'Click connect — if no Midnight wallet responds, you’ll get the exact reason.'}
      </p>

      {wallets.length > 1 ? (
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          {wallets.map((w) => (
            <button key={w.key} onClick={() => connect(w)} className="btn-primary flex items-center gap-2">
              {w.icon && <img src={w.icon} alt="" className="h-4 w-4 rounded" />}
              Connect {w.name}
            </button>
          ))}
        </div>
      ) : (
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => connect()} className="btn-primary mt-1">
          Connect {wallets[0]?.name ?? walletName ?? 'Wallet'}
        </motion.button>
      )}

      {error && (
        <div className="mt-1 max-w-md rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-200">
          <p className="whitespace-pre-line text-left">{error.message}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {(error.code === 'CHANNEL_DEAD' || error.code === 'TIMEOUT') && (
              <button
                onClick={() => reloadAndConnect()}
                className="rounded-lg bg-rose-400/20 px-3 py-1.5 font-semibold text-rose-100 hover:bg-rose-400/30"
              >
                Reload &amp; connect
              </button>
            )}
            {error.code === 'NOT_INSTALLED' && (
              <a
                href={WALLET_INSTALL_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="font-semibold underline hover:text-rose-100"
              >
                Wallet setup guide ↗
              </a>
            )}
            <button onClick={clearError} className="underline hover:text-rose-100">
              dismiss
            </button>
          </div>
        </div>
      )}

      {available && <NetworkOverride />}
      <WalletDiagnosticsPanel />
    </div>
  );
}

/**
 * Explicit network choice. A Midnight network id is the bech32m HRP segment
 * of that network's addresses, so testnet is `test`, not `testnet`.
 * Choosing one here connects on that network ONLY — no fallback wandering.
 */
function NetworkOverride() {
  const { reloadAndConnect, networkOptions } = useWallet();
  const [custom, setCustom] = useState('');

  // These go through reload-and-connect: picking a network is exactly when the
  // page has usually been open a while, which is when the wallet's background
  // worker has most likely gone to sleep and taken the channel with it.
  return (
    <div className="mt-3 w-full max-w-md rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Connect on a specific network
      </p>
      <p className="mb-2 text-[11px] text-slate-500">
        Reloads first, then connects with a fresh wallet channel — the reliable path.
      </p>

      <div className="flex flex-wrap gap-2">
        {networkOptions.map((n) => (
          <button
            key={n}
            onClick={() => reloadAndConnect(n)}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 hover:border-shadow-purple/40 hover:text-white"
            title={`reload, then connect("${n}")`}
          >
            {NETWORK_LABELS[n] ?? n}{' '}
            <span className="font-mono text-[10px] text-slate-500">{n}</span>
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim()) reloadAndConnect(custom.trim());
        }}
        className="mt-2 flex gap-2"
      >
        <input
          className="input py-1.5 text-xs"
          placeholder="or a custom network id…"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button type="submit" disabled={!custom.trim()} className="btn-ghost px-3 text-xs">
          Connect
        </button>
      </form>
    </div>
  );
}

/** Seconds elapsed in the current attempt, so a stall is visible. */
function Elapsed() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-sm text-slate-500">{seconds}s</span>;
}

/** Runs a full connect probe and shows copyable output. */
function FullDiagnostic() {
  const { networkOptions } = useWallet();
  const [report, setReport] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const network = networkOptions[0] ?? 'testnet';

  async function run() {
    setRunning(true);
    setReport('Running… approve the wallet popup if it appears.');
    try {
      setReport(await runDiagnostic(network));
    } catch (err) {
      setReport(`Diagnostic crashed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mt-3 border-t border-white/10 pt-3 font-sans">
      <button
        onClick={run}
        disabled={running}
        className="text-xs font-semibold text-shadow-purple hover:underline disabled:opacity-50"
      >
        {running ? 'Running diagnostic…' : `▶ Run full diagnostic (${network})`}
      </button>

      {report && (
        <>
          <textarea
            readOnly
            value={report}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-2 h-48 w-full resize-y rounded-lg border border-white/10 bg-black/40 p-2 font-mono text-[10px] leading-relaxed text-slate-300"
          />
          <button
            onClick={() => {
              navigator.clipboard?.writeText(report);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="mt-1 text-xs font-semibold text-shadow-purple hover:underline"
          >
            {copied ? '✓ Copied' : 'Copy report'}
          </button>
        </>
      )}
    </div>
  );
}

/** Reports which wallet providers this page can actually see. Facts only. */
export function WalletDiagnosticsPanel() {
  const { diagnostics, rescan, detecting, available } = useWallet();
  const [open, setOpen] = useState(false);

  const { midnightKeys, cardanoKeys, wallets } = diagnostics;
  const injectedButUnusable = midnightKeys.length > 0 && wallets.length === 0;

  return (
    <div className="mt-2 w-full max-w-md text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-semibold text-slate-400 underline hover:text-slate-200"
      >
        {open ? 'Hide details' : 'Trouble connecting? Show what this page sees'}
      </button>

      {open && (
        <div className="mt-2 space-y-2 rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-[11px] text-slate-400">
          <p>
            <span className="text-slate-500">window.midnight:</span>{' '}
            {midnightKeys.length ? (
              <span className="text-emerald-300">{midnightKeys.join(', ')}</span>
            ) : (
              <span className="text-rose-300">not present</span>
            )}
          </p>
          <p>
            <span className="text-slate-500">usable connectors:</span>{' '}
            {wallets.length ? (
              <span className="text-emerald-300">
                {wallets
                  .map((w) => `${w.name} (${w.generation}${w.apiVersion ? ` v${w.apiVersion}` : ''})`)
                  .join(', ')}
              </span>
            ) : (
              <span className="text-rose-300">none</span>
            )}
          </p>
          <p>
            <span className="text-slate-500">window.cardano:</span>{' '}
            {cardanoKeys.length ? (
              <span className="text-slate-300">{cardanoKeys.join(', ')}</span>
            ) : (
              <span className="text-slate-500">not present</span>
            )}
          </p>

          {injectedButUnusable && (
            <p className="border-t border-white/10 pt-2 font-sans text-amber-200">
              A Midnight object is injected but exposes neither <code>connect()</code> nor{' '}
              <code>enable()</code>. That usually means a connector version this app doesn't handle
              yet — please report the keys above.
            </p>
          )}

          {midnightKeys.length === 0 && (
            <p className="border-t border-white/10 pt-2 font-sans text-slate-400">
              Nothing was injected. Check that your wallet extension is <strong>unlocked</strong>,
              that it has site access to <code>localhost</code>, and that a Midnight account exists
              in it. Then scan again.
            </p>
          )}

          {available && (
            <p className="border-t border-white/10 pt-2 font-sans text-slate-400">
              If approval succeeds but nothing happens, the wallet is likely on a different network.
              Use <strong>“Connect on a specific network”</strong> above to force one.
            </p>
          )}

          <div className="border-t border-white/10 pt-2 font-sans">
            <button
              onClick={rescan}
              disabled={detecting}
              className="text-xs font-semibold text-shadow-purple hover:underline disabled:opacity-50"
            >
              {detecting ? 'Scanning…' : 'Scan again'}
            </button>
            <span className="mx-2 text-slate-600">·</span>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-semibold text-shadow-purple hover:underline"
            >
              Reload page
            </button>
          </div>

          <FullDiagnostic />
        </div>
      )}
    </div>
  );
}
