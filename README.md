# Zama-X402: Pay-Per-Use Confidential DApp

Zama-X402 is a cutting-edge decentralized application (dApp) demonstrating pay-per-use confidential transactions using Fully Homomorphic Encryption (FHE) technology. Built on x402 payment protocol and Zama's FHEVM, it enables secure token transfers and payment verification for metered API usage.

## What is Zama-X402?

Zama-X402 is a comprehensive pay-per-use platform showcasing the future of confidential Web3 applications. It combines:

- **Pay-Per-Use Model**: Charge based on actual usage and resource consumption
- **Confidential Token Management**: ERC7984 standard with FHE encryption
- **Real-time Billing**: Automatic payment processing per API call or transaction

## Key Features

### **Pay-Per-Use Payment Flow**
- **Metered Billing**: Charge users based on actual usage (API calls, computations, etc.)
- **Automatic Payments**: Seamless payment processing without user intervention
- **Usage Tracking**: Monitor and control resource consumption in real-time
- **Scalable Architecture**: Handle high-volume transactions efficiently

### **Confidential Token Operations**
- **Encrypted Balance Viewing**: View token balances without revealing amounts
- **Secure Decryption**: Decrypt balance handles using FHEVM technology
- **Private Transfers**: Execute token transfers while maintaining privacy
- **ERC7984 Compliance**: Full support for confidential token standard

### **User Experience**
- **Intuitive Interface**: Clean, modern design with red theme
- **Wallet Integration**: Seamless MetaMask and Web3 wallet support
- **Real-time Updates**: Live transaction status and balance updates
- **Mobile Responsive**: Works perfectly on all device sizes

## How It Works

### **Pay-Per-Use Payment Flow**

```
1. User Makes API Request / Uses Service
   ↓
2. Server Detects Usage and Calculates Cost
   ↓
3. x402 Payment Requirement Returned (402 status)
   ↓
4. Automatic Token Transfer to Merchant
   ↓
5. Payment Verified via Facilitator Service
   ↓
6. User Receives Service / API Response
```

### **Confidential Balance Flow**

```
1. Encrypted Balance Handle Retrieved from Blockchain
   ↓
2. User Creates Decryption Signature (Required for Security)
   ↓
3. FHEVM Processes Encrypted Data Locally
   ↓
4. Balance Decrypted and Displayed to User Only
   ↓
5. No Sensitive Data Exposed to Third Parties
```

### **Developer Integration Flow**

```
1. Define Usage-based Pricing (Per Call, Per Computation, etc.)
   ↓
2. Implement x402 Payment Check in API Route
   ↓
3. Handle 402 Responses and Automatic Payment Flow
   ↓
4. Verify Payments with Facilitator Service
   ↓
5. Provide Service / API Response to User
```

## Shielded Pool (`fhe-shielded-pool` scheme)

The original `fhe-transfer` scheme above hides the payment **amount** (via ERC7984), but the merchant's
payout address is a public config value shown in every 402 response, and the server learns the payer's
wallet address directly (the decryption-signature payload includes it). The `fhe-shielded-pool` scheme
is a Phase 1 upgrade that makes merchant and payer blind to **each other**, while coexisting with the
original scheme (both remain independently usable — see the two tabs in `/test`).

