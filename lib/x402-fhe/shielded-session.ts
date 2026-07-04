/**
 * Server-only HMAC session tokens for the fhe-shielded-pool scheme. Bound to
 * (commitment, resourceId, expiry) — never to a wallet address, since the whole point of this
 * scheme is that the server never learns who paid.
 */
import { createHmac, timingSafeEqual } from 'crypto';

interface SessionPayload {
  commitment: `0x${string}`;
  resourceId: `0x${string}`;
  expiry: number;
}

function getSecret(): string {
  const secret = process.env.SHIELDED_SESSION_SECRET;
  if (!secret) {
    throw new Error('SHIELDED_SESSION_SECRET must be set to issue/verify shielded-pool session tokens');
  }
  return secret;
}

function sign(payloadB64: string): string {
  return createHmac('sha256', getSecret()).update(payloadB64).digest('hex');
}

/** Caller must have already verified the commitment on-chain before issuing a session. */
export function issueSession(payload: SessionPayload): string {
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifySession(token: string): { valid: boolean; resourceId?: `0x${string}` } {
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };
  const [payloadB64, signature] = parts;

  let sigBuf: Buffer;
  let expectedBuf: Buffer;
  try {
    sigBuf = Buffer.from(signature, 'hex');
    expectedBuf = Buffer.from(sign(payloadB64), 'hex');
  } catch {
    return { valid: false };
  }

  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false };
  }

  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.expiry <= Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }
    return { valid: true, resourceId: payload.resourceId };
  } catch {
    return { valid: false };
  }
}
