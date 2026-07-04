'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useFhevmInstance } from '@/hooks/fhevm/useFhevmInstance';
import DirectTransferDemo from '@/components/shielded/DirectTransferDemo';
import ShieldedPoolDemo from '@/components/shielded/ShieldedPoolDemo';

type Tab = 'direct' | 'shielded';

/**
 * Thin tab shell: handles wallet/SDK gating shared by both schemes, then delegates to
 * DirectTransferDemo (fhe-transfer, amount-only privacy) or ShieldedPoolDemo (fhe-shielded-pool,
 * merchant + server blindness — see README "Shielded Pool" section).
 */
export default function ERC7984Demo() {
  const { address, isConnected } = useAccount();
  const { instance: fhevmInstance, isLoading: isInitializing, error: initError } = useFhevmInstance();
  const [activeTab, setActiveTab] = useState<Tab>('direct');

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
        ) : isInitializing ? (
          <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl text-center">
            <p className="text-lg font-semibold text-black">
              Initializing FHEVM Instance...
            </p>
            <p className="text-sm text-black/70 mt-2">
              Loading the Zama relayer SDK and connecting to Sepolia
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
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tab switcher */}
            <div className="flex gap-2 border-b-2 border-black">
              <button
                onClick={() => setActiveTab('direct')}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg border-2 border-b-0 border-black transition-colors ${
                  activeTab === 'direct' ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Direct Transfer (fhe-transfer)
              </button>
              <button
                onClick={() => setActiveTab('shielded')}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg border-2 border-b-0 border-black transition-colors ${
                  activeTab === 'shielded' ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Shielded Pool (fhe-shielded-pool)
              </button>
            </div>

            {activeTab === 'direct' ? (
              <DirectTransferDemo fhevmInstance={fhevmInstance} address={address as `0x${string}`} />
            ) : (
              <ShieldedPoolDemo fhevmInstance={fhevmInstance} address={address as `0x${string}`} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
