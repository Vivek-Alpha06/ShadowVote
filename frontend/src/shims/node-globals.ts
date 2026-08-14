// Node globals that browsers don't provide.
//
// Parts of the Midnight SDK's dependency tree (pino, the subsquid codecs, and
// buffer-handling inside the ledger bindings) reference Node globals directly
// rather than importing them — `Buffer.from(...)`, `process.env`, `global`.
// In a browser those are undefined and you get "Buffer is not defined" the
// moment that code path runs.
//
// Aliasing the `buffer` PACKAGE (vite.config.ts) only fixes explicit
// `import ... from 'buffer'`. Code that touches the bare global needs the
// global to actually exist, which is what this file does.
//
// MUST be imported before anything else — see main.tsx.

import { Buffer } from 'buffer';

// Typed loosely on purpose: @types/node describes `process` as the full Node
// Process (66+ members), and this shim only needs the handful browsers' worth
// that these libraries actually touch.
const g = globalThis as Record<string, unknown>;

if (!g.Buffer) g.Buffer = Buffer;
if (!g.global) g.global = globalThis;

if (!g.process) {
  g.process = {
    env: {},
    // Some libraries schedule work with nextTick; a microtask is the closest
    // browser equivalent and preserves "runs before the next macrotask".
    nextTick: (fn: () => void) => void Promise.resolve().then(fn),
    browser: true,
    version: '',
  };
}

export {};
