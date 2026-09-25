import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { shortAddress } from '../lib/format';
import DustBalance from './DustBalance';

export default function WalletButton() {
  const {
    address,
    connected,
    connecting,
    step,
    error,
    connect,
    reloadAndConnect,
    cancel,
    disconnect,
  } = useWallet();

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        {/* Balance first: testers asked to see their gas before starting a
            vote, not after the transaction failed. */}
        <DustBalance />
        <div className="glass flex items-center gap-2 px-3 py-1.5 text-sm" title={address}>
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />
          <span className="font-mono text-slate-200">{shortAddress(address)}</span>
        </div>
        <button onClick={disconnect} className="btn-ghost px-3 py-1.5 text-sm" title="Disconnect">
          Disconnect
        </button>
      </div>
    );
  }

  // While connecting, offer a way out — an attempt must never be a dead end.
  if (connecting) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-[14rem] truncate text-xs text-slate-400 sm:inline" title={step ?? ''}>
          {step ?? 'Waiting for wallet…'}
        </span>
        <button
          onClick={() => reloadAndConnect()}
          className="btn-primary px-3 py-1.5 text-sm"
          title="Reload the page and connect with a fresh wallet channel"
        >
          Reload &amp; retry
        </button>
        <button onClick={cancel} className="btn-ghost px-3 py-1.5 text-sm">
          Cancel
        </button>
      </div>
    );
  }

  // Always offer the action. If no connector responds, clicking reports why
  // rather than the button quietly disappearing.
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => connect()}
      className="btn-primary text-sm"
      title={error?.message ?? 'Connect a Midnight wallet'}
    >
      Connect Wallet
    </motion.button>
  );
}
