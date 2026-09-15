import type { Metadata } from 'next';
import ContactForm from '@/components/contact/ContactForm';
import { ConfiguredSocialLinks } from '@/components/SocialIcons';
import { getShopSettings } from '@/lib/data/settingsRepository';

// Page pilotée par le back-office : rendu toujours à jour (CMS).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  const s = getShopSettings();

  return (
    <div className="ds-page">
      <div id="contenu" className="mx-auto w-[min(1120px,100%)] px-5 py-10 sm:px-6 sm:py-14">
        <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[color:var(--ds-accent)]">Contact</p>
        <h1 className="title-tight mt-2 text-3xl font-extrabold text-[color:var(--ds-text)] sm:text-4xl">Une question&nbsp;? Écrivez-nous.</h1>
        {s.contactText && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[color:var(--ds-muted)]">{s.contactText}</p>}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Coordonnées */}
          <div className="space-y-4">
            {s.phone && (
              <a href={`tel:${s.phone.replace(/\s/g, '')}`} className="focus-ring flex items-center gap-3 rounded-panel border p-4 transition-transform hover:-translate-y-0.5" style={{ borderColor: 'var(--ds-border)', backgroundColor: 'var(--ds-secondary)' }}>
                <span className="text-xl" aria-hidden="true">📞</span>
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-[color:var(--ds-muted)]">Téléphone</span>
                  <span className="price-tnum font-semibold text-[color:var(--ds-text)]">{s.phone}</span>
                </span>
              </a>
            )}
            {s.email && (
              <a href={`mailto:${s.email}`} className="focus-ring flex items-center gap-3 rounded-panel border p-4 transition-transform hover:-translate-y-0.5" style={{ borderColor: 'var(--ds-border)', backgroundColor: 'var(--ds-secondary)' }}>
                <span className="text-xl" aria-hidden="true">✉️</span>
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-[color:var(--ds-muted)]">Email</span>
                  <span className="font-semibold text-[color:var(--ds-text)]">{s.email}</span>
                </span>
              </a>
            )}
            {s.whatsapp && (
              <a
                href={`https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex items-center gap-3 rounded-panel border p-4 transition-transform hover:-translate-y-0.5"
                style={{ borderColor: 'var(--ds-border)', backgroundColor: 'var(--ds-secondary)' }}
              >
                <span className="text-xl">💬</span>
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-[color:var(--ds-muted)]">WhatsApp</span>
                  <span className="price-tnum font-semibold text-[color:var(--ds-text)]">{s.whatsapp}</span>
                </span>
              </a>
            )}
            {s.address && (
              <div className="rounded-panel border p-4" style={{ borderColor: 'var(--ds-border)', backgroundColor: 'var(--ds-secondary)' }}>
                <span className="block text-[11px] font-bold uppercase tracking-wide text-[color:var(--ds-muted)]">Adresse</span>
                <span className="font-semibold text-[color:var(--ds-text)]">{s.address}</span>
              </div>
            )}
            <ConfiguredSocialLinks links={s.socialLinks} className="flex gap-3 pt-1" />
            {!s.phone && !s.email && !s.whatsapp && !s.address && (
              <p className="rounded-panel border border-dashed p-5 text-sm text-[color:var(--ds-muted)]" style={{ borderColor: 'var(--ds-border)' }}>
                Les coordonnées ne sont pas encore configurées — utilisez le formulaire pour nous écrire.
              </p>
            )}
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}
