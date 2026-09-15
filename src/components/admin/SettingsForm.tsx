'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ShopSettings } from '@/lib/data/types';

const champ = 'focus-ring h-11 w-full rounded-input border border-[#262B38] bg-transparent px-3.5 text-sm';

/** Paramètres boutique — coordonnées, réseaux, devise, slogan, paiement, livraison, textes. */
export default function SettingsForm({ parametres }: { parametres: ShopSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(parametres);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; texte: string } | null>(null);

  function maj<K extends keyof ShopSettings>(cle: K, valeur: ShopSettings[K]) {
    setForm((f) => ({ ...f, [cle]: valeur }));
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setMessage(null);
    const r = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = (await r.json()) as { erreur?: { message: string } };
    if (!r.ok) setMessage({ type: 'err', texte: data.erreur?.message ?? 'Enregistrement impossible.' });
    else setMessage({ type: 'ok', texte: 'Paramètres enregistrés — le site est à jour.' });
    setEnvoi(false);
    router.refresh();
  }

  return (
    <form onSubmit={soumettre} className="max-w-3xl space-y-5">
      {/* Identité */}
      <section className="rounded-panel border border-[#262B38] bg-[#161922] p-5">
        <h2 className="text-[15px] font-extrabold">Identité</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Nom de la boutique</span>
            <input value={form.shopName} onChange={(e) => maj('shopName', e.target.value)} className={champ} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Slogan (affiché sur l’accueil)</span>
            <input value={form.slogan} onChange={(e) => maj('slogan', e.target.value)} className={champ} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Devise</span>
            <input value={form.currency} onChange={(e) => maj('currency', e.target.value)} className={`${champ} uppercase`} maxLength={8} />
          </label>
        </div>
      </section>

      {/* Coordonnées */}
      <section className="rounded-panel border border-[#262B38] bg-[#161922] p-5">
        <h2 className="text-[15px] font-extrabold">Coordonnées</h2>
        <p className="mt-1 text-[12px] text-[#5D6472]">Laissez vide pour masquer l’élément côté site (icônes et boutons WhatsApp).</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Téléphone</span>
            <input value={form.phone} onChange={(e) => maj('phone', e.target.value)} className={champ} placeholder="+226 …" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">WhatsApp (format international)</span>
            <input value={form.whatsapp} onChange={(e) => maj('whatsapp', e.target.value)} className={champ} placeholder="22670000000" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Email</span>
            <input type="email" value={form.email} onChange={(e) => maj('email', e.target.value)} className={champ} placeholder="contact@… " />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Adresse</span>
            <input value={form.address} onChange={(e) => maj('address', e.target.value)} className={champ} placeholder="Ouagadougou, Burkina Faso" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Facebook (URL)</span>
            <input value={form.socialLinks.facebook ?? ''} onChange={(e) => maj('socialLinks', { ...form.socialLinks, facebook: e.target.value })} className={champ} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Instagram (URL)</span>
            <input value={form.socialLinks.instagram ?? ''} onChange={(e) => maj('socialLinks', { ...form.socialLinks, instagram: e.target.value })} className={champ} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">TikTok (URL)</span>
            <input value={form.socialLinks.tiktok ?? ''} onChange={(e) => maj('socialLinks', { ...form.socialLinks, tiktok: e.target.value })} className={champ} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">YouTube (URL)</span>
            <input value={form.socialLinks.youtube ?? ''} onChange={(e) => maj('socialLinks', { ...form.socialLinks, youtube: e.target.value })} className={champ} />
          </label>
        </div>
      </section>

      {/* Paiement */}
      <section className="rounded-panel border border-[#262B38] bg-[#161922] p-5">
        <h2 className="text-[15px] font-extrabold">Paiement</h2>
        <div className="mt-4 grid gap-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Libellé de la méthode</span>
            <input value={form.paymentSettings.label} onChange={(e) => maj('paymentSettings', { ...form.paymentSettings, label: e.target.value })} className={champ} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Instructions affichées au checkout</span>
            <textarea rows={3} value={form.paymentSettings.instructions} onChange={(e) => maj('paymentSettings', { ...form.paymentSettings, instructions: e.target.value })} className="focus-ring w-full rounded-input border border-[#262B38] bg-transparent p-3.5 text-sm" />
          </label>
        </div>
      </section>

      {/* Livraison */}
      <section className="rounded-panel border border-[#262B38] bg-[#161922] p-5">
        <h2 className="text-[15px] font-extrabold">Zones de livraison</h2>
        <p className="mt-1 text-[12px] text-[#5D6472]">Frais en FCFA. Ces zones s’affichent au checkout.</p>
        <div className="mt-4 space-y-2">
          {form.deliverySettings.zones.map((z, i) => (
            <div key={z.id} className="flex flex-wrap items-center gap-3">
              <input
                value={z.label}
                onChange={(e) => maj('deliverySettings', { ...form.deliverySettings, zones: form.deliverySettings.zones.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
                aria-label={`Zone ${i + 1} — libellé`}
                className="focus-ring h-11 min-w-0 flex-1 rounded-input border border-[#262B38] bg-transparent px-3.5 text-sm"
              />
              <label className="flex items-center gap-2 text-[12.5px] text-[#9AA1B2]">
                Frais
                <input
                  type="number"
                  min={0}
                  max={1_000_000}
                  value={z.fee}
                  onChange={(e) => maj('deliverySettings', { ...form.deliverySettings, zones: form.deliverySettings.zones.map((x, j) => (j === i ? { ...x, fee: Math.max(0, Number(e.target.value)) } : x)) })}
                  aria-label={`Zone ${z.label} — frais`}
                  className="focus-ring price-tnum h-11 w-28 rounded-input border border-[#262B38] bg-transparent px-3 text-sm"
                />
              </label>
              {form.deliverySettings.zones.length > 1 && (
                <button
                  type="button"
                  onClick={() => maj('deliverySettings', { ...form.deliverySettings, zones: form.deliverySettings.zones.filter((_, j) => j !== i) })}
                  aria-label={`Retirer la zone ${z.label}`}
                  className="focus-ring rounded-input border border-[#3A1E1E] px-2.5 py-2 text-[12px] text-[#FF5C5C]"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              maj('deliverySettings', {
                ...form.deliverySettings,
                zones: [...form.deliverySettings.zones, { id: `zone-${Date.now().toString(36)}`, label: '', fee: 0 }],
              })
            }
            className="focus-ring rounded-input border border-[#262B38] px-3 py-2 text-[12.5px] font-semibold hover:bg-[#1B1F2B]"
          >
            + Ajouter une zone
          </button>
        </div>
      </section>

      {/* Textes */}
      <section className="rounded-panel border border-[#262B38] bg-[#161922] p-5">
        <h2 className="text-[15px] font-extrabold">Textes des pages « À propos » et « Contact »</h2>
        <div className="mt-4 grid gap-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Texte « À propos »</span>
            <textarea rows={4} value={form.aboutText ?? ''} onChange={(e) => maj('aboutText', e.target.value)} className="focus-ring w-full rounded-input border border-[#262B38] bg-transparent p-3.5 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Texte « Contact »</span>
            <textarea rows={3} value={form.contactText ?? ''} onChange={(e) => maj('contactText', e.target.value)} className="focus-ring w-full rounded-input border border-[#262B38] bg-transparent p-3.5 text-sm" />
          </label>
        </div>
      </section>

      {message && (
        <p role="status" className={`rounded-input border p-3 text-[13px] font-medium ${message.type === 'ok' ? 'border-[rgba(61,214,140,.5)] text-[#3DD68C]' : 'border-[rgba(255,92,92,.5)] text-[#FF5C5C]'}`}>
          {message.texte}
        </p>
      )}

      <button type="submit" disabled={envoi} className="focus-ring inline-flex h-12 items-center rounded-pill bg-[#F0A62B] px-6 text-sm font-bold text-[#14161D] disabled:opacity-50">
        {envoi ? 'Enregistrement…' : 'Enregistrer les paramètres'}
      </button>
    </form>
  );
}
