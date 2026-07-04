import type { PaymentScheme } from '@/lib/x402-fhe/paymentHistory';

export interface ServiceConfig {
  id: string;
  name: string;
  scheme: PaymentScheme;
  description: string;
  endpoint: string;
  /** Raw on-chain units, matches maxAmountRequired in the route (6 decimals). */
  amountRaw: string;
  /** Header the resource route checks for a completed payment. */
  sessionHeader: 'X-Payment-TxHash' | 'X-Shielded-Session';
  /** Illustrative quota shown on the card - not separately metered on-chain today. */
  callsIncluded: number;
}

/**
 * Example catalog entries. All three are illustrative use-cases for the same underlying
 * mechanism - one real protected route (/api/premium-shielded), gated by the same shielded-pool
 * session check. There's only one resourceId/price on-chain today; these aren't separately
 * metered services yet.
 */
export const SERVICES: ServiceConfig[] = [
  {
    id: 'premium-data',
    name: 'Premium Data API',
    scheme: 'fhe-shielded-pool',
    description: 'General premium content access. The provider never learns your wallet or query patterns.',
    endpoint: '/api/premium-shielded',
    amountRaw: '1000000',
    sessionHeader: 'X-Shielded-Session',
    callsIncluded: 100,
  },
  {
    id: 'analytics-feed',
    name: 'Analytics Feed',
    scheme: 'fhe-shielded-pool',
    description: 'Usage/analytics style data. Your trading or usage queries stay completely private.',
    endpoint: '/api/premium-shielded',
    amountRaw: '1000000',
    sessionHeader: 'X-Shielded-Session',
    callsIncluded: 500,
  },
  {
    id: 'ai-inference',
    name: 'AI Inference',
    scheme: 'fhe-shielded-pool',
    description: 'Pay-per-call model inference. Submit queries without linking your identity to the content.',
    endpoint: '/api/premium-shielded',
    amountRaw: '1000000',
    sessionHeader: 'X-Shielded-Session',
    callsIncluded: 50,
  },
];

export function formatTokenAmount(amountRaw: string): string {
  return (Number(amountRaw) / 1e6).toFixed(2);
}
