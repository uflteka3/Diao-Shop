import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Driver, Dirty, Snapshot } from './types';
import type { Order, OrderItem, Product, ProductSize, ProductTheme } from '@/lib/data/types';

/**
 * Driver Supabase — production. Accès exclusivement SERVEUR avec la clé
 * service_role (RLS active sur toutes les tables : rien n'est exposé au public).
 * Le schéma SQL correspondant : supabase/schema.sql (à exécuter dans SQL Editor).
 */

let client: SupabaseClient | null = null;
const orderIds = new Map<string, string>(); // orderNumber → uuid de la ligne orders

function c(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

function nombre(v: unknown, defaut = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : defaut;
}

// ---------- Lecture : tables → Snapshot ----------
async function charger(): Promise<Snapshot | null> {
  const sb = c();
  const [produits, tailles, images, themes, commandes, lignes, parametres, messages] = await Promise.all([
    sb.from('products').select('*'),
    sb.from('product_sizes').select('*'),
    sb.from('product_images').select('*'),
    sb.from('product_themes').select('*'),
    sb.from('orders').select('*'),
    sb.from('order_items').select('*'),
    sb.from('shop_settings').select('*').eq('id', 1).maybeSingle(),
    sb.from('contact_messages').select('*'),
  ]);
  for (const r of [produits, tailles, images, themes, commandes, lignes, parametres, messages]) {
    if (r.error) throw r.error;
  }

  // Projet totalement vierge → amorçage sur les données de démonstration
  const vide =
    (produits.data?.length ?? 0) === 0 &&
    (commandes.data?.length ?? 0) === 0 &&
    !parametres.data &&
    (messages.data?.length ?? 0) === 0;
  if (vide) return null;

  const taillesParProduit = new Map<string, ProductSize[]>();
  for (const t of tailles.data ?? []) {
    const liste = taillesParProduit.get(t.product_id) ?? [];
    liste.push({ size: t.size, stock: nombre(t.stock), active: Boolean(t.active) });
    taillesParProduit.set(t.product_id, liste);
  }
  const imagesParProduit = new Map<string, { main: string; galerie: string[] }>();
  for (const im of (images.data ?? []).sort((a, b) => nombre(a.position) - nombre(b.position))) {
    const cur = imagesParProduit.get(im.product_id) ?? { main: '', galerie: [] };
    if (im.is_main) cur.main = im.url;
    else cur.galerie.push(im.url);
    imagesParProduit.set(im.product_id, cur);
  }
  const themesParProduit = new Map<string, ProductTheme>();
  for (const t of themes.data ?? []) {
    themesParProduit.set(t.product_id, {
      backgroundColor: t.background_color,
      primaryColor: t.primary_color,
      secondaryColor: t.secondary_color,
      accentColor: t.accent_color,
      textColor: t.text_color,
      mutedTextColor: t.muted_text_color,
      buttonColor: t.button_color,
      glowColor: t.glow_color,
      glowIntensity: nombre(t.glow_intensity, 0.4),
      surfaceGradient: t.surface_gradient,
      borderColor: t.border_color,
      mode: t.mode === 'light' ? 'light' : 'dark',
    });
  }

  const produitsMap = (produits.data ?? []).map(
    (p): Product => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      subTitle: p.sub_title ?? '',
      team: p.team ?? p.name,
      shortDescription: p.short_description ?? '',
      description: p.description ?? '',
      price: nombre(p.price),
      oldPrice: p.old_price == null ? null : nombre(p.old_price),
      currency: p.currency ?? 'FCFA',
      mainImage: imagesParProduit.get(p.id)?.main ?? '',
      gallery: imagesParProduit.get(p.id)?.galerie ?? [],
      altText: p.alt_text ?? '',
      sizes: taillesParProduit.get(p.id) ?? [],
      published: Boolean(p.published),
      isFeatured: Boolean(p.is_featured),
      createdAt: p.created_at ?? new Date().toISOString(),
    })
  );

  const itemsParCommande = new Map<string, OrderItem[]>();
  for (const it of (lignes.data ?? []).sort((a, b) => nombre(a.position) - nombre(b.position))) {
    const liste = itemsParCommande.get(it.order_id) ?? [];
    liste.push({
      productId: it.product_id ?? '',
      productName: it.product_name ?? '',
      productImage: it.product_image ?? '',
      size: it.size ?? '',
      quantity: nombre(it.quantity),
      unitPrice: nombre(it.unit_price),
      totalPrice: nombre(it.total_price),
    });
    itemsParCommande.set(it.order_id, liste);
  }
  const commandesMap = (commandes.data ?? []).map(
    (o): Order => ({
      orderNumber: o.order_number,
      customerName: o.customer_name ?? '',
      phone: o.phone ?? '',
      whatsapp: o.whatsapp ?? undefined,
      email: o.email ?? undefined,
      address: o.address ?? '',
      city: o.city ?? '',
      zoneLabel: o.zone_label ?? '',
      deliveryMethod: o.delivery_method ?? 'Livraison',
      paymentMethod: o.payment_method ?? '',
      notes: o.notes ?? undefined,
      items: itemsParCommande.get(o.id) ?? [],
      subtotal: nombre(o.subtotal),
      deliveryFee: nombre(o.delivery_fee),
      total: nombre(o.total),
      currency: o.currency ?? 'FCFA',
      status: o.status ?? 'nouvelle',
      createdAt: o.created_at ?? new Date().toISOString(),
    })
  );
  for (const o of commandesMap) {
    const uuid = (commandes.data ?? []).find((x) => x.order_number === o.orderNumber)?.id;
    if (typeof uuid === 'string') orderIds.set(o.orderNumber, uuid);
  }

  const settings = parametres.data?.data as Snapshot['settings'] | undefined;
  if (!settings) throw new Error('Paramètres boutique absents de Supabase (ligne shop_settings id=1).');

  const snapshot: Snapshot = {
    products: produitsMap,
    themes: Object.fromEntries(themesParProduit),
    featuredId: produitsMap.find((p) => p.isFeatured)?.id ?? null,
    orders: commandesMap,
    settings,
    messages: (messages.data ?? []).map((m) => ({
      id: m.id,
      name: m.name ?? '',
      email: m.email ?? '',
      phone: m.phone ?? '',
      message: m.message ?? '',
      lu: Boolean(m.lu),
      createdAt: m.created_at ?? new Date().toISOString(),
    })),
  };
  return snapshot;
}

