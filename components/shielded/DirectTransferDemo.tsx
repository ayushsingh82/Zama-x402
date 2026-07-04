'use client';

import { useEffect, useRef, useState } from 'react';
import { useERC7984Wagmi } from '@/hooks/erc7984/useERC7984Wagmi';
import { useX402Payment } from '@/hooks/x402/useX402Payment';
import { addPaymentHistoryEntry } from '@/lib/x402-fhe/paymentHistory';
import type { FHEPaymentRequirement, FHEDecryptionSignature } from '@/lib/x402-fhe/types';
import type { FhevmAdapter } from '@/hooks/fhevm/useFhevmInstance';

interface DirectTransferDemoProps {
  fhevmInstance: FhevmAdapter;
  address: `0x${string}`;
}

/**
 * The original fhe-transfer scheme demo (extracted verbatim from ERC7984Demo.tsx, no logic
 * changes beyond swapping stale hardcoded merchant-address debug text for the real address from
 * the payment requirement). Amount is hidden via ERC7984; merchant address and depositor wallet
 * are both fully visible — see the "Shielded Pool" tab for the bidirectional-blindness upgrade.
 */
export default function DirectTransferDemo({ fhevmInstance, address }: DirectTransferDemoProps) {
  const [decryptionSig, setDecryptionSig] = useState<FHEDecryptionSignature | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);

  const tokenHook = useERC7984Wagmi({ instance: fhevmInstance, hasSignature });
  const paymentHook = useX402Payment({ instance: fhevmInstance });
  const recordedHashRef = useRef<string | null>(null);

  // Records a receipt once the confidential transfer confirms on-chain. Fires once per tx hash -
  // the underlying transfer isn't awaited by handlePayment below, so this is the only reliable
  // completion signal available for the history log.
  useEffect(() => {
    if (
      tokenHook.isTransferConfirmed &&
      tokenHook.transferHash &&
      recordedHashRef.current !== tokenHook.transferHash &&
      paymentHook.requirement
    ) {
      recordedHashRef.current = tokenHook.transferHash;
      addPaymentHistoryEntry({
        scheme: 'fhe-transfer',
        endpoint: paymentHook.requirement.resource,
        amount: paymentHook.requirement.maxAmountRequired,
        txHash: tokenHook.transferHash,
      });
    }
  }, [tokenHook.isTransferConfirmed, tokenHook.transferHash, paymentHook.requirement]);

  const createDecryptionSignature = async () => {
    if (!address || !fhevmInstance) return;

    try {
      setSignatureError(null);
      const sig = await fhevmInstance.createDecryptionSignature(address, [tokenHook.tokenAddress], 365);
      setDecryptionSig(sig);
      setHasSignature(true);
    } catch (error) {
      console.error('Failed to create decryption signature:', error);
      setSignatureError(
        'Failed to create decryption signature: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  };

  const handleFetchPremiumData = async () => {
    if (!paymentHook.isReady) return;

    try {
      const result = await paymentHook.fetchWithPayment('/api/premium-data');

      if (result.success) {
        setPaymentResult(result.data);
      } else if (result.error === 'Payment required' && result.data?.requirement) {
        await handlePayment(result.data.requirement);
      }
    } catch (error) {
      console.error('Failed to fetch premium data:', error);
    }
  };

  const handlePayment = async (requirement: FHEPaymentRequirement) => {
    if (!address || !fhevmInstance) return;

    try {
      if (!decryptionSig) {
        await createDecryptionSignature();
      }

      const amount = BigInt(requirement.maxAmountRequired);
      const merchantAddress = requirement.payTo;

      await tokenHook.transferTokens(merchantAddress, amount);

      // Note: In a real implementation, you'd need to wait for the transaction
      // and then verify with facilitator. This is a simplified version.
      // After transfer completes, you would call:
      // await paymentHook.verifyPaymentAfterTransfer(txHash, decryptionSig, requirement.resource);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Token Balance Card */}
      <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-6 rounded-2xl">
        <h3 className="text-xl font-black text-white mb-4 bg-red-500 px-3 py-2 rounded-lg inline-block">
          Token Balance
        </h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-black/70 mb-2">
              Encrypted Balance Handle
            </p>
            <p className="text-sm font-mono text-black bg-gray-100 p-2 rounded break-all">
              {tokenHook.handle || 'No balance'}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-black/70 mb-2">
              Decrypted Balance
            </p>
            <div className="flex items-center gap-4">
              <p className="text-2xl font-black text-black">
                {tokenHook.clear !== null
                  ? (Number(tokenHook.clear) / 1e6).toFixed(2)
                  : '---'}
              </p>
              <button
                onClick={tokenHook.decryptBalanceHandle}
                disabled={!tokenHook.handle || tokenHook.isDecrypted || !hasSignature}
                className="bg-red-500 border-2 border-black shadow-[4px_4px_0_0_rgba(239, 68, 68, 0.5)] px-4 py-2 rounded-lg text-sm font-bold text-white hover:bg-red-600 hover:shadow-[2px_2px_0_0_rgba(239, 68, 68, 0.7)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0_0_rgba(239, 68, 68, 0.5)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              >
                {tokenHook.isDecrypted ? 'Decrypted' : 'Decrypt Balance'}
              </button>
            </div>

            {/* Signature Status and Create Button */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-black/70">
                  Decryption Signature:
                  <span className={`ml-2 ${hasSignature ? 'text-green-600' : 'text-red-600'}`}>
                    {hasSignature ? 'Created' : 'Required'}
                  </span>
                </p>
                <button
                  onClick={createDecryptionSignature}
                  disabled={hasSignature || !fhevmInstance}
                  className="bg-blue-500 border-2 border-black shadow-[4px_4px_0_0_rgba(59, 130, 246, 0.5)] px-3 py-1 rounded-lg text-xs font-bold text-white hover:bg-blue-600 hover:shadow-[2px_2px_0_0_rgba(59, 130, 246, 0.7)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0_0_rgba(59, 130, 246, 0.5)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                >
                  {hasSignature ? 'Signature Created' : 'Create Signature'}
                </button>
              </div>
              {!hasSignature && (
                <p className="text-xs text-black/50 mt-2">
                  You must create a decryption signature before viewing your balance.
                </p>
              )}
              {signatureError && (
                <p className="text-xs text-red-600 mt-2">{signatureError}</p>
              )}
            </div>
          </div>

          {tokenHook.error && (
            <p className="text-sm text-red-600">{tokenHook.error.message}</p>
          )}
        </div>
      </div>

      {/* Payment Flow Card */}
      <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-6 rounded-2xl">
        <h3 className="text-xl font-black text-white mb-4 bg-red-500 px-3 py-2 rounded-lg inline-block">
          x402 Payment Flow
        </h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-black/70 mb-2">
              Payment State: <span className="font-black text-black">{paymentHook.state}</span>
            </p>

            {paymentHook.requirement && (
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-sm font-semibold text-black mb-2">Payment Required:</p>
                <ul className="text-xs text-black/70 space-y-1">
                  <li>Amount: {(Number(paymentHook.requirement.maxAmountRequired) / 1e6).toFixed(2)} tokens</li>
                  <li>Pay To (merchant address — visible in this scheme): {paymentHook.requirement.payTo}</li>
                  <li>Description: {paymentHook.requirement.description}</li>
                </ul>
              </div>
            )}

            {paymentHook.error && (
              <p className="text-sm text-red-600 mb-4">{paymentHook.error}</p>
            )}

            <button
              onClick={handleFetchPremiumData}
              disabled={!paymentHook.isReady || paymentHook.state === 'transferring' || paymentHook.state === 'verifying'}
              className="bg-red-500 border-2 border-black shadow-[4px_4px_0_0_rgba(239, 68, 68, 0.5)] px-6 py-3 rounded-lg text-base font-bold text-white hover:bg-red-600 hover:shadow-[2px_2px_0_0_rgba(239, 68, 68, 0.7)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Fetch Premium Data
            </button>
          </div>

          {paymentResult && (
            <div className="bg-green-50 border-2 border-green-600 p-4 rounded-lg">
              <p className="text-sm font-semibold text-green-800 mb-2">Success!</p>
              <pre className="text-xs text-green-700 overflow-auto">
                {JSON.stringify(paymentResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white border-2 border-black border-dashed shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-6 rounded-2xl">
        <h3 className="text-lg font-black text-white mb-3 bg-red-500 px-3 py-1 rounded-lg inline-block">
          Instructions
        </h3>
        <ol className="text-sm text-black/80 space-y-2 list-decimal list-inside">
          <li>Connect your wallet (Sepolia testnet)</li>
          <li>Check your encrypted token balance</li>
          <li>Decrypt your balance to see the actual amount</li>
          <li>Click &quot;Fetch Premium Data&quot; to initiate payment flow</li>
          <li>Payment goes directly to the merchant&apos;s address shown above (fully public)</li>
          <li>Approve the payment transaction</li>
          <li>Wait for verification and access premium content</li>
        </ol>
      </div>
    </div>
  );
}
