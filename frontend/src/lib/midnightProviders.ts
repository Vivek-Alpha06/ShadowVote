// ===========================================================================
// Bridge: Lace DApp connector  ->  midnight-js providers
// ---------------------------------------------------------------------------
// midnight-js speaks ledger objects (UnboundTransaction / FinalizedTransaction);
// the DApp connector speaks serialized hex strings. This module is the only
// place that translation happens.
//
// Service URIs come from the WALLET (`getConfiguration()`), never hardcoded —
// the user's chosen indexer/node is authoritative and may differ per network.
//
// Proving: `Configuration.proverServerUri` is deprecated in connector v4 in
// favour of `getProvingProvider()`. We prefer the wallet's URI when it still
// supplies one, else fall back to the local proof server on :6300.
// ===========================================================================

import type { ConnectedAPI, Configuration } from '@midnight-ntwrk/dapp-connector-api';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { toHex, fromHex } from '@midnight-ntwrk/midnight-js-utils';
import { logStep, timed } from './activityLog';
import { ShadowVoteZkConfigProvider, verifyZkAssets } from './zkConfig';
import { browserPrivateStateProvider } from './browserPrivateStateProvider';
import * as ledger from '@midnight-ntwrk/ledger-v8';

/** The five circuits compiled from ShadowVote.compact. */
export const SHADOWVOTE_CIRCUITS = [
  'createElection',
  'castVote',
  'closeElection',
  'getCandidateVotes',
  'hasVoted',
] as const;

export type ShadowVoteCircuit = (typeof SHADOWVOTE_CIRCUITS)[number];

/**
 * Local proof server, reached through the Vite dev proxy (see vite.config.ts).
 * Going direct to :6300 fails CORS — that server sends no CORS headers and
 * does not answer preflight — so the same-origin proxy path is used instead.
 */
export const LOCAL_PROOF_SERVER = `${window.location.origin}/proof-server`;

/** Where the compiled ZK artifacts are served from (see frontend/public). */
export const ZK_CONFIG_BASE = `${window.location.origin}/midnight/shadowvote`;

/**
 * A wallet-supplied proof server on localhost hits the same CORS wall as our
 * own, so route it through the dev proxy. Remote URIs are left alone — those
 * are expected to send proper CORS headers.
 */
function viaProxyIfLocal(uri: string | undefined): string | undefined {
  if (!uri) return undefined;
  return /^https?:\/\/(localhost|127\.0\.0\.1):6300/i.test(uri) ? LOCAL_PROOF_SERVER : uri;
}

export interface BridgeInfo {
  config: Configuration;
  proofServerUri: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
}

/**
 * Transaction wire format.
 *
 * midnight-js hands us ledger `Transaction` OBJECTS; the DApp connector speaks
 * HEX STRINGS. The conversion is not symmetric and both halves are easy to get
 * wrong:
 *
 *   Transaction.serialize()  -> Uint8Array   (NOT a string — must be hex-encoded)
 *   Transaction.deserialize(markerS, markerP, markerB, raw: Uint8Array)
 *                            -> four arguments, with string-literal type markers
 *
 * Passing raw bytes where hex is expected leaves the wallet with an
 * unparseable transaction: it signs, nothing is submitted, and the balance
 * never moves — silently.
 */
function serializeTx(tx: unknown): string {
  const candidate = tx as { serialize?: () => Uint8Array };
  if (typeof candidate.serialize !== 'function') {
    throw new Error('Transaction object has no serialize() method');
  }
  return toHex(candidate.serialize());
}

/**
 * The transaction's IDENTIFIER — what midnight-js needs to track finalization.
 *
 * `watchForTxData(txId)` queries the indexer with `offset: { identifier: txId }`,
 * so it matches this value and nothing else. In particular it does NOT match the
 * `txHash` the wallet reports in its transaction history; those are separate
 * identifiers for the same transaction.
 */
