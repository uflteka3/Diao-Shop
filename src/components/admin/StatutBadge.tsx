import type { OrderStatus } from '@/lib/data/types';

const STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  nouvelle: { bg: 'rgba(92,168,255,.15)', fg: '#5CA8FF', label: 'Nouvelle' },
  confirmee: { bg: 'rgba(61,214,140,.15)', fg: '#3DD68C', label: 'Confirmée' },
  en_preparation: { bg: 'rgba(240,166,43,.15)', fg: '#F0A62B', label: 'En préparation' },
  expediee: { bg: 'rgba(200,150,255,.15)', fg: '#C896FF', label: 'Expédiée' },
  livree: { bg: 'rgba(61,214,140,.25)', fg: '#3DD68C', label: 'Livrée' },
  annulee: { bg: 'rgba(255,92,92,.15)', fg: '#FF5C5C', label: 'Annulée' },
  remboursee: { bg: 'rgba(255,92,92,.25)', fg: '#FF5C5C', label: 'Remboursée' },
};

export default function StatutBadge({ statut }: { statut: OrderStatus }) {
  const s = STYLES[statut] ?? STYLES.nouvelle;
  return (
    <span className="inline-block rounded-pill px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
}
