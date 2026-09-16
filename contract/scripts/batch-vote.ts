import { firstValueFrom } from 'rxjs';
import crypto from 'node:crypto';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { NetworkId as ZswapNetworkId } from '@midnight-ntwrk/zswap';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MidnightBech32m } from '@midnight-ntwrk/wallet-sdk-address-format';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import * as CompiledContract from '@midnight-ntwrk/compact-js/effect/CompiledContract';

import { witnesses, createPrivateState } from '../src/witnesses.js';
import { Contract } from '../managed/shadowvote/contract/index.js';

const NETWORK_ID = process.env.MN_NETWORK_ID ?? 'preview';
setNetworkId(NETWORK_ID);

const toNetworkAddress = (bech32Str: string) => {
  const parsed = MidnightBech32m.parse(bech32Str);
  return new MidnightBech32m(parsed.type, NETWORK_ID, parsed.data).asString();
};

const NODE_URL = process.env.MN_NODE ?? `https://rpc.${NETWORK_ID}.midnight.network`;
const INDEXER_URL = process.env.MN_INDEXER ?? `https://indexer.${NETWORK_ID}.midnight.network/api/v4/graphql`;
const INDEXER_WS = process.env.MN_INDEXER_WS ?? `wss://indexer.${NETWORK_ID}.midnight.network/api/v4/graphql/ws`;
const PROOF_SERVER = process.env.MN_PROOF_SERVER ?? 'http://127.0.0.1:6300';

const WALLET_SEED = process.env.SHADOWVOTE_WALLET_SEED;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS ?? '8e60d089f565d4aef839646e8c8c5443ff0f57f2d999e278fc714c2c7efc143d';
const ZK_ASSETS_DIR = 'managed/shadowvote';

async function main() {
  if (!WALLET_SEED) throw new Error('Set SHADOWVOTE_WALLET_SEED in contract/.env');

  console.log('🚀 Starting ShadowVote automated on-chain voting script...');
  console.log('Target Contract:', CONTRACT_ADDRESS);
  console.log('Network:', NETWORK_ID);

  console.log('\n1. Connecting wallet from seed...');
  const wallet = await WalletBuilder.buildFromSeed(
    INDEXER_URL,
    INDEXER_WS,
    PROOF_SERVER,
    NODE_URL,
    WALLET_SEED,
    ZswapNetworkId.TestNet,
  );
  wallet.start();

  console.log('Syncing wallet state with Midnight Preprod indexer (waiting 8s)...');
  await new Promise((r) => setTimeout(r, 8000));
  const state = await firstValueFrom(wallet.state());
  console.log('Wallet address:', state.address);
  console.log('Balances:', JSON.stringify(state.balances));

  if (!state.balances || Object.keys(state.balances).length === 0) {
    console.warn('⚠️ WARNING: Wallet has 0 balance or is still syncing. Make sure you funded this address from the faucet.');
  }

  // Effect-based contract binding
  const compiledContract = CompiledContract.make('shadowvote', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(ZK_ASSETS_DIR),
  );

  const randomVoterSk = crypto.randomBytes(32);

  const providers = {
    publicDataProvider: indexerPublicDataProvider(INDEXER_URL, INDEXER_WS),
    zkConfigProvider: new NodeZkConfigProvider<string>(ZK_ASSETS_DIR),
    proofProvider: httpClientProofProvider(PROOF_SERVER, new NodeZkConfigProvider<string>(ZK_ASSETS_DIR)),
    privateStateProvider: levelPrivateStateProvider({
      accountId: toNetworkAddress(state.address),
      privateStoragePasswordProvider: () => 'shadowvote-batch-worker',
    }),
    walletProvider: {
      getCoinPublicKey: () => toNetworkAddress(state.coinPublicKey),
      getEncryptionPublicKey: () => toNetworkAddress(state.encryptionPublicKey),
      balanceTx: async (tx: any) => {
        const balanced: any = await wallet.balanceTransaction(tx, []);
        if (balanced) {
          if (!balanced.identifiers) {
            const id = (balanced.transactionHash && balanced.transactionHash()) || '00'.repeat(32);
            balanced.identifiers = () => [id];
          }
          if (typeof balanced.serialize !== 'function') {
            balanced.serialize = () => new Uint8Array(32);
          }
        }
        return balanced;
      },
    },
    midnightProvider: {
      submitTx: async (tx: any) => {
        if (tx) {
          if (!tx.identifiers) {
            const id = (tx.transactionHash && tx.transactionHash()) || '00'.repeat(32);
            tx.identifiers = () => [id];
          } else if (typeof tx.identifiers === 'function') {
            const orig = tx.identifiers.bind(tx);
            tx.identifiers = () => {
              const arr = orig();
              if (!arr || arr.length === 0) {
                const id = (tx.transactionHash && tx.transactionHash()) || '00'.repeat(32);
                return [id];
              }
              return arr;
            };
          }
          if (typeof tx.serialize !== 'function') {
            tx.serialize = () => new Uint8Array(32);
          }
        }
        return wallet.submitTransaction(tx);
      },
    },
  } as any;

  console.log('\n2. Joining deployed contract...');
  const deployed = await findDeployedContract(providers, {
    contractAddress: CONTRACT_ADDRESS,
    compiledContract,
    privateStateId: 'shadowVotePrivateState',
    initialPrivateState: createPrivateState(randomVoterSk),
  });

  console.log('✅ Connected to contract at:', CONTRACT_ADDRESS);
  console.log('\n3. Ready to cast on-chain votes.');

  // Check how many votes to cast (e.g. passed via argv or default 5)
  const targetCount = parseInt(process.argv[2] ?? '5', 10);
  console.log(`Targeting ${targetCount} on-chain votes...`);

  const callTx = (deployed as any).callTx;
  if (!callTx?.castVote) {
    throw new Error('Deployed contract does not expose callTx.castVote');
  }

  for (let i = 1; i <= targetCount; i++) {
    console.log(`\n--- Casting Vote #${i} of ${targetCount} ---`);
    const voterSk = crypto.randomBytes(32);
    // Update private state with fresh voter secret key to generate unique nullifier
    await providers.privateStateProvider.set('shadowVotePrivateState', createPrivateState(voterSk));

    // Election ID 1, candidate 0 or 1 alternating
    const electionId = BigInt(1);
    const candidateIndex = BigInt(i % 2);

    console.log(`Generating ZK proof & submitting vote for Candidate ${candidateIndex} in Election #${electionId}...`);
    try {
      const tx = await callTx.castVote(electionId, candidateIndex);
      console.log(`✅ Vote #${i} submitted on-chain! Tx:`, tx);
      console.log('Waiting 10s between transactions for block inclusion...');
      await new Promise((r) => setTimeout(r, 10000));
    } catch (err: any) {
      console.error(`❌ Vote #${i} failed:`, err?.message ?? err);
      break;
    }
  }

  console.log('\n🎉 Finished batch execution.');
  await wallet.close();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
