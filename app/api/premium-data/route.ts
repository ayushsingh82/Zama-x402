import { NextRequest, NextResponse } from 'next/server';
import { create402Response, getPaymentRequirement } from '@/lib/x402-fhe/middleware';

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x803d7ADD44B238F40106B1C4439ecAcd05910dc7';
const MERCHANT_ADDRESS = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || '0xYourAddress';

/**
 * Protected resource requiring payment
 * Returns 402 Payment Required if no valid payment proof
 */
export async function GET(request: NextRequest) {
  // Check for payment proof in headers
  const paymentTxHash = request.headers.get('X-Payment-TxHash');

  // In a real implementation, you would verify the payment here
  // For now, we'll require payment if no tx hash is provided
  if (!paymentTxHash) {
    const requirement = getPaymentRequirement(
      '/api/premium-data',
      '1000000', // 1 token (assuming 6 decimals)
      'Premium content access',
      11155111 // Sepolia
    );

    return create402Response({
      ...requirement,
      resource: request.url,
      maxAmountRequired: '1000000',
      description: 'Premium content access',
    });
  }

  // If payment proof exists, return premium content
  // In production, verify the payment with facilitator service
  return NextResponse.json(
    {
      success: true,
      message: 'Welcome to premium content!',
      data: {
        content: 'This is premium data that requires payment to access.',
        timestamp: new Date().toISOString(),
        paymentTxHash,
      },
    },
    { status: 200 }
  );
}

/**
 * Verify payment and return resource
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentPayload, paymentRequirements } = body;

    // Verify payment with facilitator
    const facilitatorUrl =
      paymentRequirements.facilitator ||
      process.env.FACILITATOR_URL ||
      'https://zama-facilitator.ultravioletadao.xyz';

    const verifyResponse = await fetch(`${facilitatorUrl}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        x402Version: 1,
        paymentPayload,
        paymentRequirements,
      }),
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: verifyResult.invalidReason || 'Payment verification failed',
        },
        { status: 400 }
      );
    }

    // Return premium content
    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified! Welcome to premium content.',
        data: {
          content: 'This is premium data that requires payment to access.',
          timestamp: new Date().toISOString(),
          paymentTxHash: verifyResult.txHash,
          amount: verifyResult.amount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Premium data error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Server error',
      },
      { status: 500 }
    );
  }
}
