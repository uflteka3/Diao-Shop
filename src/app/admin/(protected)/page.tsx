import Link from 'next/link';
import { getProduits, getFeaturedId, getProduit, getCommandes } from '@/lib/admin/store';
import { rafraichirCatalogue, rafraichirCommandes } from '@/lib/server/commandesDirectes';

export const dynamic = 'force-dynamic';
import StatutBadge from '@/components/admin/StatutBadge';

export default async function DashboardPage() {
  await Promise.all([rafraichirCatalogue(), rafraichirCommandes()]);
  const produits = getProduits();
  const publies = produits.filter((p) => p.published);
  const brouillons = produits.filter((p) => !p.published);
  const featuredId = getFeaturedId();
  const featured = featuredId ? getProduit(featuredId) : null;
  const commandes = getCommandes();
  const nouvelles = commandes.filter((o) => o.status === 'nouvelle');
  const chiffre = commandes.filter((o) => o.status !== 'annulee' && o.status !== 'remboursee').reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: 'Produits', valeur: String(produits.length) },
    { label: 'Publiés', valeur: String(publies.length) },
    { label: 'Brouillons', valeur: String(brouillons.length) },
    { label: 'Commandes', valeur: String(commandes.length) },
    { label: 'Commandes nouvelles', valeur: String(nouvelles.length) },
    { label: 'Chiffre (hors annulées)', valeur: `${new Intl.NumberFormat('fr-FR').format(chiffre)} FCFA` },
  ];

  return (
    <div>
      <h1 className="title-tight text-2xl font-extrabold sm:text-3xl">Tableau de bord</h1>

      {/* Maillot mis en avant */}
      <section className="mt-5 rounded-panel border border-[#262B38] bg-[#161922] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9AA1B2]">Maillot principal de la page d’accueil</p>
        {featured ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-bold">
              {featured.name} <span className="font-medium text-[#F0A62B]">— {featured.subTitle}</span>
            </p>
            <Link href="/admin/mise-en-avant" className="focus-ring rounded-pill border border-[#262B38] px-4 py-2 text-[13px] font-semibold hover:bg-[#1B1F2B]">
              Changer
            </Link>
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[#9AA1B2]">Aucun maillot mis en avant — la page d’accueil affiche un état vide.</p>
            <Link href="/admin/mise-en-avant" className="focus-ring rounded-pill bg-[#F0A62B] px-4 py-2 text-[13px] font-bold text-[#14161D]">
              Choisir maintenant
            </Link>
          </div>
        )}
      </section>

      {/* Statistiques */}
      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-panel border border-[#262B38] bg-[#161922] p-4">
            <p className="price-tnum text-2xl font-extrabold text-[#F0A62B]">{s.valeur}</p>
            <p className="mt-1 text-[12px] font-semibold text-[#9AA1B2]">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Commandes récentes */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Commandes récentes</h2>
          <Link href="/admin/commandes" className="focus-ring text-[13px] font-semibold text-[#F0A62B] underline underline-offset-4">
            Tout voir
          </Link>
        </div>
        {commandes.length === 0 ? (
          <p className="mt-3 rounded-panel border border-dashed border-[#262B38] p-6 text-center text-sm text-[#9AA1B2]">
            Aucune commande pour le moment — elles apparaîtront ici dès le premier passage en caisse.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-panel border border-[#262B38]">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-[#1B1F2B] text-[12px] uppercase tracking-wide text-[#9AA1B2]">
                <tr>
                  <th className="px-4 py-3">Numéro</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {commandes.slice(0, 5).map((o) => (
                  <tr key={o.orderNumber} className="border-t border-[#262B38]">
                    <td className="px-4 py-3 font-bold text-[#F0A62B]">{o.orderNumber}</td>
                    <td className="px-4 py-3">{o.customerName}</td>
                    <td className="price-tnum px-4 py-3 font-semibold">{new Intl.NumberFormat('fr-FR').format(o.total)} {o.currency}</td>
                    <td className="px-4 py-3"><StatutBadge statut={o.status} /></td>
                    <td className="px-4 py-3 text-[#9AA1B2]">{new Date(o.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
