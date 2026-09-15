import type { ShopSettings } from '@/lib/data/types';
import { getParametres } from '@/lib/admin/store';

/** Couche d'accès aux paramètres boutique — branchée sur le back-office. */
export function getShopSettings(): ShopSettings {
  return getParametres();
}
