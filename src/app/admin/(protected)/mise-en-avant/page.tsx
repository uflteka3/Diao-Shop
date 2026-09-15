import FeaturedPicker from '@/components/admin/FeaturedPicker';
import { getFeaturedId, getProduits } from '@/lib/admin/store';

export const dynamic = 'force-dynamic';

export default function MiseEnAvantPage() {
  return (
    <div>
      <h1 className="title-tight text-2xl font-extrabold sm:text-3xl">Mise en avant</h1>
      <p className="mt-1 text-sm text-[#9AA1B2]">
        Un seul maillot apparaît en héros de la page d’accueil — la garantie d’une vitrine claire et fidèle à l’affiche.
      </p>
      <div className="mt-5">
        <FeaturedPicker produits={getProduits()} featuredActuel={getFeaturedId()} />
      </div>
    </div>
  );
}
