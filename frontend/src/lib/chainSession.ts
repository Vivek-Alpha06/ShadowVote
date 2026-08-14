// ===========================================================================
// Chain session
// ---------------------------------------------------------------------------
// Module-level holder for the live on-chain session: the midnight-js providers
// built from the connected wallet, plus the deployed ShadowVote contract.
//
// The UI's data layer (contractService) reads this rather than taking providers
// as arguments, so pages stay unaware of the SDK. Nothing here is created until
// the user connects a wallet and deploys/joins a contract.
// ===========================================================================

import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { BridgeInfo } from './midnightProviders';
import type { ShadowVotePrivateState } from './shadowvoteChain';
import { logStep } from './activityLog';

// Loaded on demand — see the note in contractService.ts. Keeping the SDK out of
// the initial bundle means a failure inside it cannot blank the app.
const loadProviders = () => import('./midnightProviders');
const loadChain = () => import('./shadowvoteChain');

/** Remembered so a reload rejoins the same contract instead of redeploying. */
const LS_CONTRACT_ADDRESS = 'shadowvote:contract-address';

/**
 * The ShadowVote deployments this build ships against, keyed by network.
 *
 * Without an entry the app is inert on first load — localStorage is empty in a
 * fresh browser, so a visitor would have to paste an address by hand before
 * anything worked. See `contractForNetwork` for why this is a map.
 */
const CONTRACTS: Record<string, string> = {
  preview: '8e60d089f565d4aef839646e8c8c5443ff0f57f2d999e278fc714c2c7efc143d',
  // preprod: '<address>',  // add once deployed to preprod
};

/** Networks this build ships a contract for. */
export function supportedNetworks(): string[] {
  return Object.keys(CONTRACTS);
}

/**
 * The contract to use on a given network, or null if this build has none.
 *
 * Keyed by network rather than a single constant because an address is
 * meaningless on any chain but the one it was deployed to. With a map the app
 * picks the deployment matching the connected wallet, so moving Lace between
 * networks keeps working instead of trying to join an address that cannot exist.
 *
 * `import.meta.env` isn't in this tsconfig's lib, so it is read defensively
 * rather than pulling in vite/client types just for one value. An explicit
 * override wins everywhere — that is how you point a build at your own deploy.
 */
export function contractForNetwork(networkId: string | null | undefined): string | null {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const override = env?.VITE_SHADOWVOTE_CONTRACT_ADDRESS?.trim();
  if (override) return override;
  if (!networkId) return null;
  return CONTRACTS[networkId] ?? null;
}

export interface ChainSession {
  providers: MidnightProviders;
  info: BridgeInfo;
  /** Kept so writes can pre-check spendable DUST before proving. */
  api: ConnectedAPI;
  contract: unknown;
  contractAddress: string;
  /** Deploy transaction hash, when this session created the contract. */
  deployTxHash: string | null;
  secretKey: Uint8Array;
}

let session: ChainSession | null = null;
const listeners = new Set<() => void>();

export function getSession(): ChainSession | null {
  return session;
}

/** Throws a UI-friendly error rather than a null deref. */
export function requireSession(): ChainSession {
  if (!session) {
    throw new Error('Not connected to the contract yet — connect your wallet and deploy or join.');
  }
  return session;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(): void {
  listeners.forEach((fn) => fn());
}

export function savedContractAddress(): string | null {
  return localStorage.getItem(LS_CONTRACT_ADDRESS);
}

export function forgetContract(): void {
  localStorage.removeItem(LS_CONTRACT_ADDRESS);
  session = null;
  emit();
}

/** Read back the secret key the private-state provider persisted. */
async function loadSecretKey(providers: MidnightProviders): Promise<Uint8Array> {
  const { PRIVATE_STATE_ID } = await loadChain();
  const state = (await providers.privateStateProvider.get(
    PRIVATE_STATE_ID as never,
  )) as ShadowVotePrivateState | null;
  if (!state?.secretKey) {
    throw new Error('Private state is missing a secret key — try redeploying.');
  }
  return state.secretKey;
}

/**
 * Deploying = proving (slow) + wallet signature + submission + waiting for the
 * indexer to report finalization. Minutes is normal; forever is not. Without a
 * deadline a stalled indexer subscription leaves the UI frozen with no error,
 * which is exactly the "signed it and nothing happened" symptom.
 */
const DEPLOY_TIMEOUT_MS = 6 * 60_000;
const JOIN_TIMEOUT_MS = 90_000;

async function withDeadline<T>(promise: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(
      () =>
        reject(
          new Error(
            `${what} did not complete within ${Math.round(ms / 60_000)} minutes.\n\n` +
              `The transaction may still have been submitted — check your wallet's history ` +
              `before retrying, to avoid paying the fee twice.`,
          ),
        ),
      ms,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) window.clearTimeout(timer);
  }
}

export interface OpenOptions {
  api: ConnectedAPI;
  /** Join this address; when omitted, a saved address is used, else deploy. */
  contractAddress?: string;
  forceDeploy?: boolean;
  onStep?: (step: string) => void;
}

