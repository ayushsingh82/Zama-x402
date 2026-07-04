'use client';

import Link from 'next/link';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function PageHeader() {

  return (

    <>

      <div className="absolute top-6 left-6 z-10">

        <Link href="/" className="focus:outline-none">

          <div className="bg-red-500 border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-6 py-3 rounded-lg cursor-pointer hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 flex items-center gap-3">

            <h1 className="text-2xl font-black text-black">Zama-X402</h1>

          </div>

        </Link>

      </div>

      <div className="absolute top-6 right-6 z-10">

        <ConnectButton showBalance={false} />

      </div>

    </>

  );

}
