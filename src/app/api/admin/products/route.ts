import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { exigerSession, erreurNonAutorise } from '@/lib/admin/guard';
import { enregistrerProduit, getProduits, getProduit, supprimerProduit } from '@/lib/admin/store';
import type { Product } from '@/lib/data/types';

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function valider(body: Partial<Product>, nouveau: boolean): { ok: true } | { ok: false; message: string } {
  if (!body.name || body.name.trim().length < 2) return { ok: false, message: 'Le nom est requis (2 caractères minimum).' };
  if (body.price == null || body.price < 0) return { ok: false, message: 'Le prix est requis (≥ 0).' };
  if (body.oldPrice != null && body.oldPrice <= body.price)
    return { ok: false, message: 'L’ancien prix doit être supérieur au prix actuel.' };
  const slug = slugify(body.slug || body.name);
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return { ok: false, message: 'Slug invalide.' };
  const collision = getProduits().some((p) => p.slug === slug && p.id !== body.id);
  if (collision) return { ok: false, message: `Le slug « ${slug} » est déjà utilisé.` };
  if (nouveau && !body.mainImage) return { ok: false, message: 'Une image principale est requise.' };
  return { ok: true };
}

export async function GET() {
  try {
    await exigerSession();
    return NextResponse.json({ produits: getProduits() });
  } catch {
    return erreurNonAutorise();
  }
}

export async function POST(request: Request) {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  const body = (await request.json()) as Partial<Product>;
  const v = valider(body, true);
  if (!v.ok) return NextResponse.json({ erreur: { message: v.message } }, { status: 400 });

  const id = `p-${crypto.randomUUID().slice(0, 8)}`;
  const produit: Product = {
    id,
    slug: slugify(body.slug || body.name!),
    name: body.name!.trim(),
    subTitle: body.subTitle?.trim() || 'Édition 2025',
    team: body.team?.trim() || body.name!.trim(),
    shortDescription: body.shortDescription?.trim() || '',
    description: body.description?.trim() || body.shortDescription?.trim() || '',
    price: Number(body.price),
    oldPrice: body.oldPrice != null ? Number(body.oldPrice) : null,
    currency: body.currency || 'FCFA',
    mainImage: body.mainImage!,
    altText: body.altText?.trim() || `Maillot ${body.name}`,
    sizes: body.sizes?.length ? body.sizes : [],
    published: Boolean(body.published),
    isFeatured: false, // la mise en avant est gérée exclusivement via /admin/mise-en-avant
    createdAt: new Date().toISOString(),
  };
  enregistrerProduit(produit);
  revalidatePath('/');
  revalidatePath('/boutique');
  revalidatePath('/admin/produits');
  return NextResponse.json({ produit }, { status: 201 });
}

export async function PUT(request: Request) {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  const body = (await request.json()) as Partial<Product>;
  const existant = body.id ? getProduit(body.id) : null;
  if (!existant) return NextResponse.json({ erreur: { message: 'Produit introuvable.' } }, { status: 404 });
  const v = valider({ ...existant, ...body }, false);
  if (!v.ok) return NextResponse.json({ erreur: { message: v.message } }, { status: 400 });

  const maj: Product = {
    ...existant,
    ...body,
    id: existant.id,
    slug: slugify(body.slug || existant.slug),
    name: body.name?.trim() ?? existant.name,
    price: body.price != null ? Number(body.price) : existant.price,
    oldPrice: body.oldPrice != null ? Number(body.oldPrice) : existant.oldPrice,
    sizes: body.sizes ?? existant.sizes,
    // isFeatured volontairement non modifiable ici (section dédiée)
    isFeatured: existant.isFeatured,
    createdAt: existant.createdAt,
  };
  enregistrerProduit(maj);
  revalidatePath('/');
  revalidatePath('/boutique');
  revalidatePath(`/produit/${maj.slug}`);
  revalidatePath('/admin/produits');
  return NextResponse.json({ produit: maj });
}

export async function DELETE(request: Request) {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  const { id } = (await request.json()) as { id?: string };
  if (!id || !getProduit(id)) return NextResponse.json({ erreur: { message: 'Produit introuvable.' } }, { status: 404 });
  supprimerProduit(id);
  revalidatePath('/');
  revalidatePath('/boutique');
  revalidatePath('/admin/produits');
  return NextResponse.json({ ok: true });
}
