import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { NetworkId as ZswapNetworkId } from '@midnight-ntwrk/zswap';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

const WALLET_SEED = 'cd942e30688335aa0586e32d964d7388fbf2e43cad00d81cd9439a8985256ba5';

async function main() {
  setNetworkId('test');
  
  const wallet = await WalletBuilder.buildFromSeed(
    'http://127.0.0.1:9999',
    'ws://127.0.0.1:9999',
    'http://127.0.0.1:9999',
    'http://127.0.0.1:9999',
    WALLET_SEED,
    ZswapNetworkId.TestNet,
  );
  
  console.log('\n--- Wallet Instance Methods ---');
  let obj = wallet;
  while (obj) {
    console.log(Object.getOwnPropertyNames(obj).filter(p => typeof (obj as any)[p] === 'function'));
    obj = Object.getPrototypeOf(obj);
  }
  
  console.log('\n--- Wallet state value keys ---');
  console.log(Object.keys(wallet.stateValue));

  await wallet.close();
}

main().catch(console.error);
