import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { exigerSession, erreurNonAutorise } from '@/lib/admin/guard';
import { changerStatut, supprimerCommande } from '@/lib/admin/store';
import type { OrderStatus } from '@/lib/data/types';
import { flush } from '@/lib/server/persistence';

const STATUTS: OrderStatus[] = ['nouvelle', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee', 'remboursee'];

export async function PUT(request: Request) {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  const { numero, statut } = (await request.json()) as { numero: string; statut: OrderStatus };
  if (!STATUTS.includes(statut)) {
    return NextResponse.json({ erreur: { message: 'Statut invalide.' } }, { status: 400 });
  }
  const ok = changerStatut(numero, statut);
  await flush(); // serverless : persister avant la réponse
  if (!ok) return NextResponse.json({ erreur: { message: 'Commande introuvable.' } }, { status: 404 });
  return NextResponse.json({ ok: true });
}

/** Suppression définitive d'une commande (back-office, confirmation côté client). */
export async function DELETE(request: Request) {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  const { numero } = (await request.json()) as { numero?: string };
  if (!numero || !supprimerCommande(numero.trim().toUpperCase())) {
    return NextResponse.json({ erreur: { message: 'Commande introuvable.' } }, { status: 404 });
  }
  await flush(); // serverless : persister avant la réponse
  revalidatePath('/admin/commandes');
  return NextResponse.json({ ok: true });
}
