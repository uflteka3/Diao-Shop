import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, verifierToken } from '@/lib/admin/session';

/** Vérification serveur de session — à appeler dans chaque route API admin. */
export async function exigerSession(): Promise<{ email: string }> {
  const session = await verifierToken(cookies().get(ADMIN_COOKIE)?.value);
  if (!session) throw new Error('UNAUTHORIZED');
  return session;
}

export function erreurNonAutorise() {
  return Response.json({ erreur: { code: 'unauthorized', message: 'Accès refusé.' } }, { status: 401 });
}
