'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { getPaymentHistory, type PaymentHistoryEntry } from '@/lib/x402-fhe/paymentHistory';
import { SERVICES, formatTokenAmount } from '@/lib/app/services';

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-xl p-4">
      <p className="text-xs font-bold text-black/50 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-black">{value}</p>
      <p className="text-xs text-black/50 mt-0.5">{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const [history, setHistory] = useState<PaymentHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getPaymentHistory());
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-black mb-1">Dashboard</h1>
        <p className="text-sm text-black/60 font-semibold">
          Pay-per-use x402 access backed by ERC7984 confidential transfers on Zama&apos;s FHEVM - amount hidden,
          merchant hidden.
        </p>
      </div>

      {!isConnected && (
        <div className="bg-white border-2 border-black border-dashed rounded-xl p-6">
          <p className="text-sm font-bold text-black">Connect your wallet from the top bar to pay for access below.</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatTile label="Amount" value="Hidden" sub="FHE-encrypted (ERC7984)" />
        <StatTile label="Merchant" value="Hidden" sub="shielded pool + commitment" />
        <StatTile label="Total payments" value={String(history.length)} sub="local receipt log" />
      </div>

      <section>
        <h2 className="text-xs font-black uppercase tracking-wider text-black/50 mb-4">Available Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] rounded-2xl p-6 flex flex-col"
            >
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-red-500 text-white">Amount hidden</span>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-black text-white">Merchant hidden</span>
              </div>
              <h3 className="text-lg font-black text-black mb-2">{service.name}</h3>
              <p className="text-sm text-black/70 mb-4 flex-1">{service.description}</p>
              <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                <div className="bg-gray-50 border-2 border-black rounded-lg px-3 py-2">
                  <p className="text-black/50 mb-0.5">Pay</p>
                  <p className="font-mono font-bold text-black">{formatTokenAmount(service.amountRaw)} tokens</p>
                </div>
                <div className="bg-gray-50 border-2 border-black rounded-lg px-3 py-2">
                  <p className="text-black/50 mb-0.5">Calls included</p>
                  <p className="font-mono font-bold text-black">{service.callsIncluded}</p>
                </div>
              </div>
              <p className="text-xs font-mono text-black/40 mb-4">{service.endpoint}</p>
              <Link href="/test">
                <button className="w-full bg-red-500 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-4 py-2 rounded-lg text-sm font-bold text-white hover:bg-red-600 hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">
                  Pay & Subscribe
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
