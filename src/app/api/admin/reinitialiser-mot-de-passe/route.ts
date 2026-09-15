import { NextResponse } from 'next/server';

/** Définition du nouveau mot de passe à partir du jeton de récupération
 *  contenu dans le lien de l’email (flux « mot de passe oublié » Supabase).
 *  Le jeton est celui de l’utilisateur lui-même : il ne permet de changer
 *  QUE son mot de passe — jamais les données de la boutique. */
export async function POST(request: Request) {
  const { jeton = '', motDePasse = '' } = (await request.json()) as { jeton?: string; motDePasse?: string };

  if (!jeton) {
    return NextResponse.json({ erreur: { message: 'Lien de réinitialisation manquant ou incomplet. Demandez un nouvel email.' } }, { status: 400 });
  }
  if (typeof motDePasse !== 'string' || motDePasse.length < 8) {
    return NextResponse.json({ erreur: { message: 'Le mot de passe doit contenir au moins 8 caractères.' } }, { status: 400 });
  }

  if (
    process.env.DATA_PROVIDER === 'supabase' &&
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    // 1. Valider le jeton (identité de l'utilisateur)
    const verification = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${jeton}`,
      },
      cache: 'no-store',
    });
    if (!verification.ok) {
      return NextResponse.json({ erreur: { message: 'Ce lien est expiré ou a déjà été utilisé. Demandez un nouvel email de réinitialisation.' } }, { status: 400 });
    }
    // 2. Mettre à jour le mot de passe (l'utilisateur ne peut modifier que son compte)
    const miseAJour = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${jeton}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: motDePasse }),
      cache: 'no-store',
    });
    if (!miseAJour.ok) {
      console.error('[reinitialiser-mot-de-passe] mise à jour :', miseAJour.status, await miseAJour.text().catch(() => ''));
      return NextResponse.json({ erreur: { message: 'Modification impossible pour le moment. Réessayez ou demandez un nouveau lien.' } }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { erreur: { message: 'La réinitialisation par email est disponible uniquement lorsque la boutique est branchée à Supabase.' } },
    { status: 400 }
  );
}
