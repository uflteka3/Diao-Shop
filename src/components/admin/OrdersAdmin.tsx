'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { Order, OrderStatus } from '@/lib/data/types';

const STATUTS: { valeur: OrderStatus; label: string }[] = [
  { valeur: 'nouvelle', label: 'Nouvelle' },
  { valeur: 'confirmee', label: 'Confirmée' },
  { valeur: 'en_preparation', label: 'En préparation' },
  { valeur: 'expediee', label: 'Expédiée' },
  { valeur: 'livree', label: 'Livrée' },
  { valeur: 'annulee', label: 'Annulée' },
  { valeur: 'remboursee', label: 'Remboursée' },
];

export default function OrdersAdmin({ commandes }: { commandes: Order[] }) {
  const router = useRouter();
  const [filtre, setFiltre] = useState<OrderStatus | 'tous'>('tous');
  const [ouvertes, setOuvertes] = useState<Set<string>>(new Set());
  const [occupe, setOccupe] = useState<string | null>(null);

  const liste = useMemo(() => (filtre === 'tous' ? commandes : commandes.filter((o) => o.status === filtre)), [commandes, filtre]);

  function basculerDetail(numero: string) {
    setOuvertes((s) => {
      const n = new Set(s);
      if (n.has(numero)) n.delete(numero);
      else n.add(numero);
      return n;
    });
  }

  async function changerStatut(numero: string, statut: OrderStatus) {
    setOccupe(numero);
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero, statut }),
    });
    setOccupe(null);
    router.refresh();
  }

  async function supprimer(numero: string) {
    if (!window.confirm(`Supprimer définitivement la commande ${numero} ? Cette action est irréversible.`)) return;
    setOccupe(numero);
    await fetch('/api/admin/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero }),
    });
    setOccupe(null);
    router.refresh();
  }

  if (commandes.length === 0) {
    return (
      <p className="rounded-panel border border-dashed border-[#262B38] p-8 text-center text-sm text-[#9AA1B2]">
        Aucune commande pour le moment — elles apparaîtront ici dès le premier passage en caisse.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFiltre('tous')}
          className={`focus-ring rounded-pill px-3.5 py-2 text-[12.5px] font-semibold ${filtre === 'tous' ? 'bg-[#F0A62B] text-[#14161D]' : 'border border-[#262B38] text-[#9AA1B2]'}`}
        >
          Toutes ({commandes.length})
        </button>
        {STATUTS.map((s) => {
          const n = commandes.filter((o) => o.status === s.valeur).length;
          if (n === 0 && filtre !== s.valeur) return null;
          return (
            <button
              key={s.valeur}
              type="button"
              onClick={() => setFiltre(s.valeur)}
              className={`focus-ring rounded-pill px-3.5 py-2 text-[12.5px] font-semibold ${filtre === s.valeur ? 'bg-[#F0A62B] text-[#14161D]' : 'border border-[#262B38] text-[#9AA1B2]'}`}
            >
              {s.label} ({n})
            </button>
          );
        })}
      </div>

      <ul className="mt-4 space-y-3">
        {liste.map((o) => (
          <li key={o.orderNumber} className="rounded-panel border border-[#262B38] bg-[#161922]" style={{ opacity: occupe === o.orderNumber ? 0.5 : 1 }}>
            <div className="flex flex-wrap items-center gap-3 p-4">
              <button type="button" onClick={() => basculerDetail(o.orderNumber)} className="focus-ring min-w-0 flex-1 text-left" aria-expanded={ouvertes.has(o.orderNumber)}>
                <p className="font-bold text-[#F0A62B]">
                  {o.orderNumber} <span className="font-medium text-[#E8EAF0]">— {o.customerName}</span>
                </p>
                <p className="mt-0.5 text-[12.5px] text-[#9AA1B2]">
                  {new Date(o.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })} · {o.city} ·{' '}
                  <span className="price-tnum font-bold text-[#E8EAF0]">{new Intl.NumberFormat('fr-FR').format(o.total)} {o.currency}</span>
                </p>
              </button>
              <label className="flex items-center gap-2 text-[12px] text-[#9AA1B2]">
                Statut
                <select
                  value={o.status}
                  onChange={(e) => changerStatut(o.orderNumber, e.target.value as OrderStatus)}
                  className="focus-ring h-10 rounded-input border border-[#262B38] bg-transparent px-2 text-[12.5px] font-semibold"
                >
                  {STATUTS.map((s) => (
                    <option key={s.valeur} value={s.valeur} className="text-black">
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => supprimer(o.orderNumber)}
                disabled={occupe === o.orderNumber}
                aria-label={`Supprimer la commande ${o.orderNumber}`}
                className="focus-ring h-10 rounded-input border border-[#3A1E1E] px-3 text-[12.5px] font-semibold text-[#FF5C5C] hover:bg-[#1B1F2B]"
              >
                Supprimer
              </button>
            </div>
            {ouvertes.has(o.orderNumber) && (
              <div className="border-t border-[#262B38] p-4 text-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#9AA1B2]">Client</p>
                    <p className="mt-1">{o.customerName}</p>
                    <p className="text-[13px] text-[#9AA1B2]">📞 {o.phone}{o.whatsapp ? ` · WhatsApp ${o.whatsapp}` : ''}</p>
                    {o.email && <p className="text-[13px] text-[#9AA1B2]">✉️ {o.email}</p>}
                    <p className="mt-2 text-[13px]">
                      {o.address}, {o.city} — zone « {o.zoneLabel} »
                    </p>
                    {o.notes && <p className="mt-1 text-[13px] italic text-[#9AA1B2]">« {o.notes} »</p>}
                    <p className="mt-2 text-[12px] text-[#9AA1B2]">Paiement : {o.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#9AA1B2]">Articles</p>
                    <ul className="mt-1 space-y-1.5">
                      {o.items.map((it, i) => (
                        <li key={i} className="flex items-center justify-between gap-2 text-[13px]">
                          <span className="min-w-0 truncate">
                            {it.quantity} × {it.productName} (taille {it.size})
                          </span>
                          <span className="price-tnum flex-none font-semibold">
                            {new Intl.NumberFormat('fr-FR').format(it.totalPrice)} {o.currency}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 border-t border-[#262B38] pt-2 text-[13px]">
                      Sous-total {new Intl.NumberFormat('fr-FR').format(o.subtotal)} · Livraison {new Intl.NumberFormat('fr-FR').format(o.deliveryFee)}
                    </p>
                    <p className="price-tnum mt-1 font-extrabold text-[#F0A62B]">
                      Total {new Intl.NumberFormat('fr-FR').format(o.total)} {o.currency}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
