/**
 * Client utilities for x402 FHE payment system
 */

import type {
  FHEPaymentRequirement,
  FHEPaymentPayload,
  FHEPaymentVerifyResult,
} from './types';

const FACILITATOR_URL =
  process.env.FACILITATOR_URL ||
  process.env.NEXT_PUBLIC_FACILITATOR_URL ||
  'https://zama-facilitator.ultravioletadao.xyz';

/**
 * Parse 402 Payment Required response
 */
export async function parse402Response(
  response: Response
): Promise<FHEPaymentRequirement | null> {
  if (response.status !== 402) {
    return null;
  }

  try {
    const data = await response.json();
    if (data.scheme === 'fhe-transfer') {
      return data as FHEPaymentRequirement;
    }
  } catch (error) {
    console.error('Failed to parse 402 response:', error);
  }

  return null;
}

/**
 * Verify payment with facilitator service
 */
export async function verifyPayment(
  paymentPayload: FHEPaymentPayload,
  paymentRequirement: FHEPaymentRequirement
): Promise<FHEPaymentVerifyResult> {
  const facilitatorUrl =
    paymentRequirement.facilitator || FACILITATOR_URL;

  const response = await fetch(`${facilitatorUrl}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      x402Version: 1,
      paymentPayload,
      paymentRequirements: paymentRequirement,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      isValid: false,
      invalidReason: errorData.invalidReason || 'Verification failed',
    };
  }

  return (await response.json()) as FHEPaymentVerifyResult;
}

/**
 * Fetch with payment handling
 */
export async function fetchWithPayment(
  url: string,
  options: RequestInit = {}
): Promise<{ requiresPayment: boolean; requirement?: FHEPaymentRequirement; response?: Response }> {
  try {
    const response = await fetch(url, options);

    if (response.status === 402) {
      const requirement = await parse402Response(response);
      return {
        requiresPayment: true,
        requirement: requirement || undefined,
      };
    }

    return {
      requiresPayment: false,
      response,
    };
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
