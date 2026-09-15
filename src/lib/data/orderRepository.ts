import type { Order, OrderItem } from '@/lib/data/types';
import { getProduits } from '@/lib/admin/store';
import { enregistrerCommande, getCommande, getCommandes, changerStatut, decrementerStock } from '@/lib/admin/store';
import { getShopSettings } from '@/lib/data/settingsRepository';

/**
 * Couche d'accès aux commandes — logique métier SERVEUR.
 * Prix/stock relus depuis le store, décrément du stock, snapshots, numéro DS-XXXXXX.
 * Phase 8 : insertion Supabase en transaction (même contrat).
 */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function genererNumero(): string {
  let s = '';
  do {
    s = '';
    for (let i = 0; i < 6; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  } while (getCommandes().some((o) => o.orderNumber === `DS-${s}`));
  return `DS-${s}`;
}

export interface LignePanierServeur {
  productId: string;
  size: string;
  quantity: number;
}

export interface ClientServeur {
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
}

export interface LivraisonServeur {
  address: string;
  city: string;
  zoneId: string;
  notes?: string;
}

export type ResultatCreation =
  | { ok: true; order: Order }
  | { ok: false; code: 'panier_vide' | 'produit_introuvable' | 'stock_insuffisant' | 'zone_inconnue'; message: string };

export function createOrder(
  client: ClientServeur,
  livraison: LivraisonServeur,
  lignes: LignePanierServeur[]
): ResultatCreation {
  if (lignes.length === 0) {
    return { ok: false, code: 'panier_vide', message: 'Votre panier est vide.' };
  }

  const settings = getShopSettings();
  const zone = settings.deliverySettings.zones.find((zoneItem) => zoneItem.id === livraison.zoneId);
  if (!zone) {
    return { ok: false, code: 'zone_inconnue', message: 'Zone de livraison inconnue — merci de la choisir à nouveau.' };
  }

  const produits = getProduits();
  const lignesValidees: OrderItem[] = [];
  let subtotal = 0;

  for (const ligne of lignes) {
    const product = produits.find((p) => p.id === ligne.productId && p.published);
    if (!product) {
      return { ok: false, code: 'produit_introuvable', message: 'Un maillot de votre panier n’est plus disponible.' };
    }
    const taille = product.sizes.find((s) => s.size === ligne.size && s.active);
    if (!taille || taille.stock < ligne.quantity) {
      return {
        ok: false,
        code: 'stock_insuffisant',
        message: `Stock insuffisant : ${product.name} (taille ${ligne.size}). Disponible : ${taille?.stock ?? 0}.`,
      };
    }
    const totalLigne = product.price * ligne.quantity;
    subtotal += totalLigne;
    lignesValidees.push({
      productId: product.id,
      productName: product.name, // snapshot immuable
      productImage: product.mainImage, // snapshot immuable
      size: ligne.size,
      quantity: ligne.quantity,
      unitPrice: product.price, // snapshot immuable
      totalPrice: totalLigne,
    });
  }

  // Décrément du stock (via le store : la mutation est persistée par le driver actif)
  for (const ligne of lignesValidees) {
    decrementerStock(ligne.productId, ligne.size, ligne.quantity);
  }

  const deliveryFee = zone.fee;
  const order: Order = {
    orderNumber: genererNumero(),
    customerName: client.name,
    phone: client.phone,
    whatsapp: client.whatsapp || undefined,
    email: client.email || undefined,
    address: livraison.address,
    city: livraison.city,
    zoneLabel: zone.label,
    deliveryMethod: 'Livraison',
    paymentMethod: settings.paymentSettings.label,
    notes: livraison.notes || undefined,
    items: lignesValidees,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    currency: settings.currency,
    status: 'nouvelle',
    createdAt: new Date().toISOString(),
  };

  enregistrerCommande(order);
  return { ok: true, order };
}

export function getOrderByNumber(numero: string): Order | null {
  return getCommande(numero.toUpperCase());
}

export { getCommandes, changerStatut };
