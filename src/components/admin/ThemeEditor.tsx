'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeFields from './ThemeFields';
import { FALLBACK_THEME } from '@/lib/data/seed/themes';
import type { Product, ProductTheme } from '@/lib/data/types';

/** Éditeur de thème par produit — couleurs = données, aperçu live, réinitialisation. */
export default function ThemeEditor({ produits }: { produits: Product[] }) {
  const params = useSearchParams();
  const [selection, setSelection] = useState<string | null>(params.get('produit'));
  const [brouillon, setBrouillon] = useState<ProductTheme | null>(null);
  const [enregistre, setEnregistre] = useState<ProductTheme | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; texte: string } | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const produit = produits.find((p) => p.id === selection) ?? null;

  useEffect(() => {
    if (!selection) return;
    let vivant = true;
    (async () => {
      const r = await fetch(`/api/admin/themes?productId=${selection}`);
      const data = (await r.json()) as { theme: ProductTheme | null };
      if (!vivant) return;
      const t = data.theme ?? FALLBACK_THEME;
      setBrouillon({ ...t });
      setEnregistre({ ...t });
      setMessage(null);
    })();
    return () => {
      vivant = false;
    };
  }, [selection]);

  async function enregistrer() {
    if (!produit || !brouillon) return;
    setEnvoi(true);
    setMessage(null);
    const r = await fetch('/api/admin/themes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: produit.id, theme: brouillon }),
    });
    const data = (await r.json()) as { erreur?: { message: string } };
    if (!r.ok) setMessage({ type: 'err', texte: data.erreur?.message ?? 'Enregistrement impossible.' });
    else {
      setEnregistre({ ...brouillon });
      setMessage({ type: 'ok', texte: `Thème enregistré pour « ${produit.name} » — visible sur la boutique.` });
    }
    setEnvoi(false);
  }

  function reinitialiser() {
    setBrouillon({ ...FALLBACK_THEME });
    setMessage({ type: 'ok', texte: 'Valeurs par défaut appliquées au brouillon — pensez à enregistrer.' });
  }

  const modifie = brouillon && enregistre && JSON.stringify(brouillon) !== JSON.stringify(enregistre);

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      {/* ----- Liste des produits ----- */}
      <aside className="rounded-panel border border-[#262B38] bg-[#161922] p-3">
        <p className="px-2 pb-2 pt-1 text-[12px] font-bold uppercase tracking-wide text-[#9AA1B2]">Maillots</p>
        <ul className="space-y-1">
          {produits.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelection(p.id)}
                className={`focus-ring flex w-full items-center gap-2.5 rounded-input px-2.5 py-2 text-left text-[13px] font-semibold ${selection === p.id ? 'bg-[#F0A62B] text-[#14161D]' : 'text-[#C6CBD8] hover:bg-[#1B1F2B]'}`}
              >
                <span className="relative h-8 w-8 flex-none overflow-hidden rounded-thumb bg-[#12141C]">
                  <Image src={p.mainImage} alt="" fill sizes="32px" className="object-contain p-0.5" />
                </span>
                <span className="truncate">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ----- Éditeur ----- */}
      <div>
        {!produit ? (
          <p className="rounded-panel border border-dashed border-[#262B38] p-8 text-center text-sm text-[#9AA1B2]">
            Choisissez un maillot dans la liste pour personnaliser son thème de couleurs.
          </p>
        ) : !brouillon ? (
          <p className="text-sm text-[#9AA1B2]">Chargement du thème…</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[15px] font-extrabold">
                Thème de « {produit.name} »{' '}
                {modifie && <span className="ml-2 rounded-pill bg-[rgba(240,166,43,.15)] px-2 py-0.5 text-[11px] font-bold text-[#F0A62B]">non enregistré</span>}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={reinitialiser} className="focus-ring rounded-input border border-[#262B38] px-3 py-2 text-[12.5px] font-semibold hover:bg-[#1B1F2B]">
                  Valeurs par défaut
                </button>
                <button
                  type="button"
                  onClick={enregistrer}
                  disabled={envoi}
                  className="focus-ring rounded-pill bg-[#F0A62B] px-4 py-2 text-[13px] font-bold text-[#14161D] disabled:opacity-50"
                >
                  {envoi ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </div>
            <ThemeFields
              theme={brouillon}
              onChange={setBrouillon}
              titre={produit.name}
              sousTitre={produit.subTitle}
              prix={`${produit.price.toLocaleString('fr-FR')} ${produit.currency}`}
              miniature={produit.mainImage}
            />
            {message && (
              <p
                role="status"
                className={`rounded-input border p-3 text-[13px] font-medium ${message.type === 'ok' ? 'border-[rgba(61,214,140,.5)] text-[#3DD68C]' : 'border-[rgba(255,92,92,.5)] text-[#FF5C5C]'}`}
              >
                {message.texte}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
