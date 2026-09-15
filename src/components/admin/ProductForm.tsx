'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ImageUploader from './ImageUploader';
import type { Product, ProductSize } from '@/lib/data/types';

const TAILLES_DEF = ['S', 'M', 'L', 'XL', 'XXL'];

/** Formulaire complet d'un produit — infos, prix, tailles/stocks, images, publication,
 *  mise en avant. Le thème se règle dans /admin/themes (aperçu dédié). */
export default function ProductForm({ produitInitial }: { produitInitial: Product | null }) {
  const router = useRouter();
  const [nom, setNom] = useState(produitInitial?.name ?? '');
  const [slug, setSlug] = useState(produitInitial?.slug ?? '');
  const [sousTitre, setSousTitre] = useState(produitInitial?.subTitle ?? 'Édition 2025');
  const [equipe, setEquipe] = useState(produitInitial?.team ?? '');
  const [courteDesc, setCourteDesc] = useState(produitInitial?.shortDescription ?? '');
  const [description, setDescription] = useState(produitInitial?.description ?? '');
  const [prix, setPrix] = useState(produitInitial?.price?.toString() ?? '');
  const [ancienPrix, setAncienPrix] = useState(produitInitial?.oldPrice?.toString() ?? '');
  const [imagePrincipale, setImagePrincipale] = useState(produitInitial?.mainImage ?? '');
  const [altText, setAltText] = useState(produitInitial?.altText ?? '');
  const [galerie, setGalerie] = useState<string[]>(produitInitial?.gallery ?? []);
  const [tailles, setTailles] = useState<ProductSize[]>(
    produitInitial?.sizes?.length ? produitInitial.sizes : TAILLES_DEF.map((t) => ({ size: t, stock: 12, active: true }))
  );
  const [publie, setPublie] = useState(produitInitial?.published ?? false);
  const [definirAvant, setDefinirAvant] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const champ = 'focus-ring h-11 w-full rounded-input border border-[#262B38] bg-transparent px-3.5 text-sm';

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    const prixNum = Number(prix);
    if (!Number.isFinite(prixNum) || prixNum < 0) {
      setErreur('Prix invalide.');
      return;
    }
    if (tailles.some((t) => t.active && t.stock < 0)) {
      setErreur('Les stocks doivent être ≥ 0.');
      return;
    }
    if (tailles.some((t) => t.active && t.stock > 0) === false && publie) {
      // Autorisé, mais signalé : un produit publié sans stock reste visible, tailles épuisées.
      setErreur('Ce produit est publié sans aucun stock — il apparaîtra « épuisé » sur le site.');
    }

    const corps = {
      id: produitInitial?.id,
      name: nom,
      slug: slug || nom,
      subTitle: sousTitre,
      team: equipe || nom,
      shortDescription: courteDesc,
      description: description || courteDesc,
      price: prixNum,
      oldPrice: ancienPrix ? Number(ancienPrix) : null,
      currency: 'FCFA',
      mainImage: imagePrincipale,
      gallery: galerie.filter(Boolean),
      altText: altText || `Maillot ${nom}`,
      sizes: tailles,
      published: publie,
    };

    setEnvoi(true);
    const r = await fetch('/api/admin/products', {
      method: produitInitial ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corps),
    });
    const data = (await r.json()) as { produit?: Product; erreur?: { message: string } };
    if (!r.ok || !data.produit) {
      setErreur(data.erreur?.message ?? 'Enregistrement impossible.');
      setEnvoi(false);
      return;
    }
    if (definirAvant) {
      await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.produit.id }),
      });
    }
    router.push('/admin/produits');
    router.refresh();
  }

  function majTaille(i: number, maj: Partial<ProductSize>) {
    setTailles((t) => t.map((x, j) => (j === i ? { ...x, ...maj } : x)));
  }

  return (
    <form onSubmit={soumettre} className="space-y-5">
      {/* -------- Identité -------- */}
      <section className="rounded-panel border border-[#262B38] bg-[#161922] p-5">
        <h2 className="text-[15px] font-extrabold">Identité du maillot</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Nom affiché *</span>
            <input required value={nom} onChange={(e) => setNom(e.target.value)} className={champ} placeholder="Ex : République Démocratique du Congo" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Sous-titre / édition</span>
            <input value={sousTitre} onChange={(e) => setSousTitre(e.target.value)} className={champ} placeholder="Ex : Édition Lion. 2026" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Slug (URL) — déduit du nom si vide</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className={champ} placeholder="rdc-2026" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Équipe / pays</span>
            <input value={equipe} onChange={(e) => setEquipe(e.target.value)} className={champ} placeholder="Ex : RDC" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-semibold">Accroche courte (cartes, filtres)</span>
            <input value={courteDesc} onChange={(e) => setCourteDesc(e.target.value)} className={champ} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-semibold">Description (fiche produit)</span>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="focus-ring w-full rounded-input border border-[#262B38] bg-transparent p-3.5 text-sm" />
          </label>
        </div>
      </section>

      {/* -------- Prix -------- */}
      <section className="rounded-panel border border-[#262B38] bg-[#161922] p-5">
        <h2 className="text-[15px] font-extrabold">Prix (FCFA)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Prix actuel *</span>
            <input required inputMode="numeric" value={prix} onChange={(e) => setPrix(e.target.value)} className={`${champ} price-tnum`} placeholder="25000" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Ancien prix (barré) — optionnel</span>
            <input inputMode="numeric" value={ancienPrix} onChange={(e) => setAncienPrix(e.target.value)} className={`${champ} price-tnum`} placeholder="35000" />
          </label>
        </div>
      </section>

      {/* -------- Images -------- */}
      <section className="rounded-panel border border-[#262B38] bg-[#161922] p-5">
        <h2 className="text-[15px] font-extrabold">Images</h2>
        <div className="mt-4 space-y-5">
          <ImageUploader valeur={imagePrincipale} onChange={setImagePrincipale} label="Image principale *" ariaLabel="Image principale — URL" />
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Texte alternatif (accessibilité / SEO)</span>
            <input value={altText} onChange={(e) => setAltText(e.target.value)} className={champ} />
          </label>
          <div>
            <span className="mb-2 block text-[13px] font-semibold">Galerie secondaire (optionnelle)</span>
            <div className="space-y-3">
              {galerie.map((url, i) => (
                <div key={`${url}-${i}`} className="flex items-center gap-2">
                  <div className="relative h-14 w-14 flex-none overflow-hidden rounded-input border border-[#262B38] bg-[#12141C]">
                    <Image src={url} alt="" fill sizes="56px" className="object-contain p-1" />
                  </div>
                  <input
                    value={url}
                    onChange={(e) => setGalerie((g) => g.map((x, j) => (j === i ? e.target.value : x)))}
                    aria-label={`Image ${i + 1} de la galerie`}
                    className="focus-ring h-10 min-w-0 flex-1 rounded-input border border-[#262B38] bg-transparent px-3 text-[12.5px]"
                  />
                  <button
                    type="button"
                    onClick={() => setGalerie((g) => (i === 0 ? g.slice(1) : [...g.slice(0, i - 1), g[i], g[i - 1], ...g.slice(i + 1)]))}
                    aria-label={`Monter l'image ${i + 1}`}
                    className="focus-ring rounded-input border border-[#262B38] px-2.5 py-2 text-[12px]"
                  >
                    ↑
                  </button>
                  <button type="button" onClick={() => setGalerie((g) => g.filter((_, j) => j !== i))} aria-label={`Retirer l'image ${i + 1}`} className="focus-ring rounded-input border border-[#3A1E1E] px-2.5 py-2 text-[12px] text-[#FF5C5C]">
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setGalerie((g) => [...g, ''])} className="focus-ring rounded-input border border-[#262B38] px-3 py-2 text-[12.5px] font-semibold hover:bg-[#1B1F2B]">
                + Ajouter une image à la galerie
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* -------- Tailles & stocks -------- */}
      <section className="rounded-panel border border-[#262B38] bg-[#161922] p-5">
        <h2 className="text-[15px] font-extrabold">Tailles &amp; stocks</h2>
        <div className="mt-4 space-y-2">
          {tailles.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                value={t.size}
                onChange={(e) => majTaille(i, { size: e.target.value.toUpperCase().slice(0, 5) })}
                aria-label={`Taille ${i + 1} — libellé`}
                className="focus-ring h-11 w-20 rounded-input border border-[#262B38] bg-transparent px-3 text-center text-sm font-bold"
              />
              <label className="flex items-center gap-2 text-[12.5px] text-[#9AA1B2]">
                Stock
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={t.stock}
                  onChange={(e) => majTaille(i, { stock: Math.max(0, Number(e.target.value)) })}
                  aria-label={`Stock taille ${t.size}`}
                  className="focus-ring price-tnum h-11 w-24 rounded-input border border-[#262B38] bg-transparent px-3 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-[12.5px] text-[#9AA1B2]">
                <input type="checkbox" checked={t.active} onChange={(e) => majTaille(i, { active: e.target.checked })} className="h-4 w-4 accent-[#F0A62B]" />
                Active
              </label>
              {tailles.length > 1 && (
                <button type="button" onClick={() => setTailles((x) => x.filter((_, j) => j !== i))} aria-label={`Retirer la taille ${t.size}`} className="focus-ring ml-auto rounded-input border border-[#3A1E1E] px-2.5 py-2 text-[12px] text-[#FF5C5C]">
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setTailles((x) => [...x, { size: '', stock: 0, active: true }])} className="focus-ring mt-2 rounded-input border border-[#262B38] px-3 py-2 text-[12.5px] font-semibold hover:bg-[#1B1F2B]">
            + Ajouter une taille
          </button>
        </div>
      </section>

      {/* -------- Publication -------- */}
      <section className="rounded-panel border border-[#262B38] bg-[#161922] p-5">
        <h2 className="text-[15px] font-extrabold">Publication &amp; mise en avant</h2>
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" checked={publie} onChange={(e) => setPublie(e.target.checked)} className="h-5 w-5 accent-[#F0A62B]" />
            Publier ce maillot sur la boutique
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" checked={definirAvant} onChange={(e) => setDefinirAvant(e.target.checked)} className="h-5 w-5 accent-[#F0A62B]" />
            Définir comme maillot principal de la page d’accueil
          </label>
          <p className="text-[12px] text-[#5D6472]">
            ⚠ Un seul maillot peut être mis en avant : choisir celui-ci retirera la mise en avant actuelle. Côté site, il apparaîtra en héros de la page d’accueil.
          </p>
        </div>
      </section>

      {erreur && (
        <p role="alert" className="rounded-input border border-[rgba(255,92,92,.5)] p-3 text-[13px] font-medium text-[#FF5C5C]">
          {erreur}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={envoi} className="focus-ring inline-flex h-12 items-center rounded-pill bg-[#F0A62B] px-6 text-sm font-bold text-[#14161D] disabled:opacity-50">
          {envoi ? 'Enregistrement…' : produitInitial ? 'Enregistrer les modifications' : 'Créer le maillot'}
        </button>
        <Link href="/admin/produits" className="focus-ring rounded-pill border border-[#262B38] px-5 py-3 text-sm font-semibold text-[#9AA1B2] hover:bg-[#1B1F2B]">
          Annuler
        </Link>
        <span className="text-[12px] text-[#5D6472]">Apparence (couleurs du thème) : à régler ensuite dans « Thèmes » avec aperçu live.</span>
      </div>
    </form>
  );
}
