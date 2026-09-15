import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { exigerSession, erreurNonAutorise } from '@/lib/admin/guard';
import { enregistrerTheme, getProduit, getTheme } from '@/lib/admin/store';
import type { ProductTheme, ThemeMode } from '@/lib/data/types';
import { flush } from '@/lib/server/persistence';

const COULEUR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const GRADIENT_OK = (s: string) => s.startsWith('linear-gradient(') || s.startsWith('radial-gradient(');

export async function GET(request: Request) {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('productId');
  if (!id) return NextResponse.json({ erreur: { message: 'productId requis.' } }, { status: 400 });
  return NextResponse.json({ theme: getTheme(id) });
}

export async function PUT(request: Request) {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  const { productId, theme } = (await request.json()) as { productId: string; theme: ProductTheme };
  if (!getProduit(productId)) return NextResponse.json({ erreur: { message: 'Produit introuvable.' } }, { status: 404 });

  const champs = [
    theme.backgroundColor,
    theme.primaryColor,
    theme.secondaryColor,
    theme.accentColor,
    theme.textColor,
    theme.mutedTextColor,
    theme.buttonColor,
    theme.glowColor,
  ];
  if (!champs.every((c) => typeof c === 'string' && COULEUR.test(c))) {
    return NextResponse.json({ erreur: { message: 'Couleurs invalides (format HEX attendu).' } }, { status: 400 });
  }
  if (!GRADIENT_OK(theme.surfaceGradient)) {
    return NextResponse.json({ erreur: { message: 'Dégradé invalide (linear-gradient(...) attendu).' } }, { status: 400 });
  }
  const intensite = Number(theme.glowIntensity);
  if (!Number.isFinite(intensite) || intensite < 0 || intensite > 1) {
    return NextResponse.json({ erreur: { message: 'Intensité du glow attendue entre 0 et 1.' } }, { status: 400 });
  }
  const mode: ThemeMode = theme.mode === 'light' ? 'light' : 'dark';

  enregistrerTheme(productId, { ...theme, glowIntensity: intensite, mode });
  await flush(); // serverless : persister avant la réponse
  revalidatePath('/');
  revalidatePath('/boutique');
  revalidatePath('/admin/themes');
  return NextResponse.json({ ok: true });
}
