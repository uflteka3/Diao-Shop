/**
 * Session administrateur — cookie httpOnly signé (HMAC-SHA256 via Web Crypto,
 * compatible edge + node).
 * Phase 8 : deux modes d'authentification derrière la MÊME session :
 *  - identifiants .env.local (démonstration, DATA_PROVIDER=mock) ;
 *  - Supabase Auth + profils admin/staff (DATA_PROVIDER=supabase).
 */
const COOKIE = 'ds_admin';
const TTL_MS = 1000 * 60 * 60 * 12; // 12 h

async function cle(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET ?? 'dev-secret-diaoshop';
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export interface SessionAdmin {
  email: string;
  uid?: string;
}

export async function creerToken(email: string, uid?: string): Promise<string> {
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ email, uid, exp: Date.now() + TTL_MS })));
  const sig = await crypto.subtle.sign('HMAC', await cle(), new TextEncoder().encode(payload));
  return `${payload}.${b64url(sig)}`;
}

export async function verifierToken(token: string | undefined): Promise<SessionAdmin | null> {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await cle(), deB64url(sig), new TextEncoder().encode(payload));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(deB64urlBuf(payload))) as SessionAdmin & { exp: number };
    if (Date.now() > data.exp) return null;
    return { email: data.email, uid: data.uid };
  } catch {
    return null;
  }
}

function deB64url(s: string): Uint8Array {
  return deB64urlBuf(s);
}

function deB64urlBuf(s: string): Uint8Array {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const u = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
  return u;
}

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_COOKIE_MAX_AGE = TTL_MS / 1000;
