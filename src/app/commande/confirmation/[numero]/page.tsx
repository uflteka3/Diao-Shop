import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { getOrderByNumber } from '@/lib/data/orderRepository';
import { chargerCommandeDirecte } from '@/lib/server/commandesDirectes';
import { getShopSettings } from '@/lib/data/settingsRepository';
import { FALLBACK_THEME } from '@/lib/data/seed/themes';
import { themeToCssVars } from '@/lib/themes/cssVariables';
import { formatPrix } from '@/lib/utils/format';
import { fr } from '@/lib/i18n/fr';

// Rendu toujours à jour : une commande créée il y a une seconde doit être
// affichée — jamais de cache de route ici (le 404 ne doit pas être mémorisé).
export const dynamic = 'force-dynamic';

interface Props {
  params: { numero: string };
}

export const metadata: Metadata = {
  title: 'Commande confirmée',
  robots: { index: false },
};

export default async function ConfirmationPage({ params }: Props) {
  // Lecture DIRECTE en base (source de vérité) puis repli mémoire — sur Vercel,
  // la commande peut avoir été créée par une autre instance serverless.
  const order = (await chargerCommandeDirecte(params.numero)) ?? getOrderByNumber(params.numero);
  if (!order) notFound();

  const settings = getShopSettings();
  const vars = themeToCssVars(FALLBACK_THEME);

  // Lien WhatsApp pré-rempli — UNIQUEMENT si le numéro est configuré par l'admin.
  const whatsappHref = settings.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Bonjour ${settings.shopName}, je viens de passer la commande ${order.orderNumber} (total ${formatPrix(order.total, order.currency)}).`
      )}`
    : null;

  return (
    <div
      style={{ ...vars, backgroundColor: 'var(--ds-bg)' }}
      className="ds-anim min-h-screen overflow-x-clip"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{ background: 'radial-gradient(80% 50% at 50% 0%, color-mix(in srgb, var(--ds-glow) 18%, transparent), transparent 70%)' }}
      />
      <div className="relative mx-auto w-[min(900px,96vw)] py-4 sm:py-6">
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
            <div className="mx-auto max-w-2xl">
              <p
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: 'color-mix(in srgb, var(--ds-success) 18%, transparent)', color: 'var(--ds-success)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true" focusable="false">
                  <path d="m20 6-11 11-5-5" />
                </svg>
              </p>
              <h1 className="title-tight mt-4 text-center text-3xl font-extrabold text-[color:var(--ds-text)] sm:text-4xl">
                {fr.confirmation.titre}
              </h1>
              <p className="mt-3 text-center text-sm text-[color:var(--ds-muted)]">{fr.confirmation.merci}</p>
              <p className="price-tnum mt-2 text-center text-2xl font-extrabold tracking-wide" style={{ color: 'var(--ds-accent)' }}>
                {order.orderNumber}
              </p>

              <div className="mt-6 rounded-panel border p-5" style={{ borderColor: 'var(--ds-border)', backgroundColor: 'color-mix(in srgb, var(--ds-secondary) 60%, transparent)' }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[color:var(--ds-muted)]">{fr.confirmation.recap}</p>
                  <p className="flex items-center gap-2 text-[12.5px] font-semibold text-[color:var(--ds-text)]">
                    <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--ds-info)' }} />
                    {fr.confirmation.statut} : {fr.confirmation.statutNouvelle}
                  </p>
                </div>

                <ul className="mt-4 space-y-3">
                  {order.items.map((i) => (
                    <li key={`${i.productId}-${i.size}`} className="flex items-center gap-3">
                      <span className="bg-tint relative block h-14 w-14 flex-none overflow-hidden rounded-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={i.productImage} alt={i.productName} className="h-full w-full object-contain p-1" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-bold text-[color:var(--ds-text)]">{i.productName}</span>
                        <span className="block text-[12px] text-[color:var(--ds-muted)]">
                          Taille {i.size} × {i.quantity} — <span className="price-tnum">{formatPrix(i.unitPrice, order.currency)}</span> l’unité
                        </span>
                      </span>
                      <span className="price-tnum text-[13px] font-bold text-[color:var(--ds-text)]">{formatPrix(i.totalPrice, order.currency)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 space-y-1.5 border-t pt-3 text-sm" style={{ borderColor: 'var(--ds-border)' }}>
                  <p className="flex justify-between text-[color:var(--ds-text)]">
                    <span>{fr.confirmation.sousTotal}</span>
                    <span className="price-tnum font-semibold">{formatPrix(order.subtotal, order.currency)}</span>
                  </p>
                  <p className="flex justify-between text-[color:var(--ds-text)]">
                    <span>{fr.confirmation.fraisLivraison} ({order.zoneLabel})</span>
                    <span className="price-tnum font-semibold">{order.deliveryFee > 0 ? formatPrix(order.deliveryFee, order.currency) : 'à confirmer'}</span>
                  </p>
                  <p className="flex justify-between border-t pt-2 text-[16px] font-extrabold" style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-accent)' }}>
                    <span>{fr.confirmation.total}</span>
                    <span className="price-tnum">{formatPrix(order.total, order.currency)}</span>
                  </p>
                </div>

                <div className="mt-4 grid gap-3 border-t pt-3 text-[13px] sm:grid-cols-2" style={{ borderColor: 'var(--ds-border)' }}>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[color:var(--ds-muted)]">{fr.confirmation.client}</p>
                    <p className="mt-1 font-semibold text-[color:var(--ds-text)]">{order.customerName}</p>
                    <p className="text-[color:var(--ds-muted)]">{order.phone}{order.whatsapp ? ` · WhatsApp : ${order.whatsapp}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[color:var(--ds-muted)]">{fr.confirmation.livraison}</p>
                    <p className="mt-1 font-semibold text-[color:var(--ds-text)]">{order.address}, {order.city}</p>
                    <p className="text-[color:var(--ds-muted)]">{order.zoneLabel}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[color:var(--ds-muted)]">{fr.confirmation.paiement}</p>
                    <p className="mt-1 font-semibold text-[color:var(--ds-text)]">{order.paymentMethod}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[color:var(--ds-muted)]">{settings.paymentSettings.instructions}</p>
                  </div>
                </div>
              </div>

              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-shadow btn-shine focus-ring mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-pill text-[15px] font-bold transition-transform hover:-translate-y-px active:scale-[0.99]"
                  style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true" focusable="false">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5 13.9c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.7 1.8.8 1.9c.1.1.1.3 0 .5-.3.6-.7.9-.5 1.2.7 1.2 1.6 2 2.8 2.6.3.2.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.4 1.5Z" />
                  </svg>
                  {fr.confirmation.whatsappCta}
                </a>
              ) : (
                <p className="mt-6 rounded-input border p-3.5 text-center text-[12.5px] text-[color:var(--ds-muted)]" style={{ borderColor: 'var(--ds-border)' }}>
                  {fr.confirmation.whatsappManquant}
                </p>
              )}

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/boutique"
                  className="focus-ring inline-flex h-12 items-center justify-center rounded-pill px-6 text-sm font-bold transition-transform hover:-translate-y-px active:scale-[0.99]"
                  style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
                >
                  {fr.confirmation.retourBoutique}
                </Link>
                <Link
                  href="/"
                  className="focus-ring inline-flex h-12 items-center justify-center rounded-pill border px-6 text-sm font-bold text-[color:var(--ds-text)] hover-tint"
                  style={{ borderColor: 'var(--ds-border)' }}
                >
                  {fr.commune.retourAccueil}
                </Link>
              </div>

            </div>
          </div>
        </section>
        <SiteFooter settings={settings} />
      </div>
    </div>
  );
}
