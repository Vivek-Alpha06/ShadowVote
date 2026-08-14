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
import { logError } from './lib/activityLog';
import './index.css';

// The Midnight SDK pulls in Node-oriented dependencies. If one of them fails at
// import time the app would otherwise render a blank white page with the reason
// only visible in devtools — so surface it on screen instead.
window.addEventListener('error', (e) => {
  logError('uncaught error', e.error ?? e.message);
  showFatalError(e.error ?? e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  // A rejected promise inside the SDK is often the only trace of a stall.
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
