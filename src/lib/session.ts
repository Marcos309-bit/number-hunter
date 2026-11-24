import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import type { PlayerSession } from '@/types/game';

const SESSION_COOKIE_NAME = 'nh_player_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface SignedSessionPayload extends PlayerSession {
  exp: number;
}

function getSigningSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) {
    return secret;
  }

  // Fallback derived from DATABASE_URL only if SESSION_SECRET is omitted in deployment
  const fallbackSource = process.env.DATABASE_URL;
  if (fallbackSource) {
    return crypto.createHash('sha256').update(`nh-session:${fallbackSource}`).digest('hex');
  }

  throw new Error('SESSION_SECRET environment variable is not configured.');
}

function signToken(payload: SignedSessionPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyToken(token: string): PlayerSession | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  if (!encoded || !signature) return null;

  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');

  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as SignedSessionPayload;

    if (
      typeof parsed.jogadorId !== 'number' ||
      typeof parsed.nome !== 'string' ||
      typeof parsed.nomeNormalizado !== 'string' ||
      typeof parsed.exp !== 'number'
    ) {
      return null;
    }

    if (Date.now() > parsed.exp) {
      return null;
    }

    return {
      jogadorId: parsed.jogadorId,
      nome: parsed.nome,
      nomeNormalizado: parsed.nomeNormalizado,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieConfig(session: PlayerSession) {
  const payload: SignedSessionPayload = {
    ...session,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };

  return {
    name: SESSION_COOKIE_NAME,
    value: signToken(payload),
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    },
  };
}

export function getClearedSessionCookieConfig() {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    },
  };
}

export function getPlayerSession(): PlayerSession | null {
  const cookieStore = cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return verifyToken(raw);
}
