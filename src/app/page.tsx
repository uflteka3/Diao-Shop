import type { Metadata } from 'next';
import HomeHero from '@/components/home/HomeHero';
import { getFeaturedProduct, getPublishedProducts } from '@/lib/data/productRepository';
import { getShopSettings } from '@/lib/data/settingsRepository';
import { resolveTheme } from '@/lib/themes/resolveTheme';

// Page pilotée par le back-office : rendu toujours à jour (CMS).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Diao Shop — Maillots de football premium',
  description:
    'Découvrez les maillots Diao Shop : choisissez votre taille, ajoutez au panier et changez d’ambiance à chaque maillot.',
};

export default function HomePage() {
  const products = getPublishedProducts();
  const featured = getFeaturedProduct();
  const settings = getShopSettings();

  // Thèmes résolus CÔTÉ SERVEUR et passés en données — le carrousel client
  // reste instantané et suit toujours le thème du produit affiché.
  const themes = Object.fromEntries(products.map((p) => [p.id, resolveTheme(p.id)]));

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: settings.shopName || 'Diao Shop',
        url: base,
        logo: `${base}/images/brand/logo-256.png`,
      },
      {
        '@type': 'WebSite',
        name: settings.shopName || 'Diao Shop',
        url: base,
        inLanguage: 'fr',
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeHero
        products={products}
        initialFeaturedId={featured?.id ?? null}
        settings={settings}
        themes={themes}
      />
    </>
  );
}
