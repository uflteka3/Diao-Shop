import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { getProduit } from '@/lib/admin/store';

export const dynamic = 'force-dynamic';

export default async function ModifierProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const produit = getProduit(id);
  if (!produit) notFound();

  return (
    <div>
      <h1 className="title-tight text-2xl font-extrabold sm:text-3xl">Modifier — {produit.name}</h1>
      <p className="mt-1 text-sm text-[#9AA1B2]">Les changements sont visibles sur la boutique immédiatement après enregistrement.</p>
      <div className="mt-5 max-w-3xl">
        <ProductForm produitInitial={produit} />
      </div>
    </div>
  );
}
