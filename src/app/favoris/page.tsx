import type { Metadata } from 'next';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import FavoritesList from '@/components/favoris/FavoritesList';
import { getPublishedProducts } from '@/lib/data/productRepository';
import { getShopSettings } from '@/lib/data/settingsRepository';
import { FALLBACK_THEME } from '@/lib/data/seed/themes';
import { themeToCssVars } from '@/lib/themes/cssVariables';

// Page pilotée par le back-office : rendu toujours à jour (CMS).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mes favoris',
  description: 'Retrouvez les maillots que vous avez sauvegardés.',
};

export default function FavorisPage() {
  const products = getPublishedProducts();
  const settings = getShopSettings();

  return (
    <div
      style={{ ...themeToCssVars(FALLBACK_THEME), backgroundColor: 'var(--ds-bg)' }}
      className="ds-anim relative min-h-screen overflow-x-clip"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(80% 50% at 50% 0%, color-mix(in srgb, var(--ds-glow) 18%, transparent), transparent 70%)',
        }}
      />
      <div className="relative mx-auto w-[min(1280px,96vw)] py-4 sm:py-6">
        <section
          className="rounded-card border shadow-[0_40px_90px_-30px_rgba(0,0,0,0.55)]"
          style={{
            borderColor: 'var(--ds-border)',
            backgroundColor: 'var(--ds-secondary)',
            backgroundImage: 'var(--ds-gradient)',
          }}
        >
          <SiteHeader />
          <div id="contenu" className="px-4 pb-8 pt-4 sm:px-8 lg:px-10">
            <p className="flex items-center gap-2 text-[13px] font-medium text-[color:var(--ds-muted)]">
              <span aria-hidden className="h-2 w-2 rounded-full bg-[color:var(--ds-accent)]" />
              Ma sélection
            </p>
            <h1 className="title-tight mt-1.5 text-3xl font-extrabold text-[color:var(--ds-text)] sm:text-4xl">
              Mes <span className="text-[color:var(--ds-accent)]">favoris</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[color:var(--ds-muted)]">
              Vos maillots préférés sont enregistrés sur cet appareil (aucun compte requis).
            </p>

            <div className="mt-6">
              <FavoritesList products={products} />
            </div>
          </div>
        </section>

        <SiteFooter settings={settings} />
      </div>
    </div>
  );
}
