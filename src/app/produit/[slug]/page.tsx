import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ProductDetail from '@/components/produit/ProductDetail';
import ProductCard from '@/components/catalogue/ProductCard';
import { getProductBySlug, getPublishedProducts } from '@/lib/data/productRepository';
import { getShopSettings } from '@/lib/data/settingsRepository';
import { resolveTheme } from '@/lib/themes/resolveTheme';
import { themeToCssVars } from '@/lib/themes/cssVariables';

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: 'Produit introuvable' };
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return {
    title: product.name,
    description: product.shortDescription || product.description,
    alternates: { canonical: `${base}/produit/${product.slug}` },
    openGraph: {
      type: 'website',
      title: `${product.name} — Diao Shop`,
      description: product.shortDescription || product.description,
      images: [{ url: product.mainImage, alt: product.altText }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — Diao Shop`,
      images: [product.mainImage],
    },
  };
}

export default function ProduitPage({ params }: Props) {
  const product = getProductBySlug(params.slug);
  // Produit non publié → inaccessible depuis la boutique (RLS reproduira ce comportement en Phase 8)
  if (!product || !product.published) notFound();

  const settings = getShopSettings();
  const theme = resolveTheme(product.id);
  const vars = themeToCssVars(theme);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const stockTotal = product.sizes.filter((s) => s.active).reduce((somme, s) => somme + s.stock, 0);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.shortDescription,
    image: [product.mainImage.startsWith('http') ? product.mainImage : `${base}${product.mainImage}`],
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Diao Shop' },
    offers: {
      '@type': 'Offer',
      url: `${base}/produit/${product.slug}`,
      priceCurrency: 'XOF',
      price: product.price,
      availability: stockTotal > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  // Produits similaires : même équipe d'abord, puis les autres — 4 maximum
  const published = getPublishedProducts().filter((p) => p.id !== product.id);
  const memeEquipe = published.filter((p) => p.team === product.team);
  const autres = published.filter((p) => p.team !== product.team);
  const similaires = [...memeEquipe, ...autres].slice(0, 4);

  return (
    <div
      style={{ ...vars, backgroundColor: 'var(--ds-bg)' }}
      data-mode={theme.mode}
      className="ds-anim min-h-screen overflow-x-clip"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(80% 55% at 50% 0%, color-mix(in srgb, var(--ds-glow) 22%, transparent), transparent 72%)',
        }}
      />
      <div id="contenu" className="relative mx-auto w-[min(1280px,96vw)] py-4 sm:py-6">
        <section
          className="rounded-card border shadow-[0_40px_90px_-30px_rgba(0,0,0,0.55)]"
          style={{
            borderColor: 'var(--ds-border)',
            backgroundColor: 'var(--ds-secondary)',
            backgroundImage: 'var(--ds-gradient)',
          }}
        >
          <SiteHeader />
          <div className="px-4 pb-8 pt-4 sm:px-8 lg:px-10">
            <ProductDetail product={product} />

            {similaires.length > 0 && (
              <section aria-labelledby="titre-similaires" className="mt-10">
                <h2 id="titre-similaires" className="title-tight text-xl font-extrabold text-[color:var(--ds-text)] sm:text-2xl">
                  Vous aimerez <span className="text-[color:var(--ds-accent)]">aussi</span>
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
                  {similaires.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>

        <SiteFooter settings={settings} />
      </div>
    </div>
  );
}
