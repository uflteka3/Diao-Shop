'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Product } from '@/lib/data/types';
import { formatPrix } from '@/lib/utils/format';
import { fr } from '@/lib/i18n/fr';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { ArrowRightIcon, CheckIcon } from '@/components/Icons';

interface Props {
  product: Product;
}

/**
 * Fiche produit — applique le THÈME DU PRODUIT à toute la page (variables --ds-*).
 * Galerie prête pour plusieurs images, taille obligatoire, quantité limitée au stock,
 * favoris (contexte global persistant).
 */
export default function ProductDetail({ product }: Props) {
  const { addItem, removeItem, hasItem } = useCart();
  const { has: hasFav, toggle: toggleFav } = useFavorites();
  const router = useRouter();

  const [imageIdx, setImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeHint, setSizeHint] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const images = [product.mainImage]; // galerie : 1 image réelle fournie — extensible via back-office
  const taillesActives = product.sizes.filter((s) => s.active);
  const tailleChoisie = taillesActives.find((s) => s.size === selectedSize);
  const stockTaille = tailleChoisie?.stock ?? 0;
  const totalStock = taillesActives.reduce((s, x) => s + x.stock, 0);
  const favActif = hasFav(product.id);
  // Bouton dynamique : l'état reflète le panier (taille sélectionnée).
  const dansPanier = selectedSize ? hasItem(product.id, selectedSize) : false;

  function handleAdd() {
    if (!selectedSize) {
      setSizeHint(true);
      return;
    }
    if (!tailleChoisie || tailleChoisie.stock <= 0) return;
    // Bascule : si la sélection est déjà dans le panier, un nouvel appui la retire.
    if (hasItem(product.id, selectedSize)) {
      removeItem(product.id, selectedSize);
      setToast(`${product.name} (taille ${selectedSize}) ${fr.home.produitRetire}`);
      setTimeout(() => setToast(null), 2800);
      return;
    }
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        size: selectedSize,
        quantity: qty,
        unitPrice: product.price,
        image: product.mainImage,
      },
      tailleChoisie.stock
    );
    setToast(`${product.name} (taille ${selectedSize}) ${fr.home.produitAjoute}`);
    setTimeout(() => setToast(null), 2800);
  }

  /** « Acheter maintenant » : ajout au panier puis redirection directe vers le checkout. */
  function handleAchat() {
    if (!selectedSize || !tailleChoisie || tailleChoisie.stock <= 0) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        size: selectedSize,
        quantity: qty,
        unitPrice: product.price,
        image: product.mainImage,
      },
      tailleChoisie.stock
    );
    router.push('/commande');
  }

  return (
    <div className="mx-auto w-[min(1180px,94vw)]">
      {/* Fil d'Ariane */}
      <nav aria-label="Fil d’Ariane" className="mb-4 text-[13px] text-[color:var(--ds-muted)]">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover-tint rounded px-1 py-0.5 focus-ring">
              Accueil
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/boutique" className="hover-tint rounded px-1 py-0.5 focus-ring">
              {fr.nav.boutique}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="px-1 py-0.5 font-semibold text-[color:var(--ds-text)]">
            {product.name}
          </li>
        </ol>
      </nav>

      <div
        className="grid gap-6 rounded-panel border p-4 sm:p-6 lg:grid-cols-2 lg:gap-10 lg:p-8"
        style={{
          borderColor: 'var(--ds-border)',
          backgroundColor: 'color-mix(in srgb, var(--ds-secondary) 72%, transparent)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {/* ----- Galerie ----- */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-panel border" style={{ borderColor: 'var(--ds-border)' }}>
            <Image
              key={imageIdx}
              src={images[imageIdx]}
              alt={product.altText}
              fill
              sizes="(max-width: 1024px) 92vw, 520px"
              priority
              className="object-contain p-4"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2.5">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setImageIdx(i)}
                  aria-label={`Image ${i + 1}`}
                  aria-current={i === imageIdx || undefined}
                  className="focus-ring relative h-16 w-16 overflow-hidden rounded-thumb border-2"
                  style={{ borderColor: i === imageIdx ? 'var(--ds-accent)' : 'var(--ds-border)' }}
                >
                  <Image src={src} alt="" fill sizes="64px" className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ----- Informations ----- */}
        <div className="flex flex-col">
          <p className="flex items-center gap-2 text-[13px] font-medium text-[color:var(--ds-muted)]">
            <span aria-hidden className="h-2 w-2 rounded-full bg-[color:var(--ds-accent)]" />
            {product.team}
          </p>
          <h1 className="title-tight mt-2 text-3xl font-extrabold leading-[1.1] text-[color:var(--ds-text)] sm:text-4xl">
            {product.name}
            <br />
            <span className="text-[color:var(--ds-accent)]">{product.subTitle}</span>
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <p className="price-tnum text-3xl font-extrabold text-[color:var(--ds-text)] sm:text-4xl">
              {formatPrix(product.price, product.currency)}
            </p>
            {product.oldPrice != null && (
              <p className="price-tnum text-lg font-medium text-[color:var(--ds-muted)] line-through">
                {formatPrix(product.oldPrice, product.currency)}
              </p>
            )}
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-[color:var(--ds-muted)]">{product.description}</p>

          <p className="mt-5 text-sm font-medium text-[color:var(--ds-muted)]">{fr.home.choisirTaille}</p>
          <div role="radiogroup" aria-label={fr.home.choisirTaille} className="mt-2.5 flex flex-wrap gap-2.5">
            {taillesActives.map((s) => {
              const dispo = s.stock > 0;
              const sel = selectedSize === s.size;
              return (
                <button
                  key={s.size}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  disabled={!dispo}
                  onClick={() => {
                    setSelectedSize(s.size);
                    setQty(1);
                    setSizeHint(false);
                  }}
                  title={dispo ? undefined : fr.home.tailleIndisponible}
                  className={`focus-ring inline-flex h-11 min-w-[48px] items-center justify-center rounded-pill border px-3 text-sm font-semibold transition-colors ${
                    dispo ? 'hover-tint' : 'cursor-not-allowed line-through opacity-40'
                  }`}
                  style={
                    sel
                      ? { backgroundColor: 'var(--ds-accent)', color: 'var(--ds-accent-text)', borderColor: 'var(--ds-accent)' }
                      : { borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }
                  }
                >
                  {s.size}
                </button>
              );
            })}
          </div>
          <p
            aria-live="polite"
            className="mt-2 min-h-[20px] text-[13px] font-medium"
            style={{ color: sizeHint ? 'var(--ds-danger)' : 'transparent' }}
          >
            {sizeHint ? fr.home.tailleObligatoire : '·'}
          </p>

          {/* Quantité */}
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center rounded-pill border" style={{ borderColor: 'var(--ds-border)' }}>
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Diminuer la quantité"
                className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-pill text-lg font-bold text-[color:var(--ds-text)] disabled:opacity-40"
              >
                −
              </button>
              <span aria-live="polite" className="price-tnum w-10 text-center text-[15px] font-bold text-[color:var(--ds-text)]">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(stockTaille || 1, q + 1))}
                disabled={!selectedSize || qty >= stockTaille}
                aria-label="Augmenter la quantité"
                className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-pill text-lg font-bold text-[color:var(--ds-text)] disabled:opacity-40"
              >
                +
              </button>
            </div>
            <p className="flex items-center gap-2 text-[13px] font-medium">
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: totalStock > 0 ? 'var(--ds-success)' : 'var(--ds-danger)' }}
              />
              <span className="text-[color:var(--ds-muted)]">
                {!totalStock
                  ? fr.home.epuise
                  : selectedSize
                    ? stockTaille > 0
                      ? fr.home.stockNombre(stockTaille)
                      : fr.home.tailleIndisponible
                    : fr.home.enStock}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={totalStock === 0}
              aria-pressed={dansPanier}
              className={`${dansPanier ? 'focus-ring' : 'cta-shadow focus-ring'} inline-flex h-14 items-center gap-3 rounded-pill px-7 text-[15px] font-bold transition-all hover:-translate-y-px active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45`}
              style={
                dansPanier
                  ? { border: '1.5px solid color-mix(in srgb, var(--ds-danger) 60%, transparent)', color: 'var(--ds-text)' }
                  : { backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }
              }
            >
              {dansPanier && (
                <span aria-hidden className="inline-flex" style={{ color: 'var(--ds-danger)' }}>
                  <CheckIcon className="h-4 w-4" />
                </span>
              )}
              {totalStock === 0 ? fr.home.epuise : dansPanier ? fr.home.retirerPanier : fr.home.ajouterPanier}
            </button>
            {totalStock > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (!selectedSize) {
                    setSizeHint(true);
                    return;
                  }
                  handleAchat();
                }}
                className="focus-ring inline-flex h-14 items-center gap-2 rounded-pill border px-6 text-[15px] font-bold text-[color:var(--ds-text)] transition-colors hover-tint"
                style={{ borderColor: 'var(--ds-border)' }}
              >
                {fr.produit.acheter}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => toggleFav(product.id)}
              aria-pressed={favActif}
              aria-label={fr.header.favoris}
              className="icon-btn focus-ring"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill={favActif ? 'var(--ds-accent)' : 'none'}
                stroke={favActif ? 'var(--ds-accent)' : 'currentColor'}
                strokeWidth={1.8}
                aria-hidden="true"
                focusable="false"
              >
                <path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6.3a5 5 0 1 1 7.5 6.3Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Toast d'ajout */}
      <div aria-live="polite" className="sr-only">
        {toast}
      </div>
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
          <p
            role="status"
            className="pointer-events-auto rounded-pill border px-5 py-3 text-sm font-semibold shadow-xl"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--ds-secondary) 92%, transparent)',
              borderColor: 'var(--ds-border)',
              color: 'var(--ds-text)',
            }}
          >
            ✓ {toast}
          </p>
        </div>
      )}
    </div>
  );
}
