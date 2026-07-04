'use client';

import { useEffect, useState } from 'react';
import { useShieldedPool } from '@/hooks/shielded-pool/useShieldedPool';
import { parseShieldedPool402Response, fetchWithShieldedSession } from '@/lib/x402-fhe/shielded-pool';
import type { ShieldedPoolPaymentRequirement } from '@/lib/x402-fhe/types';
import type { FhevmAdapter } from '@/hooks/fhevm/useFhevmInstance';

interface ShieldedPoolDemoProps {
  fhevmInstance: FhevmAdapter;
  address: `0x${string}`;
}

/**
 * fhe-shielded-pool scheme demo. Coexists with DirectTransferDemo (the original fhe-transfer
 * scheme) so both flows can be compared side by side.
 */
export default function ShieldedPoolDemo({ fhevmInstance, address }: ShieldedPoolDemoProps) {
  const { state, sessionToken, error, lastCommitment, depositAndSubscribe, restoreSession } = useShieldedPool();
  const [requirement, setRequirement] = useState<ShieldedPoolPaymentRequirement | null>(null);
  const [resourceResult, setResourceResult] = useState<any>(null);
  const [isFetchingRequirement, setIsFetchingRequirement] = useState(false);

  // Learn the payment requirement (incl. resourceId) up front, and restore any existing session
  // for that resourceId so a page refresh doesn't force re-depositing.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsFetchingRequirement(true);
      try {
        const response = await fetch('/api/premium-shielded');
        const req = await parseShieldedPool402Response(response);
        if (!cancelled && req) {
          setRequirement(req);
          restoreSession(req.resourceId);
        }
      } finally {
        if (!cancelled) setIsFetchingRequirement(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeposit = async () => {
    if (!requirement) return;
    await depositAndSubscribe(requirement, fhevmInstance);
  };

  const handleFetchResource = async () => {
    if (!sessionToken) return;
    const response = await fetchWithShieldedSession('/api/premium-shielded', sessionToken);
    const data = await response.json();
    setResourceResult(data);
  };

  const isBusy = state === 'depositing' || state === 'granting_operator' || state === 'registering_session';

  return (
    <div className="space-y-6">
      {/* Bidirectional blindness explainer card */}
      <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-6 rounded-2xl">
        <h3 className="text-xl font-black text-white mb-4 bg-red-500 px-3 py-2 rounded-lg inline-block">
          Shielded Pool — What&apos;s Hidden
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4">
            <p className="text-sm font-bold text-green-800 mb-2">Hidden now (Phase 1)</p>
            <ul className="text-xs text-green-800 space-y-1 list-disc list-inside">
              <li>Merchant&apos;s payout address — never in the 402 response, never in your deposit transaction</li>
              <li>Your wallet address, from this server&apos;s point of view — /api/shielded/subscribe never receives it</li>
              <li>Payment amount — FHE-encrypted throughout, same as the direct-transfer scheme</li>
              <li>Which deposit funded which merchant payout — the pool aggregates and the merchant withdraws in batches, decoupled in time</li>
            </ul>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-600 rounded-lg p-4">
            <p className="text-sm font-bold text-yellow-800 mb-2">Still visible (Phase 2 — not yet built)</p>
            <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
              <li>Your depositing wallet address is visible on Etherscan as the sender of the deposit transaction</li>
              <li>Breaking that link needs a relayer/paymaster (shared across many users) or a ZK membership proof — deliberately out of scope for this phase</li>
              <li>On-chain amount is not verified against the resource&apos;s price (see README &quot;Known limitations&quot;)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Deposit + Subscribe Card */}
      <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-6 rounded-2xl">
        <h3 className="text-xl font-black text-white mb-4 bg-red-500 px-3 py-2 rounded-lg inline-block">
          Deposit &amp; Subscribe
        </h3>

        {isFetchingRequirement ? (
          <p className="text-sm text-black/70">Loading payment requirement...</p>
        ) : requirement ? (
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm font-semibold text-black mb-2">
                Payment Required (no merchant address anywhere in this object):
              </p>
              <ul className="text-xs text-black/70 space-y-1">
                <li>Amount: {(Number(requirement.maxAmountRequired) / 1e6).toFixed(2)} tokens</li>
                <li>Pool address: {requirement.poolAddress}</li>
                <li>Resource ID: {requirement.resourceId}</li>
                <li>Description: {requirement.description}</li>
              </ul>
            </div>

            <p className="text-sm font-semibold text-black/70">
              State: <span className="font-black text-black">{state}</span>
            </p>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={handleDeposit}
              disabled={!fhevmInstance || isBusy || state === 'success'}
              className="bg-red-500 border-2 border-black shadow-[4px_4px_0_0_rgba(239, 68, 68, 0.5)] px-6 py-3 rounded-lg text-base font-bold text-white hover:bg-red-600 hover:shadow-[2px_2px_0_0_rgba(239, 68, 68, 0.7)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state === 'success' ? 'Deposited & Subscribed' : 'Deposit & Subscribe'}
            </button>

            {lastCommitment && (
              <div>
                <p className="text-xs font-semibold text-black/70 mb-1">Commitment (opaque to the server):</p>
                <p className="text-xs font-mono text-black bg-gray-100 p-2 rounded break-all">{lastCommitment}</p>
              </div>
            )}

            {sessionToken && (
              <div>
                <p className="text-xs font-semibold text-black/70 mb-1">
                  Session token (bound to the commitment, not to your wallet):
                </p>
                <p className="text-xs font-mono text-black bg-gray-100 p-2 rounded break-all">{sessionToken}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-red-600">
            Failed to load payment requirement — check NEXT_PUBLIC_SHIELDED_POOL_ADDRESS is set.
          </p>
        )}
      </div>

      {/* Fetch Resource Card */}
      {sessionToken && (
        <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-6 rounded-2xl">
          <h3 className="text-xl font-black text-white mb-4 bg-red-500 px-3 py-2 rounded-lg inline-block">
            Access Protected Resource
          </h3>
          <button
            onClick={handleFetchResource}
            className="bg-red-500 border-2 border-black shadow-[4px_4px_0_0_rgba(239, 68, 68, 0.5)] px-6 py-3 rounded-lg text-base font-bold text-white hover:bg-red-600 hover:shadow-[2px_2px_0_0_rgba(239, 68, 68, 0.7)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
          >
            Fetch Premium Data (via session, not wallet)
          </button>

          {resourceResult && (
            <div className="bg-green-50 border-2 border-green-600 p-4 rounded-lg mt-4">
              <pre className="text-xs text-green-700 overflow-auto">{JSON.stringify(resourceResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
