'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { Product } from '@/lib/data/types';
import { formatPrix } from '@/lib/utils/format';
import { fr } from '@/lib/i18n/fr';

interface Props {
  product: Product;
  topRight?: React.ReactNode;
  index?: number; // position dans la grille — décalage d'entrée en cascade
}

/** Carte produit — catalogue, favoris et produits similaires. */
export default function ProductCard({ product, topRight, index = 0 }: Props) {
  const reduce = useReducedMotion();
  const totalStock = product.sizes.filter((s) => s.active).reduce((s, x) => s + x.stock, 0);
  const epuise = totalStock === 0;

  return (
    <motion.div
      className="group relative rounded-panel border p-3 transition-transform duration-300 hover:-translate-y-1"
      style={{
        borderColor: 'var(--ds-border)',
        backgroundColor: 'color-mix(in srgb, var(--ds-secondary) 70%, transparent)',
      }}
      // Entrée douce en cascade — instantanée si prefers-reduced-motion
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : Math.min(index * 0.05, 0.3), ease: 'easeOut' }}
    >
      {topRight && <div className="absolute right-3 top-3 z-10">{topRight}</div>}
      <Link href={`/produit/${product.slug}`} className="focus-ring block rounded-panel" aria-label={product.name}>
        <div className="bg-tint relative aspect-square overflow-hidden rounded-thumb">
          <Image
            src={product.mainImage}
            alt={product.altText}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 260px"
            className={`object-contain p-2 transition-transform duration-300 group-hover:scale-105 ${epuise ? 'opacity-75 grayscale-[0.7]' : ''}`}
          />
          {epuise && (
            <span
              className="absolute left-2 top-2 rounded-pill px-2.5 py-1 text-[11px] font-bold"
              style={{ backgroundColor: 'var(--ds-danger)', color: '#fff' }}
            >
              {fr.home.epuise}
            </span>
          )}
        </div>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--ds-muted)]">
          {product.team}
        </p>
        <h3 className="title-tight truncate text-[15px] font-bold text-[color:var(--ds-text)]">{product.name}</h3>
        <p className="mt-0.5 flex items-baseline gap-2">
          <span className="price-tnum text-[15px] font-extrabold text-[color:var(--ds-accent)]">
            {formatPrix(product.price, product.currency)}
          </span>
          {product.oldPrice != null && (
            <span className="price-tnum text-[12px] font-medium text-[color:var(--ds-muted)] line-through">
              {formatPrix(product.oldPrice, product.currency)}
            </span>
          )}
        </p>
      </Link>
    </motion.div>
  );
}
