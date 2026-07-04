/**
 * Server middleware utilities for x402 FHE payment system
 */

import { keccak256, toHex } from 'viem';
import type { FHEPaymentRequirement, ShieldedPoolPaymentRequirement } from './types';

/** Stable resourceId for the /api/premium-shielded demo resource — must match whatever was passed
 * to ShieldedPool.registerResource(resourceId, merchantPayoutAddress) on-chain for this resource. */
export const PREMIUM_DATA_RESOURCE_ID = keccak256(toHex('premium-data-v1'));

/**
 * Create a 402 Payment Required response. Generic over both schemes' requirement shapes since the
 * response body is just a JSON envelope either way.
 */
export function create402Response(
  requirement: Omit<FHEPaymentRequirement, 'x402Version'> | ShieldedPoolPaymentRequirement
): Response {
  return new Response(
    JSON.stringify({
      ...requirement,
    }),
    {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Get payment requirement configuration from environment
 */
export function getPaymentRequirement(
  resource: string,
  amount: string,
  description: string,
  chainId: number = 11155111
): Omit<FHEPaymentRequirement, 'resource' | 'maxAmountRequired' | 'description'> {
  const merchantAddress = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS;
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
  const facilitatorUrl =
    process.env.FACILITATOR_URL ||
    process.env.NEXT_PUBLIC_FACILITATOR_URL ||
    'https://zama-facilitator.ultravioletadao.xyz';

  if (!merchantAddress || !tokenAddress) {
    throw new Error(
      'NEXT_PUBLIC_MERCHANT_ADDRESS and NEXT_PUBLIC_TOKEN_ADDRESS must be set'
    );
  }

  return {
    scheme: 'fhe-transfer',
    network: 'sepolia',
    chainId,
    payTo: merchantAddress as `0x${string}`,
    asset: tokenAddress as `0x${string}`,
    mimeType: 'application/json',
    maxTimeoutSeconds: 300,
    facilitator: facilitatorUrl,
  };
}

/**
 * Get shielded-pool payment requirement configuration from environment. Unlike
 * getPaymentRequirement, there is no `payTo`/merchant address at all — only the pool address and
 * an opaque resourceId. `resource`/`amount`/`description` params mirror getPaymentRequirement's
 * signature for consistency, even though (as in that function) callers re-specify them when
 * building the actual create402Response payload.
 */
export function getShieldedPoolPaymentRequirement(
  resource: string,
  amount: string,
  description: string,
  resourceId: `0x${string}` = PREMIUM_DATA_RESOURCE_ID,
  chainId: number = 11155111
): Omit<ShieldedPoolPaymentRequirement, 'resource' | 'maxAmountRequired' | 'description'> {
  const poolAddress = process.env.NEXT_PUBLIC_SHIELDED_POOL_ADDRESS;
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;

  if (!poolAddress || !tokenAddress) {
    throw new Error(
      'NEXT_PUBLIC_SHIELDED_POOL_ADDRESS and NEXT_PUBLIC_TOKEN_ADDRESS must be set'
    );
  }

  return {
    scheme: 'fhe-shielded-pool',
    network: 'sepolia',
    chainId,
    poolAddress: poolAddress as `0x${string}`,
    asset: tokenAddress as `0x${string}`,
    resourceId,
    mimeType: 'application/json',
    maxTimeoutSeconds: 300,
    sessionEndpoint: '/api/shielded/subscribe',
  };
}
