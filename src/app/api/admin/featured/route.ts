import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { exigerSession, erreurNonAutorise } from '@/lib/admin/guard';
import { definirFeatured, getFeaturedId, getProduit, getProduits } from '@/lib/admin/store';
import { flush } from '@/lib/server/persistence';

/** Mise en avant — UN SEUL maillot principal à la fois (garantie système). */
export async function GET() {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  return NextResponse.json({ featuredId: getFeaturedId() });
}

export async function POST(request: Request) {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  const { id } = (await request.json()) as { id: string | null };

  if (id !== null && (!getProduit(id) || !getProduit(id)!.published)) {
    return NextResponse.json({ erreur: { message: 'Seul un produit publié peut être mis en avant.' } }, { status: 400 });
  }
  definirFeatured(id);
  await flush(); // serverless : persister avant la réponse
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/mise-en-avant');
  return NextResponse.json({ ok: true, featuredId: getFeaturedId() });
}
