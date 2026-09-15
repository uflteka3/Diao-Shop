import { NextResponse } from 'next/server';
import { ajouterMessage } from '@/lib/admin/store';
import { flush } from '@/lib/server/persistence';

/** Contact public — validation + anti-spam basique (honeypot). */
export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    piege?: string; // honeypot : champ invisible
  };

  if (body.piege) {
    // Robot probable — répondre OK sans enregistrer
    return NextResponse.json({ ok: true }, { status: 201 });
  }
  const nom = (body.name ?? '').trim();
  const message = (body.message ?? '').trim();
  if (nom.length < 2) return NextResponse.json({ erreur: { message: 'Merci d’indiquer votre nom.' } }, { status: 400 });
  if (message.length < 10) return NextResponse.json({ erreur: { message: 'Merci de détailler votre message (10 caractères minimum).' } }, { status: 400 });
  if ((body.email ?? '').trim() === '' && (body.phone ?? '').trim() === '') {
    return NextResponse.json({ erreur: { message: 'Laissez un email ou un téléphone pour que nous puissions vous répondre.' } }, { status: 400 });
  }

  ajouterMessage({ name: nom, email: (body.email ?? '').trim(), phone: (body.phone ?? '').trim(), message: message.slice(0, 2000) });
  // CRITIQUE (serverless) : persister avant la réponse — voir api/commandes.
  await flush();
  return NextResponse.json({ ok: true }, { status: 201 });
}
