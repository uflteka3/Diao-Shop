import { NextResponse } from 'next/server';

/** Demande de réinitialisation de mot de passe (« mot de passe oublié »).
 *  Réponse volontairement générique (pas d'énumération d'emails) + limitation
 *  de débit simple (60 s par adresse). Le lien envoyé redirige vers
 *  /admin/nouveau-mot-de-passe (URL autorisée dans Supabase Auth). */
const dernierEnvoi = new Map<string, number>();
const INTERVALLE_MS = 60_000;

function urlSite(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export async function POST(request: Request) {
  const { email = '' } = (await request.json()) as { email?: string };
  const adresse = email.trim().toLowerCase();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adresse)) {
    return NextResponse.json({ erreur: { message: 'Merci d’indiquer une adresse email valide.' } }, { status: 400 });
  }

  const precedent = dernierEnvoi.get(adresse) ?? 0;
  if (Date.now() - precedent < INTERVALLE_MS) {
    return NextResponse.json({ erreur: { message: 'Un email vient déjà d’être envoyé. Attendez une minute avant de réessayer.' } }, { status: 429 });
  }

  const modeSupabase =
    process.env.DATA_PROVIDER === 'supabase' &&
    Boolean(process.env.SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (modeSupabase) {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await sb.auth.resetPasswordForEmail(adresse, {
      redirectTo: `${urlSite()}/admin/nouveau-mot-de-passe`,
    });
    if (error) {
      console.error('[mot-de-passe-oublie] envoi Supabase :', error.message);
      return NextResponse.json({ erreur: { message: 'Envoi impossible pour le moment. Réessayez dans un instant.' } }, { status: 502 });
    }
    dernierEnvoi.set(adresse, Date.now());
    console.log(`[mot-de-passe-oublie] email de réinitialisation envoyé à ${adresse}`);
  } else {
    console.warn(`[mot-de-passe-oublie] mode démonstration : aucun email réel n’a pu être envoyé à ${adresse} (réinitialisation disponible en mode Supabase).`);
  }

  return NextResponse.json({
    ok: true,
    message: 'Si un compte administrateur existe pour cet email, un lien de réinitialisation vient de vous être envoyé. Pensez à vérifier vos spams.',
  });
}
