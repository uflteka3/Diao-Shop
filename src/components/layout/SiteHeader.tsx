'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import CrownLogo from '@/components/CrownLogo';
import { CartIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon } from '@/components/Icons';
import { useCart } from '@/contexts/CartContext';
import { fr } from '@/lib/i18n/fr';

const LINKS = [
  { href: '/boutique', label: fr.nav.boutique },
  { href: '/a-propos', label: fr.nav.aPropos },
  { href: '/contact', label: fr.nav.contact },
];

/** En-tête de la carte : logo, navigation flottante en pilule, recherche / favoris / panier. */
export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  // Accès back-office DISCRET : la couronne n'ouvre l'admin qu'au TROISIÈME
  // clic rapproché (fenêtre de 900 ms). Un clic seul ne fait strictement rien.
  const clicsCouronne = useRef<number[]>([]);
  function clicSurCouronne() {
    const maintenant = Date.now();
    clicsCouronne.current = [...clicsCouronne.current.filter((t) => maintenant - t < 900), maintenant];
    if (clicsCouronne.current.length >= 3) {
      clicsCouronne.current = [];
      router.push('/admin');
    }
  }

  return (
    <header className="relative z-30 flex items-center justify-between gap-3 px-4 pt-4 sm:px-8 sm:pt-5 lg:px-10">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-input focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:bg-[color:var(--ds-accent)] focus:text-[color:var(--ds-button-text)]"
      >
        Aller au contenu
      </a>
      <span className="flex select-none items-center gap-2">
        <button
          type="button"
          onClick={clicSurCouronne}
          onDoubleClick={(e) => e.preventDefault()}
          className="focus-ring cursor-default rounded-input"
          aria-label="Diao Shop"
          title=""
        >
          <CrownLogo className="h-7 w-7 text-[color:var(--ds-accent)]" />
        </button>
        <Link href="/" className="focus-ring rounded-input title-tight whitespace-nowrap text-xl font-extrabold text-[color:var(--ds-text)]" aria-label="Accueil">
          Diao <span className="text-[color:var(--ds-accent)]">shop</span>
        </Link>
      </span>

      <nav aria-label={fr.nav.principale} className="absolute left-1/2 hidden -translate-x-1/2 md:block">
        <ul className="bg-tint flex items-center gap-1 rounded-pill border px-2 py-1.5" style={{ borderColor: 'var(--ds-border)' }}>
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative block rounded-pill px-4 py-2 text-sm transition-colors focus-ring ${
                    active
                      ? 'font-semibold text-[color:var(--ds-text)]'
                      : 'text-[color:var(--ds-muted)] hover:text-[color:var(--ds-text)]'
                  }`}
                >
                  {l.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-4 bottom-1 h-[2px] rounded-full bg-[color:var(--ds-accent)]"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-2">
        <Link href="/boutique" aria-label={fr.header.recherche} className="icon-btn focus-ring hidden sm:inline-flex">
          <SearchIcon className="h-5 w-5" />
        </Link>
        <Link href="/favoris" aria-label={fr.header.favoris} className="icon-btn focus-ring">
          <HeartIcon className="h-5 w-5" />
        </Link>
        <Link
          href="/panier"
          aria-label={`${fr.header.panier} (${count})`}
          className="icon-btn focus-ring relative"
        >
          <CartIcon className="h-5 w-5" />
          {count > 0 && (
            <span className="nav-badge" aria-hidden>
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Link>
        <button
          type="button"
          className="icon-btn focus-ring md:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? fr.nav.fermerMenu : fr.nav.ouvrirMenu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav
          id="menu-mobile"
          aria-label={fr.nav.principale}
          className="absolute inset-x-4 top-full z-40 mt-2 rounded-panel border p-2 shadow-xl md:hidden"
          style={{
            borderColor: 'var(--ds-border)',
            background: 'color-mix(in srgb, var(--ds-secondary) 90%, transparent)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <ul className="py-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="hover-tint block rounded-input px-4 py-3 text-[color:var(--ds-text)] focus-ring"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
