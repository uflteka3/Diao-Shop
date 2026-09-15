import type { Product } from '@/lib/data/types';
import { enregistrerProduit, getProduits, getTheme, enregistrerTheme, getFeaturedId } from '@/lib/admin/store';
import { FALLBACK_THEME } from '@/lib/data/seed/themes';

/**
 * Couche de données PUBLIQUE branchée sur le store back-office.
 * Les pages du site lisent ici : une modification dans /admin apparaît
 * immédiatement sur le site (sans recompilation, sans code).
 */

export function getPublishedProducts(): Product[] {
  return getProduits().filter((p) => p.published);
}

export function getAllProducts(): Product[] {
  return getProduits();
}

export function getProductBySlug(slug: string): Product | null {
  return getProduits().find((p) => p.slug === slug) ?? null;
}

export function getFeaturedProduct(): Product | null {
  const id = getFeaturedId();
  if (!id) return null;
  const p = getProduits().find((x) => x.id === id && x.published);
  return p ?? null;
}

/** Résolution du thème : produit → thème enregistré, sinon thème de secours. */
export function resolveTheme(productId: string | null | undefined) {
  if (productId) {
    const t = getTheme(productId);
    if (t) return t;
  }
  return FALLBACK_THEME;
}
