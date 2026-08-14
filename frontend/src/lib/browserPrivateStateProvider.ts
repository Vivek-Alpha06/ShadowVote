// ===========================================================================
// Browser-native PrivateStateProvider
// ---------------------------------------------------------------------------
// Replaces @midnight-ntwrk/midnight-js-level-private-state-provider.
//
// That provider is built on the `level` family (level -> browser-level ->
// abstract-level, with classic-level for Node). Those are CommonJS and
// Node-oriented, and under Vite the class hierarchy resolves inconsistently
// ("Class extends value undefined is not a constructor or null"). It also
// demands an encryption password and account scoping we do not need.
//
// The interface is small and the data is a handful of keys, so this stores it
// directly in localStorage instead — no CJS interop, no native bindings.
//
// SECURITY NOTE: contents are NOT encrypted at rest. They are readable by any
// script on this origin, exactly as the voter's secret key would be in any
// browser-held wallet state. This is a local dApp; do not reuse the key
// elsewhere.
// ===========================================================================

import type { PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types';

const PREFIX = 'shadowvote:pstate:';
const SIGNING_PREFIX = 'shadowvote:skey:';

/**
 * JSON cannot represent Uint8Array, and the voter's secret key is one — so
 * tag byte arrays on the way out and rebuild them on the way in.
 */
function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Uint8Array) {
    return { __u8: Array.from(value) };
  }
  return value;
}

function reviver(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && Array.isArray((value as { __u8?: number[] }).__u8)) {
    return Uint8Array.from((value as { __u8: number[] }).__u8);
  }
  return value;
}

function readKey<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw, reviver) as T;
  } catch {
    return null;
  }
}

function writeKey(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value, replacer));
}

function removeByPrefix(prefix: string): void {
  const doomed: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(prefix)) doomed.push(k);
  }
  doomed.forEach((k) => localStorage.removeItem(k));
}

/** Export/import are not supported here; ShadowVote never calls them. */
function unsupported(name: string): never {
  throw new Error(`${name} is not supported by the browser private state provider`);
}

export function browserPrivateStateProvider<
  PSI extends string = string,
  PS = unknown,
>(): PrivateStateProvider<PSI, PS> {
  return {
    // The SDK sets this to scope operations; our keys are already unique per
    // private-state id, so there is nothing to track.
    setContractAddress: () => {},

    set: async (privateStateId: PSI, state: PS) => {
      writeKey(PREFIX + privateStateId, state);
    },

    get: async (privateStateId: PSI) => readKey<PS>(PREFIX + privateStateId),

    remove: async (privateStateId: PSI) => {
      localStorage.removeItem(PREFIX + privateStateId);
    },

    clear: async () => removeByPrefix(PREFIX),

    setSigningKey: async (address, signingKey) => {
      writeKey(SIGNING_PREFIX + String(address), signingKey);
    },

    getSigningKey: async (address) => readKey(SIGNING_PREFIX + String(address)),

    removeSigningKey: async (address) => {
      localStorage.removeItem(SIGNING_PREFIX + String(address));
    },

    clearSigningKeys: async () => removeByPrefix(SIGNING_PREFIX),

    exportPrivateStates: () => unsupported('exportPrivateStates'),
    importPrivateStates: () => unsupported('importPrivateStates'),
    exportSigningKeys: () => unsupported('exportSigningKeys'),
    importSigningKeys: () => unsupported('importSigningKeys'),
  } as PrivateStateProvider<PSI, PS>;
}
