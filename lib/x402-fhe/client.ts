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
    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('402 response is not JSON:', contentType);
      return null;
    }

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

  try {
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
      let errorMessage = 'Verification failed';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.invalidReason || errorData.message || 'Verification failed';
        } else {
          // If not JSON, get text and truncate for error message
          const textResponse = await response.text();
          errorMessage = `Facilitator error (${response.status}): ${textResponse.substring(0, 100)}...`;
        }
      } catch (parseError) {
        errorMessage = `Facilitator error (${response.status}): Unable to parse response`;
      }

      return {
        isValid: false,
        invalidReason: errorMessage,
      };
    }

    // Ensure response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        isValid: false,
        invalidReason: 'Facilitator returned non-JSON response',
      };
    }

    const result = await response.json();
    return result as FHEPaymentVerifyResult;
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      isValid: false,
      invalidReason: error instanceof Error ? error.message : 'Network error during verification',
    };
  }
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
