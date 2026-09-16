import type { Metadata } from 'next';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ContactForm from '@/components/contact/ContactForm';
import Reveal from '@/components/Reveal';
import { ConfiguredSocialLinks } from '@/components/SocialIcons';
import { MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from '@/components/Icons';
import { getShopSettings } from '@/lib/data/settingsRepository';
import { FALLBACK_THEME } from '@/lib/data/seed/themes';
import { themeToCssVars } from '@/lib/themes/cssVariables';

// Page pilotée par le back-office : rendu toujours à jour (CMS).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Contact' };

const carteClasse =
  'card-lift focus-ring flex items-center gap-4 rounded-panel border p-5';
const carteStyle = {
  borderColor: 'var(--ds-border)',
  backgroundColor: 'color-mix(in srgb, var(--ds-text) 4%, transparent)',
} as const;

function Puce({ children, teinte }: { children: React.ReactNode; teinte: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-pill"
      style={{ backgroundColor: `color-mix(in srgb, ${teinte} 16%, transparent)`, color: teinte }}
    >
      {children}
    </span>
  );
}

export default function ContactPage() {
  const s = getShopSettings();
  const vars = themeToCssVars(FALLBACK_THEME);
  const whatsappLien = s.whatsapp ? `https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}` : null;

  return (
    <div
      style={{ ...vars, backgroundColor: 'var(--ds-bg)' }}
      className="ds-anim relative ds-grain min-h-screen overflow-x-clip"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(85% 55% at 50% 0%, color-mix(in srgb, var(--ds-glow) 22%, transparent), transparent 72%)',
          maskImage: 'linear-gradient(to bottom, black 55%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent)',
        }}
      />
      <div className="relative z-10 mx-auto w-[min(1180px,96vw)] py-4 sm:py-6 lg:py-10">
        <section
          className="overflow-hidden rounded-card border shadow-[0_40px_90px_-30px_rgba(0,0,0,0.55)]"
          style={{
            borderColor: 'var(--ds-border)',
            backgroundColor: 'var(--ds-secondary)',
            backgroundImage: 'var(--ds-gradient)',
          }}
        >
          <SiteHeader />

          <div id="contenu" className="px-4 pb-10 pt-8 sm:px-8 sm:pt-10 lg:px-12">
            <div className="mx-auto max-w-2xl text-center">
              <p
                className="inline-flex items-center gap-2 rounded-pill border px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.16em] text-[color:var(--ds-accent)]"
                style={{ borderColor: 'var(--ds-border)' }}
              >
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[color:var(--ds-accent)]" />
                Contact
              </p>
              <h1 className="title-tight mt-5 text-[clamp(1.9rem,5.5vw,2.8rem)] font-extrabold leading-[1.08] text-[color:var(--ds-text)]">
                Parlons de votre <span className="text-[color:var(--ds-accent)]">prochain maillot</span>
              </h1>
              {s.contactText && (
                <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[color:var(--ds-muted)]">
                  {s.contactText}
                </p>
              )}
            </div>

            <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_1.15fr]">
              {/* ── Coordonnées réelles (configurées par l'administrateur) ── */}
              <div className="space-y-4">
                {s.whatsapp && (
                  <Reveal>
                    <a
                      href={whatsappLien ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={carteClasse}
                      style={carteStyle}
                    >
                      <Puce teinte="var(--ds-success)">
                        <WhatsAppIcon className="h-6 w-6" />
                      </Puce>
                      <span>
                        <span className="block text-[11px] font-bold uppercase tracking-wide text-[color:var(--ds-muted)]">
                          WhatsApp — le plus rapide
                        </span>
                        <span className="price-tnum block font-semibold text-[color:var(--ds-text)]">{s.whatsapp}</span>
                      </span>
                    </a>
                  </Reveal>
                )}
                {s.phone && (
                  <Reveal delay={80}>
                    <a href={`tel:${s.phone.replace(/\s/g, '')}`} className={carteClasse} style={carteStyle}>
                      <Puce teinte="var(--ds-accent)">
                        <PhoneIcon className="h-6 w-6" />
                      </Puce>
                      <span>
                        <span className="block text-[11px] font-bold uppercase tracking-wide text-[color:var(--ds-muted)]">
                          Téléphone
                        </span>
                        <span className="price-tnum block font-semibold text-[color:var(--ds-text)]">{s.phone}</span>
                      </span>
                    </a>
                  </Reveal>
                )}
                {s.email && (
                  <Reveal delay={160}>
                    <a href={`mailto:${s.email}`} className={carteClasse} style={carteStyle}>
                      <Puce teinte="var(--ds-info)">
                        <MailIcon className="h-6 w-6" />
                      </Puce>
                      <span>
                        <span className="block text-[11px] font-bold uppercase tracking-wide text-[color:var(--ds-muted)]">
                          Email
                        </span>
                        <span className="block break-all font-semibold text-[color:var(--ds-text)]">{s.email}</span>
                      </span>
                    </a>
                  </Reveal>
                )}
                {s.address && (
                  <Reveal delay={240}>
                    <div className="rounded-panel border p-5" style={carteStyle}>
                      <div className="flex items-center gap-4">
                        <Puce teinte="var(--ds-primary)">
                          <MapPinIcon className="h-6 w-6" />
                        </Puce>
                        <span>
                          <span className="block text-[11px] font-bold uppercase tracking-wide text-[color:var(--ds-muted)]">
                            Adresse
                          </span>
                          <span className="block font-semibold text-[color:var(--ds-text)]">{s.address}</span>
                        </span>
                      </div>
                    </div>
                  </Reveal>
                )}
                <ConfiguredSocialLinks links={s.socialLinks} className="flex gap-3 pt-1" />
                {!s.phone && !s.email && !s.whatsapp && !s.address && (
                  <p
                    className="rounded-panel border border-dashed p-5 text-sm text-[color:var(--ds-muted)]"
                    style={{ borderColor: 'var(--ds-border)' }}
                  >
                    Écrivez-nous via le formulaire ci-contre.
                  </p>
                )}
              </div>

              <Reveal delay={120}>
                <ContactForm />
              </Reveal>
            </div>
          </div>

          <SiteFooter settings={s} />
        </section>
      </div>
    </div>
  );
}
