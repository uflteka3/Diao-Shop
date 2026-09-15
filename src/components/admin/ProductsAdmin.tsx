'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { Product } from '@/lib/data/types';

/** Liste des produits — recherche, filtre statut, publication/dépublication, suppression. */
export default function ProductsAdmin({ produits }: { produits: Product[] }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [filtre, setFiltre] = useState<'tous' | 'publies' | 'brouillons'>('tous');
  const [occupe, setOccupe] = useState<string | null>(null);

  const liste = useMemo(() => {
    const terme = q.trim().toLowerCase();
    return produits.filter((p) => {
      if (terme && !`${p.name} ${p.team} ${p.subTitle}`.toLowerCase().includes(terme)) return false;
      if (filtre === 'publies') return p.published;
      if (filtre === 'brouillons') return !p.published;
      return true;
    });
  }, [produits, q, filtre]);

  async function basculerPublication(p: Product) {
    setOccupe(p.id);
    await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, published: !p.published }),
    });
    setOccupe(null);
    router.refresh();
  }

  async function supprimer(p: Product) {
    if (!window.confirm(`Supprimer définitivement « ${p.name} » ? Cette action est irréversible.`)) return;
    setOccupe(p.id);
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id }),
    });
    setOccupe(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (nom, équipe…)"
          aria-label="Rechercher un produit"
          className="focus-ring h-11 min-w-0 flex-1 rounded-input border border-[#262B38] bg-transparent px-4 text-sm sm:max-w-xs"
        />
        <div className="flex rounded-pill border border-[#262B38] p-1">
          {(['tous', 'publies', 'brouillons'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltre(f)}
              className={`focus-ring rounded-pill px-3.5 py-1.5 text-[12.5px] font-semibold ${filtre === f ? 'bg-[#F0A62B] text-[#14161D]' : 'text-[#9AA1B2]'}`}
            >
              {f === 'tous' ? 'Tous' : f === 'publies' ? 'Publiés' : 'Brouillons'}
            </button>
          ))}
        </div>
        <Link href="/admin/produits/nouveau" className="focus-ring ml-auto inline-flex h-11 items-center rounded-pill bg-[#F0A62B] px-5 text-sm font-bold text-[#14161D]">
          + Ajouter un maillot
        </Link>
      </div>

      {liste.length === 0 ? (
        <p className="mt-6 rounded-panel border border-dashed border-[#262B38] p-8 text-center text-sm text-[#9AA1B2]">
          Aucun produit ne correspond.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {liste.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-4 rounded-panel border border-[#262B38] bg-[#161922] p-3 sm:p-4"
              style={{ opacity: occupe === p.id ? 0.5 : 1 }}
            >
              <div className="relative h-16 w-16 flex-none overflow-hidden rounded-thumb bg-[#12141C]">
                <Image src={p.mainImage} alt="" fill sizes="64px" className="object-contain p-1" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">
                  {p.name} <span className="font-medium text-[#F0A62B]">— {p.subTitle}</span>
                </p>
                <p className="mt-0.5 text-[12.5px] text-[#9AA1B2]">
                  {p.price.toLocaleString('fr-FR')} {p.currency} · {p.sizes.length} tailles · stock{' '}
                  {p.sizes.reduce((s, x) => s + x.stock, 0)}
                  {p.isFeatured && ' · ⭐ mis en avant'}
                </p>
              </div>
              <span
                className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${p.published ? 'bg-[rgba(61,214,140,.15)] text-[#3DD68C]' : 'bg-[rgba(240,166,43,.15)] text-[#F0A62B]'}`}
              >
                {p.published ? 'Publié' : 'Brouillon'}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => basculerPublication(p)}
                  disabled={occupe === p.id}
                  className="focus-ring rounded-input border border-[#262B38] px-3 py-2 text-[12.5px] font-semibold hover:bg-[#1B1F2B]"
                >
                  {p.published ? 'Dépublier' : 'Publier'}
                </button>
                <Link href={`/admin/themes?produit=${p.id}`} className="focus-ring rounded-input border border-[#262B38] px-3 py-2 text-[12.5px] font-semibold hover:bg-[#1B1F2B]">
                  Thème
                </Link>
                <Link href={`/admin/produits/${p.id}`} className="focus-ring rounded-input border border-[#262B38] px-3 py-2 text-[12.5px] font-semibold hover:bg-[#1B1F2B]">
                  Modifier
                </Link>
                <button
                  type="button"
                  onClick={() => supprimer(p)}
                  disabled={occupe === p.id}
                  className="focus-ring rounded-input border border-[#3A1E1E] px-3 py-2 text-[12.5px] font-semibold text-[#FF5C5C] hover:bg-[#1B1F2B]"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