Reference/prior art: [ZeroGate](https://github.com/ayushsingh82/ZeroGate) proved this "blind pool"
pattern on Stellar/Soroban using Groth16 ZK + Merkle commitments. This port keeps the same
commitment-gated blind-pool shape but runs on Solidity/FHEVM instead, and — unlike ZeroGate, whose
deposits are plaintext — keeps the payment amount FHE-encrypted throughout.

### Flow

```
1. Call protected resource ──▶ HTTP 402 ──▶ { poolAddress, resourceId }   (no merchant address, ever)
2. Client generates a random secret, computes commitment = hash(secret, resourceId, expiry)
3. Client grants ShieldedPool operator status on the token (setOperator, like an ERC20 approve)
4. Client calls ShieldedPool.depositAndRegister(encryptedAmount, proof, commitment, resourceId, expiry)
     — atomic: deposit into the pool's aggregate confidential balance + commitment registration in one tx
5. Client POSTs { commitment, resourceId, expiry } to OUR OWN /api/shielded/subscribe
     — never a third-party facilitator, and never a wallet address
6. Server RPC-reads ShieldedPool.isCommitmentValid(commitment, resourceId), issues an HMAC session token
7. Client presents X-Shielded-Session to access the protected resource — server never logs a wallet
8. Merchant calls ShieldedPool.claim(resourceId, encryptedAmount, proof) whenever, from the pool's
     aggregate balance — decoupled in time and amount from any specific deposit
```

### Bidirectional-blindness comparison

| Property | `fhe-transfer` (original) | `fhe-shielded-pool` (Phase 1) |
|---|---|---|
| Merchant payout address in 402 response | Visible (`payTo`) | Hidden (only pool address + opaque `resourceId`) |
| Merchant payout address in payer's transaction | Visible (`to`) | Hidden (`to` = pool, shared by every merchant) |
| Server learns payer's wallet address | Yes (`decryptionSignature.userAddress`) | No — `/api/shielded/subscribe` never receives one |
| Payment amount | Encrypted (ERC7984) | Encrypted (ERC7984) — unchanged |
| Amount verified against resource price | Yes (facilitator decrypts off-chain) | **No — known Phase 1 limitation, see below** |
| Link between a specific deposit and a specific merchant payout | Direct (1 transfer = 1 payment) | Broken (aggregate pool, merchant withdraws in batches) |
| Depositing wallet visible to a block explorer | Yes | Yes — **unchanged, Phase 2 scope** |

### Known limitations (Phase 1)

- **On-chain amount is not enforced against the resource's price.** `FHESafeMath.tryDecrease` (used
  throughout ERC7984) silently caps an insufficient transfer at 0 rather than reverting, so nothing
  on-chain currently checks that a deposit actually meets a resource's price. This is a real regression
  versus `fhe-transfer`, which does verify amount today via the facilitator's decryption — traded
  deliberately for merchant/server blindness. What *is* prevented (see `ShieldedPool.sol` and its test
  suite's "CRITICAL ANTI-BYPASS CHECK") is registering a commitment with **zero** payment at all:
  deposit and commitment registration are atomic in a single `depositAndRegister` call, so there is no
  way to obtain a session token without at least some real, non-zero confidential transfer occurring.
- **The frontend's FHEVM wiring is real** (`@zama-fhe/relayer-sdk`, via `hooks/fhevm/useFhevmInstance.tsx`)
  but the full deposit → claim flow has only been verified via real `fhevm.createEncryptedInput()`
  hardhat tests (`contract/test/ShieldedPool.ts`) and manual `next build`/route-level checks — not yet
  exercised end-to-end against a live Sepolia deployment with a real wallet. Deploy
  `contract/ignition/modules/ShieldedPool.ts`, set `NEXT_PUBLIC_SHIELDED_POOL_ADDRESS` and
  `SHIELDED_SESSION_SECRET`, then run the flow manually through the "Shielded Pool" tab in `/test`.

### Phase 2 (not implemented, deliberately out of scope for now)

- **Depositor anonymity.** Hiding the depositing wallet from a block explorer needs one more layer on
  top of the pool: either a relayer/paymaster (shared across many users, so the on-chain sender isn't
  any one payer's real wallet) or a ZK membership proof at claim time (Tornado-Cash-style: prove "I own
  one of N deposits" without revealing which).
- **On-chain amount enforcement**, e.g. via Zama's async public-decrypt/disclosure gateway pattern
  (`FHE.makePubliclyDecryptable` / `requestDiscloseEncryptedAmount`, already present in base
  `ERC7984.sol`) to publicly disclose an `FHE.ge(transferredAmount, price)` flag without adding a full
  ZK circuit.

## Use Cases

### **For Developers**
- **API Monetization**: Charge per API call with privacy
- **AI/ML Services**: Pay-per-computation for machine learning models
- **Data Processing**: Meter usage of data analysis services
- **Gaming**: Pay-per-action in blockchain games

### **For End Users**
- **Affordable Access**: Pay only for what you use
- **Privacy Protection**: Usage patterns remain confidential
- **Transparent Billing**: Clear cost per service usage
- **Budget Control**: Built-in spending limits and quotas

### **For Businesses**
- **SaaS Platforms**: Convert to usage-based billing model
- **Cloud Services**: Meter compute, storage, and bandwidth
- **Enterprise APIs**: Charge enterprise clients per request
- **Microservices**: Pay-per-use architecture implementation

## Technical Architecture

### **Frontend Stack**
- **Next.js 16**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety and developer experience
- **Tailwind CSS**: Utility-first styling with custom red theme
- **Wagmi**: Ethereum interaction hooks and utilities
- **RainbowKit**: Professional wallet connection interface

### **Blockchain Integration**
- **ERC7984**: Confidential token standard for encrypted balances
- **FHEVM**: Fully Homomorphic Encryption Virtual Machine
- **Sepolia**: Ethereum testnet for development and testing
- **Viem**: Type-safe Ethereum blockchain interactions

### **Payment Protocol**
- **x402**: Pay-per-use payment verification protocol
- **FHE Transfer**: Encrypted value transfer mechanism
- **Facilitator Service**: Decentralized payment validation
- **Metered Billing**: Automatic usage tracking and billing

## Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

### **Required Configuration**

```env
# Blockchain Configuration
NEXT_PUBLIC_TOKEN_ADDRESS=0x803d7ADD44B238F40106B1C4439ecAcd05910dc7
NEXT_PUBLIC_MERCHANT_ADDRESS=0x3bc07042670a3720c398da4cd688777b0565fd10

# Facilitator Service (fhe-transfer scheme only)
NEXT_PUBLIC_FACILITATOR_URL=https://zama-facilitator.ultravioletadao.xyz
FACILITATOR_URL=https://zama-facilitator.ultravioletadao.xyz

# Shielded Pool (fhe-shielded-pool scheme) — see "Shielded Pool" section above.
# Deploy contract/ignition/modules/ShieldedPool.ts to get a real pool address.
NEXT_PUBLIC_SHIELDED_POOL_ADDRESS=0xYourDeployedShieldedPoolAddress
# Server-only secret used to sign/verify shielded-pool session tokens. Generate your own — never
# reuse this placeholder in production.
SHIELDED_SESSION_SECRET=replace-with-a-long-random-secret

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

### **Optional Configuration**

```env
# Advanced Settings
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=info

# Custom Theme
NEXT_PUBLIC_PRIMARY_COLOR=red
NEXT_PUBLIC_ACCENT_COLOR=red-500

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_PAYMENT_FLOW=true
NEXT_PUBLIC_ENABLE_BALANCE_DECRYPTION=true
NEXT_PUBLIC_ENABLE_USAGE_TRACKING=true
```

### **Development Configuration**

```env
# For Local Development
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_SKIP_PAYMENT_VERIFICATION=false

# Contract Addresses (Local)
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourLocalContractAddress
NEXT_PUBLIC_VERIFIER_ADDRESS=0xYourVerifierAddress
```

> **Note:** the FHEVM instance is no longer mocked — `hooks/fhevm/useFhevmInstance.tsx` wires up the
> real `@zama-fhe/relayer-sdk` (via `initSDK()`/`createInstance()`), so `NEXT_PUBLIC_MOCK_FHEVM` no
> longer does anything and has been removed. Testing the demo requires a real wallet connected to
> Sepolia with testnet ETH and confidential tokens.

## Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH for testing

### **Installation & Setup**

1. **Clone and Install**
```bash
cd my-app
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Access Application**
- Homepage: [http://localhost:3000](http://localhost:3000)
- Demo Page: [http://localhost:3000/test](http://localhost:3000/test)

### **Testing the Pay-Per-Use Demo**

1. **Connect Wallet**: Use MetaMask to connect to Sepolia testnet
2. **View Encrypted Balance**: See your confidential token balance
3. **Create Signature**: Generate decryption signature for security
4. **Decrypt Balance**: View actual balance amount privately
5. **Test Pay-Per-Use**: Use "Fetch Premium Data" to trigger x402 pay-per-use flow
6. **Verify Usage Billing**: Complete payment and see automatic usage billing

## Project Structure

```
my-app/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── premium-data/        # fhe-transfer protected endpoint
│   │   ├── premium-shielded/    # fhe-shielded-pool protected endpoint
│   │   ├── shielded/subscribe/  # Issues shielded-pool session tokens (our own server, no facilitator)
│   │   └── facilitator/         # Third-party facilitator integration (fhe-transfer scheme only)
│   ├── test/                    # Demo and testing interface
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── ERC7984Demo.tsx           # Thin tab shell (wallet/SDK gating + tab switcher)
│   ├── shielded/
│   │   ├── DirectTransferDemo.tsx # fhe-transfer scheme UI (extracted from ERC7984Demo.tsx)
│   │   └── ShieldedPoolDemo.tsx   # fhe-shielded-pool scheme UI
│   ├── Landing.tsx                # Landing page component
│   ├── Providers.tsx              # Web3 providers setup
│   └── ScriptLoader.tsx           # Inert placeholder (SDK init now lives in useFhevmInstance)
├── hooks/                         # Custom React hooks
│   ├── erc7984/                  # ERC7984 interactions
│   ├── fhevm/useFhevmInstance.tsx # Real @zama-fhe/relayer-sdk wiring (shared by both schemes)
│   ├── shielded-pool/             # Deposit + commitment + session orchestration
│   └── x402/                      # fhe-transfer payment processing
├── lib/                           # Core utilities
│   ├── abi/                       # Shared ABI fragments (erc7984.ts, shieldedPool.ts)
│   ├── viem/publicClient.ts        # Server-only read-only RPC client
│   └── x402-fhe/                  # x402 FHE payment systems
│       ├── client.ts               # fhe-transfer payment client
│       ├── shielded-pool.ts        # fhe-shielded-pool client utils (commitment, session request)
│       ├── shielded-session.ts     # Server-only HMAC session issue/verify
│       ├── middleware.ts           # 402-response builders for both schemes
│       └── types.ts                # TypeScript types for both schemes
├── contract/                      # Smart contracts
│   ├── contracts/                 # Solidity contracts
│   │   ├── ERC7984.sol            # Confidential token
│   │   └── ShieldedPool.sol       # Bidirectional-blindness pool (Phase 1)
│   ├── ignition/modules/          # Deployment modules (Lock.ts, ShieldedPool.ts)
│   ├── test/                      # Contract tests (ERC7984.ts, ShieldedPool.ts)
│   └── hardhat.config.ts          # Hardhat configuration
└── public/                        # Static assets
```

## Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### **Key Components**

#### **ERC7984Demo.tsx**
Main pay-per-use demonstration interface:
- Wallet connection and network detection
- Encrypted balance management
- x402 pay-per-use payment flow
- Real-time transaction status

#### **useERC7984Wagmi Hook**
ERC7984 token interaction utility:
- Encrypted balance queries
- Confidential transfer execution
- Balance decryption handling

#### **useX402Payment Hook**
Pay-per-use payment processing:
- Usage-based payment detection
- Automatic payment orchestration
- Facilitator verification

## Security Features

- **Fully Homomorphic Encryption**: All computations on encrypted data
- **Usage-based Validation**: Payment verification without data exposure
- **Client-Side Processing**: Sensitive operations in user browser
- **Type Safety**: Full TypeScript coverage
- **Audit Trail**: Usage tracking with privacy protection

## Advanced Applications

### **Privacy Games**
- **FHE Wordle**: Privacy-preserving word guessing with encrypted comparisons
- **Confidential Auctions**: Multiple auction types with encrypted bids
- **Private Gaming**: Fair play with confidential game logic

### **Token & Wrapper Contracts**
- **ERC7984**: Confidential token for encrypted balances
- **ERC20 Wrapper**: Wrap standard tokens for privacy
- **ETH Wrapper**: Native ETH privacy wrapper
- **Faucet Contract**: Test token distribution system

### **Developer Tools**
- **Usage Analytics**: Track pay-per-use patterns
- **Billing Dashboard**: Monitor revenue and usage
- **Privacy SDK**: Easy integration for developers

## Contributing

This is a demonstration project for x402 pay-per-use capabilities. For contributions:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Resources

- [x402 Protocol Documentation](https://docs.zama.ai/fhevm)
- [ERC7984 Standard](https://eips.ethereum.org/EIPS/eip-7984)
- [Zama FHEVM](https://www.zama.ai/fhevm)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://www.rainbowkit.com)

## License

This project is for demonstration purposes. Smart contracts have individual licensing in the contract directory.

---

*Empowering pay-per-use confidential applications for the decentralized future*
