'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Product } from '@/lib/data/types';

/** Choix du maillot mis en avant — un seul à la fois, avec confirmation explicite. */
export default function FeaturedPicker({ produits, featuredActuel }: { produits: Product[]; featuredActuel: string | null }) {
  const router = useRouter();
  const [enAttente, setEnAttente] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const publies = produits.filter((p) => p.published);
  const courant = publies.find((p) => p.id === featuredActuel) ?? null;

  async function definir(id: string | null, nom: string) {
    const cible = id ? `« ${nom} »` : 'aucun maillot';
    if (!window.confirm(`Confirmer : mettre en avant ${cible} sur la page d’accueil ?`)) return;
    setOccupe(true);
    setMessage(null);
    const r = await fetch('/api/admin/featured', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = (await r.json()) as { erreur?: { message: string } };
    setOccupe(false);
    setEnAttente(null);
    if (!r.ok) setMessage(data.erreur?.message ?? 'Opération impossible.');
    else {
      setMessage(`✅ ${cible.charAt(0).toUpperCase() + cible.slice(1)} mis en avant.`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-panel border border-[#262B38] bg-[#161922] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AA1B2]">Maillot principal actuel</p>
        {courant ? (
          <div className="mt-3 flex items-center gap-4">
            <div className="relative h-16 w-16 flex-none overflow-hidden rounded-thumb bg-[#12141C]">
              <Image src={courant.mainImage} alt="" fill sizes="64px" className="object-contain p-1" />
            </div>
            <div>
              <p className="font-bold">
                {courant.name} <span className="font-medium text-[#F0A62B]">— {courant.subTitle}</span>
              </p>
              <button type="button" onClick={() => definir(null, '')} disabled={occupe} className="focus-ring mt-1 text-[12.5px] font-semibold text-[#FF5C5C] underline underline-offset-4">
                Retirer la mise en avant (accueil sans héros)
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-[#9AA1B2]">Aucun — la page d’accueil affiche un état vide.</p>
        )}
        {message && <p role="status" className="mt-3 rounded-input border border-[rgba(61,214,140,.5)] p-3 text-[13px] font-medium text-[#3DD68C]">{message}</p>}
      </section>

      <section>
        <p className="text-sm font-bold">Choisir un maillot publié</p>
        {enAttente && (
          <p className="mt-3 rounded-input border border-[rgba(240,166,43,.5)] p-3 text-[13px] font-medium text-[#F0A62B]">
            « {enAttente} » présélectionné — cliquez sur « Mettre en avant » pour confirmer.
          </p>
        )}
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {publies.map((p) => {
            const estCourant = p.id === featuredActuel;
            const estPreselectionne = enAttente === p.name;
            return (
              <li
                key={p.id}
                className={`rounded-panel border p-4 ${estCourant ? 'border-[#F0A62B]' : estPreselectionne ? 'border-dashed border-[#F0A62B]' : 'border-[#262B38]'} bg-[#161922]`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 flex-none overflow-hidden rounded-thumb bg-[#12141C]">
                    <Image src={p.mainImage} alt="" fill sizes="48px" className="object-contain p-1" />
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm font-bold">{p.name}</p>
                  {estCourant && <span className="rounded-pill bg-[rgba(240,166,43,.15)] px-2 py-1 text-[10.5px] font-bold text-[#F0A62B]">En avant</span>}
                </div>
                {!estCourant && (
                  <button
                    type="button"
                    onClick={() => definir(p.id, p.name)}
                    disabled={occupe}
                    className="focus-ring mt-3 w-full rounded-pill border border-[#262B38] py-2.5 text-[12.5px] font-bold hover:bg-[#1B1F2B]"
                  >
                    Mettre en avant
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
