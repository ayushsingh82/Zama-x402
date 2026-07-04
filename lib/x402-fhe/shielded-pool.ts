/**
 * Client utilities for the fhe-shielded-pool scheme. Kept parallel to client.ts (the old
 * fhe-transfer scheme) rather than modifying it — both schemes coexist.
 */
import { keccak256, encodePacked, type Hex } from 'viem';
import type {
  ShieldedPoolPaymentRequirement,
  ShieldedPoolSessionRequest,
  ShieldedPoolSessionResult,
} from './types';

/** 32 random bytes, generated and kept client-side only — never sent to any server. */
export function generateCommitmentSecret(): Hex {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return ('0x' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')) as Hex;
}

/**
 * Commitment is an opaque, client-chosen identifier as far as the contract is concerned (it never
 * recomputes or verifies this derivation) — so this hash scheme only needs to be unpredictable and
 * reproducible by the same client, not bit-for-bit matched to any on-chain computation.
 */
export function computeCommitment(secret: Hex, resourceId: Hex, expiry: number): Hex {
  return keccak256(encodePacked(['bytes32', 'bytes32', 'uint64'], [secret, resourceId, BigInt(expiry)]));
}

/** Parse a 402 response for the fhe-shielded-pool scheme (mirrors parse402Response in client.ts). */
export async function parseShieldedPool402Response(
  response: Response
): Promise<ShieldedPoolPaymentRequirement | null> {
  if (response.status !== 402) {
    return null;
  }

  try {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('402 response is not JSON:', contentType);
      return null;
    }

    const data = await response.json();
    if (data.scheme === 'fhe-shielded-pool') {
      return data as ShieldedPoolPaymentRequirement;
    }
  } catch (error) {
    console.error('Failed to parse shielded-pool 402 response:', error);
  }

  return null;
}

/**
 * Requests a session token from OUR OWN server (requirement.sessionEndpoint) — never a
 * third-party facilitator. The request body never contains a wallet address.
 */
export async function requestShieldedSession(
  request: ShieldedPoolSessionRequest,
  requirement: ShieldedPoolPaymentRequirement
): Promise<ShieldedPoolSessionResult> {
  try {
    const response = await fetch(requirement.sessionEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}) as any);
      return {
        isValid: false,
        invalidReason: errorData.invalidReason || `Session request failed (${response.status})`,
      };
    }

    return (await response.json()) as ShieldedPoolSessionResult;
  } catch (error) {
    return {
      isValid: false,
      invalidReason: error instanceof Error ? error.message : 'Network error during session request',
    };
  }
}

/** Fetches a protected resource using a previously-issued shielded-pool session token. */
export async function fetchWithShieldedSession(url: string, sessionToken: string): Promise<Response> {
  return fetch(url, {
    headers: { 'X-Shielded-Session': sessionToken },
  });
}