// ---------- Écriture : Snapshot → tables ----------
async function persisterProduits(sb: SupabaseClient, snapshot: Snapshot, ids: Set<string>): Promise<void> {
  const tout = ids.has('*');
  if (tout) {
    // Supprimer les produits disparus (les enfants partent en CASCADE)
    const { data: existants, error: errLecture } = await sb.from('products').select('id');
    if (errLecture) throw errLecture;
    const actuels = new Set(snapshot.products.map((p) => p.id));
    const supprimes = (existants ?? []).map((r) => r.id as string).filter((id) => !actuels.has(id));
    if (supprimes.length) {
      const { error } = await sb.from('products').delete().in('id', supprimes);
      if (error) throw error;
    }
  }
  const cibles = (tout ? snapshot.products : snapshot.products.filter((p) => ids.has(p.id)))
    // Les produits SANS mise en avant d'abord : évite tout conflit avec l'index
    // unique « un seul is_featured » pendant la bascule.
    .sort((a, b) => Number(a.isFeatured) - Number(b.isFeatured));
  for (const p of cibles) {
    const ligne = {
      id: p.id,
      slug: p.slug,
      name: p.name,
      sub_title: p.subTitle,
      team: p.team,
      short_description: p.shortDescription,
      description: p.description,
      price: p.price,
      old_price: p.oldPrice,
      currency: p.currency,
      alt_text: p.altText,
      published: p.published,
      is_featured: p.isFeatured,
      created_at: p.createdAt,
    };
    const { error } = await sb.from('products').upsert(ligne);
    if (error) throw error;

    await sb.from('product_sizes').delete().eq('product_id', p.id);
    if (p.sizes.length) {
      const { error: errTailles } = await sb.from('product_sizes').insert(
        p.sizes.map((s) => ({ product_id: p.id, size: s.size, stock: s.stock, active: s.active }))
      );
      if (errTailles) throw errTailles;
    }

    await sb.from('product_images').delete().eq('product_id', p.id);
    const rangeesImages = [
      { product_id: p.id, url: p.mainImage, alt: p.altText, position: 0, is_main: true },
      ...(p.gallery ?? []).map((url, i) => ({ product_id: p.id, url, alt: p.altText, position: i + 1, is_main: false })),
    ].filter((r) => r.url);
    if (rangeesImages.length) {
      const { error: errImages } = await sb.from('product_images').insert(rangeesImages);
      if (errImages) throw errImages;
    }

    const t = snapshot.themes[p.id];
    if (t) {
      const { error: errTheme } = await sb.from('product_themes').upsert({
        product_id: p.id,
        background_color: t.backgroundColor,
        primary_color: t.primaryColor,
        secondary_color: t.secondaryColor,
        accent_color: t.accentColor,
        text_color: t.textColor,
        muted_text_color: t.mutedTextColor,
        button_color: t.buttonColor,
        glow_color: t.glowColor,
        glow_intensity: t.glowIntensity,
        surface_gradient: t.surfaceGradient,
        border_color: t.borderColor,
        mode: t.mode,
      });
      if (errTheme) throw errTheme;
    }
  }
  // Produits supprimés ciblés (ids marqués sales mais absents du snapshot)
  if (!tout) {
    for (const id of ids) {
      if (!snapshot.products.some((p) => p.id === id)) {
        await sb.from('products').delete().eq('id', id);
      }
    }
  }
}

