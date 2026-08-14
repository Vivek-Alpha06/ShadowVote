// ===========================================================================
// ZK artifact provider
// ---------------------------------------------------------------------------
// Wraps FetchZkConfigProvider for two reasons:
//
// 1. It defaults to `import { fetch } from 'cross-fetch'`. Browser builds of
//    that package expose fetch as a DEFAULT export, so the named import can
//    land as undefined and calling it throws — the same trap as isomorphic-ws.
//    We pass the browser's own fetch and remove the doubt entirely.
//
// 2. compact-js wraps any failure here in a ZKConfigurationReadError whose
//    message is only "Failed to read verifier key for <tag>#<circuit>" — the
//    underlying cause is discarded. We log the real error before it is lost.
// ===========================================================================

import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import type { ShadowVoteCircuit } from './midnightProviders';

/** Bound so `fetch` is not called with a detached `this`. */
const browserFetch: typeof fetch = (input, init) => window.fetch(input, init);

export class ShadowVoteZkConfigProvider extends FetchZkConfigProvider<ShadowVoteCircuit> {
  constructor(baseURL: string) {
    super(baseURL, browserFetch as never);
  }

  override async getVerifierKey(circuitId: ShadowVoteCircuit) {
    return this.trace('verifier key', circuitId, () => super.getVerifierKey(circuitId));
  }

  override async getProverKey(circuitId: ShadowVoteCircuit) {
    return this.trace('prover key', circuitId, () => super.getProverKey(circuitId));
  }

  override async getZKIR(circuitId: ShadowVoteCircuit) {
    return this.trace('zkir', circuitId, () => super.getZKIR(circuitId));
  }

  /** Surface the true failure; compact-js discards it a layer above. */
  private async trace<T>(what: string, circuitId: string, run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (err) {
      const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      console.error(`[ShadowVote] failed to load ${what} for "${circuitId}" — ${detail}`, {
        baseURL: this.baseURL,
        circuitId,
        cause: err,
      });
      throw new Error(`Could not load ${what} for "${circuitId}" from ${this.baseURL}: ${detail}`);
    }
  }
}

/**
 * Verify every artifact is reachable before a deploy begins, so a missing or
 * mis-served file is reported plainly instead of as five opaque Effect errors.
 */
export async function verifyZkAssets(
  baseURL: string,
  circuits: readonly ShadowVoteCircuit[],
): Promise<void> {
  const missing: string[] = [];

  await Promise.all(
    circuits.flatMap((circuit) =>
      [
        `keys/${circuit}.verifier`,
        `keys/${circuit}.prover`,
        `zkir/${circuit}.bzkir`,
      ].map(async (path) => {
        const url = `${baseURL.replace(/\/$/, '')}/${path}`;
        try {
          const res = await window.fetch(url, { method: 'GET' });
          if (!res.ok) {
            missing.push(`${path} -> HTTP ${res.status}`);
            return;
          }
          if ((res.headers.get('content-type') ?? '').includes('text/html')) {
            missing.push(`${path} -> served as HTML (file not found; SPA fallback)`);
          }
        } catch (err) {
          missing.push(`${path} -> ${err instanceof Error ? err.message : String(err)}`);
        }
      }),
    ),
  );

  if (missing.length) {
    throw new Error(
      `ZK artifacts are not reachable under ${baseURL}:\n${missing.join('\n')}\n\n` +
        `They are copied from contract/managed/shadowvote into frontend/public/midnight/shadowvote.`,
    );
  }
}
