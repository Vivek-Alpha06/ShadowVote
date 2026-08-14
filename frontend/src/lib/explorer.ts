// ===========================================================================
// Block explorer links
// ---------------------------------------------------------------------------
// Lets anyone independently verify a transaction we claim happened, without
// trusting this app's UI.
//
// The route was checked against the live preview explorer rather than guessed:
// `/transactions/<hash>` returns 200 and the page contains the hash, while
// `/tx/<hash>`, `/transaction/<hash>` and nonsense paths all return 404. It is
// a Next.js app that genuinely 404s unknown routes, so a 200 is meaningful.
// ===========================================================================

/** Explorer hosts, keyed by the wallet's network id. */
const EXPLORER_HOSTS: Record<string, string> = {
  // Both verified live, and both 404 on unknown routes — so a 200 on
  // /transactions/<id> and /contracts/<addr> is meaningful, not a catch-all.
  preview: 'https://explorer.preview.midnight.network',
  preprod: 'https://explorer.preprod.midnight.network',
};

/**
 * Explorer base URL for a network, or null when we have none.
 *
 * Deliberately a lookup rather than a template like
 * `explorer.${networkId}.midnight.network`: only preview has been confirmed to
 * exist, and a fabricated link that 404s is worse than no link at all — it
 * looks like the transaction is missing from the chain.
 */
export function explorerBase(networkId: string | null | undefined): string | null {
  if (!networkId) return null;
  return EXPLORER_HOSTS[networkId] ?? null;
}

/** Public URL for a transaction hash, or null if this network has no explorer. */
export function explorerTxUrl(hash: string, networkId: string | null | undefined): string | null {
  const base = explorerBase(networkId);
  if (!base || !hash) return null;
  return `${base}/transactions/${hash}`;
}

/** Public URL for a contract address, used to link the deployed contract. */
export function explorerContractUrl(
  address: string,
  networkId: string | null | undefined,
): string | null {
  const base = explorerBase(networkId);
  if (!base || !address) return null;
  return `${base}/contracts/${address}`;
}
