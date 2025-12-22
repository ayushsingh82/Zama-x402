'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { relayer } from '@zama-fhe/relayer-sdk';

const TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x803d7ADD44B238F40106B1C4439ecAcd05910dc7') as `0x${string}`;
const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_URL || 'https://relayer.sepolia.zama.ai';

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
}

export function useERC7984Wagmi({ instance }: UseERC7984WagmiProps = {}) {
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
      const relayerInstance = relayer(RELAYER_URL);
      
      // Decrypt using relayer
      const decrypted = await relayerInstance.decrypt(
        TOKEN_ADDRESS,
        handle,
        address
      );

      if (decrypted) {
        setClear(BigInt(decrypted));
        setIsDecrypted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Decryption failed'));
      setIsDecrypted(false);
    }
  }, [handle, instance, address]);

  // Transfer tokens
  const transferTokens = useCallback(
    async (to: `0x${string}`, amount: bigint) => {
      if (!instance || !address) {
        throw new Error('Not connected');
      }

      try {
        setError(null);
        const relayerInstance = relayer(RELAYER_URL);

        // Encrypt amount
        const encrypted = await relayerInstance.encrypt(
          TOKEN_ADDRESS,
          amount.toString(),
          address
        );

        if (!encrypted) {
          throw new Error('Encryption failed');
        }

        // Write contract
        writeContract({
          address: TOKEN_ADDRESS,
          abi: ERC7984_ABI,
          functionName: 'confidentialTransfer',
          args: [to, encrypted.handle as `0x${string}`, encrypted.proof as `0x${string}`],
        });
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
