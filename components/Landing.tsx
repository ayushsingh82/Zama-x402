'use client';

import Link from 'next/link';

import React from 'react';

import { ConnectButton } from '@rainbow-me/rainbowkit';

import { useAccount } from 'wagmi';

const faqs = [

  {

    q: 'What is x402?',

    a: 'x402 is a developer guardrail system powered by Zama FHE that allows you to define spend limits, rate limits, and usage quotas on x402 calls. It prevents abuse and overuse by enforcing configurable constraints on API usage, helping developers control costs and protect their applications.'

  },

  {

    q: 'How do spend limits work?',

    a: 'Spend limits allow you to set maximum spending thresholds for x402 calls over a specific time period. Once the limit is reached, further calls are blocked until the limit resets. This helps prevent unexpected costs and budget overruns.'

  },

  {

    q: 'What are rate limits?',

    a: 'Rate limits control the frequency of x402 calls, preventing too many requests in a short time period. You can configure limits like "100 calls per minute" or "1000 calls per hour" to prevent abuse and ensure fair usage across your application.'

  },

  {

    q: 'How are usage quotas enforced?',

    a: 'Usage quotas track total consumption over a billing period (daily, weekly, monthly). When a quota is exceeded, x402 calls are automatically blocked. Quotas can be set per API endpoint, user, or application-wide, giving you granular control over usage.'

  },

];

