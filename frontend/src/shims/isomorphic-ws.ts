// Shim for `isomorphic-ws`.
//
// The indexer provider does `import { WebSocket } from 'isomorphic-ws'`, but
// that package's browser build only provides a DEFAULT export. Rollup warns
// ("WebSocket is not exported by isomorphic-ws/browser.js") and the named
// import lands as undefined at runtime, breaking the indexer's subscription.
//
// The browser already has a perfectly good WebSocket, so re-export it under
// both shapes and alias the package to this file (see vite.config.ts).

const NativeWebSocket = globalThis.WebSocket;

export { NativeWebSocket as WebSocket };
export default NativeWebSocket;
