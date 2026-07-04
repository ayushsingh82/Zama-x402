/**
 * Minimal ERC7984 ABI fragment shared by useERC7984Wagmi and useShieldedPool — single source of
 * truth so both hooks don't duplicate (and risk drifting on) the same function signatures.
 */
export const ERC7984_ABI = [
  {
    name: 'confidentialBalanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'confidentialTransfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'encryptedAmount', type: 'bytes32' },
      { name: 'proof', type: 'bytes' },
    ],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'setOperator',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'until', type: 'uint48' },
    ],
    outputs: [],
  },
  {
    name: 'isOperator',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'holder', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'decryptBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'handle', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint64' }],
  },
] as const;
