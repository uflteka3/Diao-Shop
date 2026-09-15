import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Reveal from '@/components/Reveal';
import { ShieldIcon, TruckIcon, WhatsAppIcon } from '@/components/Icons';
import { getShopSettings } from '@/lib/data/settingsRepository';
import { FALLBACK_THEME } from '@/lib/data/seed/themes';
import { themeToCssVars } from '@/lib/themes/cssVariables';

// Page pilotée par le back-office : rendu toujours à jour (CMS).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Diao Shop — la boutique burkinabè des maillots de football premium. Qualité, transparence, WhatsApp et livraison à Ouagadougou.',
};

const VALEURS = [
  {
    icone: ShieldIcon,
    titre: 'Qualité premium',
    texte: 'Des maillots légers et respirants, sélectionnés avec exigence — pensés pour le terrain comme pour la ville.',
  },
  {
    icone: WhatsAppIcon,
    titre: 'Commande simple',
    texte: 'Pas de carte bancaire ni de frais cachés : vous commandez en quelques clics et confirmez directement sur WhatsApp.',
  },
  {
    icone: TruckIcon,
    titre: 'Livraison à Ouaga',
    texte: 'Votre commande arrive chez vous, quartier par quartier. Le stock affiché est le stock réel : ce que vous voyez est disponible.',
  },
];

export default function AProposPage() {
  const s = getShopSettings();
  const vars = themeToCssVars(FALLBACK_THEME);
  const texte = s.aboutText?.trim()
    ? s.aboutText
    : `Bienvenue chez ${s.shopName} — ${s.slogan.toLowerCase()}.`;

  return (
    <div
      style={{ ...vars, backgroundColor: 'var(--ds-bg)' }}
      className="ds-anim ds-grain min-h-screen overflow-x-clip"
    >
      {/* Halo d'arrière-plan — cohérent avec l'accueil */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-80"
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
            {/* ── En-tête éditorial ── */}
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 rounded-pill border px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.16em] text-[color:var(--ds-accent)]" style={{ borderColor: 'var(--ds-border)' }}>
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[color:var(--ds-accent)]" />
                La boutique
              </p>
              <h1 className="title-tight mt-5 text-[clamp(1.9rem,5.5vw,3rem)] font-extrabold leading-[1.06] text-[color:var(--ds-text)]">
                Des maillots qui racontent votre <span className="text-[color:var(--ds-accent)]">passion du foot</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[color:var(--ds-muted)] sm:text-base">
                {s.slogan} — des grands clubs européens aux sélections nationales, votre maillot vous attend chez {s.shopName}.
              </p>
            </div>

            {/* ── Récit de la boutique (texte CMS, modifiable sans code) ── */}
            <Reveal className="mx-auto mt-10 max-w-3xl">
              <div
                className="rounded-panel border p-6 text-[15px] leading-[1.75] text-[color:var(--ds-text)] sm:p-9 sm:text-[15.5px]"
                style={{
                  borderColor: 'var(--ds-border)',
                  backgroundColor: 'color-mix(in srgb, var(--ds-text) 4%, transparent)',
                }}
              >
                <div className="whitespace-pre-line">{texte}</div>
              </div>
            </Reveal>

            {/* ── Nos garanties ── */}
            <div className="mx-auto mt-12 max-w-4xl">
              <h2 className="title-tight text-center text-xl font-extrabold text-[color:var(--ds-text)] sm:text-2xl">
                Pourquoi les supporters nous font <span className="text-[color:var(--ds-accent)]">confiance</span>
              </h2>
              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {VALEURS.map((v, i) => (
                  <Reveal key={v.titre} delay={i * 110}>
                    <div
                      className="card-lift h-full rounded-panel border p-6"
                      style={{
                        borderColor: 'var(--ds-border)',
                        backgroundColor: 'color-mix(in srgb, var(--ds-text) 4%, transparent)',
                      }}
                    >
                      <p
                        className="inline-flex h-12 w-12 items-center justify-center rounded-pill"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--ds-accent) 16%, transparent)',
                          color: 'var(--ds-accent)',
                        }}
                      >
                        <v.icone className="h-6 w-6" />
                      </p>
                      <p className="title-tight mt-4 text-[16px] font-extrabold text-[color:var(--ds-text)]">{v.titre}</p>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--ds-muted)]">{v.texte}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* ── Appel à l'action ── */}
            <Reveal className="mx-auto mt-12 max-w-3xl">
              <div
                className="relative overflow-hidden rounded-panel border p-7 text-center sm:p-10"
                style={{
                  borderColor: 'color-mix(in srgb, var(--ds-accent) 45%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--ds-accent) 10%, transparent)',
                }}
              >
                <p
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(60% 120% at 50% 0%, color-mix(in srgb, var(--ds-accent) 14%, transparent), transparent 70%)',
                  }}
                />
                <h2 className="title-tight relative text-xl font-extrabold text-[color:var(--ds-text)] sm:text-2xl">
                  Votre maillot vous attend
                </h2>
                <p className="relative mx-auto mt-2 max-w-md text-[14px] text-[color:var(--ds-muted)]">
                  Parcourez la collection, choisissez votre taille et confirmez sur WhatsApp — on s’occupe du reste.
                </p>
                <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/boutique"
                    className="cta-shadow btn-shine focus-ring inline-flex h-12 items-center justify-center rounded-pill px-7 text-sm font-bold transition-transform hover:-translate-y-px active:scale-[0.99]"
                    style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
                  >
                    Voir la boutique
                  </Link>
                  <Link
                    href="/contact"
                    className="focus-ring inline-flex h-12 items-center justify-center rounded-pill border px-7 text-sm font-bold text-[color:var(--ds-text)] transition-colors hover-tint"
                    style={{ borderColor: 'var(--ds-border)' }}
                  >
                    Nous contacter
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          <SiteFooter settings={s} />
        </section>
      </div>
    </div>
  );
}
