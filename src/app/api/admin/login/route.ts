import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, creerToken } from '@/lib/admin/session';

/** Connexion administrateur.
 *  - DATA_PROVIDER=mock (démonstration) : identifiants .env.local, anti brute-force léger ;
 *  - DATA_PROVIDER=supabase : Supabase Auth + rôle vérifié dans public.profiles.
 *    NB : le rôle est vérifié via un fetch brut portant la clé service — un client
 *    supabase-js qui vient de se connecter adopte le jeton utilisateur, sous lequel
 *    la RLS (sans policy publique) masque légitimement les lignes. */
let tentatives = 0;
let bloqueJusqua = 0;

function modeSupabase(): boolean {
  return (
    process.env.DATA_PROVIDER === 'supabase' &&
    Boolean(process.env.SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

export async function POST(request: Request) {
  const { email = '', password = '' } = (await request.json()) as { email?: string; password?: string };
  let uid: string | undefined;

  if (modeSupabase()) {
    // ----- Supabase Auth (production) -----
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return NextResponse.json({ erreur: { message: 'Email ou mot de passe incorrect.' } }, { status: 401 });
    }

    // Vérification du rôle — fetch brut avec la clé service (jamais le jeton utilisateur)
    const rep = await fetch(`${process.env.SUPABASE_URL}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(data.user.id)}`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: 'no-store',
    });
    if (!rep.ok) {
      console.error('[login] vérification du profil :', rep.status);
      return NextResponse.json({ erreur: { message: 'Connexion impossible pour le moment. Réessayez.' } }, { status: 502 });
    }
    const lignes = (await rep.json()) as { role?: string }[];
    const role = lignes[0]?.role;
    if (!role || !['admin', 'staff'].includes(role)) {
      return NextResponse.json({ erreur: { message: 'Ce compte n’a pas accès au back-office.' } }, { status: 403 });
    }
    uid = data.user.id;
  } else {
    // ----- Identifiants de démonstration (.env.local) -----
    if (Date.now() < bloqueJusqua) {
      return NextResponse.json({ erreur: { message: 'Trop de tentatives. Réessayez dans une minute.' } }, { status: 429 });
    }
    const attendu_email = process.env.ADMIN_EMAIL ?? 'admin@diaoshop.demo';
    const attendu_mdp = process.env.ADMIN_PASSWORD ?? 'diaoshop-2026';
    if (email !== attendu_email || password !== attendu_mdp) {
      tentatives += 1;
      if (tentatives >= 5) {
        bloqueJusqua = Date.now() + 60_000;
        tentatives = 0;
      }
      return NextResponse.json({ erreur: { message: 'Email ou mot de passe incorrect.' } }, { status: 401 });
    }
    tentatives = 0;
  }

  const token = await creerToken(email, uid);
  const reponse = NextResponse.json({ ok: true });
  reponse.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return reponse;
}
