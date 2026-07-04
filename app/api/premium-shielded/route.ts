import { NextRequest, NextResponse } from 'next/server';
import { create402Response, getShieldedPoolPaymentRequirement, PREMIUM_DATA_RESOURCE_ID } from '@/lib/x402-fhe/middleware';
import { verifySession } from '@/lib/x402-fhe/shielded-session';

/**
 * Protected resource for the fhe-shielded-pool scheme. Coexists with /api/premium-data (the
 * fhe-transfer scheme) — both remain independently usable so the two flows can be compared.
 *
 * Gated on X-Shielded-Session (an HMAC token bound to a commitment/resourceId/expiry), never on a
 * wallet address or tx hash — this route never learns who paid.
 */
export async function GET(request: NextRequest) {
  const sessionToken = request.headers.get('X-Shielded-Session');

  if (sessionToken) {
    const { valid, resourceId } = verifySession(sessionToken);
    if (valid && resourceId === PREMIUM_DATA_RESOURCE_ID) {
      return NextResponse.json({
        success: true,
        message: 'Welcome to premium content! (shielded-pool scheme — this server never saw your wallet address)',
        data: {
          content: 'This is premium data that requires payment to access.',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  const requirement = getShieldedPoolPaymentRequirement(
    '/api/premium-shielded',
    '1000000',
    'Premium content access - shielded pool',
    PREMIUM_DATA_RESOURCE_ID,
    11155111
  );

  return create402Response({
    ...requirement,
    resource: request.url,
    maxAmountRequired: '1000000',
    description: 'Premium content access',
  });
}
