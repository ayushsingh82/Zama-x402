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

/**
 * Shielded-pool scheme (Phase 1): merchant never appears here (no `payTo`) — only the pool
 * address and an opaque resourceId. See README "Shielded Pool" section for the full flow and
 * known limitations (amount not enforced on-chain; depositing wallet still visible on-chain).
 */
export interface ShieldedPoolPaymentRequirement {
  scheme: 'fhe-shielded-pool';
  network: string;
  chainId: number;
  poolAddress: `0x${string}`;
  asset: `0x${string}`;
  resourceId: `0x${string}`;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  maxTimeoutSeconds: number;
  /** Our own server route, never a third-party facilitator. */
  sessionEndpoint: string;
}

export type AnyPaymentRequirement = FHEPaymentRequirement | ShieldedPoolPaymentRequirement;

/** Kept entirely client-side; never sent over the network. */
export interface ShieldedPoolCommitmentSecret {
  secret: `0x${string}`;
  resourceId: `0x${string}`;
  expiry: number;
}

/**
 * Body sent to our session endpoint. Deliberately contains no wallet address and no secret —
 * only what's needed to look up the already-registered on-chain commitment.
 */
export interface ShieldedPoolSessionRequest {
  commitment: `0x${string}`;
  resourceId: `0x${string}`;
  expiry: number;
}

export interface ShieldedPoolSessionResult {
  isValid: boolean;
  invalidReason?: string;
  sessionToken?: string;
  expiresAt?: number;
}

/** State machine for the deposit -> commitment -> session flow (distinct from PaymentState). */
export type ShieldedPoolState =
  | 'idle'
  | 'requesting'
  | 'granting_operator'
  | 'depositing'
  | 'registering_session'
  | 'success'
  | 'error';
