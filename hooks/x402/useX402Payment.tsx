'use client';

import { useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import type {
  FHEPaymentRequirement,
  FHEPaymentPayload,
  PaymentState,
} from '@/lib/x402-fhe/types';
import { verifyPayment, fetchWithPayment } from '@/lib/x402-fhe/client';

interface UseX402PaymentProps {
  instance?: any; // FHEVM instance
}

interface PaymentResult {
  success: boolean;
  data?: any;
  error?: string;
}

export function useX402Payment({ instance }: UseX402PaymentProps = {}) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const [state, setState] = useState<PaymentState>('idle');
  const [requirement, setRequirement] = useState<FHEPaymentRequirement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setRequirement(null);
    setError(null);
  }, []);

  const fetchWithPaymentFlow = useCallback(
    async (url: string, amount?: bigint): Promise<PaymentResult> => {
      if (!isConnected || !address) {
        return { success: false, error: 'Wallet not connected' };
      }

      try {
        setState('requesting');
        setError(null);

        // Initial fetch
        const { requiresPayment, requirement: req, response } = await fetchWithPayment(url);

        if (!requiresPayment && response) {
          const data = await response.json();
          setState('success');
          return { success: true, data };
        }

        if (!req) {
          return { success: false, error: 'Payment required but no requirement provided' };
        }

        setRequirement(req);
        setState('payment_required');

        // If amount is provided, use it; otherwise use requirement amount
        const requiredAmount = amount || BigInt(req.maxAmountRequired);
        const recipient = req.payTo;

        // Wait for user to initiate transfer (this should be called from UI)
        // For now, return payment_required state
        return {
          success: false,
          error: 'Payment required',
          data: { requirement: req },
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Request failed';
        setError(errorMessage);
        setState('error');
        return { success: false, error: errorMessage };
      }
    },
    [isConnected, address]
  );

  const verifyPaymentAfterTransfer = useCallback(
    async (
      txHash: `0x${string}`,
      decryptionSignature: any, // FHEDecryptionSignature
      resourceUrl: string
    ): Promise<PaymentResult> => {
      if (!requirement) {
        return { success: false, error: 'No payment requirement set' };
      }

      try {
        setState('verifying');
        setError(null);

        const paymentPayload: FHEPaymentPayload = {
          x402Version: 1,
          scheme: 'fhe-transfer',
          network: requirement.network,
          chainId: requirement.chainId,
          payload: {
            txHash,
            decryptionSignature,
          },
        };

        const verifyResult = await verifyPayment(paymentPayload, requirement);

        if (!verifyResult.isValid) {
          setError(verifyResult.invalidReason || 'Payment verification failed');
          setState('error');
          return {
            success: false,
            error: verifyResult.invalidReason || 'Payment verification failed',
          };
        }

        // Retry the original request with payment proof
        setState('requesting');
        const { response } = await fetchWithPayment(resourceUrl, {
          headers: {
            'X-Payment-TxHash': txHash,
          },
        });

        if (response) {
          const data = await response.json();
          setState('success');
          return { success: true, data };
        }

        setState('error');
        return { success: false, error: 'Failed to fetch resource after payment' };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Verification failed';
        setError(errorMessage);
        setState('error');
        return { success: false, error: errorMessage };
      }
    },
    [requirement]
  );

  const isReady = isConnected && !!address && !!instance;

  return {
    fetchWithPayment: fetchWithPaymentFlow,
    verifyPaymentAfterTransfer,
    reset,
    state,
    requirement,
    error,
    isReady,
    isConnected,
    address,
    chainId,
  };
}
