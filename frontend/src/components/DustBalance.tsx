import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { faucetUrl } from '../lib/faucet';
import { formatDust } from '../lib/format';

/**
 * Live DUST balance chip.
 *
 * User feedback:
 *
 *   "A small banner showing wallet DUST balance on top right would help users
 *    ensure they have enough gas before starting the voting process."
 *     -- Indrani Mitra, 4 stars
 *
 *   "Had zero tDUST in my wallet on first try and got a cryptic RPC error
 *    code instead of a friendly message."  -- Susmita Sain, 3 stars
 *
 * The app already refused to submit a write without DUST, but it only said so
 * *after* the voter had picked a candidate and committed to the flow. Showing
 * the balance up front turns a late failure into an early, fixable one, and
 * the zero case links straight to the faucet.
 */

import { AlertTriangle } from 'lucide-react';

const POLL_MS = 20_000;

export default function DustBalance({ glass = false }: { glass?: boolean }) {
  const { api, connected, networkId } = useWallet();
  const [dust, setDust] = useState<bigint | null>(null);

  useEffect(() => {
    if (!connected || !api) {
      setDust(null);
      return;
    }

    let cancelled = false;

    const read = async () => {
      try {
        const { readFunds } = await import('../lib/midnightProviders');
        const funds = await readFunds(api as never);
        if (!cancelled) setDust(funds.dust);
      } catch {
        // A balance we cannot read is not an error worth showing: the chip
        // simply stays hidden, and the write path still reports the real
        // problem if there is one.
        if (!cancelled) setDust(null);
      }
    };

    void read();
    const id = window.setInterval(read, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [api, connected]);

  if (dust === null) return null;

  const empty = dust === 0n;

  if (empty) {
    return (
      <a
        href={faucetUrl(networkId)}
        target="_blank"
        rel="noreferrer noopener"
        className={
          glass
            ? "flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/20 backdrop-blur-md px-3 py-1 text-xs font-semibold text-amber-200 transition-all hover:bg-amber-500/30 shadow-xs"
            : "flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 transition-all hover:bg-amber-100"
        }
        title="You have no DUST, so transactions cannot be paid for. Get test tokens and register them for DUST generation."
      >
        <AlertTriangle className={`w-3.5 h-3.5 ${glass ? 'text-amber-300' : 'text-amber-600'} shrink-0`} />
        <span>No DUST — faucet ↗</span>
      </a>
    );
  }

  return (
    <span
      className={
        glass
          ? "hidden items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-bold text-emerald-300 sm:flex shadow-xs"
          : "hidden items-center gap-1.5 rounded-full border border-[#cdd0e5] bg-[#dfe7f9] px-3 py-1 text-xs font-bold text-[#2e335b] sm:flex shadow-sm"
      }
      title={`${formatDust(dust)} DUST available to pay transaction fees (${dust.toLocaleString()} SPECK)`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
      {formatDust(dust)} DUST
    </span>
  );
}
