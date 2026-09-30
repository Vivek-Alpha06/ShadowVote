import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CheckCircle2, Copy } from 'lucide-react';
import { getSession, subscribe, contractForNetwork } from '../lib/chainSession';
import { useWallet, NETWORK_LABELS } from '../hooks/useWallet';
import { shortAddress } from '../lib/format';
import { explorerContractUrl } from '../lib/explorer';
import { NETWORK_LABEL_OVERRIDE } from '../lib/networkPreference';
import Logo from './Logo';

export default function Footer() {
  const { networkId, selectedNetwork } = useWallet();
  const [session, setSession] = useState(getSession());
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <footer className="border-t border-[#cdd0e5] bg-white pt-16 pb-12 text-[#2e335b]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#cdd0e5]/60">
          {/* Brand & Newsletter Column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <Logo size={36} light={false} />
              <p className="mt-3 text-sm text-[#2e335b]/75 max-w-sm leading-relaxed">
                Zero-knowledge private voting on Midnight Network. Cryptographic confidentiality meets verifiable governance.
              </p>
            </div>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wider text-[#2e335b] mb-2.5">
                Join our newsletter &amp; updates
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-300 px-4 py-2.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Thank you! You will receive protocol updates.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="relative flex items-center max-w-md">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email..."
                    required
                    className="w-full rounded-full border border-[#cdd0e5] bg-[#f5f4fd] px-4 py-2.5 pr-28 text-xs text-[#2e335b] placeholder:text-[#2e335b]/40 outline-none focus:border-[#2e335b]"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 button sm accent text-xs !py-1.5 !px-4"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2e335b] mb-3.5">
                Elections
              </p>
              <ul className="space-y-2 text-xs font-medium text-[#2e335b]/75">
                <li><Link to="/dashboard" className="hover:text-[#2e335b] transition-colors">Browse Active</Link></li>
                <li><Link to="/create" className="hover:text-[#2e335b] transition-colors">Create Ballot</Link></li>
                <li><Link to="/results" className="hover:text-[#2e335b] transition-colors">Live Tallies</Link></li>
                <li><Link to="/history" className="hover:text-[#2e335b] transition-colors">Audit History</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2e335b] mb-3.5">
                Technology
              </p>
              <ul className="space-y-2 text-xs font-medium text-[#2e335b]/75">
                <li><a href="https://midnight.network" target="_blank" rel="noreferrer" className="hover:text-[#2e335b] transition-colors">Midnight Network ↗</a></li>
                <li><a href="https://docs.midnight.network" target="_blank" rel="noreferrer" className="hover:text-[#2e335b] transition-colors">Compact Circuits ↗</a></li>
                <li><a href="https://lace.io" target="_blank" rel="noreferrer" className="hover:text-[#2e335b] transition-colors">Lace Wallet ↗</a></li>
                <li><a href="https://preview.midnight.network" target="_blank" rel="noreferrer" className="hover:text-[#2e335b] transition-colors">Preview Testnet ↗</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2e335b] mb-3.5">
                Community
              </p>
              <ul className="space-y-2 text-xs font-medium text-[#2e335b]/75">
                <li><a href="https://x.com/shadow_vote" target="_blank" rel="noreferrer" className="hover:text-[#2e335b] transition-colors">Twitter (X) ↗</a></li>
                <li><a href="https://github.com/Vivek-Alpha06/ShadowVote" target="_blank" rel="noreferrer" className="hover:text-[#2e335b] transition-colors">GitHub Repository ↗</a></li>
                <li><a href="https://docs.google.com/spreadsheets/d/1k31OPLH2cy2uLp98bsT5O9cwMuJIuXPlykFiAioGaZw/edit?gid=1376911252#gid=1376911252" target="_blank" rel="noreferrer" className="hover:text-[#2e335b] transition-colors">Feedback Sheet ↗</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar with Contract and Copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#2e335b]/70">
          <div className="flex items-center gap-2">
            {address && (
              <button
                onClick={copyAddress}
                title={`Contract: ${address}`}
                className="flex items-center gap-2 rounded-full border border-[#cdd0e5] bg-[#f5f4fd] px-3.5 py-1.5 font-mono text-xs font-semibold text-[#2e335b] transition-all hover:bg-[#dfe7f9]"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>CA: {shortAddress(address, 8, 6)}</span>
                <span className="text-[11px] text-[#2e335b]/60 flex items-center gap-1">
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#2e335b]/70" />
                  )}
                </span>
              </button>
            )}
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[#cdd0e5] bg-[#f5f4fd] px-3 py-1.5 text-xs font-semibold text-[#2e335b] transition-all hover:bg-[#dfe7f9]"
              >
                Explorer ↗
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#2e335b]">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Midnight {networkName}
            </span>
            <span>•</span>
            <span>MIT License</span>
            <span>•</span>
            <span>© 2026 ShadowVote</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
