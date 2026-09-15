import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifierToken } from '@/lib/admin/session';

/** Pages /admin accessibles sans session (connexion + réinitialisation de mot de passe). */
const PAGES_PUBLIQUES = new Set([
  '/admin/login',
  '/admin/mot-de-passe-oublie',
  '/admin/nouveau-mot-de-passe',
]);

/** Garde des routes /admin — toute autre page admin exige une session valide. */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PAGES_PUBLIQUES.has(pathname)) return NextResponse.next();

  const session = await verifierToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
