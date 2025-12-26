'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
const TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x803d7ADD44B238F40106B1C4439ecAcd05910dc7') as `0x${string}`;

// ERC7984 ABI (simplified)
const ERC7984_ABI = [
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
    outputs: [],
  },
  {
    name: 'decryptBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'handle', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint64' }],
  },
] as const;

interface UseERC7984WagmiProps {
  instance?: any; // FHEVM instance - will be typed properly later
  hasSignature?: boolean; // Whether user has created decryption signature
}

export function useERC7984Wagmi({ instance, hasSignature = false }: UseERC7984WagmiProps = {}) {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const [handle, setHandle] = useState<`0x${string}` | null>(null);
  const [clear, setClear] = useState<bigint | null>(null);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Read balance handle
  const { data: balanceHandle, refetch: refreshBalanceHandle } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC7984_ABI,
    functionName: 'confidentialBalanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  useEffect(() => {
    if (balanceHandle) {
      setHandle(balanceHandle as `0x${string}`);
    }
  }, [balanceHandle]);

  // Decrypt balance handle
  const decryptBalanceHandle = useCallback(async () => {
    if (!handle || !instance || !address) {
      return;
    }

    try {
      setError(null);
      
      // Check if signature is required and exists
      if (instance && typeof instance.requiresSignature === 'function') {
        const requiresSig = await instance.requiresSignature(handle, TOKEN_ADDRESS);
        if (requiresSig && !hasSignature) {
          throw new Error('Decryption signature required. Please create signature first.');
        }
      }
      
      // Decrypt using FHEVM instance
      if (instance && typeof instance.decrypt === 'function') {
        const decrypted = await instance.decrypt(handle, TOKEN_ADDRESS);
        
        if (decrypted && typeof decrypted === 'bigint') {
          setClear(decrypted);
          setIsDecrypted(true);
        } else if (decrypted && typeof decrypted === 'object' && TOKEN_ADDRESS in decrypted) {
          const value = decrypted[TOKEN_ADDRESS];
          setClear(BigInt(value));
          setIsDecrypted(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Decryption failed'));
      setIsDecrypted(false);
    }
  }, [handle, instance, address, hasSignature]);

  // Transfer tokens
  const transferTokens = useCallback(
    async (to: `0x${string}`, amount: bigint) => {
      if (!instance || !address) {
        throw new Error('Not connected');
      }

      try {
        setError(null);

        // Encrypt amount using FHEVM instance
        if (instance && typeof instance.encrypt === 'function') {
          const encrypted = await instance.encrypt(amount, TOKEN_ADDRESS);

          if (!encrypted || !encrypted.handle) {
            throw new Error('Encryption failed');
          }

          // Write contract
          writeContract({
            address: TOKEN_ADDRESS,
            abi: ERC7984_ABI,
            functionName: 'confidentialTransfer',
            args: [
              to, 
              encrypted.handle as `0x${string}`, 
              encrypted.proof || '0x' as `0x${string}`
            ],
          });
        } else {
          throw new Error('FHEVM instance not properly initialized');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Transfer failed'));
        throw err;
      }
    },
    [instance, address, writeContract]
  );

  // Check if user can transfer
  const canTransfer = useCallback(
    (amount: bigint): boolean => {
      if (!clear) return false;
      return clear >= amount;
    },
    [clear]
  );

  const isProcessing = isPending || isConfirming;

  return {
    handle,
    clear,
    isDecrypted,
    error,
    refreshBalanceHandle,
    decryptBalanceHandle,
    transferTokens,
    canTransfer,
    isProcessing,
    tokenAddress: TOKEN_ADDRESS,
  };
}
