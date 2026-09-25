// Wallet connection for ShadowVote.
//
// Real wallets only — there is no demo/offline fallback, so a connected
// address is always a real one. All connector detail lives in
// lib/midnightConnector.ts; this hook is state + lifecycle.
//
// Two rules keep the UI from wedging:
//   1. Exactly ONE connection attempt may be in flight. Firing a second
//      connect() at a wallet that is already showing an approval popup can
//      leave both promises unsettled.
//   2. Every attempt can be cancelled, and every wallet call has a deadline,
//      so "Waiting for wallet…" can never become a permanent state.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  connectWallet,
  discoverWallets,
  rawMidnightKeys,
  cardanoKeys,
  NETWORK_IDS,
  NETWORK_LABELS,
  WalletCancelledError,
  WalletChannelDeadError,
  WalletLockedError,
  WalletNetworkError,
  WalletRejectedError,
  WalletTimeoutError,
  type DiscoveredWallet,
  type WalletHandle,
} from '../lib/midnightConnector';
import { closeSession, supportedNetworks } from '../lib/chainSession';
import {
  SELECTABLE_NETWORKS,
  hasExplicitPreference,
  preferredNetwork,
  setPreferredNetwork,
  subscribeNetwork,
} from '../lib/networkPreference';

export { NETWORK_LABELS };

export const WALLET_INSTALL_URL = 'https://docs.midnight.network/guides/lace-wallet';

export type WalletErrorCode =
  | 'NOT_INSTALLED'
  | 'REJECTED'
  /** Wallet is locked — unlocking is the only fix. */
  | 'LOCKED'
  | 'TIMEOUT'
  | 'WRONG_NETWORK'
  /** Injected connector is dead — only a page reload restores it. */
  | 'CHANNEL_DEAD'
  | 'FAILED';

export interface WalletError {
  code: WalletErrorCode;
  message: string;
}

export interface WalletDiagnostics {
  midnightKeys: string[];
  cardanoKeys: string[];
  wallets: DiscoveredWallet[];
}

interface WalletState {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  /** Live ConnectedAPI for building midnight-js providers; null until connected. */
  api: unknown;
  /** Which step of the handshake is running — shown while connecting. */
  step: string | null;
  available: boolean;
  detecting: boolean;
  walletName: string | null;
  networkId: string | null;
  error: WalletError | null;
  diagnostics: WalletDiagnostics;
  /** Networks the user can force, when auto-detection picks wrong. */
  networkOptions: readonly string[];
  /**
   * The network the user has CHOSEN to use — the one the next connect() asks
   * for. Distinct from `networkId`, which is what the wallet reports it is
   * actually on; the two differ while a switch is pending, and permanently if
   * the wallet refuses the choice.
   */
  selectedNetwork: string;
  /** Networks the switcher offers. */
  selectableNetworks: readonly string[];
  /** Choose a network, tearing down anything bound to the old one. */
  switchNetwork: (networkId: string) => void;
  connect: (wallet?: DiscoveredWallet, networkId?: string) => Promise<void>;
  /** Reload the page and connect immediately — recovers a dead MV3 channel. */
  reloadAndConnect: (networkId?: string) => void;
  /** Abandon an in-flight attempt. */
  cancel: () => void;
  disconnect: () => void;
  clearError: () => void;
  rescan: () => void;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

const LS_AUTOCONNECT = 'shadowvote:wallet:autoconnect';
/** Last network that worked — tried first so reconnects need only one popup. */
const LS_NETWORK = 'shadowvote:wallet:network';
/**
 * Set immediately before a deliberate reload: "connect on this network as soon
 * as the page comes back". See reloadAndConnect().
 */
const SS_PENDING = 'shadowvote:wallet:pending';

const FAST_SCAN_MS = 8_000;
const FAST_INTERVAL_MS = 250;
const SLOW_INTERVAL_MS = 2_000;
const STATE_POLL_MS = 5_000;

const EMPTY_DIAGNOSTICS: WalletDiagnostics = { midnightKeys: [], cardanoKeys: [], wallets: [] };

function probe(): WalletDiagnostics {
  return {
    midnightKeys: rawMidnightKeys(),
    cardanoKeys: cardanoKeys(),
    wallets: discoverWallets(),
  };
}

function sameDiagnostics(a: WalletDiagnostics, b: WalletDiagnostics): boolean {
  return (
    a.midnightKeys.join() === b.midnightKeys.join() &&
    a.cardanoKeys.join() === b.cardanoKeys.join() &&
    a.wallets.map((w) => w.key).join() === b.wallets.map((w) => w.key).join()
  );
}

/**
 * The single network to request. There is no fallback list: a rejected id
 * kills the wallet's message channel, so a wrong guess would poison the next
 * attempt. We ask once and let the wallet tell us its valid ids on failure.
 */
function chosenNetwork(forced?: string): string {
  if (forced) return forced;

  // An explicit choice from the network switcher outranks everything. The user
  // saying "preview" has to beat both a remembered network and our default, or
  // the switcher would silently not work.
  if (hasExplicitPreference()) return preferredNetwork();

  // A network remembered by an older build can be one this build ships no
  // contract for. That case does not fail loudly: the wallet connects fine and
  // the app then shows an empty election list with no error, which reads as
  // "the product is broken". Ignore a remembered network we cannot serve.
  const remembered = localStorage.getItem(LS_NETWORK);
  if (remembered && supportedNetworks().includes(remembered)) return remembered;
  if (remembered) localStorage.removeItem(LS_NETWORK);

  return preferredNetwork();
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(true);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<string | null>(null);
  const [error, setError] = useState<WalletError | null>(null);
  const [diagnostics, setDiagnostics] = useState<WalletDiagnostics>(EMPTY_DIAGNOSTICS);
  /** Live ConnectedAPI — what the midnight-js provider stack is built from. */
  const [api, setApi] = useState<unknown>(null);
  // Starts as our best-known list; replaced by the wallet's own list the first
  // time it rejects an id, since that is authoritative.
  const [networkOptions, setNetworkOptions] = useState<readonly string[]>(NETWORK_IDS);
  // The user's choice. Mirrored into state so the switcher re-renders; the
  // localStorage value stays the source of truth, since chosenNetwork() runs
  // outside React.
  const [selectedNetwork, setSelectedNetwork] = useState<string>(() => preferredNetwork());

  const handleRef = useRef<WalletHandle | null>(null);
  /** Non-null while an attempt is in flight; also the cancellation token. */
  const inFlightRef = useRef<{ cancelled: boolean } | null>(null);
  const [rescanNonce, setRescanNonce] = useState(0);

  const available = diagnostics.wallets.length > 0;

  const rescan = useCallback(() => {
    setDetecting(true);
    setRescanNonce((n) => n + 1);
  }, []);

  useEffect(() => subscribeNetwork(() => setSelectedNetwork(preferredNetwork())), []);

  // --- keep scanning for injected wallets ----------------------------------
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const startedAt = Date.now();

    const tick = () => {
      if (cancelled) return;

      const next = probe();
      setDiagnostics((prev) => (sameDiagnostics(prev, next) ? prev : next));

      const elapsed = Date.now() - startedAt;
      if (next.wallets.length > 0 || elapsed >= FAST_SCAN_MS) setDetecting(false);

      timer = window.setTimeout(tick, elapsed < FAST_SCAN_MS ? FAST_INTERVAL_MS : SLOW_INTERVAL_MS);
    };

    tick();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [rescanNonce]);

