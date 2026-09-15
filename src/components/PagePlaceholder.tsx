import Link from 'next/link';
import { FALLBACK_THEME } from '@/lib/data/seed/themes';
import { themeToCssVars } from '@/lib/themes/cssVariables';
import { fr } from '@/lib/i18n/fr';

/**
 * Page provisoire (Boutique, À propos, Contact, 404) — le contenu complet
 * de chaque page est livré dans les phases suivantes, conformément au
 * cahier des charges. Utilise le thème de secours (neutre premium).
 */
export default function PagePlaceholder({ titre }: { titre: string }) {
  return (
    <div
      style={{ ...themeToCssVars(FALLBACK_THEME), backgroundColor: 'var(--ds-bg)' }}
      className="ds-anim flex min-h-screen items-center justify-center px-5 py-10"
    >
      <div
        className="w-full max-w-md rounded-panel border p-8 text-center sm:p-10"
        style={{ borderColor: 'var(--ds-border)', backgroundColor: 'var(--ds-secondary)' }}
      >
        <p className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--ds-accent)' }}>
          Diao Shop
        </p>
        <h1 className="title-tight mt-2 text-2xl font-extrabold" style={{ color: 'var(--ds-text)' }}>
          {titre}
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ds-muted)' }}>
          {fr.placeholders.texte}
        </p>
        <Link
          href="/"
          className="focus-ring mt-7 inline-flex h-12 items-center rounded-pill px-6 text-sm font-bold"
          style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
        >
          {fr.commune.retourAccueil}
        </Link>
      </div>
    </div>
  );
}
