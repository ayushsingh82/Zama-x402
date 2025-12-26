# Zama-X402: Pay-Per-Use Confidential DApp

> **Developer Guardrails for x402 - Define spend limits, rate limits, and usage quotas**

Zama-X402 is a cutting-edge decentralized application (dApp) demonstrating pay-per-use confidential transactions using Fully Homomorphic Encryption (FHE) technology. Built on x402 payment protocol and Zama's FHEVM, it enables secure token transfers and payment verification for metered API usage.

## 🚀 What is Zama-X402?

Zama-X402 is a comprehensive pay-per-use platform showcasing the future of confidential Web3 applications. It combines:

- **Pay-Per-Use Model**: Charge based on actual usage and resource consumption
- **Confidential Token Management**: ERC7984 standard with FHE encryption
- **Developer Guardrails**: Built-in spend limits, rate limits, and usage quotas
- **Real-time Billing**: Automatic payment processing per API call or transaction

## ✨ Key Features

### 💳 **Pay-Per-Use Payment Flow**
- **Metered Billing**: Charge users based on actual usage (API calls, computations, etc.)
- **Automatic Payments**: Seamless payment processing without user intervention
- **Usage Tracking**: Monitor and control resource consumption in real-time
- **Scalable Architecture**: Handle high-volume transactions efficiently

### 🔐 **Confidential Token Operations**
- **Encrypted Balance Viewing**: View token balances without revealing amounts
- **Secure Decryption**: Decrypt balance handles using FHEVM technology
- **Private Transfers**: Execute token transfers while maintaining privacy
- **ERC7984 Compliance**: Full support for confidential token standard

### 🛡️ **Developer Guardrails**
- **Spend Limits**: Control maximum spending per user/session/period
- **Rate Limits**: Prevent API abuse and spam attacks
- **Usage Quotas**: Manage resource consumption effectively
- **Real-time Monitoring**: Track usage patterns and spending

### 🎨 **User Experience**
- **Intuitive Interface**: Clean, modern design with red theme
- **Wallet Integration**: Seamless MetaMask and Web3 wallet support
- **Real-time Updates**: Live transaction status and balance updates
- **Mobile Responsive**: Works perfectly on all device sizes

## 🔄 How It Works

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

## 🎯 Use Cases

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

## 🛠️ Technical Architecture

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

## 📋 Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

### **Required Configuration**

```env
# Blockchain Configuration
NEXT_PUBLIC_TOKEN_ADDRESS=0x803d7ADD44B238F40106B1C4439ecAcd05910dc7
NEXT_PUBLIC_MERCHANT_ADDRESS=0x3bc07042670a3720c398da4cd688777b0565fd10

# Facilitator Service
NEXT_PUBLIC_FACILITATOR_URL=https://zama-facilitator.ultravioletadao.xyz
FACILITATOR_URL=https://zama-facilitator.ultravioletadao.xyz

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
NEXT_PUBLIC_MOCK_FHEVM=true
NEXT_PUBLIC_SKIP_PAYMENT_VERIFICATION=false

# Contract Addresses (Local)
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourLocalContractAddress
NEXT_PUBLIC_VERIFIER_ADDRESS=0xYourVerifierAddress
```

## 🚀 Quick Start

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

## 📁 Project Structure

```
my-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── premium-data/  # Pay-per-use protected endpoints
│   │   └── facilitator/   # Facilitator integration
│   ├── test/              # Demo and testing interface
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ERC7984Demo.tsx    # Main demo component
│   ├── Landing.tsx        # Landing page component
│   ├── Providers.tsx      # Web3 providers setup
│   └── ScriptLoader.tsx   # SDK loading
├── hooks/                 # Custom React hooks
│   ├── erc7984/          # ERC7984 interactions
│   └── x402/             # Pay-per-use payment processing
├── lib/                   # Core utilities
│   └── x402-fhe/         # x402 FHE payment system
│       ├── client.ts     # Payment client
│       ├── middleware.ts # API middleware
│       └── types.ts      # TypeScript types
├── contract/             # Smart contracts
│   ├── contracts/        # Solidity contracts
│   │   ├── ERC7984.sol   # Confidential token
│   │   ├── FHEWordle.sol # Privacy game
│   │   ├── Auction.sol   # Confidential auctions
│   │   └── Faucet.sol    # Test token distribution
│   ├── test/            # Contract tests
│   └── hardhat.config.ts # Hardhat configuration
└── public/              # Static assets
```

## 🧪 Development

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

## 🔒 Security Features

- **Fully Homomorphic Encryption**: All computations on encrypted data
- **Usage-based Validation**: Payment verification without data exposure
- **Client-Side Processing**: Sensitive operations in user browser
- **Type Safety**: Full TypeScript coverage
- **Audit Trail**: Usage tracking with privacy protection

## 🌟 Advanced Applications

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

## 🤝 Contributing

This is a demonstration project for x402 pay-per-use capabilities. For contributions:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📚 Resources

- [x402 Protocol Documentation](https://docs.zama.ai/fhevm)
- [ERC7984 Standard](https://eips.ethereum.org/EIPS/eip-7984)
- [Zama FHEVM](https://www.zama.ai/fhevm)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://www.rainbowkit.com)

## 📄 License

This project is for demonstration purposes. Smart contracts have individual licensing in the contract directory.

---

**Built with ❤️ by the Zama-X402 Team**

*Empowering pay-per-use confidential applications for the decentralized future*
