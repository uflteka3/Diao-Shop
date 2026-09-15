import SettingsForm from '@/components/admin/SettingsForm';
import { getParametres } from '@/lib/admin/store';

export const dynamic = 'force-dynamic';

export default function AdminParametresPage() {
  return (
    <div>
      <h1 className="title-tight text-2xl font-extrabold sm:text-3xl">Paramètres</h1>
      <p className="mt-1 text-sm text-[#9AA1B2]">Coordonnées, réseaux sociaux, devise, paiement, livraison et textes du site.</p>
      <div className="mt-5">
        <SettingsForm parametres={getParametres()} />
      </div>
    </div>
  );
}
