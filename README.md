# x402 FHE Payment Demo

This is a Next.js application demonstrating x402 payment functionality using Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine) technology for confidential token transfers.

## What is x402?

x402 is a payment protocol that enables private, confidential transactions using Fully Homomorphic Encryption. This demo showcases:

- **Confidential Token Transfers**: Using ERC7984 standard with FHE encryption
- **Private Payment Verification**: Without revealing transaction details
- **Web3 Integration**: Built with Wagmi, RainbowKit, and Viem for Ethereum interaction

## Features

### 🔐 Confidential Token Balances
- View encrypted token balances without revealing amounts
- Decrypt balance handles securely using FHEVM
- Support for ERC7984 confidential token standard

### 💳 x402 Payment Flow
- Private payment verification without exposing transaction details
- Integration with facilitator services for payment validation
- Support for premium content access through payment verification

### 🛠️ Technical Implementation
- **FHEVM Integration**: Uses Zama's relayer SDK for encrypted computations
- **Next.js 16**: Modern React framework with App Router
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom design system

## Project Structure

```
my-app/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for payment processing
│   ├── test/              # Demo page for testing functionality
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ERC7984Demo.tsx    # Main demo component
│   ├── ScriptLoader.tsx   # SDK loading component
│   ├── Providers.tsx      # Web3 providers setup
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── erc7984/          # ERC7984 token interaction hooks
│   └── x402/             # Payment processing hooks
├── lib/                   # Utility libraries
│   └── x402-fhe/         # x402 FHE payment utilities
└── contract/             # Smart contracts (Hardhat)
    └── contracts/         # ERC7984 and supporting contracts
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- MetaMask or compatible Web3 wallet

### Installation

1. Clone the repository and navigate to the project:
```bash
cd my-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (create `.env.local`):
```env
NEXT_PUBLIC_TOKEN_ADDRESS=0x803d7ADD44B238F40106B1C4439ecAcd05910dc7
NEXT_PUBLIC_FACILITATOR_URL=https://zama-facilitator.ultravioletadao.xyz
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Testing the Demo

1. **Navigate to Test Page**: Go to `/test` to access the demo interface
2. **Connect Wallet**: Use MetaMask to connect to Sepolia testnet
3. **View Encrypted Balance**: See your confidential token balance
4. **Decrypt Balance**: Click to decrypt and view actual amount
5. **Test Payment Flow**: Use "Fetch Premium Data" to initiate x402 payment

## Architecture

### Frontend Stack
- **Next.js 16**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Static type checking
- **Tailwind CSS 4**: Utility-first styling
- **Wagmi**: Ethereum interaction hooks
- **RainbowKit**: Wallet connection interface

### Blockchain Integration
- **ERC7984**: Confidential token standard implementation
- **FHEVM**: Fully Homomorphic Encryption for private computations
- **Sepolia**: Ethereum testnet for development
- **Viem**: Type-safe Ethereum interactions

### Payment Protocol
- **x402**: Private payment verification protocol
- **FHE Transfer**: Encrypted value transfers
- **Facilitator Service**: Third-party payment validation

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Components

#### ERC7984Demo.tsx
Main demonstration component showcasing:
- Wallet connection and network detection
- Encrypted balance viewing and decryption
- x402 payment flow implementation
- Real-time transaction status updates

#### useERC7984Wagmi Hook
Custom hook for ERC7984 token interactions:
- Encrypted balance queries
- Confidential transfers
- Balance decryption functionality

#### useX402Payment Hook
Payment processing hook:
- Payment requirement detection
- Transaction signing and broadcasting
- Payment verification with facilitator

## Smart Contracts

The project includes ERC7984 smart contracts for confidential token functionality:
- **ERC7984.sol**: Core confidential token implementation
- **Hardhat Configuration**: Development and deployment setup
- **Test Suite**: Comprehensive contract testing

## Security Features

- **Fully Homomorphic Encryption**: All computations on encrypted data
- **Zero-Knowledge Proofs**: Transaction validation without revealing details
- **Client-Side Encryption**: Sensitive operations performed in browser
- **Type Safety**: Full TypeScript coverage for runtime safety

## Contributing

This is a demonstration project showcasing x402 payment capabilities. For production use, ensure:
- Proper key management and security audits
- Comprehensive testing on testnets
- Integration with production facilitator services
- Compliance with relevant regulations

## Learn More

- [x402 Protocol Documentation](https://docs.zama.ai/fhevm)
- [ERC7984 Standard](https://eips.ethereum.org/EIPS/eip-7984)
- [Zama FHEVM](https://www.zama.ai/fhevm)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)

## License

This project is for demonstration purposes. See the contract directory for licensing information on smart contracts.