  // --- keep the address in sync with the extension -------------------------
  useEffect(() => {
    if (!address) return;
    const id = window.setInterval(async () => {
      const handle = handleRef.current;
      if (!handle) return;
      try {
        const next = await handle.refresh();
        setAddress((prev) => (prev === next ? prev : next));
      } catch {
        handleRef.current = null;
        setAddress(null);
        setNetworkId(null);
      }
    }, STATE_POLL_MS);
    return () => window.clearInterval(id);
  }, [address]);

  const attach = useCallback((wallet: DiscoveredWallet, handle: WalletHandle) => {
    handleRef.current = handle;
    setApi(handle.api);
    setAddress(handle.address);
    setNetworkId(handle.networkId);
    setWalletName(wallet.name);
    localStorage.setItem(LS_AUTOCONNECT, '1');
    if (handle.networkId) localStorage.setItem(LS_NETWORK, handle.networkId);
  }, []);

  const cancel = useCallback(() => {
    if (inFlightRef.current) inFlightRef.current.cancelled = true;
    inFlightRef.current = null;
    setConnecting(false);
    setStep(null);
  }, []);

  const connect = useCallback(
    async (preferred?: DiscoveredWallet, forcedNetwork?: string) => {
      // Rule 1: never let two attempts race the same wallet.
      if (inFlightRef.current) return;

      setError(null);
      const found = probe();
      setDiagnostics(found);

      const wallet = preferred ?? found.wallets[0];
      if (!wallet) {
        setDetecting(false);
        setError({
          code: 'NOT_INSTALLED',
          message:
            'No Midnight wallet responded on this page. Make sure your wallet extension is installed and unlocked, then scan again.',
        });
        return;
      }

      const token = { cancelled: false };
      inFlightRef.current = token;
      setConnecting(true);
      setStep('Opening wallet…');

      const requested = chosenNetwork(forcedNetwork);
      try {
        const handle = await connectWallet(wallet, {
          networkId: requested,
          onStep: (s) => {
            if (!token.cancelled) setStep(s);
          },
          token,
        });
        if (token.cancelled) return;
        attach(wallet, handle);
      } catch (err) {
        if (token.cancelled || err instanceof WalletCancelledError) return;

        if (err instanceof WalletNetworkError) {
          // The wallet told us which ids it accepts — trust that over our list.
          if (err.validNetworks?.length) setNetworkOptions(err.validNetworks);
          localStorage.removeItem(LS_NETWORK);
          setError({
            code: 'WRONG_NETWORK',
            message: `${err.message} Pick one of the networks it accepts below.`,
          });
        } else if (err instanceof WalletChannelDeadError) {
          setError({
            code: 'CHANNEL_DEAD',
            message:
              'The wallet closed its connection channel, so it can’t answer until the page is reloaded. Reload, then connect once on the right network.',
          });
        } else if (err instanceof WalletLockedError) {
          setError({ code: 'LOCKED', message: err.message });
        } else if (err instanceof WalletRejectedError) {
          // Keep the wallet's own wording — it names which step was declined.
          setError({ code: 'REJECTED', message: err.message });
        } else if (err instanceof WalletTimeoutError) {
          setError({
            code: 'TIMEOUT',
            message: `${err.message}. Close any open wallet popup and reload the page before trying again.`,
          });
        } else {
          setError({
            code: 'FAILED',
            message: err instanceof Error ? err.message : 'Could not connect to the wallet.',
          });
        }
        // A failed attempt shouldn't silently retry on the next page load.
        localStorage.removeItem(LS_AUTOCONNECT);
      } finally {
        // Only the CURRENT attempt may touch shared state. A cancelled attempt
        // that settles later must not clear the flag or the step belonging to
        // the attempt that replaced it — doing so leaves inFlightRef set while
        // the UI looks idle, and every later click early-returns forever.
        if (inFlightRef.current === token) {
          inFlightRef.current = null;
          setConnecting(false);
          setStep(null);
        }
      }
    },
    [attach],
  );

