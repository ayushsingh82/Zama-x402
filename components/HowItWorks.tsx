'use client';

import Link from 'next/link';

import PageHeader from './PageHeader';

const transferSteps = [
  'Client requests a protected route (e.g. /api/premium-data)',
  'Server responds 402 with { payTo, amount, tokenAddress } - merchant address is public',
  'Client sends an ERC7984 confidential transfer to payTo - amount is FHE-encrypted',
  'Client re-requests with the tx hash + a decryption signature',
  'Facilitator service decrypts the amount off-chain and verifies it meets the price',
  'Server returns the resource',
];

const shieldedPoolSteps = [
  'Client requests a protected route (e.g. /api/premium-shielded)',
  'Server responds 402 with { poolAddress, resourceId } - no merchant address, ever',
  'Client generates a random secret, computes commitment = hash(secret, resourceId, expiry)',
  'Client grants ShieldedPool operator status on the token (like an ERC20 approve)',
  'Client calls ShieldedPool.depositAndRegister(encryptedAmount, proof, commitment, resourceId, expiry) - deposit + commitment registration in one atomic tx',
  "Client POSTs { commitment, resourceId, expiry } to our own /api/shielded/subscribe - never a third-party facilitator, never a wallet address",
  'Server RPC-reads ShieldedPool.isCommitmentValid(...) and issues an HMAC session token',
  'Client presents X-Shielded-Session to access the resource - server never logs a wallet',
  'Merchant calls ShieldedPool.claim(...) whenever, from the pool\'s aggregate balance',
];

const comparison = [
  { property: 'Merchant address in 402 response', transfer: 'Visible (payTo)', pool: 'Hidden (only pool address + resourceId)' },
  { property: 'Merchant address in payer\'s tx', transfer: 'Visible (to)', pool: 'Hidden (to = pool, shared by every merchant)' },
  { property: 'Server learns payer\'s wallet', transfer: 'Yes', pool: 'No' },
  { property: 'Payment amount', transfer: 'Encrypted', pool: 'Encrypted' },
  { property: 'Amount verified against price', transfer: 'Yes (facilitator)', pool: 'No - Phase 1 limitation' },
  { property: 'Deposit linked to a specific payout', transfer: 'Direct (1 transfer = 1 payment)', pool: 'Broken (aggregate pool, batched claims)' },
  { property: 'Depositing wallet visible on-chain', transfer: 'Yes', pool: 'Yes - unchanged, Phase 2 scope' },
];

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500 border-2 border-black text-white font-black text-sm flex items-center justify-center">
            {i + 1}
          </span>
          <span className="text-black text-sm font-semibold leading-relaxed pt-0.5">{step}</span>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorks() {
  return (
    <div className="font-sans tracking-tight relative overflow-x-hidden">

      <PageHeader />

      {/* HERO */}
      <div className="relative pt-32 pb-8 px-4 mb-8 text-center">
        <h2 className="text-4xl font-black text-black bg-white px-3 py-2 rounded-lg inline-block italic">How It Works</h2>
        <p className="max-w-2xl mx-auto mt-4 text-black font-semibold px-3">
          Two x402 payment schemes, both backed by ERC7984 confidential transfers on Zama&apos;s FHEVM.
          They coexist - pick whichever fits your privacy requirements.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-20">

        {/* fhe-transfer flow */}
        <section className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] rounded-2xl p-8 mb-10">
          <h3 className="text-2xl font-black text-black mb-2">fhe-transfer</h3>
          <p className="text-sm text-black mb-6">Direct confidential transfer to the merchant, amount encrypted.</p>
          <StepList steps={transferSteps} />
        </section>

        {/* fhe-shielded-pool flow */}
        <section className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] rounded-2xl p-8 mb-10">
          <h3 className="text-2xl font-black text-black mb-2">fhe-shielded-pool</h3>
          <p className="text-sm text-black mb-6">Phase 1 bidirectional blindness - merchant and payer hidden from each other.</p>
          <StepList steps={shieldedPoolSteps} />
        </section>

        {/* Comparison table */}
        <section className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] rounded-2xl p-8 mb-10 overflow-x-auto">
          <h3 className="text-2xl font-black text-black mb-6">Bidirectional-blindness comparison</h3>
          <table className="w-full text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-3 pr-4 font-black text-black">Property</th>
                <th className="text-left py-3 pr-4 font-black text-black">fhe-transfer</th>
                <th className="text-left py-3 font-black text-black">fhe-shielded-pool</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={i} className="border-b border-black/10">
                  <td className="py-3 pr-4 font-semibold text-black">{row.property}</td>
                  <td className="py-3 pr-4 text-black/80">{row.transfer}</td>
                  <td className="py-3 text-black/80">{row.pool}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Known limitations */}
        <section className="bg-white border-2 border-black border-dashed shadow-[8px_8px_0_0_rgba(239,68,68,0.5)] rounded-2xl p-8 mb-10">
          <h3 className="text-2xl font-black text-black mb-4">Known limitations (Phase 1)</h3>
          <ul className="space-y-3 text-sm text-black/90 font-semibold">
            <li>
              <span className="text-red-500 font-black">•</span> The shielded pool doesn&apos;t enforce the deposited
              amount against a resource&apos;s price on-chain. What is enforced: a commitment can never be registered
              without at least some real, non-zero confidential deposit occurring (deposit + registration are atomic).
            </li>
            <li>
              <span className="text-red-500 font-black">•</span> The depositing wallet is still visible to a block
              explorer - full depositor anonymity (via a relayer/paymaster or a ZK membership proof) is Phase 2, not
              yet implemented.
            </li>
          </ul>
        </section>

        <div className="text-center">
          <Link href="/test">
            <button className="bg-red-500 border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-8 py-4 rounded-lg text-lg font-bold text-white hover:bg-red-600 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px]">
              Try Both Schemes
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
