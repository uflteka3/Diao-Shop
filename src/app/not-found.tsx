import Link from 'next/link';
import { FALLBACK_THEME } from '@/lib/data/seed/themes';
import { themeToCssVars } from '@/lib/themes/cssVariables';
import { fr } from '@/lib/i18n/fr';

/**
 * Page 404 — même coque visuelle que le reste du site, ton léger
 * « ballon sorti du terrain », et sorties utiles (boutique, accueil).
 */
export default function NotFound() {
  const vars = themeToCssVars(FALLBACK_THEME);
  return (
    <div
      style={{ ...vars, backgroundColor: 'var(--ds-bg)' }}
      className="ds-anim relative flex min-h-screen items-center justify-center overflow-x-clip px-5 py-10"
    >
      {/* Halo + rayons — identiques à l'accueil */}
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
      <div
        className="relative w-full max-w-md overflow-hidden rounded-panel border p-8 text-center sm:p-10"
        style={{
          borderColor: 'var(--ds-border)',
          backgroundColor: 'var(--ds-secondary)',
          backgroundImage: 'var(--ds-gradient)',
        }}
      >
        {/* Ballon qui sort du terrain */}
        <p className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--ds-accent) 16%, transparent)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" style={{ color: 'var(--ds-accent)' }} aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" />
            <path d="m12 7 3.4 2.4-1.3 4h-4.2l-1.3-4L12 7Zm0-4v4m7.8 2.2-3.8 2.2m1.6 6.3-3.2-2.5m-8.4 2.5 3.2-2.5m-1.6-6.3 3.8 2.2" />
          </svg>
        </p>
        <p className="title-tight mt-4 text-4xl font-extrabold" style={{ color: 'var(--ds-accent)' }}>
          404
        </p>
        <h1 className="title-tight mt-1 text-2xl font-extrabold" style={{ color: 'var(--ds-text)' }}>
          Hors-jeu&nbsp;!
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ds-muted)' }}>
          Cette page n’existe pas ou a été déplacée. Remettons-vous sur la bonne voie.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/boutique"
            className="cta-shadow focus-ring inline-flex h-12 items-center justify-center rounded-pill px-6 text-sm font-bold transition-transform hover:-translate-y-px active:scale-[0.99]"
            style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
          >
            Voir la boutique
          </Link>
          <Link
            href="/"
            className="focus-ring inline-flex h-12 items-center justify-center rounded-pill border px-6 text-sm font-bold hover-tint"
            style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }}
          >
            {fr.commune.retourAccueil}
          </Link>
        </div>
      </div>
    </div>
  );
}
