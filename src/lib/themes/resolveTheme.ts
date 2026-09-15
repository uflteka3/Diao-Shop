import type { ProductTheme } from '@/lib/data/types';
import { FALLBACK_THEME } from '@/lib/data/seed/themes';
import { getTheme } from '@/lib/admin/store';

/**
 * Résolution du thème d'un produit — MÊME moteur pour toutes les pages :
 * 1. thème enregistré en back-office (éditable sans code) ;
 * 2. sinon thème de secours (jamais de couleur codée en dur côté composant).
 */
export function resolveTheme(productId: string | null | undefined): ProductTheme {
  if (productId) {
    const theme = getTheme(productId);
    if (theme) return theme;
  }
  return FALLBACK_THEME;
}

export { FALLBACK_THEME };
