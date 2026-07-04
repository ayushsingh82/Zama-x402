'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import type { FHEDecryptionSignature } from '@/lib/x402-fhe/types';

/**
 * Real @zama-fhe/relayer-sdk wiring, replacing the previous fully-mocked FHEVM instance in
 * ERC7984Demo.tsx. Exposes the same encrypt/decrypt/createDecryptionSignature/requiresSignature
 * shape the mock invented, so existing call sites (useERC7984Wagmi, ERC7984Demo) don't need to
 * change — only this hook does. New code (e.g. useShieldedPool) can use `raw` directly for the
 * real SDK's native createEncryptedInput/generateKeypair/userDecrypt API.
 */
export interface FhevmAdapter {
  raw: any;
  hasSignature: boolean;
  encrypt: (amount: bigint, contractAddress: string) => Promise<{ handle: `0x${string}`; proof: `0x${string}` }>;
  decrypt: (handle: string, contractAddress: string) => Promise<bigint>;
  requiresSignature: (handle: string, contractAddress: string) => Promise<boolean>;
  createDecryptionSignature: (
    address: string,
    contractAddresses: string[],
    durationDays: number
  ) => Promise<FHEDecryptionSignature>;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

function toHex(bytes: Uint8Array): `0x${string}` {
  return ('0x' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')) as `0x${string}`;
}

export function useFhevmInstance() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const [instance, setInstance] = useState<FhevmAdapter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Ref (not state) because the signature is consumed inside encrypt/decrypt callbacks that are
  // created once per instance and shouldn't be recreated every time a signature is (re)issued.
  const sigRef = useRef<FHEDecryptionSignature | null>(null);

  useEffect(() => {
    if (!isConnected || !address || instance || isLoading) return;
    if (typeof window === 'undefined' || !window.ethereum) return;

    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const sdk = await import('@zama-fhe/relayer-sdk/web');
        await sdk.initSDK();

        const raw = await sdk.createInstance({
          ...sdk.SepoliaConfig,
          network: window.ethereum,
        });

        if (cancelled) return;

        const adapter: FhevmAdapter = {
          raw,
          get hasSignature() {
            return sigRef.current !== null;
          },
          async encrypt(amount, contractAddress) {
            const input = raw.createEncryptedInput(contractAddress, address);
            input.add64(amount);
            const { handles, inputProof } = await input.encrypt();
            return { handle: toHex(handles[0]), proof: toHex(inputProof) };
          },
          async decrypt(handle, contractAddress) {
            const sig = sigRef.current;
            if (!sig) {
              throw new Error('Decryption signature required. Please create signature first.');
            }
            const results = await raw.userDecrypt(
              [{ handle, contractAddress }],
              sig.privateKey,
              sig.publicKey,
              sig.signature,
              sig.contractAddresses,
              sig.userAddress,
              sig.startTimestamp,
              sig.durationDays
            );
            return BigInt(results[handle as `0x${string}`] as any);
          },
          async requiresSignature() {
            return sigRef.current === null;
          },
          async createDecryptionSignature(userAddress, contractAddresses, durationDays) {
            const { publicKey, privateKey } = raw.generateKeypair();
            const startTimestamp = Math.floor(Date.now() / 1000);
            const eip712 = raw.createEIP712(publicKey, contractAddresses, startTimestamp, durationDays);

            const signature = await window.ethereum.request({
              method: 'eth_signTypedData_v4',
              params: [userAddress, JSON.stringify(eip712)],
            });

            const sig: FHEDecryptionSignature = {
              signature,
              publicKey,
              privateKey,
              userAddress: userAddress as `0x${string}`,
              contractAddresses: contractAddresses as `0x${string}`[],
              startTimestamp,
              durationDays,
            };
            sigRef.current = sig;
            return sig;
          },
        };

        setInstance(adapter);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to initialize FHEVM instance');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, chainId]);

  return { instance, isLoading, error };
}
