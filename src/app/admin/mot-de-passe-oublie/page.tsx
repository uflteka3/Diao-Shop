'use client';

import Link from 'next/link';
import { useState } from 'react';
import CrownLogo from '@/components/CrownLogo';

/** « Mot de passe oublié » — envoie un email de réinitialisation (Supabase Auth). */
export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setMessage(null);
    setEnvoi(true);
    const r = await fetch('/api/admin/mot-de-passe-oublie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = (await r.json()) as { message?: string; erreur?: { message: string } };
    if (!r.ok) {
      setErreur(data.erreur?.message ?? 'Envoi impossible. Réessayez.');
      setEnvoi(false);
      return;
    }
    setMessage(data.message ?? 'Email envoyé.');
    setEnvoi(false);
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
        <h1 className="mt-5 text-center text-base font-bold text-[color:var(--ds-text)]">Mot de passe oublié</h1>
        <p className="mt-2 text-center text-[12.5px] leading-relaxed text-[color:var(--ds-muted)]">
          Indiquez votre email d’administrateur : vous recevrez un lien pour définir un nouveau mot de passe.
        </p>

        {message ? (
          <div className="mt-6 space-y-4">
            <p role="status" className="rounded-input border p-3 text-[12.5px] font-medium" style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }}>
              {message}
            </p>
            <Link
              href="/admin/login"
              className="focus-ring inline-flex h-12 w-full items-center justify-center rounded-pill text-sm font-bold"
              style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={soumettre} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold">Email</span>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {envoi ? 'Envoi…' : 'Recevoir le lien de réinitialisation'}
            </button>
            <p className="text-center">
              <Link href="/admin/login" className="focus-ring rounded-input text-[12.5px] font-semibold underline underline-offset-4" style={{ color: 'var(--ds-muted)' }}>
                Retour à la connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
