'use client';

import Link from 'next/link';

import React from 'react';

import PageHeader from './PageHeader';
import Reveal from './Reveal';

function StrikeIcon({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl border-2 border-black bg-gray-50 flex items-center justify-center">
        {children}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[130%] h-[2px] bg-red-500 rotate-45" />
        </div>
      </div>
      <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function GuaranteeVisual() {
  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-3 sm:gap-5">
        <StrikeIcon label="Merchant">
          <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-black" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 21V9l8-5 8 5v12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </StrikeIcon>

        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0">
          <div className="absolute inset-0 rounded-full border-4 border-red-500/40 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-red-500/5" />
          <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-9 sm:h-9 text-black relative" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
          </svg>
        </div>

        <StrikeIcon label="Wallet">
          <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-black" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 12.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </StrikeIcon>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <span className="text-xs font-black px-3 py-1 rounded-full bg-black text-white">Amount hidden</span>
        <span className="text-xs font-black px-3 py-1 rounded-full bg-red-500 text-white">Merchant hidden</span>
      </div>
    </div>
  );
}

function TokenVisual() {
  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-5">
      <div className="w-14 h-14 rounded-full border-2 border-black bg-red-500 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-black text-xs">7984</span>
      </div>

      <div className="w-full max-w-[220px] border-2 border-black rounded-xl p-4 bg-gray-50">
        <div className="flex items-center gap-1.5 mb-3">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-black/40 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <p className="text-xs font-bold text-black/40 uppercase tracking-wider">Balance</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full bg-black animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <span className="text-xs font-black px-3 py-1 rounded-full bg-black text-white">FHE-encrypted</span>
        <span className="text-xs font-black px-3 py-1 rounded-full bg-gray-50 border-2 border-black text-black">Sepolia</span>
      </div>
    </div>
  );
}

