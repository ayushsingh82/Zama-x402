/**
 * Minimal ABI fragment for ShieldedPool.sol (contract/contracts/ShieldedPool.sol), matching its
 * real function signatures exactly. `externalEuint64` is ABI-encoded as bytes32.
 */
export const SHIELDED_POOL_ABI = [
  {
    name: 'registerResource',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'resourceId', type: 'bytes32' },
      { name: 'payoutAddress', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'updatePayoutAddress',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'resourceId', type: 'bytes32' },
      { name: 'newPayoutAddress', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'depositAndRegister',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'encryptedAmount', type: 'bytes32' },
      { name: 'inputProof', type: 'bytes' },
      { name: 'commitment', type: 'bytes32' },
      { name: 'resourceId', type: 'bytes32' },
      { name: 'expiry', type: 'uint64' },
    ],
    outputs: [],
  },
  {
    name: 'isCommitmentValid',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'commitment', type: 'bytes32' },
      { name: 'resourceId', type: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'resourceId', type: 'bytes32' },
      { name: 'encryptedAmount', type: 'bytes32' },
      { name: 'inputProof', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'payoutAddressOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;
