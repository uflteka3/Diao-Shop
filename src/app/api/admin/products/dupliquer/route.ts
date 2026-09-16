import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { exigerSession, erreurNonAutorise } from '@/lib/admin/guard';
import { enregistrerProduit, enregistrerTheme, getProduit, getProduits, getTheme } from '@/lib/admin/store';
import type { Product } from '@/lib/data/types';
import { flush } from '@/lib/server/persistence';

/**
 * Duplication d'un produit — crée une copie EN BROUILLON « (copie) » :
 * mêmes photos, tailles, stocks, prix et thème ; dépubliée et jamais mise
 * en avant. L'administrateur ajuste la fiche puis la publie.
 */
export async function POST(request: Request) {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  const { id } = (await request.json()) as { id?: string };
  const source = id ? getProduit(id) : null;
  if (!source) {
    return NextResponse.json({ erreur: { message: 'Produit introuvable.' } }, { status: 404 });
  }

  // slug et identifiant uniques, même après plusieurs duplications
  const existants = new Set(getProduits().map((p) => p.slug));
  let slug = `${source.slug}-copie`;
  let n = 2;
  while (existants.has(slug)) slug = `${source.slug}-copie-${n++}`;

  const copie: Product = {
    ...structuredClone(source),
    id: `p-${slug}`,
    slug,
    name: `${source.name} (copie)`,
    published: false,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  };
  enregistrerProduit(copie);

  const theme = getTheme(source.id);
  if (theme) enregistrerTheme(copie.id, structuredClone(theme));

  // CRITIQUE (serverless) : écrire en base AVANT de répondre.
  await flush();
  revalidatePath('/boutique');
  revalidatePath('/admin/produits');
  return NextResponse.json({ produit: copie }, { status: 201 });
}
