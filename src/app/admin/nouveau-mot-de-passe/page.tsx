'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CrownLogo from '@/components/CrownLogo';

/** Nouveau mot de passe — atteinte depuis le lien de l’email de réinitialisation.
 *  Le lien redirige ici avec les jetons dans le fragment (#access_token=…). */
export default function NouveauMotDePassePage() {
  const [etat, setEtat] = useState<'chargement' | 'invalide' | 'pret' | 'succes'>('chargement');
  const [jeton, setJeton] = useState<string>('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = fragment.get('access_token') ?? '';
    const type = fragment.get('type') ?? '';
    if (token && type === 'recovery') {
      setJeton(token);
      setEtat('pret');
      // Nettoyer le fragment (les jetons ne restent pas dans l'historique)
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      setEtat('invalide');
    }
  }, []);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setEnvoi(true);
    const r = await fetch('/api/admin/reinitialiser-mot-de-passe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jeton, motDePasse }),
    });
    const data = (await r.json()) as { erreur?: { message: string } };
    if (!r.ok) {
      setErreur(data.erreur?.message ?? 'Modification impossible.');
      setEnvoi(false);
      return;
    }
    setEtat('succes');
    setEnvoi(false);
    setTimeout(() => {
      window.location.href = '/admin/login?reset=ok';
    }, 1800);
  }

  const styleChamp = 'focus-ring h-12 w-full rounded-input border bg-transparent px-4 text-sm';

  return (
    <div
      style={{ ['--ds-bg' as string]: '#101319', ['--ds-secondary' as string]: '#171A22', ['--ds-accent' as string]: '#F0A62B', ['--ds-text' as string]: '#FFFFFF', ['--ds-muted' as string]: '#B8BDC9', ['--ds-border' as string]: 'rgba(240,166,43,0.25)', ['--ds-button' as string]: '#F0A62B', ['--ds-button-text' as string]: '#14161D', backgroundColor: '#101319' }}
      className="flex min-h-screen items-center justify-center px-5 py-10"
    >
      <div className="w-full max-w-sm rounded-panel border p-7" style={{ borderColor: 'var(--ds-border)', backgroundColor: 'var(--ds-secondary)' }}>
        <p className="flex items-center justify-center gap-2.5">
          <CrownLogo className="h-6 w-6 text-[color:var(--ds-accent)]" />
          <span className="title-tight text-lg font-extrabold text-[color:var(--ds-text)]">
            Diao <span className="text-[color:var(--ds-accent)]">shop</span> — Administration
          </span>
        </p>

        {etat === 'chargement' && <p className="mt-6 text-center text-sm text-[color:var(--ds-muted)]">Vérification du lien…</p>}

        {etat === 'invalide' && (
          <div className="mt-6 space-y-4">
            <p role="alert" className="rounded-input border p-3 text-[12.5px] font-medium" style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }}>
              Ce lien est invalide, expiré ou a déjà été utilisé.
            </p>
            <Link
              href="/admin/mot-de-passe-oublie"
              className="focus-ring inline-flex h-12 w-full items-center justify-center rounded-pill text-sm font-bold"
              style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
            >
              Demander un nouveau lien
            </Link>
            <p className="text-center">
              <Link href="/admin/login" className="focus-ring rounded-input text-[12.5px] font-semibold underline underline-offset-4" style={{ color: 'var(--ds-muted)' }}>
                Retour à la connexion
              </Link>
            </p>
          </div>
        )}

        {etat === 'succes' && (
          <p role="status" className="mt-6 rounded-input border p-3 text-center text-[13px] font-semibold" style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }}>
            ✅ Mot de passe mis à jour — redirection vers la connexion…
          </p>
        )}

        {etat === 'pret' && (
          <>
            <h1 className="mt-5 text-center text-base font-bold text-[color:var(--ds-text)]">Nouveau mot de passe</h1>
            <form onSubmit={soumettre} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold">Nouveau mot de passe (8 caractères minimum)</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  className={styleChamp}
                  style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold">Confirmer le mot de passe</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  className={styleChamp}
                  style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }}
                />
              </label>
              {erreur && (
                <p role="alert" className="rounded-input border p-3 text-[12.5px] font-medium" style={{ borderColor: 'var(--ds-danger, #FF5C5C)', color: 'var(--ds-danger, #FF5C5C)' }}>
                  {erreur}
                </p>
              )}
              <button
                type="submit"
                disabled={envoi}
                className="focus-ring inline-flex h-12 w-full items-center justify-center rounded-pill text-sm font-bold disabled:opacity-50"
                style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
              >
                {envoi ? 'Enregistrement…' : 'Définir le nouveau mot de passe'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
