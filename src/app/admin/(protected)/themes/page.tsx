import { Suspense } from 'react';
import ThemeEditor from '@/components/admin/ThemeEditor';
import { getProduits } from '@/lib/admin/store';
import { rafraichirCatalogue } from '@/lib/server/commandesDirectes';

export const dynamic = 'force-dynamic';

export default async function AdminThemesPage() {
  await rafraichirCatalogue();
  return (
    <div>
      <h1 className="title-tight text-2xl font-extrabold sm:text-3xl">Thèmes</h1>
      <p className="mt-1 max-w-2xl text-sm text-[#9AA1B2]">
        Chaque maillot possède ses couleurs : l’ambiance de la page d’accueil et de la fiche suit automatiquement le produit affiché — zéro code, zéro flash blanc.
      </p>
      <div className="mt-5">
        <Suspense fallback={<p className="text-sm text-[#9AA1B2]">Chargement…</p>}>
          <ThemeEditor produits={getProduits()} />
        </Suspense>
      </div>
    </div>
  );
}
