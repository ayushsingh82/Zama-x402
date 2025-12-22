/**
 * Server middleware utilities for x402 FHE payment system
 */

import type { FHEPaymentRequirement } from './types';

/**
 * Create a 402 Payment Required response
 */
export function create402Response(
  requirement: Omit<FHEPaymentRequirement, 'x402Version'>
): Response {
  return new Response(
    JSON.stringify({
      scheme: 'fhe-transfer',
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
