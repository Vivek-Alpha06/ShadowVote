import { useWallet, NETWORK_LABELS } from '../hooks/useWallet';
import { contractForNetwork } from '../lib/chainSession';
import { NETWORK_BLURBS, SHOW_NETWORK_SWITCH } from '../lib/networkPreference';

/**
 * Pick which Midnight network to use.
 *
 * ShadowVote is deployed on more than one testnet, and an election lives on
 * exactly one of them — a contract address means nothing on any other chain. So
 * the network is not a detail to be inferred: it decides which elections the
 * visitor can even see, which is why it is offered up front rather than buried
 * in a settings screen.
 *
 * Switching while connected reloads the page. That is deliberate, not laziness:
 * see switchNetwork() in useWallet for why asking a live wallet connector for a
 * second network is worse than a reload.
 */
export default function NetworkSwitch({ compact = false }: { compact?: boolean }) {
  const { selectedNetwork, selectableNetworks, switchNetwork, networkId, connected } = useWallet();

  // Gated here as well as at each call site, so the control cannot reappear
  // through a render path someone adds later while it is meant to be hidden.
  if (!SHOW_NETWORK_SWITCH) return null;

  // The wallet is on a different chain than the one chosen here. Real and worth
  // saying: the app follows the WALLET, so this is why the elections on screen
  // may not be the ones the switcher implies.
  const mismatch = connected && networkId && networkId !== selectedNetwork ? networkId : null;

  if (compact) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 p-0.5">
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
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                active ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {active && <span className="h-1.5 w-1.5 rounded-full bg-black/60" />}
              {NETWORK_LABELS[n] ?? n}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        Network
      </p>

      <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 p-1.5 backdrop-blur-xl">
        {selectableNetworks.map((n) => {
          const active = n === selectedNetwork;
          const deployed = Boolean(contractForNetwork(n));
          return (
            <button
              key={n}
              onClick={() => switchNetwork(n)}
              aria-pressed={active}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                active
                  ? 'bg-white text-black shadow-lg'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {NETWORK_LABELS[n] ?? n}
                {/* An undeployed network stays pickable, but says so. Hiding it
                    would leave a visitor whose wallet is on it with no way to
                    understand why the app looks empty. */}
                {!deployed && (
                  <span
                    title="No ShadowVote contract is deployed here yet"
                    className={`text-[10px] font-medium ${active ? 'text-zinc-600' : 'text-zinc-600'}`}
                  >
                    (soon)
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-center text-xs leading-relaxed text-zinc-500">
        {NETWORK_BLURBS[selectedNetwork] ?? `Using the ${selectedNetwork} network.`}
      </p>

      {mismatch && (
        <p className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-center text-xs leading-relaxed text-amber-200/90">
          Your wallet reports it is on <strong>{NETWORK_LABELS[mismatch] ?? mismatch}</strong>. The
          app follows the wallet, so switch the Midnight network inside your wallet to match — or
          pick {NETWORK_LABELS[mismatch] ?? mismatch} here.
        </p>
      )}
    </div>
  );
}
