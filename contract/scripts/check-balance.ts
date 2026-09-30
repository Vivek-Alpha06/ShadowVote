import { firstValueFrom } from 'rxjs';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { NetworkId as ZswapNetworkId } from '@midnight-ntwrk/zswap';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

const NETWORK_ID    = process.env.MN_NETWORK_ID    ?? 'preview';
const NODE_URL      = process.env.MN_NODE          ?? `https://rpc.${NETWORK_ID}.midnight.network`;
const INDEXER_URL   = process.env.MN_INDEXER       ?? `https://indexer.${NETWORK_ID}.midnight.network/api/v4/graphql`;
const INDEXER_WS    = process.env.MN_INDEXER_WS    ?? `wss://indexer.${NETWORK_ID}.midnight.network/api/v4/graphql/ws`;
const PROOF_SERVER  = process.env.MN_PROOF_SERVER  ?? 'http://127.0.0.1:6300';

const WALLET_SEED   = process.env.SHADOWVOTE_WALLET_SEED;

async function main() {
  if (!WALLET_SEED) throw new Error('SHADOWVOTE_WALLET_SEED not set in .env');
  setNetworkId(NETWORK_ID);
  console.log(`Connecting wallet from seed and syncing with ${NETWORK_ID} indexer …`);
  
  const wallet = await WalletBuilder.buildFromSeed(
    INDEXER_URL,
    INDEXER_WS,
    PROOF_SERVER,
    NODE_URL,
    WALLET_SEED,
    ZswapNetworkId.TestNet,
  );
  
  wallet.start();

  const sub = wallet.state().subscribe((state) => {
    console.log('\n[Wallet state update]');
    console.log('  Balances:', JSON.stringify(state.balances));
    if (state.coins && state.coins.length > 0) {
      console.log('  Coins count:', state.coins.length);
    }
  });

  // Wait 15 seconds for sync to complete
  await new Promise((resolve) => setTimeout(resolve, 15000));
  
  sub.unsubscribe();
  await wallet.close();
}

main().catch((err) => {
  console.error('Failed to get balance:', err);
  process.exit(1);
});
