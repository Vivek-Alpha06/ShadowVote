import { useEffect, useState } from 'react';
import { getSession, subscribe, contractForNetwork } from '../lib/chainSession';
import { explorerContractUrl } from '../lib/explorer';
import { useWallet } from '../hooks/useWallet';
import { shortAddress } from '../lib/format';

export default function Footer() {
  const { networkId } = useWallet();
  const [session, setSession] = useState(getSession());

  useEffect(() => subscribe(() => setSession(getSession())), []);

  // Prefer the live session, else the address this build ships for whatever
  // network the wallet reports — so the contract is linkable before connecting.
  // Null when this build has no deployment for that network, in which case there
  // is simply nothing to link.
  const network = session?.info.config.networkId ?? networkId;
  const address = session?.contractAddress ?? contractForNetwork(network);
  const url = address ? explorerContractUrl(address, network) : null;

  return (
    <footer className="border-t border-white/5 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row">
        <p>
          <span className="font-semibold text-slate-300">ShadowVote</span> — Vote Privately. Verify
          Publicly.
        </p>

        {address &&
          (url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={address}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-slate-400 transition-colors hover:border-shadow-purple/50 hover:text-slate-200"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              contract {shortAddress(address, 10, 6)}
              <span className="font-sans font-semibold text-shadow-purple">verify ↗</span>
            </a>
          ) : (
            // No explorer for this network — show the address rather than a link
            // that would 404 and look like the contract does not exist.
            <span title={address} className="font-mono text-xs text-slate-500">
              contract {shortAddress(address, 10, 6)}
            </span>
          ))}

        <p className="flex items-center gap-2">
          Built on <span className="font-semibold text-shadow-purple">Midnight</span>
          <span className="text-slate-700">•</span> MIT License
        </p>
      </div>
    </footer>
  );
}
