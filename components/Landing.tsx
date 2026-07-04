'use client';

import Link from 'next/link';

import React from 'react';

import PageHeader from './PageHeader';
import Reveal from './Reveal';

const faqs = [

  {

    q: 'What is x402 pay-per-use?',

    a: 'x402 is a pay-per-use payment protocol. A protected API route responds with HTTP 402 and payment requirements instead of the resource; the client pays, then re-requests and gets the data. This project implements two variants of that flow on top of Zama\'s FHEVM.'

  },

  {

    q: 'What is the difference between the two payment schemes?',

    a: 'fhe-transfer is a direct confidential transfer to the merchant\'s address, verified by a facilitator service that decrypts the amount off-chain. fhe-shielded-pool routes payment through a pooled contract instead: the merchant\'s address is never shown to the payer, and the server never sees the payer\'s wallet - only a commitment hash. See the "How It Works" page for the full flow of each.'

  },

  {

    q: 'What does ERC7984 give you that a normal ERC20 doesn\'t?',

    a: 'ERC7984 is a confidential token standard: balances and transfer amounts are encrypted on-chain via FHE. Only the token holder can decrypt their own balance (via a signature-gated FHEVM decryption request) - the amount is never visible on a block explorer.'

  },

  {

    q: 'Is the shielded pool fully anonymous?',

    a: 'Not yet. Phase 1 hides the merchant\'s payout address and keeps the server blind to the payer\'s wallet, but the depositing wallet itself is still visible on-chain, and the deposited amount isn\'t enforced against the resource\'s price on-chain. Both are documented, scoped Phase 2 items - see "How It Works" for details.'

  },

];

const schemeCards = [
  {
    title: 'fhe-transfer scheme',
    subtitle: 'Direct confidential transfer to the merchant, amount always encrypted.',
    points: [
      '402 response with merchant payTo address',
      'ERC7984 confidential transfer, amount hidden',
      'Facilitator service verifies payment off-chain',
    ],
  },
  {
    title: 'fhe-shielded-pool scheme',
    subtitle: 'Phase 1 bidirectional blindness - merchant and payer hidden from each other:',
    points: [
      'No merchant address in the 402 response, ever',
      'Deposit into a shared pool, gated by a commitment hash',
      'Server never sees a wallet address, only the commitment',
      'Merchant claims from the aggregate pool balance later',
    ],
  },
];

