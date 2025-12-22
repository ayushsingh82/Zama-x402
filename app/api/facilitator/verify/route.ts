import { NextRequest, NextResponse } from 'next/server';

const FACILITATOR_URL =
  process.env.FACILITATOR_URL ||
  process.env.NEXT_PUBLIC_FACILITATOR_URL ||
  'https://zama-facilitator.ultravioletadao.xyz';

/**
 * Proxy requests to facilitator service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${FACILITATOR_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Facilitator proxy error:', error);
    return NextResponse.json(
      {
        isValid: false,
        invalidReason: error instanceof Error ? error.message : 'Proxy error',
      },
      { status: 500 }
    );
  }
}

/**
 * Health check
 */
export async function GET() {
  try {
    const response = await fetch(`${FACILITATOR_URL}/health`);
    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 500 }
    );
  }
}
