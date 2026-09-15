import ProductForm from '@/components/admin/ProductForm';

export default function NouveauProduitPage() {
  return (
    <div>
      <h1 className="title-tight text-2xl font-extrabold sm:text-3xl">Nouveau maillot</h1>
      <p className="mt-1 text-sm text-[#9AA1B2]">Créez un produit : il apparaîtra sur la boutique dès sa publication.</p>
      <div className="mt-5 max-w-3xl">
        <ProductForm produitInitial={null} />
      </div>
    </div>
  );
}
