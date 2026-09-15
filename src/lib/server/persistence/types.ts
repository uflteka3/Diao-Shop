import type { Order, Product, ProductTheme, ShopSettings } from '@/lib/data/types';

export interface ContactMessageData {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  lu: boolean;
  createdAt: string;
}

/** Photographie complète de l'état du back-office. */
export interface Snapshot {
  products: Product[];
  themes: Record<string, ProductTheme>;
  featuredId: string | null;
  orders: Order[];
  settings: ShopSettings;
  messages: ContactMessageData[];
}

export type Kind = 'products' | 'orders' | 'settings' | 'messages';

/** '*' = tout le domaine (ex. changement de mise en avant). */
export type Dirty = Map<Kind, Set<string>>;

export interface Driver {
  nom: string;
  charger(): Promise<Snapshot | null>;
  persister(snapshot: Snapshot, dirty: Dirty): Promise<void>;
}
