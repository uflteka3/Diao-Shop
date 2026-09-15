import OrdersAdmin from '@/components/admin/OrdersAdmin';
import { getCommandes } from '@/lib/admin/store';
import { rafraichirCommandes } from '@/lib/server/commandesDirectes';

export const dynamic = 'force-dynamic';

export default async function AdminCommandesPage() {
  // Résynchro : les commandes arrivent du site public (autres instances Vercel).
  await rafraichirCommandes();
  return (
    <div>
      <h1 className="title-tight text-2xl font-extrabold sm:text-3xl">Commandes</h1>
      <p className="mt-1 text-sm text-[#9AA1B2]">Suivez chaque commande et faites évoluer son statut.</p>
      <div className="mt-5">
        <OrdersAdmin commandes={getCommandes()} />
      </div>
    </div>
  );
}
