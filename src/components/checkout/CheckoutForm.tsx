'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import type { ShopSettings } from '@/lib/data/types';
import { formatPrix } from '@/lib/utils/format';
import { fr } from '@/lib/i18n/fr';

interface Props {
  settings: ShopSettings;
}

type Erreurs = Partial<Record<'name' | 'phone' | 'address' | 'city' | 'zoneId' | 'global', string>>;

/** Checkout — formulaire client + récapitulatif + création de commande SERVEUR. */
export default function CheckoutForm({ settings }: Props) {
  const { items, subtotal, clear, hydrated } = useCart();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Ouagadougou');
  const [zoneId, setZoneId] = useState('');
  const [notes, setNotes] = useState('');
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [envoi, setEnvoi] = useState(false);
  const [commandeCreee, setCommandeCreee] = useState(false);

  const zones = settings.deliverySettings.zones;
  const zoneChoisie = zones.find((z) => z.id === zoneId);
  const livraisonGratuite = zoneChoisie?.fee === 0;

  useEffect(() => {
    if (hydrated && items.length === 0 && !commandeCreee) {
      router.replace('/panier');
    }
  }, [hydrated, items.length, commandeCreee, router]);

  const total = useMemo(() => subtotal + (zoneChoisie?.fee ?? 0), [subtotal, zoneChoisie]);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreurs({});
    setEnvoi(true);
    try {
      const reponse = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name, phone, whatsapp, email },
          delivery: { address, city, zoneId, notes },
          items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
        }),
      });
      const data = (await reponse.json()) as { numero?: string; erreur?: { message: string; code: string } };
      if (!reponse.ok || !data.numero) {
        const message = data.erreur?.message ?? fr.commande.erreurGenerique;
        if (data.erreur?.code === 'stock_insuffisant' || data.erreur?.code === 'produit_introuvable') {
          setErreurs({ global: `${message} ${fr.commande.retourPanier} : ` });
        } else {
          setErreurs({ global: message });
        }
        setEnvoi(false);
        return;
      }
      clear();
      setCommandeCreee(true); // empêche la redirection « panier vide » pendant la navigation
      router.push(`/commande/confirmation/${data.numero}`);
    } catch {
      setErreurs({ global: fr.commande.erreurGenerique });
      setEnvoi(false);
    }
  }

  if (!hydrated) return null;

  const champClasse =
    'focus-ring h-12 w-full rounded-input border bg-transparent px-4 text-sm text-[color:var(--ds-text)] placeholder:text-[color:color-mix(in_srgb,var(--ds-text)_40%,transparent)]';
  const champStyle = { borderColor: 'var(--ds-border)' };

  return (
    <form onSubmit={soumettre} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* ----- Formulaire ----- */}
      <div className="space-y-5 rounded-panel border p-5 sm:p-6" style={{ borderColor: 'var(--ds-border)', backgroundColor: 'color-mix(in srgb, var(--ds-secondary) 60%, transparent)' }}>
        <fieldset>
          <legend className="title-tight text-lg font-extrabold text-[color:var(--ds-text)]">{fr.commande.coordonnees}</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[13px] font-semibold text-[color:var(--ds-text)]">{fr.commande.nom} *</span>
              <input className={champClasse} style={champStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder={fr.commande.nomPlaceholder} autoComplete="name" required />
              {erreurs.name && <span className="mt-1 block text-[12px] font-medium" style={{ color: 'var(--ds-danger)' }}>{erreurs.name}</span>}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-[color:var(--ds-text)]">{fr.commande.telephone} *</span>
              <input className={champClasse} style={champStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={fr.commande.telephonePlaceholder} inputMode="tel" autoComplete="tel" required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-[color:var(--ds-text)]">{fr.commande.whatsapp}</span>
              <input className={champClasse} style={champStyle} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder={fr.commande.whatsappPlaceholder} inputMode="tel" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[13px] font-semibold text-[color:var(--ds-text)]">{fr.commande.email}</span>
              <input type="email" className={champClasse} style={champStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={fr.commande.emailPlaceholder} autoComplete="email" />
            </label>
          </div>
        </fieldset>

        <fieldset className="border-t pt-5" style={{ borderColor: 'var(--ds-border)' }}>
          <legend className="title-tight text-lg font-extrabold text-[color:var(--ds-text)]">{fr.commande.livraison}</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[13px] font-semibold text-[color:var(--ds-text)]">{fr.commande.adresse} *</span>
              <input className={champClasse} style={champStyle} value={address} onChange={(e) => setAddress(e.target.value)} placeholder={fr.commande.adressePlaceholder} autoComplete="street-address" required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-[color:var(--ds-text)]">{fr.commande.ville} *</span>
              <input className={champClasse} style={champStyle} value={city} onChange={(e) => setCity(e.target.value)} placeholder={fr.commande.villePlaceholder} autoComplete="address-level2" required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-[color:var(--ds-text)]">{fr.commande.zone} *</span>
              <select className={champClasse} style={champStyle} value={zoneId} onChange={(e) => setZoneId(e.target.value)} required>
                <option value="" disabled className="text-black">
                  — Choisir —
                </option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id} className="text-black">
                    {z.label} {z.fee > 0 ? `(+${new Intl.NumberFormat('fr-FR').format(z.fee)} FCFA)` : '(frais à confirmer)'}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[13px] font-semibold text-[color:var(--ds-text)]">{fr.commande.notes}</span>
              <textarea className="focus-ring w-full rounded-input border bg-transparent px-4 py-3 text-sm text-[color:var(--ds-text)] placeholder:text-[color:color-mix(in_srgb,var(--ds-text)_40%,transparent)]" style={champStyle} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={fr.commande.notesPlaceholder} rows={3} maxLength={500} />
            </label>
          </div>
          <p className="mt-2 text-[11.5px] text-[color:color-mix(in_srgb,var(--ds-text)_55%,transparent)]">
            Démo — Zones et frais de livraison à remplacer depuis le back-office.
          </p>
        </fieldset>

        <fieldset className="border-t pt-5" style={{ borderColor: 'var(--ds-border)' }}>
          <legend className="title-tight text-lg font-extrabold text-[color:var(--ds-text)]">{fr.commande.paiement}</legend>
          <div
            className="mt-4 flex items-start gap-3 rounded-panel border p-4"
            style={{ borderColor: 'var(--ds-border)', backgroundColor: 'color-mix(in srgb, var(--ds-accent) 10%, transparent)' }}
          >
            <span aria-hidden className="mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-pill border" style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5 13.9c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.7 1.8.8 1.9c.1.1.1.3 0 .5-.3.6-.7.9-.5 1.2.7 1.2 1.6 2 2.8 2.6.3.2.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.4 1.5Z"/></svg>
            </span>
            <div>
              <p className="text-sm font-bold text-[color:var(--ds-text)]">{settings.paymentSettings.label}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[color:var(--ds-muted)]">{settings.paymentSettings.instructions}</p>
            </div>
          </div>
        </fieldset>
      </div>

      {/* ----- Récapitulatif ----- */}
      <aside
        className="h-fit rounded-panel border p-5 lg:sticky lg:top-4"
        style={{ borderColor: 'var(--ds-border)', backgroundColor: 'color-mix(in srgb, var(--ds-secondary) 72%, transparent)' }}
      >
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[color:var(--ds-muted)]">{fr.commande.recap}</p>
        <ul className="mt-3 space-y-3">
          {items.map((i) => (
            <li key={`${i.productId}-${i.size}`} className="flex items-center gap-3">
              <span className="bg-tint relative block h-12 w-12 flex-none overflow-hidden rounded-thumb">
                <Image src={i.image} alt="" fill sizes="48px" className="object-contain p-1" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold text-[color:var(--ds-text)]">{i.name}</span>
                <span className="block text-[12px] text-[color:var(--ds-muted)]">
                  Taille {i.size} × {i.quantity}
                </span>
              </span>
              <span className="price-tnum text-[13px] font-bold text-[color:var(--ds-text)]">
                {formatPrix(i.unitPrice * i.quantity, 'FCFA')}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1.5 border-t pt-3 text-sm" style={{ borderColor: 'var(--ds-border)' }}>
          <p className="flex justify-between text-[color:var(--ds-text)]">
            <span>{fr.commande.sousTotal}</span>
            <span className="price-tnum font-semibold">{formatPrix(subtotal, 'FCFA')}</span>
          </p>
          <p className="flex justify-between text-[color:var(--ds-text)]">
            <span>{fr.commande.fraisLivraison}</span>
            <span className="price-tnum font-semibold">
              {zoneChoisie ? (livraisonGratuite ? 'à confirmer' : formatPrix(zoneChoisie.fee, 'FCFA')) : '—'}
            </span>
          </p>
          <p className="flex justify-between border-t pt-2 text-[15px] font-extrabold" style={{ borderColor: 'var(--ds-border)', color: 'var(--ds-accent)' }}>
            <span>{fr.commande.total}</span>
            <span className="price-tnum">{formatPrix(total, 'FCFA')}</span>
          </p>
        </div>

        {erreurs.global && (
          <p role="alert" className="mt-4 rounded-input border p-3 text-[12.5px] font-medium" style={{ borderColor: 'color-mix(in srgb, var(--ds-danger) 60%, transparent)', color: 'var(--ds-danger)' }}>
            {erreurs.global}
            {erreurs.global.includes('panier') && (
              <Link href="/panier" className="ml-1 underline">
                {fr.commande.retourPanier}
              </Link>
            )}
          </p>
        )}

        <button
          type="submit"
          disabled={envoi || items.length === 0}
          className="cta-shadow focus-ring mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-pill py-3.5 text-[15px] font-bold transition-transform hover:-translate-y-px active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45"
          style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
        >
          {envoi ? fr.commande.envoi : fr.commande.confirmer}
        </button>
      </aside>
    </form>
  );
}
