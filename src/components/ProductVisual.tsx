'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface Props {
  src: string;
  alt: string;
  productKey: string;
}

/**
 * Scène du produit principal (carrousel d'accueil).
 * - Affiches d'origine (/images/demo/*) : rendu « flottant » intégré au décor.
 * - Photos réelles (/images/produits/*) : la PHOTO ORIGINALE fournie par le
 *   gérant est affichée TELLE QUELLE — jamais détourée, jamais recadrée,
 *   jamais régénérée. Seule la mise en page change : cadre arrondi, liserau
 *   du thème et halo coloré dynamique autour de la photo.
 */
export default function ProductVisual({ src, alt, productKey }: Props) {
  const reduce = useReducedMotion();
  const photoReelle = src.startsWith('/images/produits/');

  return (
    <div className="relative h-full w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={productKey}
          className="absolute inset-0 flex items-center justify-center"
          initial={reduce ? false : { opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: reduce ? 0 : 0.32, ease: [0.4, 0, 0.2, 1] }}
        >
          {photoReelle ? (
            /* PHOTO RÉELLE : ratio d'origine conservé (w-auto / max-h), zéro recadrage. */
            <motion.div
              className="flex h-full w-full items-center justify-center p-1"
              animate={reduce ? undefined : { y: [0, -8, 0] }}
              transition={reduce ? undefined : { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="max-h-full w-auto max-w-full rounded-panel border"
                style={{
                  borderColor: 'var(--ds-border)',
                  boxShadow:
                    '0 30px 70px -22px rgba(0, 0, 0, 0.65), 0 0 64px -18px color-mix(in srgb, var(--ds-glow) 40%, transparent)',
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              className="relative h-full w-[min(86%,430px)]"
              animate={reduce ? undefined : { y: [0, -9, 0] }}
              transition={reduce ? undefined : { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 1024px) 70vw, 430px"
                priority
                className="object-contain drop-shadow-[0_34px_28px_rgba(0,0,0,0.45)]"
              />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
