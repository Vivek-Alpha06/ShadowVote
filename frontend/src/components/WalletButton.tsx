import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  Loader2,
  RefreshCw,
  Coins,
} from 'lucide-react';
import { useWallet, NETWORK_LABELS } from '../hooks/useWallet';
import { shortAddress } from '../lib/format';
import { faucetUrl } from '../lib/faucet';
import { explorerBase } from '../lib/explorer';
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
    networkId,
    selectedNetwork,
  } = useWallet();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDropdownOpen(false);
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleCopyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const networkName =
    NETWORK_LABELS[networkId ?? selectedNetwork ?? 'preview'] ??
    networkId ??
    'Preview Testnet';
  const explorerUrl = explorerBase(networkId ?? selectedNetwork ?? 'preview');

  // Connected state: Sleek unified glass capsule with dropdown
  if (connected && address) {
    return (
      <div className="relative flex items-center gap-2" ref={dropdownRef}>
        <DustBalance glass={true} />

        {/* Account Capsule Trigger Pill */}
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold text-white transition-all backdrop-blur-md shadow-xs ${
            dropdownOpen
              ? 'bg-white/20 border-white/40 shadow-md ring-2 ring-white/20'
              : 'bg-white/10 hover:bg-white/15 border-white/20'
          }`}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          {/* Mini Gradient Avatar */}
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 text-white shadow-xs">
            <Wallet className="h-2.5 w-2.5" />
          </div>

          <span className="font-mono text-xs font-semibold text-white/95">
            {shortAddress(address, 6, 4)}
          </span>

          <ChevronDown
            className={`h-3.5 w-3.5 text-white/70 transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Floating Glassmorphic Account Popover */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-full mt-2.5 w-72 rounded-2xl border border-white/20 bg-[#141833]/95 p-4 text-white shadow-2xl backdrop-blur-2xl z-50"
            >
              {/* Account Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 text-white shadow-md">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Connected Account</p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {networkName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Address Chip with Copy Button */}
              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">
                  Wallet Address
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-white/90 truncate" title={address}>
                    {shortAddress(address, 10, 8)}
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Copy full address"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-white/70" />
                    )}
                  </button>
                </div>
              </div>

              {/* Menu Links & Actions */}
              <div className="mt-3 space-y-1">
                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Midnight Explorer</span>
                    </span>
                    <span className="text-[10px] text-white/40">↗</span>
                  </a>
                )}

                <a
                  href={faucetUrl(networkId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Coins className="h-3.5 w-3.5 text-amber-400" />
                    <span>Get Test DUST (Faucet)</span>
                  </span>
                  <span className="text-[10px] text-white/40">↗</span>
                </a>

                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      disconnect();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5 text-rose-400" />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Connecting state: Sleek glass loading capsule
  if (connecting) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1.5 text-xs text-white shadow-xs">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400 shrink-0" />
        <span className="hidden sm:inline font-medium text-white/90 text-xs truncate max-w-[130px]">
          {step ?? 'Connecting Lace…'}
        </span>
        <button
          onClick={() => reloadAndConnect()}
          className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-white/25 transition-colors inline-flex items-center gap-1"
          title="Reload connector"
        >
          <RefreshCw className="h-2.5 w-2.5" />
          <span>Retry</span>
        </button>
        <button
          onClick={cancel}
          className="text-[11px] text-white/60 hover:text-white transition-colors ml-0.5"
          title="Cancel attempt"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Disconnected state: High-contrast sleek CTA button
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => connect()}
      className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-white/95 px-4 py-2 text-xs font-bold text-[#202952] shadow-md transition-all border border-white/40"
      title={error?.message ?? 'Connect a Midnight wallet'}
    >
      <Wallet className="h-3.5 w-3.5 text-indigo-700" />
      <span>Connect Wallet</span>
    </motion.button>
  );
}
