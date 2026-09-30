import { useEffect, useState } from 'react';
import { getSession, subscribe, contractForNetwork } from '../lib/chainSession';
import { useWallet, NETWORK_LABELS } from '../hooks/useWallet';
import { shortAddress } from '../lib/format';
import { explorerContractUrl } from '../lib/explorer';
import { NETWORK_LABEL_OVERRIDE } from '../lib/networkPreference';

export default function Footer() {
  const { networkId, selectedNetwork } = useWallet();
  const [session, setSession] = useState(getSession());
  const [copied, setCopied] = useState(false);

  useEffect(() => subscribe(() => setSession(getSession())), []);

  const network = session?.info.config.networkId ?? networkId ?? selectedNetwork ?? 'preview';
  const address = session?.contractAddress ?? contractForNetwork(network);
  const explorerUrl = address ? explorerContractUrl(address, network) : null;

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const networkName = NETWORK_LABEL_OVERRIDE ?? NETWORK_LABELS[network] ?? network;

  return (
    <footer className="border-t border-white/[0.08] bg-[#060608] py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-zinc-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">ShadowVote</span>
          <span className="text-zinc-600">—</span>
          <span>Vote Privately. Verify Publicly.</span>
        </div>

        {address && (
          <div className="flex items-center gap-2">
            <button
              onClick={copyAddress}
              title={`Click to copy contract address: ${address}`}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0c0d12] px-3 py-1.5 font-mono text-zinc-400 transition-all hover:border-violet-500/40 hover:text-white hover:bg-violet-950/20"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CA: {shortAddress(address, 8, 6)}</span>
              <span className="text-[10px] text-zinc-500">{copied ? '✓ Copied' : '📋'}</span>
            </button>

            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/[0.08] bg-[#0c0d12] px-2.5 py-1.5 text-zinc-400 transition-all hover:border-violet-500/40 hover:text-violet-300"
                title="View contract on Midnight Explorer"
              >
                Explorer ↗
              </a>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <a
            href="https://x.com/shadow_vote"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            @shadow_vote
          </a>
          <span className="text-zinc-800">•</span>
          <span className="inline-flex items-center gap-1.5 text-violet-400">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            Midnight {networkName}
          </span>
          <span className="text-zinc-800">•</span>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  );
}