function transactionIdOf(tx: unknown): string | null {
  const candidate = tx as { identifiers?: () => unknown[] };
  if (typeof candidate.identifiers !== 'function') return null;
  try {
    const first = candidate.identifiers()[0];
    if (first === undefined || first === null) return null;
    return typeof first === 'string' ? first : String(first);
  } catch {
    return null;
  }
}

type TransactionStatics = {
  deserialize: (
    markerS: string,
    markerP: string,
    markerB: string,
    raw: Uint8Array,
  ) => unknown;
};

function deserializeTx(hex: string): unknown {
  const Transaction = (ledger as unknown as { Transaction?: TransactionStatics }).Transaction;
  if (!Transaction?.deserialize) {
    throw new Error('ledger-v8 does not expose Transaction.deserialize');
  }

  const raw = new Uint8Array(fromHex(hex));

  // A balanced transaction from the wallet is "ready for submission", i.e.
  // signed + proven + bound. Fall back to pre-binding for wallets that hand
  // back a still-unbound transaction.
  try {
    return Transaction.deserialize('signature', 'proof', 'binding', raw);
  } catch (err) {
    try {
      return Transaction.deserialize('signature', 'proof', 'pre-binding', raw);
    } catch {
      throw err instanceof Error ? err : new Error(String(err));
    }
  }
}

/**
 * The connector's `submitTransaction()` resolves to void, so the transaction
 * hash has to be recovered from wallet history. We snapshot the newest hashes
 * before submitting and return whichever entry is new afterwards.
 */
async function recentHashes(api: ConnectedAPI, size = 10): Promise<Set<string>> {
  try {
    const entries = await api.getTxHistory(0, size);
    return new Set(entries.map((e) => e.txHash));
  } catch {
    return new Set();
  }
}

async function findNewHash(api: ConnectedAPI, before: Set<string>): Promise<string | null> {
  // The wallet needs a moment to register the submission.
  for (let attempt = 0; attempt < 12; attempt++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const entries = await api.getTxHistory(0, 10);
      const fresh = entries.find((e) => !before.has(e.txHash));
      if (fresh) return fresh.txHash;
    } catch {
      /* keep polling */
    }
  }
  return null;
}

/** Tx hashes observed this session, newest first — surfaced in the UI. */
export const submittedTxHashes: string[] = [];

/**
 * Progress sink. The SDK drives balancing/submission internally, so without
 * this the UI has no idea whether it is proving, waiting on a signature, or
 * waiting for the chain — which is indistinguishable from a freeze.
 */
let progressSink: ((step: string) => void) | null = null;

export function onProviderProgress(fn: ((step: string) => void) | null): void {
  progressSink = fn;
}

function report(step: string): void {
  logStep(step);
  progressSink?.(step);
}

/**
 * The SDK keeps the network id in module-level state and every wallet/contract
 * operation asserts it has been set ("Network ID has not been configured").
 * It must therefore be configured BEFORE constructing providers, building a
 * Contract, or reading ledger state.
 *
 * The value comes from the wallet's own `getConfiguration()`, so the SDK can
 * never disagree with the network the user is actually connected to.
 */
export function configureNetwork(networkId: string): void {
  if (!networkId) throw new Error('Wallet did not report a network id');
  try {
    if (getNetworkId() === networkId) return; // already set to the same value
  } catch {
    // getNetworkId() throws when unset — that is exactly why we are here.
  }
  setNetworkId(networkId);
}

/** Logs every call the proof provider makes, without changing behaviour. */
function instrumentProofProvider<T extends object>(provider: T, uri: string): T {
  return new Proxy(provider, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function' || typeof prop !== 'string') return value;
      return (...args: unknown[]) => {
        const result = (value as (...a: unknown[]) => unknown).apply(target, args);
        if (result instanceof Promise) {
          return timed(`proofProvider.${prop}() via ${uri}`, () => result);
        }
        return result;
      };
    },
  });
}

