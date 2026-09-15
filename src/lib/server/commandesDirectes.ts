import type { ContactMessage, Order, OrderItem } from '@/lib/data/types';
import { remplacerCommandes, remplacerMessages } from '@/lib/admin/store';

/**
 * Lectures DIRECTES Supabase (service_role) — indépendantes du store mémoire.
 *
 * Pourquoi : sur Vercel, chaque instance serverless possède sa propre copie
 * mémoire du store. Une commande créée (ou un message déposé) via une autre
 * instance n'y figure pas. La page de confirmation et les pages admin
 * relecturent donc la base, source de vérité, avant de répondre.
 */

interface ConfigSupabase {
  url: string;
  cle: string;
}

function config(): ConfigSupabase | null {
  const url = process.env.SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle) return null;
  return { url: url.replace(/\/+$/, ''), cle };
}

async function rest<T>(cfg: ConfigSupabase, chemin: string): Promise<T> {
  const reponse = await fetch(`${cfg.url}${chemin}`, {
    headers: { apikey: cfg.cle, Authorization: `Bearer ${cfg.cle}` },
    cache: 'no-store',
  });
  if (!reponse.ok) throw new Error(`Supabase REST ${reponse.status} sur ${chemin.split('?')[0]}`);
  return (await reponse.json()) as T;
}

function nombre(v: unknown, defaut = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : defaut;
}

type Rangee = Record<string, unknown>;

function versOrder(o: Rangee, lignes: Rangee[]): Order {
  const items: OrderItem[] = lignes.map((it) => ({
    productId: (it.product_id as string) ?? '',
    productName: (it.product_name as string) ?? '',
    productImage: (it.product_image as string) ?? '',
    size: (it.size as string) ?? '',
    quantity: nombre(it.quantity, 1),
    unitPrice: nombre(it.unit_price),
    totalPrice: nombre(it.total_price),
  }));
  return {
    orderNumber: (o.order_number as string) ?? '',
    customerName: (o.customer_name as string) ?? '',
    phone: (o.phone as string) ?? '',
    whatsapp: (o.whatsapp as string) ?? undefined,
    email: (o.email as string) ?? undefined,
    address: (o.address as string) ?? '',
    city: (o.city as string) ?? '',
    zoneLabel: (o.zone_label as string) ?? '',
    deliveryMethod: (o.delivery_method as string) ?? 'Livraison',
    paymentMethod: (o.payment_method as string) ?? '',
    notes: (o.notes as string) ?? undefined,
    items,
    subtotal: nombre(o.subtotal),
    deliveryFee: nombre(o.delivery_fee),
    total: nombre(o.total),
    currency: (o.currency as string) ?? 'FCFA',
    status: ((o.status as string) ?? 'nouvelle') as Order['status'],
    createdAt: (o.created_at as string) ?? new Date().toISOString(),
  };
}

/** Lecture directe d'une commande par son numéro (DS-XXXXXX). `null` si absente/erreur. */
export async function chargerCommandeDirecte(numero: string): Promise<Order | null> {
  const cfg = config();
  if (!cfg) return null; // mode démo (mock) : la mémoire du store fait foi
  const propre = numero.trim().toUpperCase();
  if (!/^DS-[A-Z0-9]{4,10}$/.test(propre)) return null;
  try {
    const commandes = await rest<Rangee[]>(
      cfg,
      `/rest/v1/orders?order_number=eq.${encodeURIComponent(propre)}&select=*`
    );
    const ligne = commandes[0];
    if (!ligne) return null;
    const lignes = await rest<Rangee[]>(
      cfg,
      `/rest/v1/order_items?order_id=eq.${String(ligne.id)}&order=position.asc&select=*`
    );
    return versOrder(ligne, lignes);
  } catch (erreur) {
    console.error('[commandesDirectes] échec de lecture :', erreur);
    return null;
  }
}

/** Résynchro du store mémoire avec toutes les commandes en base (page admin). */
export async function rafraichirCommandes(): Promise<void> {
  const cfg = config();
  if (!cfg) return;
  try {
    const [commandes, lignes] = await Promise.all([
      rest<Rangee[]>(cfg, '/rest/v1/orders?order=created_at.desc&select=*'),
      rest<Rangee[]>(cfg, '/rest/v1/order_items?order=position.asc&select=*'),
    ]);
    const parCommande = new Map<string, Rangee[]>();
    for (const it of lignes) {
      const id = String(it.order_id);
      const liste = parCommande.get(id) ?? [];
      liste.push(it);
      parCommande.set(id, liste);
    }
    remplacerCommandes(commandes.map((o) => versOrder(o, parCommande.get(String(o.id)) ?? [])));
  } catch (erreur) {
    console.error('[commandesDirectes] résynchro commandes impossible :', erreur);
  }
}

/** Résynchro du store mémoire avec les messages de contact en base. */
export async function rafraichirMessages(): Promise<void> {
  const cfg = config();
  if (!cfg) return;
  try {
    const messages = await rest<Rangee[]>(cfg, '/rest/v1/contact_messages?order=created_at.desc&select=*');
    const convertis: ContactMessage[] = messages.map((m) => ({
      id: String(m.id),
      name: (m.name as string) ?? '',
      email: (m.email as string) ?? '',
      phone: (m.phone as string) ?? '',
      message: (m.message as string) ?? '',
      lu: Boolean(m.lu),
      createdAt: (m.created_at as string) ?? new Date().toISOString(),
    }));
    remplacerMessages(convertis);
  } catch (erreur) {
    console.error('[commandesDirectes] résynchro messages impossible :', erreur);
  }
}
