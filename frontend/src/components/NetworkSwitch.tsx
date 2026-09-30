import { useWallet, NETWORK_LABELS } from '../hooks/useWallet';
import { contractForNetwork } from '../lib/chainSession';
import { NETWORK_BLURBS, SHOW_NETWORK_SWITCH } from '../lib/networkPreference';

export default function NetworkSwitch({ compact = false }: { compact?: boolean }) {
  const { selectedNetwork, selectableNetworks, switchNetwork, networkId, connected } = useWallet();

  if (!SHOW_NETWORK_SWITCH) return null;

  const mismatch = connected && networkId && networkId !== selectedNetwork ? networkId : null;

  if (compact) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-[#cdd0e5] bg-[#dfe7f9] p-0.5 shadow-sm">
        {selectableNetworks.map((n) => {
          const active = n === selectedNetwork;
          return (
            <button
              key={n}
              onClick={() => switchNetwork(n)}
              title={
                contractForNetwork(n)
                  ? `Use ${NETWORK_LABELS[n] ?? n}`
                  : `${NETWORK_LABELS[n] ?? n} — no contract deployed yet`
              }
              className={`flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-bold transition-all ${
                active ? 'bg-white text-[#2e335b] shadow-sm' : 'text-[#2e335b]/70 hover:text-[#2e335b]'
              }`}
            >
              {active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
              {NETWORK_LABELS[n] ?? n}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-[#2e335b]">
        Network
      </p>

      <div className="flex items-center gap-1.5 rounded-full border border-[#cdd0e5] bg-[#dfe7f9] p-1 shadow-sm">
        {selectableNetworks.map((n) => {
          const active = n === selectedNetwork;
          const deployed = Boolean(contractForNetwork(n));
          return (
            <button
              key={n}
              onClick={() => switchNetwork(n)}
              aria-pressed={active}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                active
                  ? 'bg-white text-[#2e335b] shadow-sm'
                  : 'text-[#2e335b]/70 hover:text-[#2e335b]'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {NETWORK_LABELS[n] ?? n}
                {!deployed && (
                  <span
                    title="No ShadowVote contract is deployed here yet"
                    className="text-[10px] font-medium text-[#2e335b]/50"
                  >
                    (soon)
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-center text-xs leading-relaxed text-[#2e335b]/70">
        {NETWORK_BLURBS[selectedNetwork] ?? `Using the ${selectedNetwork} network.`}
      </p>

      {mismatch && (
        <p className="mt-2 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-center text-xs leading-relaxed text-amber-900">
          Your wallet reports it is on <strong>{NETWORK_LABELS[mismatch] ?? mismatch}</strong>. The
          app follows the wallet, so switch the Midnight network inside your wallet to match — or
          pick {NETWORK_LABELS[mismatch] ?? mismatch} here.
        </p>
      )}
    </div>
  );
}
