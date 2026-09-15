'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Product } from '@/lib/data/types';
import ProductCard from '@/components/catalogue/ProductCard';
import { fr } from '@/lib/i18n/fr';

type Tri = 'nouveaute' | 'prix-asc' | 'prix-desc';

interface Props {
  products: Product[];
}

const TAILLES = ['S', 'M', 'L', 'XL', 'XXL'];
const PAS_AFFICHAGE = 8;

/**
 * Catalogue — recherche, filtres (équipe, prix, taille, disponibilité), tri.
 * Filtres synchronisés avec l'URL (partageables). États : vide + chargement progressif.
 */
export default function CatalogueClient({ products }: Props) {
  const searchParams = useSearchParams();

  const [q, setQ] = useState('');
  const [equipes, setEquipes] = useState<string[]>([]);
  const [tailles, setTailles] = useState<string[]>([]);
  const [prixMax, setPrixMax] = useState<number | null>(null);
  const [dispoSeulement, setDispoSeulement] = useState(false);
  const [tri, setTri] = useState<Tri>('nouveaute');
  const [affiches, setAffiches] = useState(PAS_AFFICHAGE);
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  const prixMaxPossible = useMemo(
    () => Math.ceil(Math.max(...products.map((p) => p.price), 0) / 5000) * 5000,
    [products]
  );

  // Initialisation depuis l'URL (liens partageables)
  useEffect(() => {
    const qp = searchParams;
    if (qp.get('q')) setQ(qp.get('q') ?? '');
    if (qp.get('equipe')) setEquipes(qp.get('equipe')?.split(',').filter(Boolean) ?? []);
    if (qp.get('taille')) setTailles(qp.get('taille')?.split(',').filter(Boolean) ?? []);
    if (qp.get('prixMax')) setPrixMax(Number(qp.get('prixMax')) || null);
    if (qp.get('dispo') === '1') setDispoSeulement(true);
    if (qp.get('tri')) setTri(qp.get('tri') as Tri);
  }, [searchParams]);

  // Synchronisation URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (equipes.length) params.set('equipe', equipes.join(','));
    if (tailles.length) params.set('taille', tailles.join(','));
    if (prixMax != null) params.set('prixMax', String(prixMax));
    if (dispoSeulement) params.set('dispo', '1');
    if (tri !== 'nouveaute') params.set('tri', tri);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `/boutique?${qs}` : '/boutique');
  }, [q, equipes, tailles, prixMax, dispoSeulement, tri]);

  const equipesDisponibles = useMemo(
    () => Array.from(new Set(products.map((p) => p.team))).sort((a, b) => a.localeCompare(b, 'fr')),
    [products]
  );

  const resultats = useMemo(() => {
    const terme = q.trim().toLowerCase();
    let liste = products.filter((p) => {
      if (terme && !`${p.name} ${p.team} ${p.subTitle}`.toLowerCase().includes(terme)) return false;
      if (equipes.length && !equipes.includes(p.team)) return false;
      if (tailles.length) {
        const ok = tailles.some((t) => p.sizes.some((s) => s.size === t && s.active && s.stock > 0));
        if (!ok) return false;
      }
      if (prixMax != null && p.price > prixMax) return false;
      if (dispoSeulement) {
        const stock = p.sizes.filter((s) => s.active).reduce((sum, s) => sum + s.stock, 0);
        if (stock === 0) return false;
      }
      return true;
    });
    liste = [...liste].sort((a, b) => {
      if (tri === 'prix-asc') return a.price - b.price;
      if (tri === 'prix-desc') return b.price - a.price;
      return b.createdAt.localeCompare(a.createdAt); // nouveauté
    });
    return liste;
  }, [products, q, equipes, tailles, prixMax, dispoSeulement, tri]);

  function toggle<T>(liste: T[], valeur: T, set: (v: T[]) => void) {
    set(liste.includes(valeur) ? liste.filter((x) => x !== valeur) : [...liste, valeur]);
    setAffiches(PAS_AFFICHAGE);
  }

  function reinitialiser() {
    setQ('');
    setEquipes([]);
    setTailles([]);
    setPrixMax(null);
    setDispoSeulement(false);
    setTri('nouveaute');
    setAffiches(PAS_AFFICHAGE);
  }

  const filtresActifs = Boolean(q || equipes.length || tailles.length || prixMax != null || dispoSeulement || tri !== 'nouveaute');

  const panneauFiltres = (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Équipes */}
      <fieldset>
        <legend className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[color:var(--ds-muted)]">
          Équipe / sélection
        </legend>
        <div className="flex flex-wrap gap-2">
          {equipesDisponibles.map((e) => {
            const on = equipes.includes(e);
            return (
              <button
                key={e}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(equipes, e, setEquipes)}
                className={`focus-ring rounded-pill border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${on ? '' : 'hover-tint'}`}
                style={
                  on
                    ? { backgroundColor: 'var(--ds-accent)', color: 'var(--ds-accent-text)', borderColor: 'var(--ds-accent)' }
                    : { borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }
                }
              >
                {e}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Tailles */}
      <fieldset>
        <legend className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[color:var(--ds-muted)]">Taille</legend>
        <div className="flex flex-wrap gap-2">
          {TAILLES.map((t) => {
            const on = tailles.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(tailles, t, setTailles)}
                className={`focus-ring inline-flex h-9 min-w-[42px] items-center justify-center rounded-pill border px-2.5 text-[12.5px] font-semibold transition-colors ${on ? '' : 'hover-tint'}`}
                style={
                  on
                    ? { backgroundColor: 'var(--ds-accent)', color: 'var(--ds-accent-text)', borderColor: 'var(--ds-accent)' }
                    : { borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }
                }
              >
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Prix + dispo */}
      <fieldset>
        <legend className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[color:var(--ds-muted)]">
          Prix maximum
        </legend>
        <input
          type="range"
          min={5000}
          max={prixMaxPossible}
          step={1000}
          value={prixMax ?? prixMaxPossible}
          onChange={(e) => {
            setPrixMax(Number(e.target.value));
            setAffiches(PAS_AFFICHAGE);
          }}
          aria-label="Prix maximum"
          className="w-full accent-[color:var(--ds-accent)]"
        />
        <p className="price-tnum mt-1 text-[12.5px] font-semibold text-[color:var(--ds-text)]">
          {prixMax != null ? `≤ ${new Intl.NumberFormat('fr-FR').format(prixMax)} FCFA` : 'Tous les prix'}
        </p>
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[color:var(--ds-text)]">
          <input
            type="checkbox"
            checked={dispoSeulement}
            onChange={(e) => {
              setDispoSeulement(e.target.checked);
              setAffiches(PAS_AFFICHAGE);
            }}
            className="h-4 w-4 accent-[color:var(--ds-accent)]"
          />
          En stock uniquement
        </label>
      </fieldset>

      {/* Tri */}
      <fieldset>
        <legend className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[color:var(--ds-muted)]">Trier par</legend>
        <select
          value={tri}
          onChange={(e) => {
            setTri(e.target.value as Tri);
            setAffiches(PAS_AFFICHAGE);
          }}
          aria-label="Trier les produits"
          className="focus-ring h-11 w-full rounded-input border bg-transparent px-3 text-sm font-semibold text-[color:var(--ds-text)]"
          style={{ borderColor: 'var(--ds-border)' }}
        >
          <option className="text-black" value="nouveaute">
            Nouveauté
          </option>
          <option className="text-black" value="prix-asc">
            Prix croissant
          </option>
          <option className="text-black" value="prix-desc">
            Prix décroissant
          </option>
        </select>
        {filtresActifs && (
          <button
            type="button"
            onClick={reinitialiser}
            className="focus-ring mt-3 text-[12.5px] font-semibold underline underline-offset-4"
            style={{ color: 'var(--ds-accent)' }}
          >
            Réinitialiser les filtres
          </button>
        )}
      </fieldset>
    </div>
  );

  return (
    <div>
      {/* Recherche + toggle filtres mobile */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setAffiches(PAS_AFFICHAGE);
            }}
            placeholder="Rechercher un maillot, une équipe…"
            aria-label="Rechercher un maillot"
            className="focus-ring h-12 w-full rounded-pill border bg-transparent pl-5 pr-5 text-sm text-[color:var(--ds-text)] placeholder:text-[color:color-mix(in_srgb,var(--ds-text)_45%,transparent)]"
            style={{ borderColor: 'var(--ds-border)' }}
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltresOuverts((v) => !v)}
          aria-expanded={filtresOuverts}
          aria-controls="filtres-catalogue"
          className="focus-ring inline-flex h-12 items-center gap-2 rounded-pill border px-5 text-sm font-bold text-[color:var(--ds-text)] lg:hidden"
          style={{ borderColor: 'var(--ds-border)' }}
        >
          Filtres {filtresActifs && '•'}
        </button>
      </div>

      <div
        id="filtres-catalogue"
        className={`mt-4 overflow-hidden rounded-panel border transition-all ${filtresOuverts ? 'block' : 'hidden lg:block'}`}
        style={{ borderColor: 'var(--ds-border)', backgroundColor: 'color-mix(in srgb, var(--ds-secondary) 60%, transparent)' }}
      >
        <div className="p-4 sm:p-5">{panneauFiltres}</div>
      </div>

      {/* Résultats */}
      <p aria-live="polite" className="mt-5 text-[13px] font-medium text-[color:var(--ds-muted)]">
        {resultats.length} maillot{resultats.length > 1 ? 's' : ''} {filtresActifs ? 'trouvé' + (resultats.length > 1 ? 's' : '') : 'disponible' + (resultats.length > 1 ? 's' : '')}
      </p>

      {resultats.length === 0 ? (
        <div className="mt-6 rounded-panel border p-10 text-center" style={{ borderColor: 'var(--ds-border)' }}>
          <p className="title-tight text-lg font-bold text-[color:var(--ds-text)]">Aucun maillot ne correspond</p>
          <p className="mt-2 text-sm text-[color:var(--ds-muted)]">
            Essayez de modifier votre recherche ou de retirer certains filtres.
          </p>
          <button
            type="button"
            onClick={reinitialiser}
            className="focus-ring mt-5 inline-flex h-11 items-center rounded-pill px-5 text-sm font-bold"
            style={{ backgroundColor: 'var(--ds-button)', color: 'var(--ds-button-text)' }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
            {resultats.slice(0, affiches).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
          {resultats.length > affiches && (
            <div className="mt-7 text-center">
              <button
                type="button"
                onClick={() => setAffiches((n) => n + PAS_AFFICHAGE)}
                className="focus-ring inline-flex h-12 items-center rounded-pill border px-6 text-sm font-bold text-[color:var(--ds-text)]"
                style={{ borderColor: 'var(--ds-border)' }}
              >
                Afficher plus ({resultats.length - affiches} restant{resultats.length - affiches > 1 ? 's' : ''})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
