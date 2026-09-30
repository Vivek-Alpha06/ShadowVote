// ===========================================================================
// Network preference
// ---------------------------------------------------------------------------
// Which Midnight network the visitor has chosen to use. ShadowVote is deployed
// on more than one, and a contract address only means something on the chain it
// was deployed to, so "which network" has to be a first-class, remembered
// choice rather than whatever the wallet happened to be left on.
//
// This module owns nothing but the preference. The live session still takes its
// network from the wallet's own getConfiguration() — see chainSession — because
// the wallet is the only authority on what it is actually connected to. The
// preference decides which network we ASK for.
// ===========================================================================

import { contractForNetwork } from './chainSession';

const LS_PREFERRED = 'shadowvote:network:preferred';

/**
 * Is the network switcher shown in the UI?
 */
export const SHOW_NETWORK_SWITCH = true;

/**
 * Network name to display, overriding the one actually in use.
 * Set to null so the active network reported by the wallet/session is displayed.
 */
export const NETWORK_LABEL_OVERRIDE: string | null = null;

/**
 * Networks the switcher offers, best-supported first.
 */
export const SELECTABLE_NETWORKS = ['preview', 'preprod'] as const;

export type SelectableNetwork = (typeof SELECTABLE_NETWORKS)[number];

/** One line per network, shown under the switcher. */
export const NETWORK_BLURBS: Record<string, string> = {
  preview: 'The Midnight Preview network — the primary testnet with verified contracts and active elections.',
  preprod: 'The Midnight Preprod network.',
};

export function isSelectable(id: string | null | undefined): id is SelectableNetwork {
  return !!id && (SELECTABLE_NETWORKS as readonly string[]).includes(id);
}

/**
 * The network to use when the visitor has not chosen one.
 *
 * The first selectable network that this build actually ships a contract for.
 * That ordering matters: defaulting to a network with no deployment connects
 * the wallet successfully and then shows an empty app, which reads as "the
 * product is broken" rather than "nothing is deployed there yet".
 */
export function defaultNetwork(): SelectableNetwork {
  return SELECTABLE_NETWORKS.find((n) => contractForNetwork(n)) ?? SELECTABLE_NETWORKS[0];
}

/** The visitor's chosen network, or the default when they have not chosen. */
export function preferredNetwork(): SelectableNetwork {
  // With the switcher hidden there is no way to change a stored choice, so a
  // stale one must not be honoured.
  if (!SHOW_NETWORK_SWITCH) return defaultNetwork();

  let stored: string | null = null;
  try {
    stored = localStorage.getItem(LS_PREFERRED);
  } catch {
    /* private mode / storage blocked — fall through to the default */
  }
  return isSelectable(stored) ? stored : defaultNetwork();
}

/** True once the visitor has made an explicit choice. */
export function hasExplicitPreference(): boolean {
  if (!SHOW_NETWORK_SWITCH) return false;
  try {
    return isSelectable(localStorage.getItem(LS_PREFERRED));
  } catch {
    return false;
  }
}

const listeners = new Set<() => void>();

export function subscribeNetwork(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setPreferredNetwork(id: string): void {
  if (!isSelectable(id)) return;
  try {
    localStorage.setItem(LS_PREFERRED, id);
  } catch {
    /* the choice still applies to this page; it just will not be remembered */
  }
  listeners.forEach((fn) => fn());
}