async function persisterCommandes(sb: SupabaseClient, snapshot: Snapshot, numeros: Set<string>): Promise<void> {
  const cibles = numeros.has('*') ? snapshot.orders : snapshot.orders.filter((o) => numeros.has(o.orderNumber));
  for (const o of cibles) {
    let id = orderIds.get(o.orderNumber);
    if (!id) {
      const { data } = await sb.from('orders').select('id').eq('order_number', o.orderNumber).maybeSingle();
      if (typeof data?.id === 'string') id = data.id;
    }
    const ligne: Record<string, unknown> = {
      order_number: o.orderNumber,
      customer_name: o.customerName,
      phone: o.phone,
      whatsapp: o.whatsapp ?? null,
      email: o.email ?? null,
      address: o.address,
      city: o.city,
      zone_label: o.zoneLabel,
      delivery_method: o.deliveryMethod,
      payment_method: o.paymentMethod,
      notes: o.notes ?? null,
      subtotal: o.subtotal,
      delivery_fee: o.deliveryFee,
      total: o.total,
      currency: o.currency,
      status: o.status,
      created_at: o.createdAt,
    };
    if (id) ligne.id = id;
    const { data: rangee, error } = await sb.from('orders').upsert(ligne).select('id').single();
    if (error || !rangee) throw error ?? new Error('Échec de l’upsert de la commande.');
    id = rangee.id as string;
    orderIds.set(o.orderNumber, id);

    await sb.from('order_items').delete().eq('order_id', id);
    if (o.items.length) {
      // product_id sans clé étrangère : l'historique (snapshots) survit aux suppressions de produits
      const { error: errItems } = await sb.from('order_items').insert(
        o.items.map((it, i) => ({
          order_id: id,
          position: i,
          product_id: it.productId || null,
          product_name: it.productName,
          product_image: it.productImage,
          size: it.size,
          quantity: it.quantity,
          unit_price: it.unitPrice,
          total_price: it.totalPrice,
        }))
      );
      if (errItems) throw errItems;
    }
  }
}

async function persisterParametres(sb: SupabaseClient, snapshot: Snapshot): Promise<void> {
  const { error } = await sb
    .from('shop_settings')
    .upsert({ id: 1, data: snapshot.settings, updated_at: new Date().toISOString() });
  if (error) throw error;
}

async function persisterMessages(sb: SupabaseClient, snapshot: Snapshot, ids: Set<string>): Promise<void> {
  const tout = ids.has('*');
  const cibles = tout ? snapshot.messages : snapshot.messages.filter((m) => ids.has(m.id));
  for (const m of cibles) {
    const { error } = await sb.from('contact_messages').upsert({
      id: m.id,
      name: m.name,
      email: m.email || null,
      phone: m.phone || null,
      message: m.message,
      lu: m.lu,
      created_at: m.createdAt,
    });
    if (error) throw error;
  }
  // Ids marqués sales mais absents du snapshot → suppression
  for (const id of ids) {
    if (id === '*') continue;
    if (!snapshot.messages.some((m) => m.id === id)) {
      await sb.from('contact_messages').delete().eq('id', id);
    }
  }
}

async function persister(snapshot: Snapshot, dirty: Dirty): Promise<void> {
  const sb = c();
  if (dirty.has('products')) await persisterProduits(sb, snapshot, dirty.get('products')!);
  if (dirty.has('orders')) await persisterCommandes(sb, snapshot, dirty.get('orders')!);
  if (dirty.has('settings')) await persisterParametres(sb, snapshot);
  if (dirty.has('messages')) await persisterMessages(sb, snapshot, dirty.get('messages')!);
}

export const supabaseDriver: Driver = {
  nom: 'supabase',
  charger,
  persister,
};