export async function buildProviders(
  api: ConnectedAPI,
): Promise<{ providers: MidnightProviders; info: BridgeInfo }> {
  const config = await api.getConfiguration();

  // Record what the wallet actually reports — network, indexer and (crucially)
  // which proof server it expects, which may differ from the local one.
  logStep(`wallet config: ${JSON.stringify(config)}`);

  // FIRST — before any other SDK call. Everything downstream asserts on this.
  configureNetwork(config.networkId);

  const { shieldedCoinPublicKey, shieldedEncryptionPublicKey } = await api.getShieldedAddresses();

  const proofServerUri = viaProxyIfLocal(config.proverServerUri) ?? LOCAL_PROOF_SERVER;
  logStep(`proof server in use: ${proofServerUri}`);
  logStep(`shielded coin public key: ${shieldedCoinPublicKey.slice(0, 24)}…`);

  // Fail fast with a readable message if the artifacts aren't reachable —
  // otherwise compact-js reports five opaque ZKConfigurationReadErrors.
  await verifyZkAssets(ZK_CONFIG_BASE, SHADOWVOTE_CIRCUITS);

  // The ZK config provider is shared: the proof provider needs it to resolve
  // prover keys and ZKIR per circuit.
  const zkConfigProvider = new ShadowVoteZkConfigProvider(ZK_CONFIG_BASE);

  const providers = {
    privateStateProvider: browserPrivateStateProvider(),
    // Third arg is webSocketImpl. It defaults to `isomorphic-ws`, whose browser
    // build exposes WebSocket only as a default export — the same undefined
    // named-import trap as cross-fetch. Pass the browser's own and be certain:
    // deployContract waits on this subscription for finalization, so a broken
    // socket makes the deploy hang forever with no error.
    publicDataProvider: indexerPublicDataProvider(
      config.indexerUri,
      config.indexerWsUri,
      window.WebSocket as never,
    ),
    zkConfigProvider,
    // Wrapped so the proving phase is visible: it runs BEFORE the wallet's
    // sign prompt and is the slowest step, so a stall here looks identical to
    // a stall anywhere else without instrumentation.
    proofProvider: instrumentProofProvider(
      httpClientProofProvider(proofServerUri, zkConfigProvider),
      proofServerUri,
    ),

    walletProvider: {
      getCoinPublicKey: () => shieldedCoinPublicKey,
      getEncryptionPublicKey: () => shieldedEncryptionPublicKey,
      /** Hand the unbound tx to the wallet to pay fees and fix imbalances. */
      balanceTx: async (tx: unknown) => {
        report('Balancing transaction — approve in your wallet…');

        const hex = await timed('serialize unbalanced tx', async () => serializeTx(tx));
        logStep(`  serialized ${hex.length / 2} bytes`);

        const { tx: balanced } = await timed(
          'wallet.balanceUnsealedTransaction() — SIGN PROMPT',
          () => api.balanceUnsealedTransaction(hex),
        );
        logStep(`  wallet returned ${balanced ? balanced.length / 2 : 0} bytes`);

        const result = await timed('deserialize balanced tx', async () => deserializeTx(balanced));
        report('Transaction balanced.');
        return result;
      },
    },

    midnightProvider: {
      /**
       * Submit via the wallet and return the transaction's IDENTIFIER.
       *
       * midnight-js then blocks in `watchForTxData(txId)` — documented to "wait
       * indefinitely" — which matches on the ledger identifier (see
       * `transactionIdOf`). This used to scrape the wallet's history for a newly
       * appeared hash and return `hash ?? ''`, and BOTH branches were wrong: a
       * wallet `txHash` is not the identifier the indexer keys on, and `''`
       * matches nothing whatsoever. The symptom was a transaction the user
       * signed, that genuinely landed on-chain, while the UI sat forever on
       * "Creating…" with no error and no timeout.
       */
      submitTx: async (tx: unknown) => {
        report('Submitting transaction to the network…');

        // Read the identifier BEFORE submitting: it comes from the balanced
        // transaction itself, so it needs no round-trip and cannot race the
        // wallet's history catching up.
        const txId = transactionIdOf(tx);
        if (!txId) {
          throw new Error(
            'Could not read a transaction identifier from the balanced transaction. ' +
              'Refusing to submit — midnight-js would otherwise wait forever for a ' +
              'transaction it can never find.',
          );
        }
        logStep(`tx identifier: ${txId}`);

        const before = await recentHashes(api);
        const hex = await timed('serialize balanced tx', async () => serializeTx(tx));
        await timed('wallet.submitTransaction()', () => api.submitTransaction(hex));
        report(`Submitted — ${txId.slice(0, 18)}… — waiting for finalization`);

        // The wallet's hash is used only to show the user a familiar tx id, so
        // it is looked up in the background: finalization no longer depends on
        // it, and it must never delay or block submission again.
        void findNewHash(api, before).then((hash) => {
          if (hash) {
            submittedTxHashes.unshift(hash);
            logStep(`wallet reports tx hash: ${hash}`);
          }
        });

        return txId;
      },
    },
  } as unknown as MidnightProviders;

  return {
    providers,
    info: {
      config,
      proofServerUri,
      coinPublicKey: shieldedCoinPublicKey,
      encryptionPublicKey: shieldedEncryptionPublicKey,
    },
  };
}

