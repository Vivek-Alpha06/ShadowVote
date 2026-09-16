import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { faucetUrl } from '../lib/faucet';

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

const POLL_MS = 20_000;

function format(dust: bigint): string {
  return dust.toLocaleString();
}

export default function DustBalance() {
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
        className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200 transition-colors hover:bg-amber-500/20"
        title="You have no DUST, so transactions cannot be paid for. Get test tokens and register them for DUST generation."
      >
        <span aria-hidden>⚠️</span>
        <span>No DUST — get tokens ↗</span>
      </a>
    );
  }

  return (
    <span
      className="hidden items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-300 sm:flex"
      title={`${format(dust)} DUST available to pay transaction fees`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      {format(dust)} DUST
    </span>
  );
}
