import ProductsAdmin from '@/components/admin/ProductsAdmin';
import { getProduits } from '@/lib/admin/store';

export const dynamic = 'force-dynamic';

export default function AdminProduitsPage() {
  return (
    <div>
      <h1 className="title-tight text-2xl font-extrabold sm:text-3xl">Produits</h1>
      <p className="mt-1 text-sm text-[#9AA1B2]">Ajouter, modifier, publier ou retirer vos maillots — sans code.</p>
      <div className="mt-5">
        <ProductsAdmin produits={getProduits()} />
      </div>
    </div>
  );
}
