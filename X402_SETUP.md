# x402 FHE Payment System Setup Guide

This document describes the x402 FHE payment system implementation based on Tomi's documentation.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Required Environment Variables for x402 FHE Payment System

# Address that receives payments
NEXT_PUBLIC_MERCHANT_ADDRESS="0xYourAddress"

# ERC7984 token contract address
NEXT_PUBLIC_TOKEN_ADDRESS="0x803d7ADD44B238F40106B1C4439ecAcd05910dc7"

# Payment verification service URL
FACILITATOR_URL="https://zama-facilitator.ultravioletadao.xyz"
NEXT_PUBLIC_FACILITATOR_URL="https://zama-facilitator.ultravioletadao.xyz"

# FHE Relayer URL
NEXT_PUBLIC_RELAYER_URL="https://relayer.sepolia.zama.ai"

# WalletConnect Project ID (if not already set)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=""
```

## Project Structure

```
my-app/
├── lib/
│   └── x402-fhe/
│       ├── types.ts          # Type definitions for payment system
│       ├── client.ts         # Client utilities for payment flow
│       └── middleware.ts     # Server middleware utilities
├── hooks/
│   ├── erc7984/
│   │   └── useERC7984Wagmi.tsx   # ERC7984 token operations hook
│   └── x402/
│       └── useX402Payment.tsx    # x402 payment flow hook
├── app/
│   ├── api/
│   │   ├── facilitator/
│   │   │   ├── verify/
│   │   │   │   └── route.ts      # Facilitator proxy endpoint
│   │   │   └── supported/
│   │   │       └── route.ts      # Supported tokens/networks
│   │   └── premium-data/
│   │       └── route.ts          # Protected resource endpoint
│   └── test/
│       └── page.tsx              # Testing/demo page
└── components/
    └── ERC7984Demo.tsx           # Main demo component
```

## Key Components

### 1. Type Definitions (`lib/x402-fhe/types.ts`)

Defines all TypeScript interfaces for:
- `FHEPaymentRequirement` - Payment requirements from 402 response
- `FHEDecryptionSignature` - User authorization for decryption
- `FHEPaymentPayload` - Payment payload sent after transfer
- `FHEPaymentVerifyResult` - Verification result from facilitator
- `PaymentState` - Payment state machine states

### 2. Client Utilities (`lib/x402-fhe/client.ts`)

- `parse402Response()` - Parse 402 Payment Required responses
- `verifyPayment()` - Verify payment with facilitator service
- `fetchWithPayment()` - Fetch with automatic payment handling

### 3. Server Middleware (`lib/x402-fhe/middleware.ts`)

- `create402Response()` - Create 402 Payment Required response
- `getPaymentRequirement()` - Get payment requirement from env vars

### 4. ERC7984 Hook (`hooks/erc7984/useERC7984Wagmi.tsx`)

Manages ERC7984 token operations:
- `handle` - Encrypted balance handle
- `clear` - Decrypted balance
- `isDecrypted` - Whether balance is decrypted
- `refreshBalanceHandle()` - Refresh balance from contract
- `decryptBalanceHandle()` - Decrypt balance using relayer
- `transferTokens()` - Transfer encrypted tokens
- `canTransfer()` - Check if transfer is possible

### 5. x402 Payment Hook (`hooks/x402/useX402Payment.tsx`)

Handles x402 payment flow:
- `fetchWithPayment()` - Fetch resource with payment handling
- `verifyPaymentAfterTransfer()` - Verify payment after transfer
- `reset()` - Reset payment state
- `state` - Current payment state
- `requirement` - Current payment requirement
- `error` - Error message if any

### 6. API Routes

#### `/api/premium-data` (GET/POST)
Protected resource requiring payment:
- GET: Returns 402 with payment requirements if no payment proof
- POST: Verifies payment and returns premium content

#### `/api/facilitator/verify` (POST)
Proxies verification requests to facilitator service.

#### `/api/facilitator/supported` (GET)
Returns supported tokens and networks.

### 7. Demo Component (`components/ERC7984Demo.tsx`)

Main UI component for testing x402 payments:
- Token balance display (encrypted/decrypted)
- Payment flow demonstration
- Premium data access
- State management visualization

## Usage Flow

1. **Connect Wallet**: User connects wallet via RainbowKit
2. **Check Balance**: View encrypted token balance handle
3. **Decrypt Balance**: Decrypt balance to see actual amount
4. **Request Premium Data**: Click "Fetch Premium Data"
5. **Receive 402 Response**: Server returns payment requirement
6. **Transfer Tokens**: User initiates confidential transfer
7. **Verify Payment**: Payment is verified with facilitator
8. **Access Resource**: Premium content is returned

## Payment State Machine

```
idle → requesting → payment_required → signing → 
transferring → verifying → success/error
```

## Dependencies

The following packages are required:
- `@zama-fhe/relayer-sdk` - FHE operations
- `ethers` - Ethereum interaction
- `zod` - Schema validation
- `wagmi` - React hooks for Ethereum
- `@rainbow-me/rainbowkit` - Wallet connection UI

## Testing

1. Navigate to `/test` page
2. Connect your wallet (Sepolia testnet)
3. Follow the on-screen instructions to test the payment flow

## Notes

- The facilitator service is hosted at: `https://zama-facilitator.ultravioletadao.xyz`
- Default token address: `0x803d7ADD44B238F40106B1C4439ecAcd05910dc7`
- Currently configured for Sepolia testnet (chainId: 11155111)
