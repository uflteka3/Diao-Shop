'use client';

import { useState } from 'react';

/** Formulaire de contact public — enregistre le message pour le back-office (anti-spam : honeypot). */
export default function ContactForm() {
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'envoye'>('repos');
  const [erreur, setErreur] = useState<string | null>(null);

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    const fd = new FormData(e.currentTarget);
    setEtat('envoi');
    const r = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fd.get('name'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        message: fd.get('message'),
        piege: fd.get('piege'),
      }),
    });
    const data = (await r.json()) as { erreur?: { message: string } };
    if (!r.ok) {
      setErreur(data.erreur?.message ?? 'Envoi impossible. Réessayez.');
      setEtat('repos');
      return;
    }
    setEtat('envoye');
  }

  const champ = 'focus-ring h-12 w-full rounded-input border bg-transparent px-4 text-sm';

  if (etat === 'envoye') {
    return (
      <p role="status" className="rounded-panel border p-5 text-sm font-semibold" style={{ borderColor: 'var(--ds-border)', backgroundColor: 'var(--ds-secondary)' }}>
        ✅ Merci ! Votre message a bien été envoyé — nous revenons vers vous très vite.
      </p>
    );
  }

  return (
    <form onSubmit={soumettre} className="space-y-4 rounded-panel border p-5 sm:p-6" style={{ borderColor: 'var(--ds-border)', backgroundColor: 'var(--ds-secondary)' }}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Nom *</span>
          <input name="name" required minLength={2} autoComplete="name" className={champ} style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Téléphone / WhatsApp</span>
          <input name="phone" inputMode="tel" autoComplete="tel" className={champ} style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Email</span>
        <input name="email" type="email" autoComplete="email" className={champ} style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Message *</span>
        <textarea name="message" required minLength={10} rows={4} className="focus-ring w-full rounded-input border bg-transparent p-4 text-sm" style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }} />
      </label>
      {/* Honeypot anti-spam (invisible) */}
      <input type="text" name="piege" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {erreur && (
        <p role="alert" className="rounded-input border p-3 text-[12.5px] font-medium" style={{ borderColor: 'var(--ds-danger)', color: 'var(--ds-danger)' }}>
          {erreur}
        </p>
      )}
      <button
        type="submit"
        disabled={etat === 'envoi'}
        className="focus-ring inline-flex h-12 min-w-[44px] items-center rounded-pill px-6 text-sm font-bold disabled:opacity-50"
        style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
      >
        {etat === 'envoi' ? 'Envoi…' : 'Envoyer le message'}
      </button>
    </form>
  );
}
