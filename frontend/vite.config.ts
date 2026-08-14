import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { debugLogPlugin } from './vite-plugin-debug-log';

const shim = (name: string) => fileURLToPath(new URL(`./src/shims/${name}`, import.meta.url));

// The Midnight SDK ships WASM (compact-runtime, ledger, zswap) and uses
// top-level await, and several of its transitive deps expect Node's Buffer /
// global. Browsers provide none of that, hence the plugins + shims below.
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait(), debugLogPlugin()],

  server: {
    port: 5173,
    /**
     * The proof server sends no CORS headers and does not answer preflight, so
     * a direct browser POST to :6300 would be blocked. Proxying it makes those
     * requests same-origin and sidesteps CORS entirely.
     *
     * No COOP/COEP headers here on purpose: cross-origin isolation is only
     * needed for SharedArrayBuffer, proving happens in the proof server rather
     * than in browser WASM threads, and `require-corp` would block every
     * cross-origin response that lacks CORP — including the wallet's indexer.
     */
    proxy: {
      '/proof-server': {
        target: 'http://localhost:6300',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proof-server/, ''),
        timeout: 300_000, // proving is slow
        proxyTimeout: 300_000,
      },
    },
  },

  define: {
    // Some deps reference `global` / `process.env` at module scope.
    global: 'globalThis',
    'process.env': {},
  },

  resolve: {
    alias: {
      buffer: 'buffer/',
      // Browser build exports WebSocket only as default; the indexer provider
      // imports it as a named export. See src/shims/isomorphic-ws.ts.
      'isomorphic-ws': shim('isomorphic-ws.ts'),
    },
  },

  optimizeDeps: {
    /**
     * ALL @midnight-ntwrk packages are excluded, deliberately and uniformly.
     *
     * Some of them ship WASM that esbuild cannot pre-bundle, so those must be
     * excluded. But excluding only *some* is worse than excluding none: a
     * package that is pre-bundled and the same package pulled in raw become two
     * distinct module instances, so `class X extends Y` sees `Y` as undefined
     * ("Class extends value undefined is not a constructor or null").
     * Keeping the whole scope on one side of the fence avoids the split.
     */
    exclude: [
      '@midnight-ntwrk/compact-js',
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/dapp-connector-api',
      '@midnight-ntwrk/ledger-v8',
      '@midnight-ntwrk/midnight-js-contracts',
      '@midnight-ntwrk/midnight-js-fetch-zk-config-provider',
      '@midnight-ntwrk/midnight-js-http-client-proof-provider',
      '@midnight-ntwrk/midnight-js-indexer-public-data-provider',
      '@midnight-ntwrk/midnight-js-network-id',
      '@midnight-ntwrk/midnight-js-protocol',
      '@midnight-ntwrk/midnight-js-types',
      '@midnight-ntwrk/midnight-js-utils',
      '@midnight-ntwrk/onchain-runtime-v3',
      '@midnight-ntwrk/platform-js',
      '@midnight-ntwrk/wallet-sdk-address-format',
      '@midnight-ntwrk/wallet-sdk-capabilities',
      '@midnight-ntwrk/zswap',
    ],
    /**
     * Excluding a package also opts its dependencies out of pre-bundling, so
     * any CommonJS ones lose Vite's ESM interop shim and blow up at runtime
     * ("does not provide an export named 'default'"). These are every CJS
     * package reachable from the excluded scope, so they get pre-bundled.
     *
     * The `level` family is deliberately absent: nothing imports it any more.
     * src/lib/browserPrivateStateProvider.ts replaced the level-backed private
     * state provider precisely because that CJS/Node class hierarchy was the
     * source of "Class extends value undefined".
     *
     * Every entry was verified to expose a real runtime entry point. Types-only
     * packages make Vite fail to START with "Failed to resolve entry for
     * package", so they must NOT be listed.
     */
    include: [
      '@pinojs/redact',
      '@subsquid/scale-codec',
      '@subsquid/util-internal-hex',
      '@subsquid/util-internal-json',
      'atomic-sleep',
      'base64-js',
      'buffer',
      'cross-fetch',
      'fetch-retry',
      'ieee754',
      'is-buffer',
      'object-inspect',
      'on-exit-leak-free',
      'pino',
      'pino-abstract-transport',
      'pino-std-serializers',
      'process-warning',
      'quick-format-unescaped',
      'real-require',
      'sonic-boom',
      'split2',
      'thread-stream',
    ],
    esbuildOptions: {
      target: 'esnext',
      define: { global: 'globalThis' },
    },
  },

  build: {
    target: 'esnext',
    commonjsOptions: { transformMixedEsModules: true },
  },

  worker: { format: 'es' },
});
