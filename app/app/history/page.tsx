'use client';

import { useEffect, useState } from 'react';
import { getPaymentHistory, clearPaymentHistory, type PaymentHistoryEntry } from '@/lib/x402-fhe/paymentHistory';
import { formatTokenAmount } from '@/lib/app/services';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryPage() {
  const [history, setHistory] = useState<PaymentHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHistory(getPaymentHistory());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-black mb-1">Payment History</h1>
          <p className="text-sm text-black/60 font-semibold">
            Local receipt log only - amounts are still on-chain encrypted, and this list never leaves your browser.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => {
              clearPaymentHistory();
              setHistory([]);
            }}
            className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-4 py-2 rounded-lg text-sm font-bold text-black hover:bg-black hover:text-white transition-all duration-200"
          >
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white border-2 border-black border-dashed rounded-2xl p-12 text-center">
          <p className="text-sm font-bold text-black/60">No payments recorded yet.</p>
          <p className="text-xs text-black/40 mt-1">Pay for a service on the Dashboard or /test page to see it here.</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] rounded-2xl overflow-hidden">
          <div className="divide-y-2 divide-black">
            {history.map((entry) => (
              <div key={entry.id} className="px-6 py-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-red-500 text-white">
                      {entry.scheme}
                    </span>
                    <span className="text-xs font-mono text-black/50">{entry.endpoint}</span>
                  </div>
                  <p className="text-xs text-black/50">{formatDate(entry.timestamp)}</p>
                  {entry.txHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${entry.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1.5 text-xs font-mono text-black/70 hover:text-red-500 transition-colors truncate max-w-full"
                    >
                      {entry.txHash.slice(0, 18)}...{entry.txHash.slice(-6)}
                    </a>
                  )}
                  {entry.commitment && (
                    <p className="text-xs font-mono text-black/40 mt-1">
                      commitment: {entry.commitment.slice(0, 14)}...
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-mono font-black text-black">
                    {entry.amount ? formatTokenAmount(entry.amount) : '—'} tokens
                  </p>
                  <p className="text-xs text-black/40">via x402</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t-2 border-black bg-gray-50">
            <p className="text-xs text-black/50">
              {history.length} payment{history.length === 1 ? '' : 's'} recorded in this browser.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
