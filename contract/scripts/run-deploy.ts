import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// Set the network ID immediately before importing any other Midnight packages.
// This prevents ESM hoisting issues where packages capture the default network ID.
const networkId = process.env.MN_NETWORK_ID ?? 'preprod';
console.log(`Setting global network ID to: ${networkId}`);
setNetworkId(networkId);

try {
  await import('./deploy.js');
} catch (err: any) {
  console.error('Fatal deployment error:', err);
  if (err && typeof err === 'object') {
    console.error('Error properties:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  }
  process.exit(1);
}
