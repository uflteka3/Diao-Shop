'use client';

import Link from 'next/link';
import type { Product } from '@/lib/data/types';
import ProductCard from '@/components/catalogue/ProductCard';
import { useFavorites } from '@/contexts/FavoritesContext';
import { fr } from '@/lib/i18n/fr';

/** Page Favoris — ajout/retrait persistant (localStorage), accès fiche produit, état vide. */
export default function FavoritesList({ products }: { products: Product[] }) {
  const { ids, toggle, hydrated } = useFavorites();
  const favoris = products.filter((p) => ids.includes(p.id));

  if (!hydrated) {
    // Squelette pendant la lecture du stockage local
    return (
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-panel"
            style={{ backgroundColor: 'color-mix(in srgb, var(--ds-text) 6%, transparent)' }}
          />
        ))}
      </div>
    );
  }

  if (favoris.length === 0) {
    return (
      <div className="rounded-panel border p-10 text-center" style={{ borderColor: 'var(--ds-border)' }}>
        <p className="title-tight text-lg font-bold text-[color:var(--ds-text)]">Aucun favori pour le moment</p>
        <p className="mt-2 text-sm text-[color:var(--ds-muted)]">
          Touchez le cœur d’un maillot pour le retrouver ici, sur cet appareil.
        </p>
        <Link
          href="/boutique"
          className="focus-ring mt-6 inline-flex h-12 items-center rounded-pill px-6 text-sm font-bold"
          style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
        >
          {fr.commune.voirBoutique}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
      {favoris.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          topRight={
            <button
              type="button"
              onClick={() => toggle(p.id)}
              aria-label={`Retirer ${p.name} des favoris`}
              className="icon-btn focus-ring !h-9 !w-9"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="var(--ds-accent)"
                stroke="var(--ds-accent)"
                strokeWidth={1.8}
                aria-hidden="true"
                focusable="false"
              >
                <path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6.3a5 5 0 1 1 7.5 6.3Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          }
        />
      ))}
    </div>
  );
}
