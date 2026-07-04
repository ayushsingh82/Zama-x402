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

/**
 * Real count of successful (200) protected-resource calls made from this browser, incremented by
 * the Playground - not an illustrative/fabricated number.
 */
const API_CALL_COUNT_KEY = 'zama-x402-api-call-count';

export function getApiCallCount(): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(API_CALL_COUNT_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export function incrementApiCallCount(): number {
  const next = getApiCallCount() + 1;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(API_CALL_COUNT_KEY, String(next));
    } catch {
      // localStorage unavailable - count just won't persist
    }
  }
  return next;
}
