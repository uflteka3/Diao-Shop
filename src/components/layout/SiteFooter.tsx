import CrownLogo from '@/components/CrownLogo';
import { ConfiguredSocialLinks } from '@/components/SocialIcons';
import { MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from '@/components/Icons';
import type { ShopSettings } from '@/lib/data/types';
import Link from 'next/link';

/** Pied de page commun — coordonnées et réseaux uniquement s'ils sont configurés (rien d'inventé). */
export default function SiteFooter({ settings }: { settings: ShopSettings }) {
  const annee = new Date().getFullYear();
  return (
    <footer className="mx-auto mt-10 w-[min(1180px,94vw)] pb-8">
      <div
        className="rounded-panel border p-6 sm:p-8"
        style={{ borderColor: 'var(--ds-border)', backgroundColor: 'color-mix(in srgb, var(--ds-secondary) 55%, transparent)' }}
      >
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-2.5">
              <CrownLogo className="h-6 w-6 text-[color:var(--ds-accent)]" />
              <span className="title-tight text-lg font-extrabold text-[color:var(--ds-text)]">
                Diao <span className="text-[color:var(--ds-accent)]">shop</span>
              </span>
            </p>
            {settings.slogan && <p className="mt-3 max-w-xs text-[13px] text-[color:var(--ds-muted)]">{settings.slogan}</p>}
            <ConfiguredSocialLinks links={settings.socialLinks} className="mt-4 flex items-center gap-2" />
          </div>

          <nav aria-label="Liens de pied de page">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[color:var(--ds-muted)]">Navigation</p>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/boutique', label: 'Boutique' },
                { href: '/a-propos', label: 'À propos' },
                { href: '/contact', label: 'Contact' },
                { href: '/favoris', label: 'Favoris' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover-tint rounded px-1 py-0.5 focus-ring text-[color:var(--ds-text)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[color:var(--ds-muted)]">Contact</p>
            <ul className="mt-3 space-y-2.5 text-sm text-[color:var(--ds-text)]">
              {settings.whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring inline-flex items-center gap-2 rounded transition-colors hover:text-[color:var(--ds-accent)]"
                  >
                    <WhatsAppIcon className="h-4 w-4 flex-none" aria-hidden />
                    {settings.whatsapp}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, '')}`}
                    className="focus-ring inline-flex items-center gap-2 rounded transition-colors hover:text-[color:var(--ds-accent)]"
                  >
                    <PhoneIcon className="h-4 w-4 flex-none" aria-hidden />
                    <span className="price-tnum">{settings.phone}</span>
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="focus-ring inline-flex items-center gap-2 rounded transition-colors hover:text-[color:var(--ds-accent)]"
                  >
                    <MailIcon className="h-4 w-4 flex-none" aria-hidden />
                    <span className="break-all">{settings.email}</span>
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 flex-none" aria-hidden />
                  {settings.address}
                </li>
              )}
            </ul>
          </div>
        </div>

        <p className="mt-8 border-t pt-5 text-center text-[12px] text-[color:var(--ds-muted)]" style={{ borderColor: 'var(--ds-border)' }}>
          © {annee} Diao Shop — Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