function FlowVisual() {
  const steps: { label: string; icon: React.ReactNode }[] = [
    {
      label: 'Request',
      icon: (
        <path d="M6 4h9l3 3v13H6z M15 4v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      ),
    },
    {
      label: '402',
      icon: (
        <>
          <rect x="6" y="11" width="12" height="8" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      ),
    },
    {
      label: 'Pay',
      icon: (
        <>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9.5 12h5M12 9.5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      ),
    },
    {
      label: 'Access',
      icon: <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    },
  ];

  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-6">
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-black bg-gray-50 flex items-center justify-center flex-shrink-0 ${
                  s.label === 'Pay' ? 'animate-pulse' : ''
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-black" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {s.icon}
                </svg>
              </div>
              <span className="text-[10px] font-black text-black/60 uppercase tracking-wider">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black/30 flex-shrink-0 -mt-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

const faqs = [

  {

    q: 'What is x402 pay-per-use?',

    a: 'x402 is a pay-per-use payment protocol. A protected API route responds with HTTP 402 and payment requirements instead of the resource; the client pays, then re-requests and gets the data.'

  },

  {

    q: 'Is my payment amount ever visible on-chain?',

    a: 'No. Every transfer is an ERC7984 confidential transfer - amounts are FHE-encrypted by default, so they\'re never visible to a block explorer or to the merchant\'s server.'

  },

  {

    q: 'Does the merchant learn who paid?',

    a: 'No. Payment goes into a shared pool gated by a commitment hash, not directly to the merchant. The server only ever sees that commitment when issuing access - never a wallet address - and the merchant claims from the pool\'s aggregate balance separately, decoupled from any single payment.'

  },

  {

    q: 'Is this fully anonymous?',

    a: 'Not yet in every respect. The depositing wallet is still visible on-chain, and the deposited amount isn\'t enforced against the resource\'s price on-chain - both are documented, scoped next steps. See the Docs page for details.'

  },

];

export default function Landing() {

  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  return (

    <div className="font-sans tracking-tight relative overflow-x-hidden">

      <PageHeader />

      {/* HERO */}

      <div className="relative pt-32 pb-8 px-4 mb-8 overflow-hidden">

        <div className="flex items-center justify-center">

          <div className="text-center relative z-10">

            <div className="mb-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>

              <p className="text-sm font-black text-black hover:text-red-500 transition-colors cursor-default px-3 py-2 rounded-lg inline-block">Pay-Per-Use Confidential Payments</p>

            </div>

            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black bg-white px-3 py-2 rounded-lg inline-block">
                x402 powered by Zama FHE
              </h2>

            </div>

            <div className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.25s' }}>

              <p className="text-black font-semibold px-3">
                A protected API route returns HTTP 402 instead of data. The client pays into a
                shielded pool with an FHE-encrypted ERC7984 transfer, then gets the resource -
                amount hidden, merchant hidden, always.
              </p>

            </div>

          </div>

        </div>

      </div>

      <div className="text-center mb-6 flex flex-col md:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>

        <Link href="/app">

          <button className="bg-black border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-8 py-4 rounded-lg text-lg font-bold text-white hover:bg-white hover:text-black hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:scale-[1.03] transition-all duration-200 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px]">Open Dashboard</button>

        </Link>

        <Link href="/docs">

          <button className="bg-white border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-8 py-4 rounded-lg text-lg font-bold text-black hover:bg-black hover:text-white hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:scale-[1.03] transition-all duration-200 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px]">Docs</button>

        </Link>

      </div>

      {/* MAIN CONTENT */}

      <div className="max-w-5xl mx-auto px-4 pb-20 mt-16">

        <div className="space-y-20">

          {/* ROW: The Guarantee */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

            <Reveal>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">How It Works</p>
                <h2 className="text-3xl font-black text-black mb-6">Amount Hidden. Merchant Hidden.</h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black flex-shrink-0"></span><span className="text-black font-semibold">No merchant address in the 402 response, ever</span></li>
                  <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black flex-shrink-0"></span><span className="text-black font-semibold">Every transfer amount FHE-encrypted via ERC7984</span></li>
                  <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black flex-shrink-0"></span><span className="text-black font-semibold">Deposit into a shared pool, gated by a commitment hash</span></li>
                  <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black flex-shrink-0"></span><span className="text-black font-semibold">Server never sees a wallet address, only the commitment</span></li>
                  <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black flex-shrink-0"></span><span className="text-black font-semibold">Merchant claims from the aggregate pool balance later</span></li>
                </ul>
              </div>
            </Reveal>

            <Reveal delayMs={150}>
              <GuaranteeVisual />
            </Reveal>

          </div>

          {/* ROW: The Token */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

            <Reveal>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">The Token</p>
                <h2 className="text-3xl font-black text-black mb-4">ERC7984 Confidential Token</h2>
                <p className="text-sm text-black mb-6 leading-relaxed">The token this payment flow moves value with, backed by Zama&apos;s FHEVM:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-bold text-black mb-2">On-chain:</h4>
                    <ul className="space-y-1">
                      <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500 flex-shrink-0"></span><span>Encrypted balances and transfer amounts</span></li>
                      <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500 flex-shrink-0"></span><span>FHE computation via Zama&apos;s FHEVM</span></li>
                      <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500 flex-shrink-0"></span><span>Deployed on Sepolia testnet</span></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-2">In the browser:</h4>
                    <ul className="space-y-1">
                      <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500 flex-shrink-0"></span><span>Real @zama-fhe/relayer-sdk instance</span></li>
                      <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500 flex-shrink-0"></span><span>Signature-gated balance decryption</span></li>
                      <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500 flex-shrink-0"></span><span>Only the holder can decrypt their balance</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delayMs={150}>
              <TokenVisual />
            </Reveal>

          </div>

          {/* ROW: Why x402 */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

            <Reveal>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">Why x402</p>
                <h2 className="text-3xl font-black text-black mb-6">Pay-Per-Use, No Subscriptions</h2>
                <p className="text-black text-sm">A protected route returns HTTP 402 with payment requirements instead of data - pay once, then get the resource. No subscriptions, no API keys.</p>
              </div>
            </Reveal>

            <Reveal delayMs={150}>
              <FlowVisual />
            </Reveal>

          </div>

        </div>

        {/* FAQ SECTION */}

        <Reveal>

          <section className="relative z-10 px-4 pt-28 pb-16">

            <div className="max-w-3xl mx-auto">

              <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2 text-center">FAQ</p>

              <h2 className="text-3xl text-black font-black mb-8 text-center">Frequently Asked Questions</h2>

              <div className="space-y-4">

                {faqs.map((faq, index) => (

                  <div key={index} className="border-2 border-red-500 rounded-2xl overflow-hidden bg-white transition-shadow duration-300 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]">

                    <button

                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}

                      className="w-full p-6 text-left flex items-center justify-between text-black hover:bg-red-500 hover:text-white transition-all duration-300 focus:outline-none"

                    >

                      <span className="font-medium text-lg">{faq.q}</span>

                      <span className={`text-2xl transition-transform duration-300 ${expandedFaq === index ? 'rotate-45' : ''}`}>+</span>

                    </button>

                    {expandedFaq === index && (

                      <div className="px-6 pb-6 text-black/80 animate-fade-in-up bg-white">{faq.a}</div>

                    )}

                  </div>

                ))}

              </div>

            </div>

          </section>

        </Reveal>

      </div>

    </div>

  );

}
