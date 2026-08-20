import { firstValueFrom } from 'rxjs';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { NetworkId as ZswapNetworkId } from '@midnight-ntwrk/zswap';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MidnightBech32m } from '@midnight-ntwrk/wallet-sdk-address-format';

const WALLET_SEED = process.env.SHADOWVOTE_WALLET_SEED ?? 'cd942e30688335aa0586e32d964d7388fbf2e43cad00d81cd9439a8985256ba5';

async function main() {
  // Set network ID to 'preprod' before deriving addresses
  setNetworkId('preprod');
  
  // Use dummy offline URLs just to initialize the builder for address derivation
  const wallet = await WalletBuilder.buildFromSeed(
    'http://127.0.0.1:9999',
    'ws://127.0.0.1:9999',
    'http://127.0.0.1:9999',
    'http://127.0.0.1:9999',
    WALLET_SEED,
    ZswapNetworkId.TestNet,
  );
  
  const state = await firstValueFrom(wallet.state());
  const parsed = MidnightBech32m.parse(state.coinPublicKey);
  const unshieldedPreprod = new MidnightBech32m('addr', 'preprod', parsed.data).asString();

  console.log('\n==================================================');
  console.log('YOUR PREPROD UNSHIELDED ADDRESS (FOR FAUCET):');
  console.log(unshieldedPreprod);
  console.log('--------------------------------------------------');
  console.log('YOUR PREPROD SHIELDED ADDRESS:');
  console.log(state.address);
  console.log('==================================================\n');
  
  await wallet.close();
}

main().catch((err) => {
  console.error('Error deriving address:', err);
  process.exit(1);
});
