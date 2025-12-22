'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useERC7984Wagmi } from '@/hooks/erc7984/useERC7984Wagmi';
import { useX402Payment } from '@/hooks/x402/useX402Payment';
import { relayer } from '@zama-fhe/relayer-sdk';
import type { FHEPaymentRequirement } from '@/lib/x402-fhe/types';

const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_URL || 'https://relayer.sepolia.zama.ai';

export default function ERC7984Demo() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [decryptionSig, setDecryptionSig] = useState<any>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  
  const tokenHook = useERC7984Wagmi({ instance: fhevmInstance });
  const paymentHook = useX402Payment({ instance: fhevmInstance });

  // Initialize FHEVM instance
  useEffect(() => {
    if (isConnected && address) {
      const relayerInstance = relayer(RELAYER_URL);
      setFhevmInstance(relayerInstance);
    }
  }, [isConnected, address]);

  // Create decryption signature
  const createDecryptionSignature = async () => {
    if (!address || !fhevmInstance) return;

    try {
      // This would normally use fhevm to create signature
      // For now, we'll create a placeholder
      const sig = {
        signature: '0x',
        publicKey: '0x',
        privateKey: '0x',
        userAddress: address,
        contractAddresses: [tokenHook.tokenAddress],
        startTimestamp: Math.floor(Date.now() / 1000),
        durationDays: 365,
      };
      setDecryptionSig(sig);
    } catch (error) {
      console.error('Failed to create decryption signature:', error);
    }
  };

  // Handle premium data fetch
  const handleFetchPremiumData = async () => {
    if (!paymentHook.isReady) return;

    try {
      const result = await paymentHook.fetchWithPayment('/api/premium-data');

      if (result.success) {
        setPaymentResult(result.data);
      } else if (result.error === 'Payment required' && result.data?.requirement) {
        // Initiate payment flow
        await handlePayment(result.data.requirement);
      }
    } catch (error) {
      console.error('Failed to fetch premium data:', error);
    }
  };

  // Handle payment flow
  const handlePayment = async (requirement: FHEPaymentRequirement) => {
    if (!address || !fhevmInstance) return;

    try {
      // Create decryption signature if not exists
      if (!decryptionSig) {
        await createDecryptionSignature();
      }

      // Transfer tokens
      const amount = BigInt(requirement.maxAmountRequired);
      
      await tokenHook.transferTokens(
        requirement.payTo as `0x${string}`,
        amount
      );

      // Note: In a real implementation, you'd need to wait for the transaction
      // and then verify with facilitator. This is a simplified version.
      // After transfer completes, you would call:
      // await paymentHook.verifyPaymentAfterTransfer(txHash, decryptionSig, requirement.resource);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans tracking-tight">
      {/* Header */}
      <div className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-black">Zama-X402</h1>
          <ConnectButton showBalance={false} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-black text-black mb-4">
            x402 FHE Payment Demo
          </h2>
          <p className="text-lg text-black/80">
            Test confidential token transfers and payment verification
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 rounded-2xl text-center">
            <p className="text-lg font-semibold text-black mb-4">
              Connect your wallet to start testing
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Token Balance Card */}
            <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 rounded-2xl">
              <h3 className="text-xl font-black text-black mb-4 bg-[#FBBF24] px-3 py-2 rounded-lg inline-block">
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
                      disabled={!tokenHook.handle || tokenHook.isDecrypted}
                      className="bg-[#FBBF24] border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-4 py-2 rounded-lg text-sm font-bold text-black hover:bg-[#FCD34D] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                    >
                      {tokenHook.isDecrypted ? 'Decrypted' : 'Decrypt Balance'}
                    </button>
                  </div>
                </div>

                {tokenHook.error && (
                  <p className="text-sm text-red-600">{tokenHook.error.message}</p>
                )}
              </div>
            </div>

            {/* Payment Flow Card */}
            <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 rounded-2xl">
              <h3 className="text-xl font-black text-black mb-4 bg-[#FBBF24] px-3 py-2 rounded-lg inline-block">
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
                        <li>Pay To: {paymentHook.requirement.payTo}</li>
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
                    className="bg-[#FBBF24] border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-6 py-3 rounded-lg text-base font-bold text-black hover:bg-[#FCD34D] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-white border-2 border-black border-dashed shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 rounded-2xl">
              <h3 className="text-lg font-black text-black mb-3 bg-[#FBBF24] px-3 py-1 rounded-lg inline-block">
                Instructions
              </h3>
              <ol className="text-sm text-black/80 space-y-2 list-decimal list-inside">
                <li>Connect your wallet (Sepolia testnet)</li>
                <li>Check your encrypted token balance</li>
                <li>Decrypt your balance to see the actual amount</li>
                <li>Click "Fetch Premium Data" to initiate payment flow</li>
                <li>Approve the payment transaction</li>
                <li>Wait for verification and access premium content</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
