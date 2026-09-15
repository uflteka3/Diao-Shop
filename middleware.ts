import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifierToken } from '@/lib/admin/session';

/** Garde des routes /admin — toute page sauf /admin/login exige une session valide. */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin/login') return NextResponse.next();

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
