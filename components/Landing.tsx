'use client';

import Link from 'next/link';

import React from 'react';

import { ConnectButton } from '@rainbow-me/rainbowkit';

import { useAccount } from 'wagmi';

const faqs = [

  {

    q: 'What is x402 pay-per-use?', 

    a: 'x402 is a pay-per-use payment protocol powered by Zama FHE that charges users based on actual usage - whether that\'s API calls, computations, or resource consumption. Each transaction is processed through FHEVM for privacy while enabling automatic billing.'

  },

  {

    q: 'How does FHE Wordle work?',

    a: 'FHE Wordle is a privacy-preserving word guessing game where letter comparisons happen on encrypted data. Players can guess words without revealing their guesses to the game server, while still getting feedback on correct letters and positions.'

  },

  {

    q: 'What are Confidential Auctions?', 

    a: 'Confidential auctions use FHE to keep bids encrypted throughout the auction process. This enables blind auctions with sealed bids and Dutch auctions with descending prices, ensuring bid privacy while maintaining fairness and transparency.'

  },

  {

    q: 'How do Token Wrappers work?', 

    a: 'Token wrappers convert standard tokens (ERC20, ETH) into confidential versions using FHE encryption. Users can maintain privacy while trading, with balances and amounts encrypted on-chain but still usable for transactions.'

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

              <p className="text-sm font-black text-black hover:text-red-500 transition-colors cursor-default px-3 py-2 rounded-lg inline-block">Pay-Per-Use Confidential Applications</p>

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

          {/* Privacy Games */}

          <div className="col-span-12 md:col-span-6 row-span-2 bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl flex flex-col justify-center">

            <h2 className="text-xl font-black mb-4 text-black hover:text-red-500 transition-colors cursor-default px-3 py-2 rounded-lg inline-block">Privacy Games</h2>

            <p className="text-sm text-black leading-relaxed mb-4">Experience gaming with complete privacy using FHE encryption.</p>

            <ul className="space-y-2 text-sm">

              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">FHE Wordle - Encrypted word guessing</span></li>

              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Letter comparisons on encrypted data</span></li>

              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Fair play without revealing guesses</span></li>

            </ul>

          </div>

          {/* Confidential Auctions */}

          <div className="col-span-12 md:col-span-6 row-span-2 bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl flex flex-col justify-center">

            <h2 className="text-xl font-black mb-4 text-black hover:text-red-500 transition-colors cursor-default px-3 py-2 rounded-lg inline-block">Confidential Auctions</h2>

            <p className="text-sm text-black mb-4 leading-relaxed">Multiple auction implementations with encrypted bids:</p>

            <ul className="space-y-2 text-sm">

              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Blind auctions with sealed bids</span></li>

              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Dutch auctions with descending prices</span></li>

              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Bid privacy throughout process</span></li>

              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Fair and transparent outcome</span></li>

            </ul>

          </div>

          {/* Token & Wrapper Contracts */}

          <div className="col-span-12 md:col-span-8 row-span-2 bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl flex flex-col justify-center">

            <h2 className="text-xl font-black mb-4 text-black hover:text-red-500 transition-colors cursor-default px-3 py-2 rounded-lg inline-block">Token & Wrapper Contracts</h2>

            <p className="text-sm text-black mb-4 leading-relaxed">Convert standard tokens into confidential versions:</p>

            <div className="grid grid-cols-2 gap-4 text-sm">

              <div>

                <h4 className="font-bold text-black mb-2">Token Types:</h4>

                <ul className="space-y-1">

                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500"></span><span>Confidential Token Example</span></li>

                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500"></span><span>ERC20 Wrapper</span></li>

                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500"></span><span>ETH Wrapper</span></li>

                </ul>

              </div>

              <div>

                <h4 className="font-bold text-black mb-2">Features:</h4>

                <ul className="space-y-1">

                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500"></span><span>Encrypted balances</span></li>

                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500"></span><span>Private transactions</span></li>

                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500"></span><span>Faucet Contract</span></li>

                </ul>

              </div>

            </div>

          </div>

          {/* Pay-Per-Use Model */}

          <div className="col-span-12 md:col-span-4 row-span-1 bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl flex flex-col justify-center">

            <h3 className="text-lg font-black mb-2 text-black hover:text-red-500 transition-colors cursor-default px-3 py-1 rounded-lg inline-block">Pay-Per-Use Model</h3>

            <p className="text-black text-sm mt-2">Charge users based on actual usage - API calls, computations, or resource consumption with automatic billing.</p>

          </div>

          {/* Demo Instructions */}

          <div className="col-span-12 md:col-span-4 row-span-1 bg-white border-2 border-black border-dashed shadow-[8px_8px_0_0_rgba(239, 68, 68, 0.5)] p-8 rounded-2xl flex flex-col justify-center">

            <h4 className="text-lg font-bold text-black hover:text-red-500 transition-colors cursor-default px-3 py-1 rounded-lg inline-block">Try It Now</h4>

            <p className="text-black text-sm mt-2 font-bold">Connect wallet, view encrypted balance, and test the pay-per-use payment flow with premium content access.</p>

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
