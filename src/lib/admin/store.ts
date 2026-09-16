import type { ContactMessage, Order, Product, ProductTheme, ShopSettings } from '@/lib/data/types';
import { DEMO_PRODUCTS } from '@/lib/data/seed/products';
import { DEMO_THEMES } from '@/lib/data/seed/themes';
import { DEMO_SETTINGS } from '@/lib/data/seed/settings';
import { marquerSale } from '@/lib/server/persistence';
import type { Snapshot } from '@/lib/server/persistence';

/**
 * Store mutable central — couche de lecture synchrone du site.
 * Chaque mutation est persistée via le driver actif (JSON local en mode démo,
 * Supabase en production — voir src/lib/server/persistence).
 *
 * IMPORTANT : l'état vit dans `globalThis` pour garantir UNE SEULE instance
 * (instrumentation, routes API, pages et middlewares sont compilés dans des
 * graphes séparés par Next.js ; sans global, chacun verrait sa propre copie).
 */

function cloner<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

interface EtatStore {
  produits: Map<string, Product>;
  themes: Map<string, ProductTheme>;
  commandes: Map<string, Order>;
  messages: ContactMessage[];
  parametres: ShopSettings;
  featuredId: string | null;
}

function etatInitial(): EtatStore {
  const etat: EtatStore = {
    produits: new Map(),
    themes: new Map(),
    commandes: new Map(),
    messages: [],
    parametres: cloner(DEMO_SETTINGS),
    featuredId: DEMO_PRODUCTS.find((p) => p.isFeatured)?.id ?? null,
  };
  // Amorçage par défaut : données de démonstration (remplacées par la persistance au démarrage)
  for (const p of DEMO_PRODUCTS) {
    etat.produits.set(p.id, cloner(p));
    const t = DEMO_THEMES[p.id];
    if (t) etat.themes.set(p.id, cloner(t));
  }
  return etat;
}

const globalRef = globalThis as unknown as { __dsStore?: EtatStore };
const etat = globalRef.__dsStore ?? etatInitial();
globalRef.__dsStore = etat;

// ---------- Photographie / restauration de l'état (persistance) ----------
export function exporterSnapshot(): Snapshot {
  return {
    products: Array.from(etat.produits.values()),
    themes: Object.fromEntries(etat.themes),
    featuredId: etat.featuredId,
    orders: Array.from(etat.commandes.values()),
    settings: etat.parametres,
    messages: [...etat.messages],
  };
}

export function hydraterStore(snapshot: Snapshot): void {
  etat.produits.clear();
  etat.themes.clear();
  etat.commandes.clear();
  etat.messages.length = 0;
  for (const p of snapshot.products ?? []) etat.produits.set(p.id, cloner(p));
  for (const [id, t] of Object.entries(snapshot.themes ?? {})) etat.themes.set(id, cloner(t));
  etat.featuredId = snapshot.featuredId ?? null;
  for (const o of snapshot.orders ?? []) etat.commandes.set(o.orderNumber, cloner(o));
  etat.parametres = cloner(snapshot.settings);
  for (const m of snapshot.messages ?? []) etat.messages.push(cloner(m));
}

// ---------- Produits ----------
export function getProduits(): Product[] {
  return Array.from(etat.produits.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getProduit(id: string): Product | null {
  return etat.produits.get(id) ?? null;
}

export function enregistrerProduit(p: Product): void {
  etat.produits.set(p.id, p);
  marquerSale('products', p.id);
}

export function supprimerProduit(id: string): void {
  etat.produits.delete(id);
  etat.themes.delete(id);
  if (etat.featuredId === id) etat.featuredId = null;
  marquerSale('products', id);
}

// ---------- Mise en avant (UN SEUL produit à la fois) ----------
export function getFeaturedId(): string | null {
  return etat.featuredId;
}

export function definirFeatured(id: string | null): void {
  etat.featuredId = id;
  for (const p of etat.produits.values()) p.isFeatured = p.id === id;
  marquerSale('products'); // tout le domaine : les drapeaux isFeatured changent globalement
}

// ---------- Thèmes ----------
export function getTheme(productId: string): ProductTheme | null {
  return etat.themes.get(productId) ?? null;
}

export function enregistrerTheme(productId: string, theme: ProductTheme): void {
  etat.themes.set(productId, theme);
  marquerSale('products', productId);
}

// ---------- Commandes ----------
export function getCommandes(): Order[] {
  return Array.from(etat.commandes.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCommande(numero: string): Order | null {
  return etat.commandes.get(numero) ?? null;
}

export function enregistrerCommande(o: Order): void {
  etat.commandes.set(o.orderNumber, o);
  marquerSale('orders', o.orderNumber);
}

export function changerStatut(numero: string, statut: Order['status']): boolean {
  const o = etat.commandes.get(numero);
  if (!o) return false;
  o.status = statut;
  marquerSale('orders', numero);
  return true;
}

/** Suppression d'une commande (back-office) — persistée par le driver actif. */
export function supprimerCommande(numero: string): boolean {
  if (!etat.commandes.has(numero)) return false;
  etat.commandes.delete(numero);
  marquerSale('orders', numero);
  return true;
}

/** Décrément de stock appliqué par la commande — persisté par ligne produit. */
export function decrementerStock(productId: string, taille: string, quantite: number): void {
  const p = etat.produits.get(productId);
  const t = p?.sizes.find((s) => s.size === taille);
  if (p && t) {
    t.stock = Math.max(0, t.stock - quantite);
    marquerSale('products', productId);
  }
}

/** Remplacement complet des commandes (résynchro depuis Supabase — sans marquer sale). */
export function remplacerCommandes(orders: Order[]): void {
  etat.commandes.clear();
  for (const o of orders) etat.commandes.set(o.orderNumber, cloner(o));
}

// ---------- Paramètres ----------
export function getParametres(): ShopSettings {
  return cloner(etat.parametres);
}

export function enregistrerParametres(maj: Partial<ShopSettings>): void {
  // Les clés absentes/undefined ne doivent jamais écraser les valeurs existantes.
  const propre = Object.fromEntries(Object.entries(maj).filter(([, valeur]) => valeur !== undefined)) as Partial<ShopSettings>;
  etat.parametres = { ...etat.parametres, ...propre };
  marquerSale('settings');
}

/** Remplacement complet des messages (résynchro depuis Supabase — sans marquer sale). */
export function remplacerMessages(messages: ContactMessage[]): void {
  etat.messages.length = 0;
  for (const m of messages) etat.messages.push(cloner(m));
}

// ---------- Messages de contact ----------
export function getMessages(): ContactMessage[] {
  return [...etat.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function ajouterMessage(m: Omit<ContactMessage, 'id' | 'lu' | 'createdAt'>): void {
  const message: ContactMessage = { ...m, id: crypto.randomUUID(), lu: false, createdAt: new Date().toISOString() };
  etat.messages.push(message);
  marquerSale('messages', message.id);
}

export function marquerMessageLu(id: string, lu: boolean): void {
  const m = etat.messages.find((x) => x.id === id);
  if (m) {
    m.lu = lu;
    marquerSale('messages', id);
  }
}

export function supprimerMessage(id: string): void {
  const i = etat.messages.findIndex((x) => x.id === id);
  if (i >= 0) {
    etat.messages.splice(i, 1);
    marquerSale('messages', id);
  }
}

export type { ContactMessage };
