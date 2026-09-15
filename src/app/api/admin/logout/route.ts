import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin/session';

export async function POST() {
  const reponse = NextResponse.json({ ok: true });
  reponse.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return reponse;
}
