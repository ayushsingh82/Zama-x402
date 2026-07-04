/**
 * Client-side payment history, shared by both x402 schemes. Persisted to localStorage only -
 * there is no server-side record of who paid (that's the point of both schemes), so this is
 * purely a local receipt log for the dashboard/history/playground pages.
 */

export type PaymentScheme = 'fhe-transfer' | 'fhe-shielded-pool';

export interface PaymentHistoryEntry {
  id: string;
  scheme: PaymentScheme;
  endpoint: string;
  amount?: string;
  txHash?: `0x${string}`;
  resourceId?: `0x${string}`;
  commitment?: `0x${string}`;
  timestamp: string;
}

const STORAGE_KEY = 'zama-x402-payment-history';

export function getPaymentHistory(): PaymentHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PaymentHistoryEntry[];
  } catch {
    return [];
  }
}

export function addPaymentHistoryEntry(
  entry: Omit<PaymentHistoryEntry, 'id' | 'timestamp'>
): PaymentHistoryEntry {
  const full: PaymentHistoryEntry = {
    ...entry,
    id: `${entry.scheme}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const next = [full, ...getPaymentHistory()];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable (e.g. private browsing quota) - history just won't persist
    }
  }

  return full;
}

export function clearPaymentHistory(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
