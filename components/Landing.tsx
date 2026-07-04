'use client';

import Link from 'next/link';

import React from 'react';

import PageHeader from './PageHeader';
import Reveal from './Reveal';

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

              <h2 className="text-5xl font-black text-black bg-white px-3 py-2 rounded-lg inline-block">
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

          <button className="bg-black border-2 border-black shadow-[6px_6px_0_0_rgba(239,68,68,0.6)] px-8 py-4 rounded-lg text-lg font-bold text-white hover:bg-white hover:text-black hover:shadow-[4px_4px_0_0_rgba(239,68,68,0.6)] hover:translate-x-[2px] hover:translate-y-[2px] hover:scale-[1.03] transition-all duration-200 active:shadow-[2px_2px_0_0_rgba(239,68,68,0.6)] active:translate-x-[4px] active:translate-y-[4px]">Open Dashboard</button>

        </Link>

        <Link href="/docs">

          <button className="bg-white border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-8 py-4 rounded-lg text-lg font-bold text-black hover:bg-black hover:text-white hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:scale-[1.03] transition-all duration-200 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px]">Docs</button>

        </Link>

      </div>

      {/* MAIN CONTENT - SECTIONED */}

      <div className="max-w-5xl mx-auto px-4 pb-20 mt-16">

        {/* SECTION: The Guarantee */}

        <section className="py-12">

          <Reveal>
            <div className="text-center mb-10">
              <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">How It Works</p>
              <h2 className="text-3xl font-black text-black">Amount Hidden. Merchant Hidden.</h2>
            </div>
          </Reveal>

          <Reveal>

            <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] p-8 rounded-2xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_rgba(239,68,68,0.6)]">

              <ul className="space-y-2 text-sm max-w-xl mx-auto">

                <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">No merchant address in the 402 response, ever</span></li>

                <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Every transfer amount FHE-encrypted via ERC7984</span></li>

                <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Deposit into a shared pool, gated by a commitment hash</span></li>

                <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Server never sees a wallet address, only the commitment</span></li>

                <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Merchant claims from the aggregate pool balance later</span></li>

              </ul>

            </div>

          </Reveal>

        </section>

        {/* SECTION: The Token */}

        <section className="py-12 border-t-2 border-black/10">

          <Reveal>
            <div className="text-center mb-10">
              <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">The Token</p>
              <h2 className="text-3xl font-black text-black">ERC7984 Confidential Token</h2>
            </div>
          </Reveal>

          <Reveal>

            <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] p-8 rounded-2xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_rgba(239,68,68,0.6)]">

              <p className="text-sm text-black mb-6 leading-relaxed text-center max-w-2xl mx-auto">The token this payment flow moves value with, backed by Zama&apos;s FHEVM:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

                <div>

                  <h4 className="font-bold text-black mb-2">On-chain:</h4>

                  <ul className="space-y-1">

                    <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500"></span><span>Encrypted balances and transfer amounts</span></li>

                    <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500"></span><span>FHE computation via Zama&apos;s FHEVM</span></li>

                    <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500"></span><span>Deployed on Sepolia testnet</span></li>

                  </ul>

                </div>

                <div>

                  <h4 className="font-bold text-black mb-2">In the browser:</h4>

                  <ul className="space-y-1">

                    <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500"></span><span>Real @zama-fhe/relayer-sdk instance</span></li>

                    <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500"></span><span>Signature-gated balance decryption</span></li>

                    <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500"></span><span>Only the holder can decrypt their balance</span></li>

                  </ul>

                </div>

              </div>

            </div>

          </Reveal>

        </section>

        {/* SECTION: Why x402 */}

        <section className="py-12 border-t-2 border-black/10">

          <Reveal>
            <div className="text-center mb-10">
              <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">Why x402</p>
              <h2 className="text-3xl font-black text-black">Pay-Per-Use, No Subscriptions</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Reveal>

              <div className="h-full bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] p-8 rounded-2xl flex flex-col justify-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_rgba(239,68,68,0.6)]">

                <h3 className="text-lg font-black mb-2 text-black hover:text-red-500 transition-colors cursor-default px-3 py-1 rounded-lg inline-block">Pay-Per-Use Model</h3>

                <p className="text-black text-sm mt-2">A protected route returns HTTP 402 with payment requirements instead of data - pay once, then get the resource. No subscriptions, no API keys.</p>

              </div>

            </Reveal>

            <Reveal delayMs={100}>

              <div className="h-full bg-white border-2 border-black border-dashed shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] p-8 rounded-2xl flex flex-col justify-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_rgba(239,68,68,0.6)]">

                <h4 className="text-lg font-bold text-black hover:text-red-500 transition-colors cursor-default px-3 py-1 rounded-lg inline-block">Try It Now</h4>

                <p className="text-black text-sm mt-2 font-bold">Connect a Sepolia wallet, view your encrypted balance, and pay for a service through the Dashboard.</p>

              </div>

            </Reveal>

          </div>

        </section>

        {/* FAQ SECTION */}

        <Reveal>

          <section className="relative z-10 px-4 py-16 border-t-2 border-black/10">

            <div className="max-w-3xl mx-auto">

              <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2 text-center">FAQ</p>

              <h2 className="text-3xl text-black font-black mb-8 text-center">Frequently Asked Questions</h2>

              <div className="space-y-4">

                {faqs.map((faq, index) => (

                  <div key={index} className="border-2 border-red-500 rounded-2xl overflow-hidden bg-white transition-shadow duration-300 hover:shadow-[6px_6px_0_0_rgba(239,68,68,0.4)]">

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
