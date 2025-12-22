import { NextResponse } from 'next/server';

/**
 * Returns supported tokens and networks
 */
export async function GET() {
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x803d7ADD44B238F40106B1C4439ecAcd05910dc7';

  return NextResponse.json({
    supported: [
      {
        network: 'sepolia',
        chainId: 11155111,
        tokens: [
          {
            address: tokenAddress,
            symbol: 'CTKN',
            name: 'Confidential Token',
          },
        ],
      },
    ],
  });
}
