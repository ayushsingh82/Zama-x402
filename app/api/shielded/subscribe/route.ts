import { NextRequest, NextResponse } from 'next/server';
import { publicClient } from '@/lib/viem/publicClient';
import { SHIELDED_POOL_ABI } from '@/lib/abi/shieldedPool';
import { issueSession } from '@/lib/x402-fhe/shielded-session';
import type { ShieldedPoolSessionRequest, ShieldedPoolSessionResult } from '@/lib/x402-fhe/types';

const POOL_ADDRESS = process.env.NEXT_PUBLIC_SHIELDED_POOL_ADDRESS as `0x${string}` | undefined;

/**
 * Issues a session token for the fhe-shielded-pool scheme. This is OUR OWN route — never a
 * third-party facilitator — and it deliberately only ever reads/logs {commitment, resourceId,
 * expiry} from the request body. It never receives, stores, or logs a wallet address.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ShieldedPoolSessionRequest>;
    const { commitment, resourceId, expiry } = body;

    if (!commitment || !resourceId || !expiry) {
      return NextResponse.json<ShieldedPoolSessionResult>(
        { isValid: false, invalidReason: 'commitment, resourceId, and expiry are required' },
        { status: 400 }
      );
    }

    if (!POOL_ADDRESS) {
      return NextResponse.json<ShieldedPoolSessionResult>(
        { isValid: false, invalidReason: 'Server misconfigured: NEXT_PUBLIC_SHIELDED_POOL_ADDRESS not set' },
        { status: 500 }
      );
    }

    const isValid = await publicClient.readContract({
      address: POOL_ADDRESS,
      abi: SHIELDED_POOL_ABI,
      functionName: 'isCommitmentValid',
      args: [commitment, resourceId],
    });

    if (!isValid) {
      return NextResponse.json<ShieldedPoolSessionResult>(
        { isValid: false, invalidReason: 'Commitment not found, expired, or resourceId mismatch' },
        { status: 400 }
      );
    }

    const sessionToken = issueSession({ commitment, resourceId, expiry });

    return NextResponse.json<ShieldedPoolSessionResult>({
      isValid: true,
      sessionToken,
      expiresAt: expiry,
    });
  } catch (error) {
    console.error('Shielded-pool subscribe error:', error);
    return NextResponse.json<ShieldedPoolSessionResult>(
      { isValid: false, invalidReason: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