export default function Landing() {

  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  return (

    <div className="font-sans tracking-tight relative overflow-x-hidden">

      <PageHeader />

      {/* HERO */}

      <div className="relative pt-32 pb-8 px-4 mb-8 overflow-hidden">

        {/* floating decorative accents */}
        <div className="hidden md:block absolute top-24 left-[8%] w-16 h-16 bg-red-500 border-2 border-black rounded-2xl rotate-12 animate-float opacity-70" style={{ animationDelay: '0.2s' }} />
        <div className="hidden md:block absolute top-40 right-[10%] w-10 h-10 bg-black rounded-full animate-float opacity-70" style={{ animationDelay: '1.1s' }} />
        <div className="hidden md:block absolute bottom-4 left-[18%] w-8 h-8 border-2 border-red-500 rounded-lg animate-float opacity-70" style={{ animationDelay: '0.6s' }} />

        <div className="flex items-center justify-center">

          <div className="text-center relative z-10">

            <div className="mb-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>

              <p className="text-sm font-black text-black hover:text-red-500 transition-colors cursor-default px-3 py-2 rounded-lg inline-block">Pay-Per-Use Confidential Payments</p>

            </div>

            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>

              <h2 className="text-5xl font-black text-black bg-white px-3 py-2 rounded-lg inline-block italic">
                x402 powered by{' '}
                <span
                  className="animate-gradient-text bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, #ef4444, #000000, #ef4444)' }}
                >
                  Zama FHE
                </span>
              </h2>

            </div>

            <div className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.25s' }}>

              <p className="text-black font-semibold px-3">
                A protected API route returns HTTP 402 instead of data. The client pays with an
                FHE-encrypted ERC7984 transfer, then gets the resource - amount always encrypted,
                and with the shielded pool scheme, the merchant address hidden too.
              </p>

            </div>

          </div>

        </div>

      </div>

      <div className="text-center mb-6 flex flex-col md:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>

        <Link href="/test">

          <button className="bg-red-500 border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-8 py-4 rounded-lg text-lg font-bold text-white hover:bg-red-600 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:scale-[1.03] transition-all duration-200 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px]">Try the Demo</button>

        </Link>

        <Link href="/app">

          <button className="bg-black border-2 border-black shadow-[6px_6px_0_0_rgba(239,68,68,0.6)] px-8 py-4 rounded-lg text-lg font-bold text-white hover:bg-white hover:text-black hover:shadow-[4px_4px_0_0_rgba(239,68,68,0.6)] hover:translate-x-[2px] hover:translate-y-[2px] hover:scale-[1.03] transition-all duration-200 active:shadow-[2px_2px_0_0_rgba(239,68,68,0.6)] active:translate-x-[4px] active:translate-y-[4px]">Open Dashboard</button>

        </Link>

        <Link href="/how-it-works">

          <button className="bg-white border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-8 py-4 rounded-lg text-lg font-bold text-black hover:bg-black hover:text-white hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:scale-[1.03] transition-all duration-200 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px]">How It Works</button>

        </Link>

      </div>

      {/* MAIN CONTENT - BENTO GRID */}

      <div className="max-w-5xl mx-auto px-4 pb-20 mt-16">

        <div className="grid grid-cols-12 gap-6 auto-rows-[180px]">

          {schemeCards.map((card, i) => (

            <Reveal key={card.title} delayMs={i * 100} className="col-span-12 md:col-span-6 row-span-2">

              <div className="h-full bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] p-8 rounded-2xl flex flex-col justify-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_rgba(239,68,68,0.6)]">

                <h2 className="text-xl font-black mb-4 text-black hover:text-red-500 transition-colors cursor-default px-3 py-2 rounded-lg inline-block">{card.title}</h2>

                <p className="text-sm text-black leading-relaxed mb-4">{card.subtitle}</p>

                <ul className="space-y-2 text-sm">

                  {card.points.map((point) => (
                    <li key={point} className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">{point}</span></li>
                  ))}

                </ul>

              </div>

            </Reveal>

          ))}

          {/* ERC7984 confidential token */}

          <Reveal delayMs={200} className="col-span-12 md:col-span-8 row-span-2">

            <div className="h-full bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] p-8 rounded-2xl flex flex-col justify-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_rgba(239,68,68,0.6)]">

              <h2 className="text-xl font-black mb-4 text-black hover:text-red-500 transition-colors cursor-default px-3 py-2 rounded-lg inline-block">ERC7984 Confidential Token</h2>

              <p className="text-sm text-black mb-4 leading-relaxed">The token both payment schemes move value with, backed by Zama&apos;s FHEVM:</p>

              <div className="grid grid-cols-2 gap-4 text-sm">

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

          {/* Pay-Per-Use Model */}

          <Reveal delayMs={300} className="col-span-12 md:col-span-4 row-span-1">

            <div className="h-full bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] p-8 rounded-2xl flex flex-col justify-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_rgba(239,68,68,0.6)]">

              <h3 className="text-lg font-black mb-2 text-black hover:text-red-500 transition-colors cursor-default px-3 py-1 rounded-lg inline-block">Pay-Per-Use Model</h3>

              <p className="text-black text-sm mt-2">A protected route returns HTTP 402 with payment requirements instead of data - pay once, then get the resource. No subscriptions, no API keys.</p>

            </div>

          </Reveal>

          {/* Demo Instructions */}

          <Reveal delayMs={400} className="col-span-12 md:col-span-4 row-span-1">

            <div className="h-full bg-white border-2 border-black border-dashed shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] p-8 rounded-2xl flex flex-col justify-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_rgba(239,68,68,0.6)]">

              <h4 className="text-lg font-bold text-black hover:text-red-500 transition-colors cursor-default px-3 py-1 rounded-lg inline-block">Try It Now</h4>

              <p className="text-black text-sm mt-2 font-bold">Connect a Sepolia wallet, view your encrypted balance, and test both payment schemes side by side on the /test page.</p>

            </div>

          </Reveal>

        </div>

        {/* FAQ SECTION */}

        <Reveal>

          <section className="relative z-10 px-4 py-16 border-t border-red-500/20 mt-12">

            <div className="max-w-3xl mx-auto">

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
