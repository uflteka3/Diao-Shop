'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import CrownLogo from '@/components/CrownLogo';

function FormulaireConnexion() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await r.json()) as { erreur?: { message: string } };
      if (!r.ok) {
        setErreur(data.erreur?.message ?? 'Connexion impossible.');
        setEnvoi(false);
        return;
      }
      const next = params.get('next');
      router.push(next && next.startsWith('/admin') ? next : '/admin');
    } catch {
      setErreur('Connexion impossible. Réessayez.');
      setEnvoi(false);
    }
  }

  const styleChamp = 'focus-ring h-12 w-full rounded-input border bg-transparent px-4 text-sm';

  return (
    <form onSubmit={soumettre} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Email</span>
        <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={styleChamp} style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Mot de passe</span>
        <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={styleChamp} style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }} />
      </label>
      {erreur && (
        <p role="alert" className="rounded-input border p-3 text-[12.5px] font-medium" style={{ borderColor: 'var(--ds-danger)', color: 'var(--ds-danger)' }}>
          {erreur}
        </p>
      )}
      <button
        type="submit"
        disabled={envoi}
        className="focus-ring inline-flex h-12 w-full items-center justify-center rounded-pill text-sm font-bold disabled:opacity-50"
        style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
      >
        {envoi ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
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
        <p className="mt-3 text-center text-[12.5px] text-[color:var(--ds-muted)]">Accès réservé aux administrateurs.</p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <FormulaireConnexion />
          </Suspense>
        </div>
        <p className="mt-5 rounded-input border p-3 text-[11px] leading-relaxed text-[color:var(--ds-muted)]" style={{ borderColor: 'var(--ds-border)' }}>
          Mode démonstration : identifiants définis dans <code>.env.local</code> (ADMIN_EMAIL / ADMIN_PASSWORD). Phase 8 : Supabase Auth.
        </p>
      </div>
    </div>
  );
}
