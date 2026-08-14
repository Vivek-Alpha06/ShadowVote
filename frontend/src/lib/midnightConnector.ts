// ===========================================================================
// Midnight DApp connector adapter
// ---------------------------------------------------------------------------
// Wallets inject their API into `window.midnight`, keyed by a freshly
// generated UUID — NOT by a fixed name like `mnLace`. Anything that looks for
// a hardcoded key resolves to undefined against a current wallet, so we always
// enumerate with Object.entries().
//
// Two connector generations exist in the wild and we support both:
//
//   modern (dapp-connector-api v4+):
//     InitialAPI   { rdns, name, icon, apiVersion, connect(networkId) }
//     ConnectedAPI { getShieldedAddresses(), getUnshieldedAddress(),
//                    getConnectionStatus() }
//   legacy:
//     { enable() -> { state() -> { address } }, isEnabled() }
//
// EVERY call into the wallet is wrapped in a timeout. A wallet that accepts an
// approval and then never settles its promise is a real failure mode, and
// without a deadline it leaves the UI stuck on "waiting" forever.
// ===========================================================================

/**
 * Network ids accepted by `connect()`, as reported by Lace itself:
 *   "Valid networks are: mainnet, testnet, devnet, qanet, undeployed, preview, preprod"
 *
 * NOTE: the connect id and the address HRP segment are DIFFERENT namespaces.
 * Testnet addresses are `mn_shield-addr_test1…` (segment `test`) but the
 * connect id is `testnet`. Do not derive one from the other — map them.
 *
 * Test networks lead; mainnet is last, since a wallet doing dApp work is
 * almost never on it.
 */
export const NETWORK_IDS = [
  // preview first: that is where this project's funded wallet lives
  // (faucet.preview.midnight.network), and the first attempt must be a
  // plausible one — a rejected id kills the wallet's message channel.
  'preview',
  'preprod',
  'undeployed',
  'mainnet',
  // Accepted by some builds but rejected by others; kept last so a default
  // attempt never burns the channel on an id this wallet doesn't know.
  'testnet',
  'devnet',
  'qanet',
] as const;
export type NetworkId = (typeof NETWORK_IDS)[number];

/**
 * Networks offered in the UI picker. Lace's Midnight account exposes exactly
 * three — undeployed / preview / preprod — plus mainnet. Note that Lace's
 * top-level "testnet" label is NOT a Midnight network id; pick whichever of
 * these the wallet's Midnight section is set to.
 */
export const NETWORK_LABELS: Record<string, string> = {
  preview: 'Preview',
  preprod: 'Pre-prod',
  undeployed: 'Local / undeployed',
  mainnet: 'Mainnet',
  testnet: 'Testnet',
  devnet: 'Devnet',
  qanet: 'QAnet',
};

/** address HRP segment -> connect() network id */
const HRP_TO_NETWORK_ID: Record<string, string> = {
  test: 'testnet',
  dev: 'devnet',
  qa: 'qanet',
};

/**
 * The network a returned address belongs to, normalised to a connect() id.
 * `mn_shield-addr_test1…` -> "testnet"; `mn_addr_preprod1…` -> "preprod";
 * an address with no network segment is mainnet.
 */
export function networkFromAddress(address: string): string | null {
  // HRP is everything before the final "1" separator (bech32m's charset
  // excludes "1", so the last one is always the separator).
  const separator = address.lastIndexOf('1');
  if (separator <= 0) return null;
  const hrp = address.slice(0, separator);
  if (!hrp.startsWith('mn_')) return null;

  const segments = hrp.split('_');
  if (segments.length < 3) return 'mainnet';
  const segment = segments[segments.length - 1];
  return HRP_TO_NETWORK_ID[segment] ?? segment;
}

/**
 * Wallets reject an unknown id with their own list of valid ones. Harvest it —
 * it beats any list we hardcode.
 */
