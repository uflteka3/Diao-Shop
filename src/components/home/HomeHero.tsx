'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Product, ProductTheme, ShopSettings } from '@/lib/data/types';
import { FALLBACK_THEME } from '@/lib/data/seed/themes';
import { themeToCssVars } from '@/lib/themes/cssVariables';
import { formatPrix } from '@/lib/utils/format';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import ProductVisual from '@/components/ProductVisual';
import CrownLogo from '@/components/CrownLogo';
import SiteHeader from '@/components/layout/SiteHeader';
import {
  ArrowRightIcon,
  CartIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  MedalIcon,
  ShieldIcon,
  TruckIcon,
} from '@/components/Icons';
import { ConfiguredSocialLinks } from '@/components/SocialIcons';
import { fr } from '@/lib/i18n/fr';

interface Props {
  products: Product[];
  initialFeaturedId: string | null;
  settings: ShopSettings;
  themes: Record<string, ProductTheme>;
}

const CONFIANCE = [
  { icon: 'shield', label: fr.confiance.tissu },
  { icon: 'medal', label: fr.confiance.qualite },
  { icon: 'truck', label: fr.confiance.livraison },
] as const;

/**
 * Page d'accueil — héros premium fidèle aux affiches de référence.
 * Règle absolue : AUCUNE couleur codée en dur — tout passe par les variables
 * --ds-* issues du thème du produit sélectionné (transitions CSS .ds-anim).
 */
