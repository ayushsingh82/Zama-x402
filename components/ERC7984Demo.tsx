 'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useERC7984Wagmi } from '@/hooks/erc7984/useERC7984Wagmi';
import { useX402Payment } from '@/hooks/x402/useX402Payment';
import type { FHEPaymentRequirement } from '@/lib/x402-fhe/types';

export default function ERC7984Demo() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [decryptionSig, setDecryptionSig] = useState<any>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  const tokenHook = useERC7984Wagmi({ instance: fhevmInstance, hasSignature });
  const paymentHook = useX402Payment({ instance: fhevmInstance });

  // Check if SDK is available
  useEffect(() => {
    // For now, we'll consider SDK as loaded since we're using a mock implementation
    setSdkLoaded(true);
  }, []);

  // Initialize FHEVM instance
  useEffect(() => {
    if (!isConnected || !address || fhevmInstance || isInitializing || !sdkLoaded) {
      return;
    }

    const initializeFHEVM = async () => {
      try {
        setIsInitializing(true);
        setInitError(null);

        // Create a mock FHEVM instance that matches the expected interface
        let hasSignature = false;
        const mockInstance = {
          hasSignature: false,
          encrypt: async (amount: bigint, contractAddress: string) => {
            // Mock encryption - in real implementation this would use the actual SDK
            return {
              handle: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              proof: '0x'
            };
          },
          decrypt: async (handle: string, contractAddress: string) => {
            // Mock decryption - in real implementation this would use the actual SDK
            // Always require signature for security
            if (!mockInstance.hasSignature) {
              throw new Error('Decryption signature required. Please create signature first.');
            }
            return {
              [contractAddress]: BigInt('200000') // 0.2 tokens (200000 micro units)
            };
          },
          requiresSignature: async (handle: string, contractAddress: string) => {
            // Always require signature for demonstration
            return true;
          },
          createDecryptionSignature: async (address: string, contractAddresses: string[], durationDays: number) => {
            // Mock signature creation
            const timestamp = Math.floor(Date.now() / 1000);
            const sig = {
              signature: `0x${Math.random().toString(16).substr(2, 130)}`,
              publicKey: address,
              privateKey: '0x',
              userAddress: address,
              contractAddresses,
              startTimestamp: timestamp,
              durationDays,
            };
            mockInstance.hasSignature = true;
            setHasSignature(true);
            return sig;
          }
        };
        
        setFhevmInstance(mockInstance);
      } catch (error) {
        console.error('Failed to initialize FHEVM:', error);
        setInitError(error instanceof Error ? error.message : 'Failed to initialize FHEVM');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeFHEVM();
  }, [isConnected, address, fhevmInstance, isInitializing, sdkLoaded]);

  // Create decryption signature
  const createDecryptionSignature = async () => {
    if (!address || !fhevmInstance) return;

    try {
      setInitError(null);
      
      // Check if FHEVM has signature creation method
      if (typeof fhevmInstance.createDecryptionSignature === 'function') {
        const sig = await fhevmInstance.createDecryptionSignature(
          address,
          [tokenHook.tokenAddress],
          365 // duration days
        );
        setDecryptionSig(sig);
      } else {
        // Fallback: create signature with wallet signing
        // This would normally require user interaction
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `Create decryption signature for address ${address} at timestamp ${timestamp}`;
        
        // In real implementation, this would use wallet.signMessage()
        // For now, create a mock signature
        const sig = {
          signature: `0x${Math.random().toString(16).substr(2, 130)}`,
          publicKey: address,
          privateKey: '0x',
          userAddress: address,
          contractAddresses: [tokenHook.tokenAddress],
          startTimestamp: timestamp,
          durationDays: 365,
        };
        setDecryptionSig(sig);
        setHasSignature(true);
        console.log('Created mock decryption signature for testing');
      }
    } catch (error) {
      console.error('Failed to create decryption signature:', error);
      setInitError('Failed to create decryption signature: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

      // Transfer tokens to merchant address
      const amount = BigInt(requirement.maxAmountRequired);
      // Use the merchant address from payment requirement or fallback
      const merchantAddress = requirement.payTo || '0x3bc07042670a3720c398da4cd688777b0565fd10' as `0x${string}`;
      
      await tokenHook.transferTokens(
        merchantAddress,
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
    <div className="font-sans tracking-tight">
      {/* Header */}
      <div className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-black text-black hover:text-red-500 transition-colors cursor-pointer">
            Zama-X402
          </a>
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
          <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl text-center">
            <p className="text-lg font-semibold text-black mb-4">
              Connect your wallet to start testing
            </p>
            <ConnectButton />
          </div>
        ) : !sdkLoaded ? (
          <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl text-center">
            <p className="text-lg font-semibold text-black mb-2">
              Loading SDK...
            </p>
            <p className="text-sm text-black/70">
              Please wait while we initialize the FHEVM SDK
            </p>
          </div>
        ) : isInitializing ? (
          <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl text-center">
            <p className="text-lg font-semibold text-black">
              Initializing FHEVM Instance...
            </p>
            <p className="text-sm text-black/70 mt-2">
              Setting up mock FHEVM for demonstration
            </p>
          </div>
        ) : initError || !fhevmInstance ? (
          <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl text-center">
            <p className="text-lg font-semibold text-red-600 mb-2">
              FHEVM SDK Initialization Failed
            </p>
            <p className="text-sm text-black/70 mb-4">
              {initError || 'Unknown error occurred'}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500 border-2 border-black shadow-[4px_4px_0_0_rgba(239, 68, 68, 0.5)] px-6 py-3 rounded-lg text-base font-bold text-white hover:bg-red-600 hover:shadow-[2px_2px_0_0_rgba(239, 68, 68, 0.7)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
              >
                Refresh Page
              </button>
              <p className="text-xs text-black/50 mt-4">
                Debug: SDK Loaded: {sdkLoaded ? 'Yes' : 'No'} | 
                Merchant Address: 0x3bc07042670a3720c398da4cd688777b0565fd10
              </p>
            </div>
          </div>
        ) : (
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
                        <li>Pay To: {paymentHook.requirement.payTo}</li>
                        <li>Merchant: 0x3bc07042670a3720c398da4cd688777b0565fd10</li>
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
                <li>Click "Fetch Premium Data" to initiate payment flow</li>
                <li>Payment will be sent to merchant: 0x3bc07042670a3720c398da4cd688777b0565fd10</li>
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

