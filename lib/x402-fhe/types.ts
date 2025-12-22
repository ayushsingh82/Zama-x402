/**
 * Type definitions for x402 FHE payment system
 */

/**
 * Payment Requirement returned by server in 402 response
 */
export interface FHEPaymentRequirement {
  scheme: 'fhe-transfer';
  network: string;
  chainId: number;
  payTo: `0x${string}`;
  maxAmountRequired: string;
  asset: `0x${string}`;
  resource: string;
  description: string;
  mimeType: string;
  maxTimeoutSeconds: number;
  facilitator?: string;
}

/**
 * User authorization for server-side decryption
 */
export interface FHEDecryptionSignature {
  signature: string;
  publicKey: string;
  privateKey: string;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
  startTimestamp: number;
  durationDays: number;
}

/**
 * Payment Payload sent by client after transfer
 */
export interface FHEPaymentPayload {
  x402Version: 1;
  scheme: 'fhe-transfer';
  network: string;
  chainId: number;
  payload: {
    txHash: `0x${string}`;
    decryptionSignature: FHEDecryptionSignature;
  };
}

/**
 * Verify Result response from facilitator verification
 */
export interface FHEPaymentVerifyResult {
  isValid: boolean;
  invalidReason?: string;
  txHash?: `0x${string}`;
  amount?: string;
}

/**
 * ConfidentialTransfer Event data
 */
export interface ConfidentialTransferEvent {
  from: `0x${string}`;
  to: `0x${string}`;
  amount: `0x${string}`;
}

/**
 * Payment state machine states
 */
export type PaymentState =
  | 'idle'
  | 'requesting'
  | 'payment_required'
  | 'signing'
  | 'transferring'
  | 'verifying'
  | 'success'
  | 'error';