  /**
   * Reload the page, then connect the instant it comes back.
   *
   * Under Manifest V3 the wallet's service worker sleeps, which kills the
   * message channel behind the object injected at page load. Nothing on the
   * page can revive it — `connect()` then hangs or reports "object can no
   * longer be used". Reloading re-injects a fresh connector, and connecting
   * immediately means we use it before the worker can idle out again.
   */
  const reloadAndConnect = useCallback((network?: string) => {
    sessionStorage.setItem(SS_PENDING, network ?? chosenNetwork());
    window.location.reload();
  }, []);

  /**
   * Choose a different network.
   *
   * Everything bound to the old chain has to go: the chain session holds
   * providers, private state and a contract that only exist there, and a
   * remembered "last network that worked" would otherwise pull the next
   * auto-connect straight back to the network the user just left.
   *
   * When a wallet is already connected this goes through reloadAndConnect
   * rather than calling connect() again. Asking a live connector for a second
   * network is what kills Lace's message channel, after which nothing works
   * until a reload — so we reload deliberately, on our terms, instead of
   * discovering it the hard way.
   */
  const switchNetwork = useCallback(
    (next: string) => {
      if (next === preferredNetwork() && (!networkId || next === networkId)) return;

      setPreferredNetwork(next);
      setSelectedNetwork(next);
      closeSession();
      localStorage.removeItem(LS_NETWORK);

      if (handleRef.current || address) {
        reloadAndConnect(next);
        return;
      }
      // Not connected: nothing to tear down, and the next connect() will read
      // the new preference on its own.
      cancel();
      setError(null);
    },
    [address, networkId, reloadAndConnect, cancel],
  );

  // --- connect as soon as a wallet appears, when asked to ------------------
  const triedAutoRef = useRef(false);
  useEffect(() => {
    if (triedAutoRef.current || address) return;
    if (inFlightRef.current) return; // never race a manual click

    const wallet = diagnostics.wallets[0];
    if (!wallet) return;

    // 1. A deliberate reload-and-connect: fire straight away, while the
    //    freshly injected connector is still live.
    const pending = sessionStorage.getItem(SS_PENDING);
    if (pending) {
      sessionStorage.removeItem(SS_PENDING);
      triedAutoRef.current = true;
      void connect(wallet, pending);
      return;
    }

    // 2. Otherwise only reconnect on a network we KNOW worked before.
    //    Guessing here would burn the channel before the user can click.
    if (localStorage.getItem(LS_AUTOCONNECT) !== '1') return;
    const remembered = localStorage.getItem(LS_NETWORK);
    if (!remembered) return;

    triedAutoRef.current = true;
    void connect(wallet, remembered);
  }, [diagnostics.wallets, address, connect]);

  const disconnect = useCallback(() => {
    cancel();
    handleRef.current = null;
    triedAutoRef.current = true; // don't immediately auto-reconnect
    setAddress(null);
    setApi(null);
    setNetworkId(null);
    setError(null);
    localStorage.removeItem(LS_AUTOCONNECT);
  }, [cancel]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<WalletState>(
    () => ({
      address,
      connected: Boolean(address),
      connecting,
      api,
      step,
      available,
      detecting,
      walletName,
      networkId,
      error,
      diagnostics,
      networkOptions,
      selectedNetwork,
      selectableNetworks: SELECTABLE_NETWORKS,
      switchNetwork,
      connect,
      reloadAndConnect,
      cancel,
      disconnect,
      clearError,
      rescan,
    }),
    [
      address,
      connecting,
      api,
      step,
      available,
      detecting,
      walletName,
      networkId,
      error,
      diagnostics,
      networkOptions,
      selectedNetwork,
      switchNetwork,
      connect,
      reloadAndConnect,
      cancel,
      disconnect,
      clearError,
      rescan,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
