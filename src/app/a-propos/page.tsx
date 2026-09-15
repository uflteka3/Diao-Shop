import type { Metadata } from 'next';
import { getShopSettings } from '@/lib/data/settingsRepository';

// Page pilotée par le back-office : rendu toujours à jour (CMS).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'À propos' };

export default function AProposPage() {
  const s = getShopSettings();
  return (
    <div className="ds-page">
      <div id="contenu" className="mx-auto w-[min(880px,100%)] px-5 py-10 sm:px-6 sm:py-14">
        <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[color:var(--ds-accent)]">À propos</p>
        <h1 className="title-tight mt-2 text-3xl font-extrabold text-[color:var(--ds-text)] sm:text-4xl">
          {s.shopName} — {s.slogan || 'La boutique des maillots'}
        </h1>
        <div className="mt-6 rounded-panel border p-6 text-[15px] leading-relaxed text-[color:var(--ds-muted)] sm:p-8" style={{ borderColor: 'var(--ds-border)', backgroundColor: 'var(--ds-secondary)' }}>
          {s.aboutText?.trim() ? (
            <p className="whitespace-pre-line">{s.aboutText}</p>
          ) : (
            <p>
              La présentation de la boutique arrive bientôt.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
