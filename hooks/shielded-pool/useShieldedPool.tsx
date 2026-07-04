'use client';

import { useCallback, useState } from 'react';
import { useAccount, useConfig } from 'wagmi';
import { readContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { ERC7984_ABI } from '@/lib/abi/erc7984';
import { SHIELDED_POOL_ABI } from '@/lib/abi/shieldedPool';
import { generateCommitmentSecret, computeCommitment, requestShieldedSession } from '@/lib/x402-fhe/shielded-pool';
import { addPaymentHistoryEntry } from '@/lib/x402-fhe/paymentHistory';
import type { ShieldedPoolPaymentRequirement, ShieldedPoolState } from '@/lib/x402-fhe/types';
import type { FhevmAdapter } from '@/hooks/fhevm/useFhevmInstance';

const OPERATOR_GRANT_SECONDS = 60 * 60; // 1 hour operator window granted to the pool per deposit

interface DepositAndSubscribeResult {
  success: boolean;
  sessionToken?: string;
  error?: string;
}

function sessionStorageKey(resourceId: string) {
  return `shielded-session:${resourceId}`;
}

export function useShieldedPool() {
  const { address, isConnected } = useAccount();
  const config = useConfig();

  const [state, setState] = useState<ShieldedPoolState>('idle');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCommitment, setLastCommitment] = useState<`0x${string}` | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setSessionToken(null);
    setError(null);
    setLastCommitment(null);
  }, []);

  /** Restores a previously-issued session from sessionStorage, scoped per resourceId, so a page
   * refresh doesn't force re-depositing. Caller still needs to re-verify with the resource itself. */
  const restoreSession = useCallback((resourceId: string) => {
    if (typeof window === 'undefined') return null;
    const stored = window.sessionStorage.getItem(sessionStorageKey(resourceId));
    if (stored) {
      setSessionToken(stored);
      setState('success');
    }
    return stored;
  }, []);

  const depositAndSubscribe = useCallback(
    async (
      requirement: ShieldedPoolPaymentRequirement,
      instance: FhevmAdapter
    ): Promise<DepositAndSubscribeResult> => {
      if (!isConnected || !address) {
        return { success: false, error: 'Wallet not connected' };
      }

      try {
        setError(null);
        setState('requesting');

        const isOperator = await readContract(config, {
          address: requirement.asset,
          abi: ERC7984_ABI,
          functionName: 'isOperator',
          args: [address, requirement.poolAddress],
        });

        if (!isOperator) {
          setState('granting_operator');
          const until = Math.floor(Date.now() / 1000) + OPERATOR_GRANT_SECONDS;
          const operatorTxHash = await writeContract(config, {
            address: requirement.asset,
            abi: ERC7984_ABI,
            functionName: 'setOperator',
            args: [requirement.poolAddress, until],
          });
          await waitForTransactionReceipt(config, { hash: operatorTxHash });
        }

        setState('depositing');

        const secret = generateCommitmentSecret();
        const expiry = Math.floor(Date.now() / 1000) + requirement.maxTimeoutSeconds;
        const commitment = computeCommitment(secret, requirement.resourceId, expiry);

        // Per ShieldedPool.sol: the encrypted input must target the POOL address (not the token),
        // since depositAndRegister calls FHE.fromExternal on itself, not the token.
        const amount = BigInt(requirement.maxAmountRequired);
        const input = instance.raw.createEncryptedInput(requirement.poolAddress, address);
        input.add64(amount);
        const { handles, inputProof } = await input.encrypt();
        const handleHex = ('0x' +
          Array.from(handles[0] as Uint8Array)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')) as `0x${string}`;
        const proofHex = ('0x' +
          Array.from(inputProof as Uint8Array)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')) as `0x${string}`;

        const depositTxHash = await writeContract(config, {
          address: requirement.poolAddress,
          abi: SHIELDED_POOL_ABI,
          functionName: 'depositAndRegister',
          args: [handleHex, proofHex, commitment, requirement.resourceId, BigInt(expiry)],
        });
        await waitForTransactionReceipt(config, { hash: depositTxHash });

        setLastCommitment(commitment);
        setState('registering_session');

        const sessionResult = await requestShieldedSession(
          { commitment, resourceId: requirement.resourceId, expiry },
          requirement
        );

        if (!sessionResult.isValid || !sessionResult.sessionToken) {
          setState('error');
          setError(sessionResult.invalidReason || 'Session request failed');
          return { success: false, error: sessionResult.invalidReason || 'Session request failed' };
        }

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(sessionStorageKey(requirement.resourceId), sessionResult.sessionToken);
        }

        addPaymentHistoryEntry({
          scheme: 'fhe-shielded-pool',
          endpoint: requirement.resource,
          amount: requirement.maxAmountRequired,
          txHash: depositTxHash,
          resourceId: requirement.resourceId,
          commitment,
        });

        setSessionToken(sessionResult.sessionToken);
        setState('success');
        return { success: true, sessionToken: sessionResult.sessionToken };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Deposit/subscribe failed';
        setError(message);
        setState('error');
        return { success: false, error: message };
      }
    },
    [isConnected, address, config]
  );

  return {
    state,
    sessionToken,
    error,
    lastCommitment,
    depositAndSubscribe,
    restoreSession,
    reset,
    isConnected,
    address,
  };
}
