import { MidnightBech32m } from '@midnight-ntwrk/wallet-sdk-address-format';

const cpkStr = 'mn_shield-cpk_test1jtzcfypwa6wr9vztrzpjyf26h8lx0sv4u4hxr7exx9g7ecznensqrmd2vh';

try {
  const parsed = MidnightBech32m.parse(cpkStr);
  
  // Construct unshielded address for Preview/Test
  const unshieldedPreview = new MidnightBech32m('addr', 'test', parsed.data);
  console.log('PREVIEW UNSHIELDED ADDRESS:', unshieldedPreview.asString());
  
  // Construct unshielded address for Preprod
  const unshieldedPreprod = new MidnightBech32m('addr', 'preprod', parsed.data);
  console.log('PREPROD UNSHIELDED ADDRESS:', unshieldedPreprod.asString());
} catch (err) {
  console.error('Failed to derive unshielded address:', err);
}
