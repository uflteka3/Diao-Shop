'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Apparition douce au défilement (IntersectionObserver, une seule fois).
 * - Sans JavaScript : le contenu reste visible (classe posée seulement
 *   après montage, jamais dans le HTML serveur).
 * - prefers-reduced-motion : l'apparition est instantanée (CSS + garde JS).
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [arme, setArme] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return; // jamais caché si animations réduites
    setArme(true);
    const cible = ref.current;
    if (!cible) return;
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (entree.isIntersecting) {
            setVisible(true);
            observateur.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    observateur.observe(cible);
    return () => observateur.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${arme ? 'ds-reveal' : ''} ${arme && visible ? 'ds-reveal-visible' : ''} ${className}`}
      style={arme ? { '--ds-reveal-delay': `${delay}ms` } as React.CSSProperties : undefined}
    >
      {children}
    </div>
  );
}
