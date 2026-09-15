'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/lib/data/types';
import { formatPrix } from '@/lib/utils/format';
import { fr } from '@/lib/i18n/fr';

/** Page panier — quantités limitées au stock réel, suppression, sous-totaux, état vide. */
export default function CartView({ produits }: { produits: Product[] }) {
  const { items, subtotal, updateQty, removeItem, hydrated } = useCart();
  const router = useRouter();

  // Si le panier se vide ( suppression de la dernière ligne), renvoyer vers l'état vide (pas de redirection forcée)
  function stockDe(productSlug: string, size: string): number | null {
    const p = produits.find((x) => x.slug === productSlug);
    if (!p) return null; // produit retiré du catalogue
    const s = p.sizes.find((x) => x.size === size && x.active);
    return s ? s.stock : null;
  }

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-3">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-24 rounded-panel"
            style={{ backgroundColor: 'color-mix(in srgb, var(--ds-text) 6%, transparent)' }}
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-panel border p-10 text-center" style={{ borderColor: 'var(--ds-border)' }}>
        <p className="title-tight text-lg font-bold text-[color:var(--ds-text)]">{fr.panier.vide}</p>
        <p className="mt-2 text-sm text-[color:var(--ds-muted)]">{fr.panier.videTexte}</p>
        <Link
          href="/boutique"
          className="focus-ring mt-6 inline-flex h-12 items-center rounded-pill px-6 text-sm font-bold"
          style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
        >
          {fr.panier.continuerAchats}
        </Link>
      </div>
    );
  }

  const toutDisponible = items.every(
    (i) => (stockDe(i.slug, i.size) ?? 0) >= i.quantity
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* ----- Lignes du panier ----- */}
      <ul className="space-y-3">
        {items.map((item) => {
          const stock = stockDe(item.slug, item.size);
          const ok = stock != null && stock >= item.quantity;
          return (
            <li
              key={`${item.productId}-${item.size}`}
              className="flex gap-4 rounded-panel border p-3 sm:p-4"
              style={{
                borderColor: ok ? 'var(--ds-border)' : 'color-mix(in srgb, var(--ds-danger) 55%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--ds-secondary) 60%, transparent)',
              }}
            >
              <Link
                href={`/produit/${item.slug}`}
                className="bg-tint focus-ring relative block h-24 w-24 flex-none overflow-hidden rounded-thumb"
              >
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-contain p-1.5" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/produit/${item.slug}`}
                      className="focus-ring block truncate text-[15px] font-bold text-[color:var(--ds-text)]"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-[13px] text-[color:var(--ds-muted)]">
                      Taille <span className="font-bold text-[color:var(--ds-text)]">{item.size}</span>
                      {' · '}
                      <span className="price-tnum">{formatPrix(item.unitPrice, 'FCFA')}</span> l’unité
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.size)}
                    aria-label={`${fr.panier.supprimer} : ${item.name} (taille ${item.size})`}
                    className="icon-btn focus-ring !h-9 !w-9"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-4 w-4" aria-hidden="true" focusable="false">
                      <path d="M4 7h16M9 7V4.8c0-.4.4-.8.8-.8h4.4c.4 0 .8.4.8.8V7m-9 0 1 12.2c.1.9.8 1.6 1.7 1.6h7c.9 0 1.6-.7 1.7-1.6L17 7" />
                    </svg>
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-pill border" style={{ borderColor: 'var(--ds-border)' }}>
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.size, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Diminuer la quantité"
                      className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-pill text-lg font-bold text-[color:var(--ds-text)] disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="price-tnum w-9 text-center text-sm font-bold text-[color:var(--ds-text)]">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.size, Math.min(item.quantity + 1, stock ?? item.quantity))}
                      disabled={stock == null || item.quantity >= stock}
                      aria-label="Augmenter la quantité"
                      className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-pill text-lg font-bold text-[color:var(--ds-text)] disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <p className="price-tnum text-[15px] font-extrabold text-[color:var(--ds-accent)]">
                    {formatPrix(item.unitPrice * item.quantity, 'FCFA')}
                  </p>
                </div>

                {!ok && (
                  <p className="mt-2 text-[12.5px] font-semibold" style={{ color: 'var(--ds-danger)' }}>
                    {stock == null
                      ? fr.panier.indisponible
                      : `${fr.home.tailleIndisponible} — stock restant : ${stock}.`}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* ----- Récapitulatif ----- */}
      <aside
        className="h-fit rounded-panel border p-5 lg:sticky lg:top-4"
        style={{ borderColor: 'var(--ds-border)', backgroundColor: 'color-mix(in srgb, var(--ds-secondary) 72%, transparent)' }}
      >
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[color:var(--ds-muted)]">{fr.commande.recap}</p>
        <div className="mt-3 flex items-center justify-between text-sm text-[color:var(--ds-text)]">
          <span>{fr.panier.sousTotal}</span>
          <span className="price-tnum font-bold">{formatPrix(subtotal, 'FCFA')}</span>
        </div>
        <p className="mt-2 text-[12px] text-[color:var(--ds-muted)]">{fr.panier.livraisonNote}</p>
        <button
          type="button"
          disabled={!toutDisponible}
          onClick={() => router.push('/commande')}
          className="cta-shadow focus-ring mt-5 inline-flex h-13 w-full items-center justify-center rounded-pill py-3.5 text-[15px] font-bold transition-transform hover:-translate-y-px active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45"
          style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
        >
          {fr.panier.passerCommande}
        </button>
        <Link
          href="/boutique"
          className="focus-ring mt-3 block text-center text-[13px] font-semibold underline underline-offset-4"
          style={{ color: 'var(--ds-accent)' }}
        >
          {fr.panier.continuerAchats}
        </Link>
      </aside>
    </div>
  );
}
