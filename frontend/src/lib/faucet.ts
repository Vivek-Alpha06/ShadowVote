// ===========================================================================
// Faucet links
// ---------------------------------------------------------------------------
// User feedback, repeatedly:
//
//   "Had zero tDUST in my wallet on first try and got a cryptic RPC error code
//    instead of a friendly message saying I need gas tokens from the faucet."
//   "Add a direct link to the Midnight tDUST faucet inside the wallet connect
//    modal to help first-time users get testnet gas faster."
//
// Getting tokens is the single biggest onboarding cliff, and until now the app
// named the problem without offering the fix.
//
// Same rule as explorer.ts: a LOOKUP, never a template like
// `faucet.${networkId}.midnight.network`. A fabricated link that 404s is worse
// than no link, because it reads as "the faucet is down" rather than "we do
// not have a link for your network". Anything not confirmed falls back to the
// docs page, which is always correct even when it is one click slower.
// ===========================================================================

/** Always-valid fallback: the docs page that explains how to get tokens. */
export const FAUCET_DOCS_URL = 'https://docs.midnight.network/develop/tutorial/using/faucet';

/**
 * Faucet hosts keyed by the wallet's network id.
 *
 * Add an entry here only after loading it in a browser and confirming it
 * serves the faucet for that network. An unverified host belongs in neither
 * this map nor the UI.
 */
const FAUCET_HOSTS: Record<string, string> = {
  // Intentionally empty until each host is confirmed live. Every caller
  // already degrades to FAUCET_DOCS_URL, so an empty map is correct
  // behaviour, not a missing feature.
};

/** Best available faucet URL for a network — never null. */
export function faucetUrl(networkId: string | null | undefined): string {
  if (!networkId) return FAUCET_DOCS_URL;
  return FAUCET_HOSTS[networkId] ?? FAUCET_DOCS_URL;
}

/** True when we are sending the user to a network-specific faucet. */
export function hasDirectFaucet(networkId: string | null | undefined): boolean {
  return Boolean(networkId && FAUCET_HOSTS[networkId]);
}
