import { useEffect, useState } from 'react';
import { getSession, subscribe, contractForNetwork } from '../lib/chainSession';
import { useWallet, NETWORK_LABELS } from '../hooks/useWallet';
import { shortAddress } from '../lib/format';
import { NETWORK_LABEL_OVERRIDE } from '../lib/networkPreference';

export default function Footer() {
  const { networkId, selectedNetwork } = useWallet();
  const [session, setSession] = useState(getSession());

  useEffect(() => subscribe(() => setSession(getSession())), []);

  // Prefer the live session, else the address this build ships for whatever
  // network the wallet reports — so the contract is linkable before connecting.
  // Null when this build has no deployment for that network, in which case there
  // is simply nothing to link.
  const network = session?.info.config.networkId ?? networkId;
  const address = session?.contractAddress ?? contractForNetwork(network);

  return (
    <footer className="border-t border-zinc-900 bg-black py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-zinc-500 sm:flex-row">
        <p>
          <span className="font-semibold text-white">ShadowVote</span> — Vote Privately. Verify Publicly.
        </p>

        {address && (
          <span title={address} className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1 font-mono text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            contract {shortAddress(address, 10, 6)}
          </span>
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
          <span>Midnight {NETWORK_LABEL_OVERRIDE ?? NETWORK_LABELS[network ?? selectedNetwork] ?? selectedNetwork}</span>
          <span className="text-zinc-800">•</span>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  );
}