export interface WalletFunds {
  /** DUST is the FEE token. Without it no transaction can be balanced. */
  dust: bigint;
  /** Maximum DUST the current NIGHT holding can generate. */
  dustCap: bigint;
  /** Unshielded token balances, keyed by token type — NIGHT lives here. */
  unshielded: Record<string, bigint>;
  shielded: Record<string, bigint>;
}

export async function readFunds(api: ConnectedAPI): Promise<WalletFunds> {
  const [dustInfo, unshielded, shielded] = await Promise.all([
    api.getDustBalance().catch(() => ({ balance: 0n, cap: 0n })),
    api.getUnshieldedBalances().catch(() => ({}) as Record<string, bigint>),
    api.getShieldedBalances().catch(() => ({}) as Record<string, bigint>),
  ]);
  return {
    dust: dustInfo.balance ?? 0n,
    dustCap: dustInfo.cap ?? 0n,
    unshielded,
    shielded,
  };
}

/**
 * Fees are paid in DUST, so a wallet holding only NIGHT cannot transact until
 * that NIGHT is registered for DUST generation. Checking first turns a slow,
 * opaque "Insufficient Funds: could not balance dust" from deep inside the
 * wallet into an actionable message before anything is proved or signed.
 */
export async function assertCanPayFees(api: ConnectedAPI): Promise<void> {
  const funds = await readFunds(api);
  const total = (b: Record<string, bigint>) =>
    Object.values(b).reduce((sum, v) => sum + (v ?? 0n), 0n);

  logStep(
    `balances — dust: ${funds.dust} (cap ${funds.dustCap}), ` +
      `unshielded: ${total(funds.unshielded)}, shielded: ${total(funds.shielded)}`,
  );

  if (funds.dust > 0n) return;

  const hasNight = total(funds.unshielded) > 0n;
  throw new Error(
    hasNight
      ? 'No DUST to pay the transaction fee.\n\n' +
        'You hold NIGHT, but fees are paid in DUST, which NIGHT generates only ' +
        'after you register it. In Lace, register your NIGHT for DUST generation, ' +
        'then wait for DUST to accrue and try again.\n\n' +
        `(DUST balance 0, generation cap ${funds.dustCap})`
      : 'This wallet has no funds on this network.\n\n' +
        'Get tNIGHT from the faucet for the connected account, register it for ' +
        'DUST generation in Lace, then retry.',
  );
}

/** Quick reachability check so a dead proof server is reported clearly. */
export async function checkProofServer(uri: string): Promise<boolean> {
  try {
    await fetch(uri, { method: 'HEAD', mode: 'no-cors' });
    return true;
  } catch {
    return false;
  }
}
