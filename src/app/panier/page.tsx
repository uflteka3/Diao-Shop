import type { Metadata } from 'next';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import CartView from '@/components/panier/CartView';
import { getShopSettings } from '@/lib/data/settingsRepository';
import { getPublishedProducts } from '@/lib/data/productRepository';
import { FALLBACK_THEME } from '@/lib/data/seed/themes';
import { themeToCssVars } from '@/lib/themes/cssVariables';

// Page pilotée par le back-office : rendu toujours à jour (CMS).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mon panier',
  description: 'Vérifiez vos articles avant de passer commande chez Diao Shop.',
};

export default function PanierPage() {
  const settings = getShopSettings();
  const produits = getPublishedProducts();
  return (
    <div
      style={{ ...themeToCssVars(FALLBACK_THEME), backgroundColor: 'var(--ds-bg)' }}
      className="ds-anim relative min-h-screen overflow-x-clip"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: 'radial-gradient(80% 50% at 50% 0%, color-mix(in srgb, var(--ds-glow) 18%, transparent), transparent 70%)' }}
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
              Ma commande
            </p>
            <h1 className="title-tight mt-1.5 text-3xl font-extrabold text-[color:var(--ds-text)] sm:text-4xl">
              Mon <span className="text-[color:var(--ds-accent)]">panier</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[color:var(--ds-muted)]">
              Vérifiez vos articles avant de passer commande.
            </p>
            <div className="mt-6">
              <CartView produits={produits} />
            </div>
          </div>
        </section>
        <SiteFooter settings={settings} />
      </div>
    </div>
  );
}