export default function Landing() {

  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  const { isConnected } = useAccount();

  return (

    <div className="font-sans tracking-tight relative overflow-x-hidden">

      {/* HEADER */}

      <div className="absolute top-6 left-6 z-10">

        <Link href="/" className="focus:outline-none">

          <div className="bg-red-500 border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-6 py-3 rounded-lg cursor-pointer hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 flex items-center gap-3">

            <h1 className="text-2xl font-black text-black"> <a href="/">Zama-X402</a></h1>

          </div>

        </Link>

      </div>

      {/* WALLET CONNECT BUTTON */}

      <div className="absolute top-6 right-6 z-10">

        <div className={`connect-button-wrapper border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-lg cursor-pointer hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 ${
          isConnected ? 'bg-white' : 'bg-red-500'
        }`}>

          <ConnectButton showBalance={false} />

        </div>

      </div>

     

      {/* HERO */}

      <div className="relative pt-32 pb-8 px-4 mb-8">

        <div className="flex items-center justify-center">

          <div className="text-center">

            <div className="mb-4">
              <p className="text-sm font-black text-black hover:text-red-500 transition-colors cursor-default px-3 py-2 rounded-lg inline-block">Developer Guardrails for x402</p>
            </div>

            <div className="mb-6">

              <h2 className="text-5xl font-black text-black bg-white px-3 py-2 rounded-lg inline-block italic">X402 powered by zama fhe</h2>

            </div>

          </div>

        </div>

      </div>

      <div className="text-center mb-6 flex flex-col md:flex-row items-center justify-center gap-6">

      <Link href="/test">

          <button className="bg-red-500 border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-8 py-4 rounded-lg text-lg font-bold text-white hover:bg-red-600 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px]">Start Testing </button>

        </Link>

        


        </div>

      {/* MAIN CONTENT - BENTO GRID */}

      <div className="max-w-5xl mx-auto px-4 pb-20 mt-16">

        <div className="grid grid-cols-12 gap-6 auto-rows-[180px]">

          {/* Why x402 */}
          <div className="col-span-12 md:col-span-6 row-span-2 bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl flex flex-col justify-center">

            <h2 className="text-xl font-black mb-4 text-black hover:text-red-500 transition-colors cursor-default px-3 py-2 rounded-lg inline-block">Why x402</h2>

            <p className="text-sm text-black leading-relaxed">Prevent unexpected costs and abuse with powerful guardrails for x402. Define spend limits to control budgets, set rate limits to prevent API abuse, and configure usage quotas to manage consumption. Protect your application from overuse while maintaining full control over x402 call behavior.</p>

          </div>

          {/* Key Features */}
          <div className="col-span-12 md:col-span-6 row-span-2 bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl flex flex-col justify-center">
            <h2 className="text-xl font-black mb-4 text-black hover:text-red-500 transition-colors cursor-default px-3 py-2 rounded-lg inline-block">Key Features</h2>

            <p className="text-sm text-black mb-4 leading-relaxed">Powerful guardrail capabilities:</p>

            <ul className="space-y-2 text-sm">

              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Spend limits - Control budget and costs</span></li>

              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Rate limits - Prevent API abuse</span></li>

              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Usage quotas - Manage consumption</span></li>

              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Real-time monitoring & alerts</span></li>

              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">SDK & API integration</span></li>

            </ul>

          </div>

          {/* How It Works */}
          <div className="col-span-12 md:col-span-8 row-span-2 bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl flex flex-col justify-center">
            <h2 className="text-xl font-black mb-4 text-black hover:text-red-500 transition-colors cursor-default px-3 py-2 rounded-lg inline-block">How It Works</h2>

            <p className="text-sm text-black mb-4 leading-relaxed">Set up guardrails in four simple steps:</p>

            <div className="space-y-3">

              <div className="flex items-start"><span className="text-lg font-extrabold text-red-500 mr-3">1</span><div><div className="font-bold text-black mb-1 text-sm">Configure Limits</div><div className="text-xs text-black">Define spend limits, rate limits, and usage quotas through our intuitive interface or SDK.</div></div></div>

              <div className="flex items-start"><span className="text-lg font-extrabold text-red-500 mr-3">2</span><div><div className="font-bold text-black mb-1 text-sm">Integrate SDK</div><div className="text-xs text-black">Add x402 SDK to your application to enforce guardrails on all x402 calls automatically.</div></div></div>

              <div className="flex items-start"><span className="text-lg font-extrabold text-red-500 mr-3">3</span><div><div className="font-bold text-black mb-1 text-sm">Monitor Usage</div><div className="text-xs text-black">Track real-time usage, spending, and rate limit status through the dashboard with detailed analytics.</div></div></div>

              <div className="flex items-start"><span className="text-lg font-extrabold text-red-500 mr-3">4</span><div><div className="font-bold text-black mb-1 text-sm">Automatic Enforcement</div><div className="text-xs text-black">When limits are reached, x402 calls are automatically blocked or throttled to prevent abuse and overuse.</div></div></div>

            </div>

          </div>

          {/* Developer Guardrails */}
          <div className="col-span-12 md:col-span-4 row-span-1 bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl flex flex-col justify-center">
            <h3 className="text-lg font-black mb-2 text-black hover:text-red-500 transition-colors cursor-default px-3 py-1 rounded-lg inline-block">Developer Guardrails</h3>

            <p className="text-black text-sm mt-2">x402 provides essential guardrails for developers using x402, preventing unexpected costs, API abuse, and overuse through configurable limits and real-time enforcement.</p>

          </div>

          {/* SDK & API */}
          <div className="col-span-12 md:col-span-4 row-span-1 bg-white border-2 border-black border-dashed shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl flex flex-col justify-center">
            <h4 className="text-lg font-bold text-black hover:text-red-500 transition-colors cursor-default px-3 py-1 rounded-lg inline-block">SDK & API</h4>

            <p className="text-black text-sm mt-2 font-bold">Easy-to-use SDKs and REST APIs for defining limits, monitoring usage, and integrating guardrails into your x402-powered applications.</p>

          </div>

        </div>

        {/* FAQ SECTION - moved up */}

        <section className="relative z-10 px-4 py-16 border-t border-red-500/20 mt-12">

          <div className="max-w-3xl mx-auto">

            <h2 className="text-3xl text-black font-black mb-8 text-center">Frequently Asked Questions</h2>

            <div className="space-y-4">

              {faqs.map((faq, index) => (

                <div key={index} className="border-2 border-red-500 rounded-2xl overflow-hidden bg-white">

                  <button

                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}

                    className="w-full p-6 text-left flex items-center justify-between text-black hover:bg-red-500 hover:text-white transition-all duration-300 focus:outline-none"

                  >

                    <span className="font-medium text-lg">{faq.q}</span>

                    <span className="text-2xl">{expandedFaq === index ? '−' : '+'}</span>

                  </button>

                  {expandedFaq === index && (

                    <div className="px-6 pb-6 text-black/80 animate-fade-in bg-white">{faq.a}</div>

                  )}

                </div>

              ))}

            </div>

          </div>

        </section>

    

       

      </div>

    </div>

  );

}