/**
 * Build providers and either deploy a fresh contract or join an existing one.
 * Deploying submits a real transaction and costs a fee from the connected wallet.
 */
/**
 * The open currently in progress, if any.
 *
 * Two concurrent opens are ALWAYS a bug: each builds its own providers and asks
 * the wallet for permissions again, and a second request arriving while the
 * first is pending is what wedges Lace's message channel — after which every
 * later call hangs until the page is reloaded.
 *
 * React StrictMode makes this the default rather than the exception: in dev it
 * mounts, unmounts and remounts every component, double-invoking effects. A
 * `useRef` guard inside a component cannot stop it, because the ref is recreated
 * on the remount. Guarding here covers that and every other caller.
 */
let inFlight: Promise<ChainSession> | null = null;

export function openSession(options: OpenOptions): Promise<ChainSession> {
  if (inFlight) {
    logStep('openSession already in flight — joining it rather than racing the wallet');
    return inFlight;
  }
  inFlight = openSessionInner(options).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function openSessionInner({
  api,
  contractAddress,
  forceDeploy,
  onStep,
}: OpenOptions): Promise<ChainSession> {
  onStep?.('Loading Midnight SDK…');
  const [providersMod, chainMod] = await Promise.all([loadProviders(), loadChain()]);
  const { buildProviders, submittedTxHashes, onProviderProgress } = providersMod;

  // Let the provider bridge report balancing/submission progress to the UI.
  if (onStep) onProviderProgress(onStep);
  const { deployShadowVote, joinShadowVote, contractAddressOf, txHashOf } = chainMod;

  // Stage-2 permissions: transaction methods, asked for only now that an
  // on-chain write is actually about to happen. Non-fatal — the calls below
  // report their own errors if the wallet still withholds something.
  onStep?.('Requesting transaction permissions — approve in the wallet…');
  try {
    const { grantTransactionPermissions } = await import('./midnightConnector');
    await grantTransactionPermissions(api);
  } catch {
    /* proceed; provider calls will surface any real permission problem */
  }

  onStep?.('Building providers from wallet configuration…');
  const { providers, info } = await buildProviders(api);

  // Precedence: explicit argument > this browser's saved address > the contract
  // this build ships for the wallet's ACTUAL network. Only `forceDeploy` skips
  // all three, so a first-time visitor joins the shipped contract rather than
  // silently deploying their own and paying for it.
  //
  // The network comes from `info.config.networkId`, i.e. the wallet's own
  // getConfiguration() — never a guess.
  const shipped = contractForNetwork(info.config.networkId);
  const target =
    contractAddress ?? (forceDeploy ? undefined : (savedContractAddress() ?? shipped ?? undefined));

  // No contract for this network and no explicit deploy request. Falling through
  // would DEPLOY a fresh contract and charge a fee the user never asked for, so
  // fail with something they can act on instead.
  if (!target && !forceDeploy) {
    throw new Error(
      `No ShadowVote contract is deployed on "${info.config.networkId}".\n\n` +
        `This build ships contracts for: ${supportedNetworks().join(', ')}.\n` +
        `Switch your wallet to one of those, or use "Deploy a new contract" to ` +
        `create one here (that submits a real transaction and costs a fee).`,
    );
  }

  let contract: unknown;
  let address: string;
  let deployTxHash: string | null = null;

  if (target) {
    onStep?.(`Joining contract ${target.slice(0, 18)}…`);
    contract = await withDeadline(
      joinShadowVote(providers, target),
      JOIN_TIMEOUT_MS,
      `Joining ${target.slice(0, 18)}…`,
    );
    address = target;
  } else {
    // Fees are paid in DUST — but ONLY by transactions, and deploying is the
    // only branch here that submits one. Joining is `findDeployedContract`,
    // which costs nothing, and every read after it is free.
    //
    // This check used to run unconditionally, before the join. A wallet with no
    // DUST therefore threw before ever attaching to the contract, so the app
    // showed no elections at all and only "you have no DUST" — when browsing
    // needs no DUST whatsoever.
    onStep?.('Checking DUST balance for fees…');
    await providersMod.assertCanPayFees(api);

    onStep?.('Proving and submitting — approve in your wallet, then wait…');
    contract = await withDeadline(
      deployShadowVote(providers),
      DEPLOY_TIMEOUT_MS,
      'Deploying contract',
    );
    const deployed = contractAddressOf(contract);
    if (!deployed) throw new Error('Deploy succeeded but no contract address was returned.');
    address = deployed;
    deployTxHash = txHashOf(contract) ?? submittedTxHashes[0] ?? null;
    localStorage.setItem(LS_CONTRACT_ADDRESS, address);
  }

  onStep?.('Loading private state…');
  const secretKey = await loadSecretKey(providers);

  // Detach the progress sink; later circuit calls report through their own UI.
  onProviderProgress(null);

  session = { providers, info, api, contract, contractAddress: address, deployTxHash, secretKey };
  localStorage.setItem(LS_CONTRACT_ADDRESS, address);
  emit();
  return session;
}
