'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CrownLogo from '@/components/CrownLogo';

const LIENS = [
  { href: '/admin', label: 'Tableau de bord', exact: true },
  { href: '/admin/produits', label: 'Produits' },
  { href: '/admin/mise-en-avant', label: 'Mise en avant' },
  { href: '/admin/themes', label: 'Thèmes' },
  { href: '/admin/commandes', label: 'Commandes' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/parametres', label: 'Paramètres' },
];

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function deconnexion() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0E1016] text-[#E8EAF0]">
      <div className="mx-auto flex w-[min(1400px,100%)] flex-col lg:flex-row">
        {/* ----- Barre latérale ----- */}
        <aside className="flex flex-none flex-col gap-1 border-b border-[#262B38] p-4 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <Link href="/admin" className="mb-4 flex items-center gap-2.5 focus-ring">
            <CrownLogo className="h-6 w-6 text-[#F0A62B]" />
            <span className="title-tight text-lg font-extrabold">
              Diao <span className="text-[#F0A62B]">shop</span>
            </span>
          </Link>
          {LIENS.map((l) => {
            const actif = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`focus-ring rounded-input px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  actif ? 'bg-[#F0A62B] text-[#14161D]' : 'text-[#9AA1B2] hover:bg-[#1B1F2B] hover:text-[#E8EAF0]'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <div className="mt-auto hidden space-y-2 pt-6 lg:block">
            <Link href="/" target="_blank" className="focus-ring block rounded-input px-3.5 py-2 text-[13px] text-[#9AA1B2] hover:text-[#E8EAF0]">
              ↗ Voir la boutique
            </Link>
            <p className="truncate px-3.5 text-[11.5px] text-[#5D6472]" title={email}>
              {email}
            </p>
            <button type="button" onClick={deconnexion} className="focus-ring w-full rounded-input px-3.5 py-2 text-left text-[13px] font-semibold text-[#FF5C5C] hover:bg-[#1B1F2B]">
              Se déconnecter
            </button>
          </div>
          {/* Actions mobiles */}
          <div className="mt-4 flex gap-2 lg:hidden">
            <Link href="/" target="_blank" className="focus-ring rounded-input border border-[#262B38] px-3 py-2 text-[12px] text-[#9AA1B2]">
              Boutique ↗
            </Link>
            <button type="button" onClick={deconnexion} className="focus-ring rounded-input border border-[#3A1E1E] px-3 py-2 text-[12px] font-semibold text-[#FF5C5C]">
              Déconnexion
            </button>
          </div>
        </aside>

        {/* ----- Contenu ----- */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
