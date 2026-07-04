/**
 * Shared read-only viem client for server-side RPC reads (e.g. ShieldedPool.isCommitmentValid).
 * Server-only — never imported from client components.
 */
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL;

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});
