'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

function DocsHeader() {
  return (
    <div className="lg:hidden absolute top-6 left-6 z-10">
      <Link href="/" className="focus:outline-none">
        <div className="bg-red-500 border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-6 py-3 rounded-lg cursor-pointer hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">
          <h1 className="text-2xl font-black text-black">Zama-X402</h1>
        </div>
      </Link>
    </div>
  );
}

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'privacy', label: 'Privacy guarantee' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'x402', label: 'x402 flow' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'api', label: 'API reference' },
  { id: 'quickstart', label: 'Quick start' },
];

/** Fixed to the viewport (not `sticky`) so it never scrolls away, however tall the content gets. */
function Sidebar({ active }: { active: string }) {
  return (
    <aside className="hidden lg:flex flex-col gap-8 fixed top-0 left-0 h-screen w-56 flex-shrink-0 border-r-2 border-black bg-white z-20 px-6 py-8 overflow-y-auto">
      <Link href="/" className="focus:outline-none">
        <div className="bg-red-500 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-4 py-2 rounded-lg inline-block">
          <p className="text-lg font-black text-black">Zama-X402</p>
        </div>
      </Link>
      <nav className="space-y-1">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`block text-sm font-bold py-1.5 pl-4 border-l-2 transition-all ${
              active === s.id
                ? 'border-red-500 text-red-500'
                : 'border-black/10 text-black/50 hover:text-black hover:border-black/30'
            }`}
          >
            {s.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function Code({ children, label }: { children: string; label?: string }) {
  return (
    <div className="border-2 border-black bg-gray-50 rounded-lg overflow-hidden">
      {label && (
        <div className="px-4 py-2 border-b-2 border-black bg-white">
          <span className="text-xs font-mono font-bold text-black/50">{label}</span>
        </div>
      )}
      <pre className="p-4 text-xs font-mono text-black overflow-x-auto leading-relaxed whitespace-pre">{children}</pre>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-500 text-white">
      {children}
    </span>
  );
}

const privacyRows = [
  {
    who: 'Payer',
    learns: 'Never learns any merchant identity beyond an opaque resourceId',
    why: 'The 402 response has only poolAddress + resourceId, never a merchant address',
  },
  {
    who: 'Server',
    learns: 'Never sees a wallet address',
    why: '/api/shielded/subscribe takes only { commitment, resourceId, expiry }',
  },
  {
    who: 'On-chain observer',
    learns: 'Sees the depositing wallet, but not which merchant it paid',
    why: 'Every deposit goes to the same pool address; only the merchant\'s later claim() reveals a payout, decoupled in time and amount',
  },
];

const howItWorksSteps = [
  {
    step: '01',
    title: 'Protected route returns 402',
    body: 'A GET to /api/premium-shielded without a valid session returns HTTP 402 with only a pool address and an opaque resourceId - never a merchant address.',
  },
  {
    step: '02',
    title: 'Client deposits into the pool',
    body: 'A commitment is computed client-side, then ShieldedPool.depositAndRegister() deposits an FHE-encrypted amount and registers the commitment atomically in one transaction.',
  },
  {
    step: '03',
    title: 'Client requests a session, not the merchant',
    body: 'The commitment is POSTed to our own /api/shielded/subscribe, which RPC-reads isCommitmentValid() and issues an HMAC session token. No wallet address is ever sent.',
  },
  {
    step: '04',
    title: 'Resource is served',
    body: 'The protected route returns its data. The server never logged a wallet address at any point in the flow.',
  },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState('overview');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="font-sans tracking-tight relative overflow-x-hidden min-h-screen bg-white">
      <DocsHeader />
      <Sidebar active={activeSection} />

      <div className="max-w-3xl mx-auto lg:ml-56 xl:mx-auto px-4 pt-32 pb-20">

        <div className="flex-1 min-w-0 space-y-16">

          <div>
            <h1 className="text-4xl font-black text-black bg-white px-3 py-2 rounded-lg inline-block mb-4">
              Zama-X402 Docs
            </h1>
            <p className="text-black/70 max-w-xl leading-relaxed font-semibold">
              Pay-per-use x402 payments backed by ERC7984 confidential transfers on Zama&apos;s FHEVM.
              Amount hidden, merchant hidden - one flow.
            </p>
          </div>

          {/* Overview */}
          <section id="overview">
            <h2 className="text-2xl font-black text-black mb-4">Overview</h2>
            <p className="text-black/70 leading-relaxed mb-4">
              This project implements the x402 pay-per-use protocol on top of an{' '}
              <span className="font-bold text-black">ERC7984 confidential token</span>. A protected
              route returns HTTP <Badge>402 Payment Required</Badge> instead of the resource - the
              402 response never contains a merchant address, only a shared pool address and an
              opaque resourceId.
            </p>
            <div className="border-2 border-black rounded-lg p-5 bg-white shadow-[4px_4px_0_0_rgba(239,68,68,0.5)]">
              <p className="text-sm font-black text-red-500 mb-1">fhe-shielded-pool</p>
              <p className="text-xs text-black/60 leading-relaxed">Deposit into a shared pool, gated by a commitment hash. Amount is FHE-encrypted; merchant is hidden; the server never sees a wallet.</p>
            </div>
          </section>

          {/* Privacy guarantee */}
          <section id="privacy">
            <h2 className="text-2xl font-black text-black mb-2">Privacy guarantee</h2>
            <p className="text-black/70 leading-relaxed mb-6">
              The core property: neither side learns the other&apos;s identity. The shielded pool is the
              neutral intermediary between payer and merchant.
            </p>
            <div className="overflow-x-auto border-2 border-black rounded-lg">
              <table className="w-full text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b-2 border-black bg-gray-50">
                    <th className="text-left py-3 px-4 font-black text-black">Who</th>
                    <th className="text-left py-3 px-4 font-black text-black">What they learn</th>
                    <th className="text-left py-3 px-4 font-black text-black">Why</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {privacyRows.map((row) => (
                    <tr key={row.who} className="bg-white">
                      <td className="py-3 px-4 text-black font-semibold align-top">{row.who}</td>
                      <td className="py-3 px-4 text-black/70 align-top">{row.learns}</td>
                      <td className="py-3 px-4 text-black/50 text-xs leading-relaxed align-top">{row.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* How it works */}
          <section id="how-it-works">
            <h2 className="text-2xl font-black text-black mb-6">How it works</h2>
            <div className="space-y-4">
              {howItWorksSteps.map((item) => (
                <div key={item.step} className="flex gap-5 border-2 border-black rounded-lg p-5 bg-white shadow-[4px_4px_0_0_rgba(239,68,68,0.4)]">
                  <span className="text-3xl font-black text-red-500/30 leading-none flex-shrink-0">{item.step}</span>
                  <div>
                    <h3 className="text-base font-black text-black mb-1.5">{item.title}</h3>
                    <p className="text-sm text-black/60 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* x402 flow */}
          <section id="x402">
            <h2 className="text-2xl font-black text-black mb-4">x402 flow</h2>
            <p className="text-black/70 leading-relaxed mb-4">Raw request/response shapes for the shielded-pool scheme:</p>
            <div className="space-y-3">
              <Code label="GET /api/premium-shielded (no session)">{`→ HTTP 402
{
  "scheme": "fhe-shielded-pool",
  "network": "sepolia",
  "chainId": 11155111,
  "poolAddress": "0x...",       // never the merchant's address
  "asset": "0x...",
  "resourceId": "0x...",
  "maxAmountRequired": "1000000",
  "sessionEndpoint": "/api/shielded/subscribe"
}`}</Code>
              <Code label="POST /api/shielded/subscribe">{`// Body — server receives ONLY these fields:
{ "commitment": "0x...", "resourceId": "0x...", "expiry": 1735900000 }

// ✗ wallet address  ✗ tx hash  ✗ payment amount

// Response:
{ "isValid": true, "sessionToken": "<hmac>", "expiresAt": 1735900000 }`}</Code>
              <Code label="Authenticated call">{`GET /api/premium-shielded
X-Shielded-Session: <hmac-token>

→ 200 OK { "success": true, "data": { "content": "..." } }`}</Code>
            </div>
          </section>

          {/* Contracts */}
          <section id="contracts">
            <h2 className="text-2xl font-black text-black mb-4">Contracts</h2>
            <p className="text-black/70 leading-relaxed mb-4">
              <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">ShieldedPool.sol</code> holds
              the aggregate confidential balance both merchants and payers interact with.
            </p>
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b-2 border-black bg-gray-50">
                <span className="text-xs font-mono font-black text-red-500">ShieldedPool.sol</span>
              </div>
              <div className="divide-y-2 divide-black/10">
                {[
                  { fn: 'registerResource(resourceId, payoutAddress)', note: 'Owner-gated merchant registration - prevents resourceId-squatting.' },
                  { fn: 'depositAndRegister(amount, proof, commitment, resourceId, expiry)', note: 'Atomic deposit + commitment registration - a commitment can never exist without a real deposit.' },
                  { fn: 'isCommitmentValid(commitment, resourceId)', note: 'The one read the server needs to issue a session token.' },
                  { fn: 'claim(resourceId, amount, proof)', note: 'Merchant withdraws from the pool\'s aggregate balance, decoupled from any specific deposit.' },
                ].map(({ fn, note }) => (
                  <div key={fn} className="px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-2 bg-white">
                    <code className="text-xs font-mono font-bold text-black sm:w-[50%] flex-shrink-0">{fn}</code>
                    <p className="text-xs text-black/50 leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* API reference */}
          <section id="api">
            <h2 className="text-2xl font-black text-black mb-4">API reference</h2>
            <div className="space-y-2">
              {[
                { method: 'GET', path: '/api/premium-shielded', auth: 'X-Shielded-Session', desc: 'The protected resource - amount and merchant both hidden.' },
                { method: 'POST', path: '/api/shielded/subscribe', auth: 'none', desc: 'Issues a session token from a commitment. Never sees a wallet.' },
              ].map((route) => (
                <div key={route.path} className="flex flex-col sm:flex-row sm:items-start gap-3 border-2 border-black rounded-lg px-4 py-3.5 bg-white">
                  <div className="flex items-center gap-2.5 sm:w-[240px] flex-shrink-0">
                    <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-black text-white">{route.method}</span>
                    <code className="text-sm font-mono font-bold text-black">{route.path}</code>
                  </div>
                  <div className="flex items-start gap-2.5 flex-1">
                    <span className="text-xs font-mono font-bold border-2 border-red-500 text-red-500 px-2 py-0.5 rounded flex-shrink-0">{route.auth}</span>
                    <p className="text-sm text-black/60">{route.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick start */}
          <section id="quickstart">
            <h2 className="text-2xl font-black text-black mb-6">Quick start</h2>
            <div className="space-y-3">
              <Code label="1. Install and run">{`npm install
npm run dev    # http://localhost:3000`}</Code>
              <Code label="2. .env.local">{`NEXT_PUBLIC_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_MERCHANT_ADDRESS=0x...
NEXT_PUBLIC_SHIELDED_POOL_ADDRESS=0x...   # deploy contract/ignition/modules/ShieldedPool.ts
SHIELDED_SESSION_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY`}</Code>
              <Code label="3. Try it">{`1. Open /app - the service dashboard
2. Connect a Sepolia wallet with testnet ETH + confidential tokens
3. Pay for a service, then check /app/history and /app/playground`}</Code>
            </div>
          </section>

          <div className="pt-8 border-t-2 border-black/10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/app" className="inline-flex items-center gap-2 bg-red-500 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-white px-6 py-3 text-sm font-bold rounded-lg hover:bg-red-600 transition-colors">
              Open Dashboard
            </Link>
            <a
              href="https://github.com/ayushsingh82/Zama-x402"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-black/50 hover:text-black transition-colors"
            >
              GitHub - ayushsingh82/Zama-x402
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
