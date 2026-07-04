'use client';

import { useState } from 'react';
import { getPaymentHistory, incrementApiCallCount } from '@/lib/x402-fhe/paymentHistory';
import { SERVICES, type ServiceConfig } from '@/lib/app/services';
import { PREMIUM_DATA_RESOURCE_ID } from '@/lib/x402-fhe/middleware';

interface CallResult {
  status: number;
  data: unknown;
}

function sessionStorageKey(resourceId: string) {
  return `shielded-session:${resourceId}`;
}

/** Looks up whatever credential this browser already has for the service, if any. */
function findCredential(service: ServiceConfig): string | null {
  if (service.scheme === 'fhe-shielded-pool') {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage.getItem(sessionStorageKey(PREMIUM_DATA_RESOURCE_ID));
  }
  const entry = getPaymentHistory().find(
    (h) => h.scheme === 'fhe-transfer' && h.endpoint === service.endpoint && h.txHash
  );
  return entry?.txHash ?? null;
}

function ServicePanel({ service }: { service: ServiceConfig }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CallResult | null>(null);
  const [showRaw, setShowRaw] = useState(true);

  async function call(withCredential: boolean) {
    setLoading(true);
    setResult(null);
    try {
      const headers: Record<string, string> = {};
      if (withCredential) {
        const cred = findCredential(service);
        if (cred) headers[service.sessionHeader] = cred;
      }
      const resp = await fetch(service.endpoint, { headers });
      const data = await resp.json();
      setResult({ status: resp.status, data });
      if (withCredential && resp.ok) incrementApiCallCount();
    } catch (err) {
      setResult({ status: 0, data: { error: err instanceof Error ? err.message : 'Request failed' } });
    } finally {
      setLoading(false);
    }
  }

  const hasCredential = !!findCredential(service);

  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-red-500 text-white">{service.scheme}</span>
        <span className="text-xs font-mono text-black/50">GET {service.endpoint}</span>
      </div>
      <h3 className="text-lg font-black text-black mb-4">{service.name}</h3>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => call(false)}
          disabled={loading}
          className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-4 py-2 rounded-lg text-sm font-bold text-black hover:bg-black hover:text-white transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Calling...' : 'Call without payment (see 402)'}
        </button>
        <button
          onClick={() => call(true)}
          disabled={loading || !hasCredential}
          className="bg-red-500 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-4 py-2 rounded-lg text-sm font-bold text-white hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
          title={hasCredential ? undefined : 'Pay for this service on the Dashboard or /test page first'}
        >
          Call with saved credential
        </button>
      </div>

      {!hasCredential && (
        <p className="text-xs text-black/40 mb-4">
          No stored {service.sessionHeader} yet - pay for this service first (Dashboard or /test).
        </p>
      )}

      {result && (
        <div className="border-2 border-black rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b-2 border-black">
            <span
              className={`text-xs font-mono font-black ${
                result.status >= 200 && result.status < 300 ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {result.status === 0 ? 'ERR' : result.status}
            </span>
            <button
              onClick={() => setShowRaw((v) => !v)}
              className="text-xs font-bold text-black/50 hover:text-black transition-colors"
            >
              {showRaw ? 'Hide raw' : 'Show raw'}
            </button>
          </div>
          {showRaw && (
            <pre className="p-4 text-xs font-mono text-black overflow-x-auto leading-relaxed bg-gray-50/50">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-black mb-1">Playground</h1>
        <p className="text-sm text-black/60 font-semibold">
          Call both protected endpoints directly and inspect the raw x402 402/200 responses.
        </p>
      </div>

      <div className="space-y-6">
        {SERVICES.map((service) => (
          <ServicePanel key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