export function parseValidNetworks(message: string): string[] | null {
  // Wallets phrase this differently ("Valid networks are:", "Supported
  // networks are:") and the wording varies by version — match both.
  // \b matters: without it "Unsupported network ID: …" matches on its own
  // "supported" and captures the rejected id instead of the supported list.
  // "are"/"include" is mandatory for the same reason.
  const match = /\b(?:valid|supported|available)\s+networks?\s+(?:are|include)\s*:?\s*([^.\n]+)/i.exec(
    message,
  );
  if (!match) return null;
  const ids = match[1]
    .split(/[,\s]+/)
    .map((s) => s.trim().replace(/[.'"`]/g, ''))
    .filter(Boolean);
  return ids.length ? ids : null;
}

/**
 * True for errors meaning the injected connector object is dead. Lace tears
 * down its message channel after certain failures ("Remote API with channel
 * 'feature-flags' was shutdown: object can no longer be used"), and every
 * later call on that object hangs. Only a page reload gets a live one back.
 */
export function isChannelDead(message: string): boolean {
  return /was shutdown|can no longer be used|channel.*closed|disconnected port/i.test(message);
}

/**
 * Approval is user-driven so it needs headroom, but a dead MV3 channel also
 * presents as a hang — waiting the better part of a minute to discover that
 * helps nobody. 30s covers a real approval and fails fast on a dead channel.
 */
const CONNECT_TIMEOUT_MS = 30_000;
/** Post-approval reads should be immediate; a stall here means a wedged wallet. */
const READ_TIMEOUT_MS = 12_000;

export interface WalletHandle {
  address: string;
  networkId: string | null;
  /** Re-read the address; throws if the wallet is gone, locked, or wedged. */
  refresh: () => Promise<string>;
  /**
   * The live ConnectedAPI, needed to build midnight-js providers.
   * Null for legacy connectors, which cannot drive the modern provider stack.
   */
  api: unknown;
}

export interface DiscoveredWallet {
  /** The UUID (or legacy key) this wallet was injected under. */
  key: string;
  name: string;
  icon: string | null;
  apiVersion: string | null;
  rdns: string | null;
  generation: 'modern' | 'legacy';
}

export class WalletRejectedError extends Error {}
export class WalletTimeoutError extends Error {}
export class WalletCancelledError extends Error {}

/** The wallet rejected the network id and told us which ones it accepts. */
export class WalletNetworkError extends Error {
  constructor(
    message: string,
    readonly validNetworks: string[] | null,
  ) {
    super(message);
  }
}

/** The injected connector is dead; only a page reload restores it. */
export class WalletChannelDeadError extends Error {}

/** The wallet is locked — the user must unlock it, nothing else will help. */
export class WalletLockedError extends Error {}

/** Wallets report this as a "Rejected" error, so match on the reason text. */
export function looksLocked(message: string): boolean {
  return /is locked|unlock the wallet|please unlock/i.test(message);
}

/** Function names exposed by an injected object — the most useful diagnostic. */
export function describeApi(obj: unknown): string[] {
  if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return [];
  const names = new Set<string>();
  for (
    let cursor: object | null = obj as object;
    cursor && cursor !== Object.prototype;
    cursor = Object.getPrototypeOf(cursor) as object | null
  ) {
    for (const name of Object.getOwnPropertyNames(cursor)) {
      if (name === 'constructor') continue;
      names.add(name);
    }
  }
  return [...names].sort();
}

/** Progress reporting so the UI can show which step is running (or stalling). */
export type StepReporter = (step: string) => void;

export interface ConnectOptions {
  /** The ONE network to request. Never falls back — see connectWallet(). */
  networkId?: string;
  onStep?: StepReporter;
  /** Set `.cancelled = true` to abandon an in-flight attempt. */
  token?: { cancelled: boolean };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new WalletTimeoutError(`${label} did not respond within ${ms / 1000}s`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function checkCancelled(token?: { cancelled: boolean }): void {
  if (token?.cancelled) throw new WalletCancelledError('Connection attempt cancelled');
}

// --- raw injected shapes ----------------------------------------------------

interface ConnectedApi {
  getShieldedAddresses?: () => Promise<{ shieldedAddress?: string }>;
  getUnshieldedAddress?: () => Promise<{ unshieldedAddress?: string }>;
  getConnectionStatus?: () => Promise<{ status: string; networkId?: string }>;
  /**
   * Declares which methods the dApp intends to call. Wallets treat this as the
   * permission prompt and resolve only once the user grants — so address reads
   * before this has run can be rejected outright.
   */
  hintUsage?: (methodNames: string[]) => Promise<void>;
}

/**
 * Permissions are requested in two stages, because a wallet may decline a whole
 * batch if any single entry is unwelcome — and connecting must not require the
 * user to pre-approve spending.
 *
 * Stage 1 (connect): just enough to identify the account.
 * Stage 2 (deploy/vote): the transaction methods, requested at point of use.
 */
export const CONNECT_METHODS = ['getShieldedAddresses', 'getUnshieldedAddress'];

export const TRANSACTION_METHODS = [
  'getConfiguration',
  'balanceUnsealedTransaction',
  'submitTransaction',
  'getTxHistory',
];

interface ModernApi {
  rdns?: string;
  name?: string;
  icon?: string;
  apiVersion?: string;
  connect: (networkId: string) => Promise<ConnectedApi>;
}

interface LegacyApi {
  name?: string;
  apiVersion?: string;
  enable: () => Promise<{ state: () => Promise<{ address?: string; addressLegacy?: string }> }>;
  isEnabled?: () => Promise<boolean>;
}

type Injected = ModernApi | LegacyApi | undefined;

function isModern(api: Injected): api is ModernApi {
  return Boolean(api && typeof (api as ModernApi).connect === 'function');
}

function isLegacy(api: Injected): api is LegacyApi {
  return Boolean(api && typeof (api as LegacyApi).enable === 'function');
}

function midnightRoot(): Record<string, Injected> | undefined {
  const root = (window as unknown as { midnight?: Record<string, Injected> }).midnight;
  return root && typeof root === 'object' ? root : undefined;
}

export function cardanoKeys(): string[] {
  const root = (window as unknown as { cardano?: Record<string, unknown> }).cardano;
  return root && typeof root === 'object' ? Object.keys(root) : [];
}

/** Every injected Midnight wallet, in injection order. */
export function discoverWallets(): DiscoveredWallet[] {
  const root = midnightRoot();
  if (!root) return [];

  return Object.entries(root)
    .filter(([, api]) => isModern(api) || isLegacy(api))
    .map(([key, api]) => ({
      key,
      name: api?.name ?? (key === 'mnLace' ? 'Lace' : key.slice(0, 8)),
      icon: (api as ModernApi)?.icon ?? null,
      apiVersion: api?.apiVersion ?? null,
      rdns: (api as ModernApi)?.rdns ?? null,
      generation: isModern(api) ? ('modern' as const) : ('legacy' as const),
    }));
}

/** Raw keys under window.midnight, including anything unrecognised (diagnostics). */
export function rawMidnightKeys(): string[] {
  const root = midnightRoot();
  return root ? Object.keys(root) : [];
}

function rawApi(key: string): Injected {
  return midnightRoot()?.[key];
}

function looksRejected(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: string })?.code ?? '';
  return /rejected|permissionrejected|denied|declin|cancel|refus/i.test(`${code} ${msg}`);
}

/**
 * Ask the wallet for the permissions this dApp needs.
 *
 * Must run BEFORE any address read: wallets use hintUsage as the permission
 * prompt, and reject reads attempted before the user has granted.
 */
async function grantPermissions(
  api: ConnectedApi,
  methods: string[],
  onStep?: StepReporter,
): Promise<void> {
  if (!api.hintUsage) return;
  onStep?.('Requesting permissions — approve in the wallet…');
  await withTimeout(api.hintUsage(methods), CONNECT_TIMEOUT_MS, 'hintUsage()');
}

/**
 * Stage 2: ask for the transaction permissions, immediately before the first
 * on-chain write. Exported so the deploy flow can call it at the right moment.
 */
export async function grantTransactionPermissions(api: unknown): Promise<void> {
  const connected = api as ConnectedApi;
  if (!connected?.hintUsage) return;
  await withTimeout(
    connected.hintUsage(TRANSACTION_METHODS),
    CONNECT_TIMEOUT_MS,
    'hintUsage(transaction methods)',
  );
}

/**
 * Read the wallet's address. Failures are COLLECTED rather than swallowed —
 * "no address returned" on its own hides the reason (usually a permission
 * rejection), which is exactly the dead end this used to produce.
 */
async function readModernAddress(
  api: ConnectedApi,
  onStep?: StepReporter,
  failures: string[] = [],
): Promise<string | null> {
  // Prefer the shielded address — it's the privacy-relevant identity and the
  // one ShadowVote's nullifier derives from.
  if (api.getShieldedAddresses) {
    try {
      onStep?.('Reading shielded address…');
      const shielded = await withTimeout(
        api.getShieldedAddresses(),
        READ_TIMEOUT_MS,
        'getShieldedAddresses()',
      );
      if (shielded?.shieldedAddress) return shielded.shieldedAddress;
      failures.push(`getShieldedAddresses() returned ${JSON.stringify(shielded)}`);
    } catch (err) {
      failures.push(`getShieldedAddresses() threw: ${describeError(err)}`);
    }
  }

  if (api.getUnshieldedAddress) {
    try {
      onStep?.('Reading unshielded address…');
      const unshielded = await withTimeout(
        api.getUnshieldedAddress(),
        READ_TIMEOUT_MS,
        'getUnshieldedAddress()',
      );
      if (unshielded?.unshieldedAddress) return unshielded.unshieldedAddress;
      failures.push(`getUnshieldedAddress() returned ${JSON.stringify(unshielded)}`);
    } catch (err) {
      failures.push(`getUnshieldedAddress() threw: ${describeError(err)}`);
    }
  }

  return null;
}

/** DApp connector errors carry `code`/`reason` alongside `message`. */
function describeError(err: unknown): string {
  const e = err as { code?: string; reason?: string; message?: string };
  return [e?.code, e?.reason ?? e?.message].filter(Boolean).join(' — ') || String(err);
}

/**
 * Full self-service diagnostic: probes the injected surface, then attempts a
 * real connect and records exactly where it stops. Produces copyable text so a
 * failure can be reported without opening DevTools.
 */
export async function runDiagnostic(networkId: string): Promise<string> {
  const lines: string[] = [];
  const t0 = Date.now();
  const stamp = () => `+${((Date.now() - t0) / 1000).toFixed(1)}s`;
  const log = (msg: string) => lines.push(`[${stamp()}] ${msg}`);

  log(`ShadowVote wallet diagnostic — requesting network "${networkId}"`);
  log(`page: ${window.location.origin} | secure context: ${window.isSecureContext}`);
  log(`userAgent: ${navigator.userAgent}`);

  const midnightPresent = Boolean(midnightRoot());
  log(`window.midnight present: ${midnightPresent}`);
  log(`window.midnight keys: ${rawMidnightKeys().join(', ') || '(none)'}`);
  log(`window.cardano keys: ${cardanoKeys().join(', ') || '(none)'}`);

  const wallets = discoverWallets();
  log(`usable connectors: ${wallets.length}`);
  for (const w of wallets) {
    log(
      `  - ${w.name} | key=${w.key} | generation=${w.generation} | apiVersion=${w.apiVersion ?? '?'} | rdns=${w.rdns ?? '?'}`,
    );
    log(`    InitialAPI members: ${describeApi(rawApi(w.key)).join(', ') || '(none)'}`);
  }

  if (!wallets.length) {
    log('STOP: nothing to connect to.');
    return lines.join('\n');
  }

  const wallet = wallets[0];
  const api = rawApi(wallet.key);

  if (!isModern(api)) {
    log('Connector is legacy (enable/state); skipping modern probe.');
    return lines.join('\n');
  }

  log(`calling connect("${networkId}")… approve in the wallet popup if it appears`);
  let connected: ConnectedApi;
  try {
    connected = await withTimeout(api.connect(networkId), CONNECT_TIMEOUT_MS, 'connect()');
    log('connect() RESOLVED');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log(`connect() FAILED: ${message}`);
    const valid = parseValidNetworks(message);
    if (valid) log(`  -> wallet's valid networks: ${valid.join(', ')}`);
    if (isChannelDead(message)) log('  -> dead MV3 channel; a page reload is required');
    if (err instanceof WalletTimeoutError)
      log('  -> never answered: popup dismissed, or background worker asleep');
    return lines.join('\n');
  }

  log(`ConnectedAPI members: ${describeApi(connected).join(', ') || '(none)'}`);

  // Permissions must be granted before address reads, so exercise the same
  // order the real connect flow uses.
  if (connected.hintUsage) {
    try {
      log('calling hintUsage(connect methods) — approve the permission prompt…');
      await withTimeout(connected.hintUsage(CONNECT_METHODS), CONNECT_TIMEOUT_MS, 'hintUsage()');
      log('hintUsage() RESOLVED (permissions granted)');
    } catch (err) {
      log(`hintUsage() FAILED: ${describeError(err)}`);
    }
  } else {
    log('hintUsage(): NOT PRESENT');
  }

  for (const method of ['getShieldedAddresses', 'getUnshieldedAddress', 'getConnectionStatus']) {
    const fn = (connected as unknown as Record<string, unknown>)[method];
    if (typeof fn !== 'function') {
      log(`${method}: NOT PRESENT`);
      continue;
    }
    try {
      const result = await withTimeout(
        (fn as () => Promise<unknown>).call(connected),
        READ_TIMEOUT_MS,
        method,
      );
      log(`${method} -> ${JSON.stringify(result)}`);
    } catch (err) {
      log(`${method} FAILED: ${describeError(err)}`);
    }
  }

  return lines.join('\n');
}

/**
 * Connect to a discovered wallet on ONE network.
 *
 * Deliberately makes a single `connect()` call and never falls back to another
 * network. Lace tears down its message channel after rejecting an id — every
 * subsequent call on the same injected object then fails with "object can no
 * longer be used" or hangs forever. So a wrong first guess used to poison the
 * correct second attempt. Instead we ask once, and when the wallet rejects the
 * id it hands us its own list of valid networks, which the UI offers directly.
 */
export async function connectWallet(
  wallet: DiscoveredWallet,
  { networkId = NETWORK_IDS[0], onStep, token }: ConnectOptions = {},
): Promise<WalletHandle> {
  const api = rawApi(wallet.key);

  if (isModern(api)) {
    checkCancelled(token);

    let connected: ConnectedApi;
    try {
      onStep?.(`Requesting approval on "${networkId}"…`);
      connected = await withTimeout(
        api.connect(networkId),
        CONNECT_TIMEOUT_MS,
        `connect("${networkId}")`,
      );
    } catch (err) {
      if (err instanceof WalletCancelledError || err instanceof WalletTimeoutError) throw err;
      const message = err instanceof Error ? err.message : String(err);

      const valid = parseValidNetworks(message);
      if (valid) {
        throw new WalletNetworkError(
          `This wallet rejected the network "${networkId}".`,
          valid.filter((n) => n !== networkId),
        );
      }
      if (isChannelDead(message)) throw new WalletChannelDeadError(message);
      if (looksRejected(err)) throw new WalletRejectedError(message);
      throw new Error(message);
    }

    checkCancelled(token);

    // Permissions first — some wallets reject address reads attempted before
    // hintUsage. A failure here is NOT fatal: the wallet may already permit
    // reads, so try them anyway and let them report their own errors.
    const failures: string[] = [];
    try {
      await grantPermissions(connected, CONNECT_METHODS, onStep);
    } catch (err) {
      failures.push(`hintUsage() failed: ${describeError(err)}`);
    }

    checkCancelled(token);

    const address = await readModernAddress(connected, onStep, failures);
    if (!address) {
      // A locked wallet also reports as "Rejected", but the fix is completely
      // different — say so plainly rather than blaming permissions.
      if (failures.some((f) => looksLocked(f))) {
        throw new WalletLockedError(
          'Your wallet is locked. Open the Lace extension, unlock it, then try again.',
        );
      }
      // Connected fine, so the network was right — the address getters are the
      // problem. Report WHY each one failed, plus the API surface.
      if (failures.some((f) => /reject/i.test(f))) {
        throw new WalletRejectedError(
          `The wallet declined to share an address.\n${failures.join('\n')}`,
        );
      }
      throw new Error(
        `Connected on "${networkId}" but no address was returned.\n\n` +
          `${failures.join('\n') || 'No address method was available.'}\n\n` +
          `ConnectedAPI exposes: ${describeApi(connected).join(', ') || '(nothing enumerable)'}`,
      );
    }

    // The address HRP is ground truth for which network we landed on.
    let reported = networkFromAddress(address) ?? networkId;
    if (!networkFromAddress(address)) {
      try {
        onStep?.('Confirming network…');
        const status = await withTimeout(
          connected.getConnectionStatus?.() ?? Promise.resolve(undefined),
          READ_TIMEOUT_MS,
          'getConnectionStatus()',
        );
        if (status?.networkId) reported = status.networkId;
      } catch {
        /* status is optional — never fail the connection over it */
      }
    }

    return {
      address,
      networkId: reported,
      api: connected,
      refresh: async () => {
        const next = await readModernAddress(connected);
        if (!next) throw new Error('Wallet is locked or disconnected');
        return next;
      },
    };
  }

  if (isLegacy(api)) {
    try {
      onStep?.('Requesting approval…');
      const enabled = await withTimeout(api.enable(), CONNECT_TIMEOUT_MS, 'enable()');
      checkCancelled(token);

      onStep?.('Reading address…');
      const state = await withTimeout(enabled.state(), READ_TIMEOUT_MS, 'state()');
      const address = state.address ?? state.addressLegacy;
      if (!address) throw new Error('Wallet returned no address. Unlock it and try again.');

      return {
        address,
        networkId: networkFromAddress(address),
        api: null, // legacy connector: cannot drive midnight-js providers
        refresh: async () => {
          const next = await withTimeout(enabled.state(), READ_TIMEOUT_MS, 'state()');
          const addr = next.address ?? next.addressLegacy;
          if (!addr) throw new Error('Wallet is locked or disconnected');
          return addr;
        },
      };
    } catch (err) {
      if (err instanceof WalletCancelledError || err instanceof WalletTimeoutError) throw err;
      if (looksRejected(err)) {
        throw new WalletRejectedError(
          err instanceof Error ? err.message : 'Connection rejected in the wallet',
        );
      }
      throw err;
    }
  }

  throw new Error('That wallet no longer exposes a usable Midnight connector.');
}
