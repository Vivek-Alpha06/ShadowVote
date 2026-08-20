import { firstValueFrom } from 'rxjs';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { NetworkId as ZswapNetworkId } from '@midnight-ntwrk/zswap';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

const NODE_URL      = 'https://rpc.preprod.midnight.network';
const INDEXER_URL   = 'https://indexer.preprod.midnight.network/api/v3/graphql';
const INDEXER_WS    = 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws';
const PROOF_SERVER  = 'http://127.0.0.1:6300';

const WALLET_SEED   = process.env.SHADOWVOTE_WALLET_SEED ?? 'cd942e30688335aa0586e32d964d7388fbf2e43cad00d81cd9439a8985256ba5';

async function main() {
  setNetworkId('preprod');
  console.log('Building wallet from seed and syncing with the indexer on Preview …');
  
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