export default function HomeHero({ products, initialFeaturedId, settings, themes }: Props) {
  const reduce = useReducedMotion();
  const { addItem, removeItem, hasItem } = useCart();
  const { has: hasFav, toggle: toggleFav } = useFavorites();

  const [featuredId, setFeaturedId] = useState<string | null>(initialFeaturedId);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeHint, setSizeHint] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Performance mobile : le bandeau défilant est mis en pause quand il est
  // hors écran ou pendant un défilement — aucune animation inutile.
  const marqueeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;
    let visible = false;
    let enDefilement = false;
    let minuteur: ReturnType<typeof setTimeout> | null = null;
    function maj() {
      el!.classList.toggle('ds-marquee-pause', !visible || enDefilement);
    }
    const observateur = new IntersectionObserver(
      (entrees) => {
        visible = entrees[0]?.isIntersecting ?? false;
        maj();
      },
      { rootMargin: '80px' }
    );
    observateur.observe(el);
    const onScroll = () => {
      enDefilement = true;
      maj();
      if (minuteur) clearTimeout(minuteur);
      minuteur = setTimeout(() => {
        enDefilement = false;
        maj();
      }, 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observateur.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (minuteur) clearTimeout(minuteur);
    };
  }, []);

  const idx = products.findIndex((p) => p.id === featuredId);
  const product = idx >= 0 ? products[idx] : null;
  const nextProduct = product && products.length > 1 ? products[(idx + 1) % products.length] : null;

  const theme = useMemo(() => (product ? themes[product.id] ?? FALLBACK_THEME : FALLBACK_THEME), [product, themes]);
  const vars = useMemo(() => themeToCssVars(theme), [theme]);

  const taillesActives = product?.sizes.filter((s) => s.active) ?? [];
  const totalStock = taillesActives.reduce((s, x) => s + x.stock, 0);
  const enStock = totalStock > 0;
  const favActif = product ? hasFav(product.id) : false;
  // Bouton dynamique : état « déjà dans le panier » pour la taille affichée.
  const dansPanier = Boolean(product && selectedSize && hasItem(product.id, selectedSize));

  function goTo(id: string) {
    if (id === featuredId) return;
    setFeaturedId(id);
    setSelectedSize(null);
    setSizeHint(false);
  }

  function goNext() {
    if (!product) return;
    goTo(products[(idx + 1) % products.length].id);
  }

  function goPrev() {
    if (!product) return;
    goTo(products[(idx - 1 + products.length) % products.length].id);
  }

  function handleAdd() {
    if (!product || !enStock) return;
    if (!selectedSize) {
      setSizeHint(true);
      return;
    }
    const sizeInfo = product.sizes.find((s) => s.size === selectedSize);
    if (!sizeInfo || sizeInfo.stock <= 0) return;
    // Bascule : un nouvel appui retire la sélection du panier.
    if (hasItem(product.id, selectedSize)) {
      removeItem(product.id, selectedSize);
      setToast(`${product.name} (taille ${selectedSize}) ${fr.home.produitRetire}`);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2800);
      return;
    }
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        size: selectedSize,
        quantity: 1,
        unitPrice: product.price,
        image: product.mainImage,
      },
      sizeInfo.stock
    );
    const message = `${product.name} (taille ${selectedSize}) ${fr.home.produitAjoute}`;
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }

  return (
    <div
      data-mode={theme.mode}
      className="ds-anim relative min-h-screen overflow-x-clip"
      style={{ ...vars, backgroundColor: 'var(--ds-bg)' }}
    >
      {/* Rayons + halo d'arrière-plan — dérivés automatiquement du thème */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(85% 60% at 50% 0%, color-mix(in srgb, var(--ds-glow) 26%, transparent), transparent 72%), repeating-conic-gradient(from 160deg at 50% -12%, color-mix(in srgb, var(--ds-text) 4%, transparent) 0deg 5deg, transparent 5deg 16deg)',
          maskImage: 'linear-gradient(to bottom, black 55%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent)',
        }}
      />

      <div id="contenu" className="relative mx-auto w-[min(1280px,96vw)] py-4 sm:py-6 lg:py-10">
        {/* ====== CARTE PRINCIPALE ====== */}
        <section
          className="overflow-hidden rounded-card border shadow-[0_40px_90px_-30px_rgba(0,0,0,0.55)]"
          style={{
            borderColor: 'var(--ds-border)',
            backgroundColor: 'var(--ds-secondary)',
            backgroundImage: 'var(--ds-gradient)',
          }}
        >
          <SiteHeader />

          {/* Zone principale 3 colonnes */}
          <div className="grid gap-6 px-4 pb-4 pt-6 sm:px-8 lg:grid-cols-[minmax(260px,360px)_minmax(0,1fr)_minmax(260px,320px)] lg:gap-4 lg:px-10 lg:pb-6 lg:pt-8 xl:gap-10">
            {/* ----- Colonne gauche : informations produit ----- */}
            <div className="order-2 flex flex-col justify-center lg:order-1">
              <div className="flex items-center gap-3">
                <button type="button" onClick={goPrev} aria-label={fr.home.produitPrecedent} className="icon-btn focus-ring">
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button type="button" onClick={goNext} aria-label={fr.home.produitSuivant} className="icon-btn focus-ring">
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-6 flex items-center gap-2 text-[13px] font-medium text-[color:var(--ds-muted)]">
                <span aria-hidden className="h-2 w-2 rounded-full bg-[color:var(--ds-accent)]" />
                {fr.home.labelCategorie}
              </p>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={product?.id ?? 'aucun'}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: reduce ? 0 : 0.24, ease: 'easeOut' }}
                >
                  <h1 className="title-tight mt-2 text-3xl font-extrabold leading-[1.08] text-[color:var(--ds-text)] sm:text-4xl xl:text-[42px]">
                    {product ? product.name : fr.home.aucunProduitTitre}
                    {product && (
                      <>
                        <br />
                        <span className="text-[color:var(--ds-accent)]">{product.subTitle}</span>
                      </>
                    )}
                  </h1>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-[color:var(--ds-muted)] sm:text-[15px]">
                    {product ? product.shortDescription : fr.home.aucunProduitTexte}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!product || !enStock}
                  aria-pressed={dansPanier}
                  className={`${dansPanier ? 'focus-ring' : 'cta-shadow focus-ring'} group inline-flex h-14 items-center gap-3 rounded-pill px-7 text-[15px] font-bold transition-all hover:-translate-y-px active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45`}
                  style={
                    dansPanier
                      ? { border: '1.5px solid color-mix(in srgb, var(--ds-danger) 60%, transparent)', color: 'var(--ds-text)' }
                      : { backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }
                  }
                >
                  {dansPanier ? (
                    <span aria-hidden className="inline-flex" style={{ color: 'var(--ds-danger)' }}>
                      <CheckIcon className="h-5 w-5" />
                    </span>
                  ) : (
                    <CartIcon className="h-5 w-5" />
                  )}
                  {product && enStock ? (dansPanier ? fr.home.retirerPanier : fr.home.ajouterPanier) : fr.home.epuise}
                  {!dansPanier && <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />}
                </button>
                {product && (
                  <button
                    type="button"
                    onClick={() => toggleFav(product.id)}
                    aria-pressed={favActif}
                    aria-label={fr.header.favoris}
                    className="icon-btn focus-ring"
                  >
                    <HeartIcon className="h-5 w-5" filled={favActif} />
                  </button>
                )}
              </div>
            </div>

            {/* ----- Scène produit ----- */}
            <div className="relative order-1 flex min-h-[300px] items-center justify-center sm:min-h-[400px] lg:order-2 lg:min-h-[480px]">
              <div
                aria-hidden
                className="ds-anim pointer-events-none absolute left-1/2 top-[52%] h-[48%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                style={{
                  background: 'radial-gradient(closest-side, var(--ds-glow), transparent)',
                  opacity: 'calc(var(--ds-glow-intensity) * 0.55)',
                }}
              />
              {product ? (
                <div className="relative z-10 h-full w-full">
                  <ProductVisual src={product.mainImage} alt={product.altText} productKey={product.id} />
                </div>
              ) : (
                <p className="z-10 max-w-xs text-center text-sm text-[color:var(--ds-muted)]">
                  {fr.home.aucunProduitTexte}
                </p>
              )}
            </div>

            {/* ----- Colonne droite : achat ----- */}
            <div className="order-3 flex flex-col justify-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={product?.id ?? 'prix'}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: reduce ? 0 : 0.22, ease: 'easeOut' }}
                >
                  <p className="price-tnum text-4xl font-extrabold text-[color:var(--ds-text)] sm:text-[42px]">
                    {product ? formatPrix(product.price, product.currency) : '—'}
                  </p>
                  {product?.oldPrice != null && (
                    <p className="price-tnum mt-1 text-lg font-medium text-[color:var(--ds-muted)] line-through">
                      {formatPrix(product.oldPrice, product.currency)}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {product && (
                <>
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
                            setSizeHint(false);
                          }}
                          title={dispo ? undefined : fr.home.tailleIndisponible}
                          className={`focus-ring inline-flex h-11 min-w-[44px] items-center justify-center rounded-pill border px-3 text-sm font-semibold transition-colors ${
                            dispo ? 'hover-tint' : 'cursor-not-allowed line-through opacity-40'
                          }`}
                          style={
                            sel
                              ? {
                                  backgroundColor: 'var(--ds-accent)',
                                  color: 'var(--ds-accent-text)',
                                  borderColor: 'var(--ds-accent)',
                                }
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
                  <p className="flex items-center gap-2 text-[13px] font-medium">
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: enStock ? 'var(--ds-success)' : 'var(--ds-danger)' }}
                    />
                    <span className="text-[color:var(--ds-muted)]">
                      {enStock ? fr.home.enStock : fr.home.epuise}
                    </span>
                  </p>
                </>
              )}

              {/* Réassurance — textes issus des affiches (à valider par le client) */}
              <ul className="mt-6 grid grid-cols-3 gap-2 border-t pt-5" style={{ borderColor: 'var(--ds-border)' }}>
                {CONFIANCE.map((c) => (
                  <li key={c.icon} className="flex flex-col items-center gap-1.5 text-center">
                    <span className="icon-btn pointer-events-none !h-9 !w-9">
                      {c.icon === 'shield' ? (
                        <ShieldIcon className="h-4 w-4" />
                      ) : c.icon === 'medal' ? (
                        <MedalIcon className="h-4 w-4" />
                      ) : (
                        <TruckIcon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="text-[10.5px] leading-tight text-[color:var(--ds-muted)]">{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ----- Pied de carte : réseaux · slogan · miniatures ----- */}
          <div className="grid grid-cols-1 items-end gap-5 px-4 pb-6 sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:px-10">
            <div className="order-3 justify-self-center md:order-1 md:justify-self-start">
              <ConfiguredSocialLinks links={settings.socialLinks} className="flex items-center gap-2.5" />
            </div>

            <p className="order-2 flex items-center justify-center gap-3 text-[13px] text-[color:var(--ds-muted)]">
              <span aria-hidden className="h-px w-8 bg-[color:color-mix(in_srgb,var(--ds-muted)_60%,transparent)]" />
              {settings.slogan}
              <span aria-hidden className="h-px w-8 bg-[color:color-mix(in_srgb,var(--ds-muted)_60%,transparent)]" />
            </p>

            <div className="order-1 flex flex-col items-end gap-3 md:order-3">
              {nextProduct && (
                <button
                  type="button"
                  onClick={goNext}
                  aria-label={`${fr.home.produitSuivant} : ${nextProduct.name}`}
                  className="bg-tint hover-tint focus-ring hidden w-[190px] items-center gap-2 rounded-mini border p-2 text-left transition-colors xl:flex"
                  style={{ borderColor: 'var(--ds-border)' }}
                >
                  <ChevronLeftIcon className="h-4 w-4 flex-none text-[color:var(--ds-muted)]" />
                  <span className="relative block h-12 flex-1">
                    <Image src={nextProduct.mainImage} alt="" fill sizes="96px" className="object-contain" />
                  </span>
                  <ChevronRightIcon className="h-4 w-4 flex-none text-[color:var(--ds-muted)]" />
                </button>
              )}

              {product && (
                <div className="thumb-scroll max-w-full">
                  <ul className="flex items-center gap-2.5">
                    {products.map((p) => {
                      const active = p.id === product.id;
                      return (
                        <li key={p.id} className="relative flex-none">
                          <button
                            type="button"
                            onClick={() => goTo(p.id)}
                            aria-label={p.name}
                            aria-current={active || undefined}
                            className="focus-ring block h-[68px] w-[58px] rounded-thumb border-2 p-1 transition-transform hover:scale-105 sm:h-[84px] sm:w-[72px]"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--ds-text) 7%, transparent)',
                              borderColor: active ? 'var(--ds-accent)' : 'transparent',
                            }}
                          >
                            <span className="relative block h-full w-full">
                              <Image src={p.mainImage} alt="" fill sizes="72px" className="object-contain" />
                            </span>
                          </button>
                          {active && (
                            <span
                              aria-hidden
                              className="absolute -bottom-2 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-[color:var(--ds-accent)]"
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* Bandeau défilant — messages clés de la boutique (factualité : slogan + services configurés) */}
      <div ref={marqueeRef} className="ds-marquee relative mt-2 border-y py-3" style={{ borderColor: 'var(--ds-border)' }} aria-hidden="true">
        <div className="ds-marquee-piste">
          {[0, 1].map((copie) => (
            <ul key={copie} className="flex flex-none items-center" aria-hidden={copie === 1}>
              {[
                settings.slogan || 'Le style de vos équipes, à portée de main',
                'Livraison à Ouagadougou',
                settings.paymentSettings.label,
                'Stock réel affiché',
                'Maillots premium',
              ].map((texte, i) => (
                <li key={`${copie}-${i}`} className="flex flex-none items-center">
                  <span className="whitespace-nowrap px-6 text-[13px] font-bold uppercase tracking-[0.14em] text-[color:var(--ds-muted)]">
                    {texte}
                  </span>
                  <CrownLogo className="h-3.5 w-3.5 flex-none text-[color:var(--ds-accent)]" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* Toast de confirmation d'ajout au panier */}
      <div aria-live="polite" className="sr-only">
        {toast}
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
            className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
          >
            <p
              role="status"
              className="pointer-events-auto flex items-center gap-2 rounded-pill border px-5 py-3 text-sm font-semibold shadow-xl"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--ds-secondary) 92%, transparent)',
                borderColor: 'var(--ds-border)',
                color: 'var(--ds-text)',
              }}
            >
              <CheckIcon className="h-4 w-4 text-[color:var(--ds-success)]" />
              {toast}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
