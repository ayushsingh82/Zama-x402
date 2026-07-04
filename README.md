# Zama-X402: Confidential Pay-Per-Use

Zama-X402 is a pay-per-use x402 implementation where a protected API route returns HTTP 402
instead of data, the client pays with an FHE-encrypted [ERC7984](https://eips.ethereum.org/EIPS/eip-7984)
transfer into a shared pool, and the resource is served once payment is confirmed.

**Amount hidden. Merchant hidden. Always.** This isn't two schemes to choose between — it's one
flow with both properties by default:

- The payment amount is FHE-encrypted end to end (ERC7984), so it's never visible on-chain.
- The merchant's address never appears in the 402 response. Payment goes into a shared pool
  gated by a commitment hash, and the server only ever sees that commitment — never a wallet.

Reference/prior art: [ZeroGate](https://github.com/ayushsingh82/ZeroGate) proved this "blind pool"
pattern on Stellar/Soroban using Groth16 ZK + Merkle commitments. This port keeps the same
commitment-gated blind-pool shape but runs on Solidity/FHEVM instead, and — unlike ZeroGate, whose
deposits are plaintext — keeps the payment amount FHE-encrypted throughout.

## How it works

```
1. Call protected resource ──▶ HTTP 402 ──▶ { poolAddress, resourceId }   (no merchant address, ever)
2. Client generates a random secret, computes commitment = hash(secret, resourceId, expiry)
3. Client grants ShieldedPool operator status on the token (setOperator, like an ERC20 approve)
4. Client calls ShieldedPool.depositAndRegister(encryptedAmount, proof, commitment, resourceId, expiry)
     — atomic: deposit into the pool's aggregate confidential balance + commitment registration in one tx
5. Client POSTs { commitment, resourceId, expiry } to our own /api/shielded/subscribe
     — never a third-party facilitator, and never a wallet address
6. Server RPC-reads ShieldedPool.isCommitmentValid(commitment, resourceId), issues an HMAC session token
7. Client presents X-Shielded-Session to access the protected resource — server never logs a wallet
8. Merchant calls ShieldedPool.claim(resourceId, encryptedAmount, proof) whenever, from the pool's
     aggregate balance — decoupled in time and amount from any specific deposit
```

The full write-up (privacy guarantee table, contract reference, request/response shapes) is on the
[`/docs`](http://localhost:3000/docs) page once the app is running.

## Privacy guarantee

| Who | What they learn | Why |
|---|---|---|
| Payer | Never learns any merchant identity beyond an opaque `resourceId` | The 402 response has only `poolAddress` + `resourceId`, never a merchant address |
| Server | Never sees a wallet address | `/api/shielded/subscribe` takes only `{ commitment, resourceId, expiry }` |
| On-chain observer | Sees the depositing wallet, but not which merchant it paid | Every deposit goes to the same pool address; only the merchant's later `claim()` reveals a payout, decoupled in time and amount |

## Known limitations

- **On-chain amount is not enforced against the resource's price.** `FHESafeMath.tryDecrease` (used
  throughout ERC7984) silently caps an insufficient transfer at 0 rather than reverting, so nothing
  on-chain currently checks that a deposit actually meets a resource's price. What *is* prevented
  (see `ShieldedPool.sol` and its test suite's "CRITICAL ANTI-BYPASS CHECK") is registering a
  commitment with **zero** payment at all: deposit and commitment registration are atomic in a
  single `depositAndRegister` call, so there is no way to obtain a session token without at least
  some real, non-zero confidential transfer occurring.
- **The depositing wallet is still visible on-chain.** Every deposit goes to the same pool address,
  so an explorer can see *that* a wallet paid, just not *which merchant* it paid. Full depositor
  anonymity is a scoped next step (see below).
- **The frontend's FHEVM wiring is real** (`@zama-fhe/relayer-sdk`, via `hooks/fhevm/useFhevmInstance.tsx`)
  but the full deposit → claim flow has only been verified via real `fhevm.createEncryptedInput()`
  hardhat tests (`contract/test/ShieldedPool.ts`) and manual `next build`/route-level checks — not yet
  exercised end-to-end against a live Sepolia deployment with a real wallet.

### Not yet implemented (deliberately out of scope for now)

- **Depositor anonymity.** Hiding the depositing wallet from a block explorer needs one more layer on
  top of the pool: either a relayer/paymaster (shared across many users, so the on-chain sender isn't
  any one payer's real wallet) or a ZK membership proof at claim time (Tornado-Cash-style: prove "I own
  one of N deposits" without revealing which).
- **On-chain amount enforcement**, e.g. via Zama's async public-decrypt/disclosure gateway pattern
  (`FHE.makePubliclyDecryptable` / `requestDiscloseEncryptedAmount`, already present in base
  `ERC7984.sol`) to publicly disclose an `FHE.ge(transferredAmount, price)` flag without adding a full
  ZK circuit.

### Technical note: the older `fhe-transfer` scheme

The codebase also still contains a simpler `fhe-transfer` scheme (`/api/premium-data`) — a direct
confidential transfer straight to a public merchant address, verified by a third-party facilitator
that decrypts the amount off-chain. It's kept working for comparison in the `/test` demo page, but
it is **not** the product's primary flow: it hides the amount but not the merchant, and the server
does learn the payer's wallet address. The shielded pool above is the one actually presented as
"the" flow throughout the landing page, dashboard, and docs.

## Technical Architecture

**Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Wagmi, RainbowKit.

**Blockchain**: ERC7984 confidential token, FHEVM, Sepolia testnet, Viem.

**Payment protocol**: x402, ERC7984 confidential transfers, HMAC session tokens (shielded pool),
third-party facilitator (legacy `fhe-transfer` path only).

## Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Blockchain Configuration
NEXT_PUBLIC_TOKEN_ADDRESS=0x803d7ADD44B238F40106B1C4439ecAcd05910dc7
NEXT_PUBLIC_MERCHANT_ADDRESS=0x3bc07042670a3720c398da4cd688777b0565fd10

# Shielded Pool — deploy contract/ignition/modules/ShieldedPool.ts to get a real pool address.
NEXT_PUBLIC_SHIELDED_POOL_ADDRESS=0xYourDeployedShieldedPoolAddress
# Server-only secret used to sign/verify shielded-pool session tokens. Generate your own — never
# reuse this placeholder in production.
SHIELDED_SESSION_SECRET=replace-with-a-long-random-secret

# Facilitator Service (legacy fhe-transfer scheme only)
NEXT_PUBLIC_FACILITATOR_URL=https://zama-facilitator.ultravioletadao.xyz
FACILITATOR_URL=https://zama-facilitator.ultravioletadao.xyz

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

> **Note:** the FHEVM instance is no longer mocked — `hooks/fhevm/useFhevmInstance.tsx` wires up the
> real `@zama-fhe/relayer-sdk` (via `initSDK()`/`createInstance()`). Testing the demo requires a real
> wallet connected to Sepolia with testnet ETH and confidential tokens.

## Quick Start

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH for testing

### Installation & Setup

```bash
npm install
cp .env.example .env.local   # then edit with your configuration
npm run dev
```

### Pages

- **`/`** — Landing page
- **`/app`** — Service dashboard: available pay-per-use services, stats, and a "Pay & Subscribe" entry point
- **`/app/history`** — Local payment receipt log (persisted to `localStorage`, never sent to a server)
- **`/app/playground`** — Call the protected endpoint directly and inspect the raw 402/200 responses
- **`/docs`** — Full technical write-up: privacy guarantee, contract reference, request/response shapes, quick start
- **`/test`** — Low-level demo/comparison interface for both the shielded-pool and legacy fhe-transfer flows

### Testing the flow

1. Connect a wallet to Sepolia testnet
2. Open `/app` and pay for a service — this deposits into the pool and requests a session token
3. Check `/app/history` for the receipt and `/app/playground` to call the endpoint directly

## Project Structure

```
Zama-x402/
├── app/                            # Next.js App Router
│   ├── api/
│   │   ├── premium-shielded/       # The protected resource — amount + merchant both hidden
│   │   ├── premium-data/           # Legacy fhe-transfer protected endpoint (see Technical note)
│   │   ├── shielded/subscribe/     # Issues session tokens (our own server, no facilitator)
│   │   └── facilitator/            # Third-party facilitator integration (fhe-transfer only)
│   ├── app/                        # Dashboard: page.tsx, history/, playground/, layout.tsx (sidebar + topbar)
│   ├── docs/                       # Full technical documentation page
│   ├── test/                       # Low-level demo/comparison interface
│   ├── layout.tsx                  # Root layout with providers
│   └── page.tsx                    # Landing page
├── components/
│   ├── Landing.tsx                 # Landing page
│   ├── Docs.tsx                    # /docs page content
│   ├── PageHeader.tsx              # Shared logo + wallet-connect header
│   ├── Reveal.tsx                  # Scroll-triggered fade-in wrapper
│   ├── Footer.tsx
│   ├── app/                        # Dashboard-only components (AppSidebar, AppTopbar)
│   ├── ERC7984Demo.tsx             # /test tab shell (wallet/SDK gating + tab switcher)
│   └── shielded/
│       ├── DirectTransferDemo.tsx  # Legacy fhe-transfer UI
│       └── ShieldedPoolDemo.tsx    # Shielded-pool UI
├── hooks/
│   ├── erc7984/                    # ERC7984 interactions
│   ├── fhevm/useFhevmInstance.tsx  # Real @zama-fhe/relayer-sdk wiring
│   ├── shielded-pool/              # Deposit + commitment + session orchestration
│   └── x402/                       # Legacy fhe-transfer payment processing
├── lib/
│   ├── abi/                        # Shared ABI fragments
│   ├── app/services.ts             # Dashboard/playground service catalog
│   ├── viem/publicClient.ts        # Server-only read-only RPC client
│   └── x402-fhe/
│       ├── shielded-pool.ts        # Client utils (commitment, session request)
│       ├── shielded-session.ts     # Server-only HMAC session issue/verify
│       ├── paymentHistory.ts       # Client-side localStorage payment receipt log
│       ├── middleware.ts           # 402-response builders
│       ├── client.ts               # Legacy fhe-transfer payment client
│       └── types.ts
├── contract/
│   ├── contracts/
│   │   ├── ERC7984.sol             # Confidential token
│   │   └── ShieldedPool.sol        # Aggregate confidential-balance pool
│   ├── ignition/modules/           # Deployment modules
│   ├── test/                       # Contract tests
│   └── hardhat.config.ts
└── public/                         # Static assets
```

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Resources

- [ERC7984 Standard](https://eips.ethereum.org/EIPS/eip-7984)
- [Zama FHEVM](https://www.zama.ai/fhevm)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://www.rainbowkit.com)

## License

This project is for demonstration purposes. Smart contracts have individual licensing in the contract directory.
