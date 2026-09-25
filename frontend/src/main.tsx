// FIRST import, deliberately: installs Buffer/process/global before any SDK
// module can touch them. Moving this below the others reintroduces
// "Buffer is not defined".
import './shims/node-globals';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { WalletProvider } from './hooks/useWallet';
import { ToastProvider } from './hooks/useToast';
import ErrorScreen, { showFatalError } from './components/ErrorScreen';
import { logError, logStep } from './lib/activityLog';
import './index.css';

/** Any browser's extension scheme, as it appears in a script URL or a stack. */
const EXTENSION_URL = /(?:chrome|moz|safari-web|ms-browser)-extension:\/\//i;

/**
 * Two extensions racing to install the same provider on `window`.
 *
 * Whichever loses throws "Cannot redefine property: ethereum" (or solana, …).
 * Matched by message because the throw happens inside `Object.defineProperty`,
 * where the reported filename is sometimes `<anonymous>` rather than the
 * extension's own script.
 */
const PROVIDER_CLASH = /Cannot redefine property:\s*(ethereum|solana|web3|tron|bitcoin|cardano)/i;

/**
 * Did this error come from outside ShadowVote?
 *
 * Our page shares one `window` with every extension the user has installed, and
 * their uncaught errors reach our global handler. Crypto wallets are the usual
 * culprit: several inject an EVM provider on load, and the second one to arrive
 * throws. Nothing in ShadowVote causes that and nothing in ShadowVote is broken
 * by it — the app runs fine — so painting "ShadowVote failed to start" over it
 * is both false and actively harmful: it sends people to debug our app, or to
 * conclude the site is broken, because of another extension's bug.
 *
 * These are logged rather than swallowed silently, so they are still visible in
 * the activity log if a real problem ever hides behind one.
 */
function isForeignError(source: unknown, err: unknown, message: string): boolean {
  if (typeof source === 'string' && EXTENSION_URL.test(source)) return true;
  const stack = err instanceof Error ? (err.stack ?? '') : '';
  if (EXTENSION_URL.test(stack)) return true;
  const text = err instanceof Error ? err.message : String(err ?? '');
  return PROVIDER_CLASH.test(message) || PROVIDER_CLASH.test(text);
}

// The Midnight SDK pulls in Node-oriented dependencies. If one of them fails at
// import time the app would otherwise render a blank white page with the reason
// only visible in devtools — so surface it on screen instead.
window.addEventListener('error', (e) => {
  const message = typeof e.message === 'string' ? e.message : '';
  if (isForeignError(e.filename, e.error, message)) {
    logStep(`ignored a browser-extension error: ${message || 'unknown'}`);
    return;
  }
  logError('uncaught error', e.error ?? e.message);
  showFatalError(e.error ?? e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  // A rejected promise inside the SDK is often the only trace of a stall.
  if (isForeignError(undefined, e.reason, '')) {
    logStep('ignored a browser-extension promise rejection');
    return;
  }
  logError('unhandled promise rejection', e.reason);
  showFatalError(e.reason);
});

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorScreen>
        <BrowserRouter>
          <WalletProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </WalletProvider>
        </BrowserRouter>
      </ErrorScreen>
    </React.StrictMode>,
  );
} catch (err) {
  showFatalError(err);
}
