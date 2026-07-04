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
}

export const SERVICES: ServiceConfig[] = [
  {
    id: 'premium-data',
    name: 'Premium Data (fhe-transfer)',
    scheme: 'fhe-transfer',
    description: 'Direct confidential transfer to the merchant. Amount is FHE-encrypted; merchant address is public.',
    endpoint: '/api/premium-data',
    amountRaw: '1000000',
    sessionHeader: 'X-Payment-TxHash',
  },
  {
    id: 'premium-shielded',
    name: 'Premium Shielded (fhe-shielded-pool)',
    scheme: 'fhe-shielded-pool',
    description: 'Deposit into a shared pool gated by a commitment hash. Merchant address never appears; server never sees a wallet.',
    endpoint: '/api/premium-shielded',
    amountRaw: '1000000',
    sessionHeader: 'X-Shielded-Session',
  },
];

export function formatTokenAmount(amountRaw: string): string {
  return (Number(amountRaw) / 1e6).toFixed(2);
}
