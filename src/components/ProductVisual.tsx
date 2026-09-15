'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface Props {
  src: string;
  alt: string;
  productKey: string;
}

/**
 * Scène du produit principal — image réelle de l'administrateur,
 * jamais déformée (object-contain), effet flottant + ombre portée.
 * Transitions produit : fondu + légère élévation (désactivées si
 * l'utilisateur demande une réduction des animations).
 */
export default function ProductVisual({ src, alt, productKey }: Props) {
  const reduce = useReducedMotion();

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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
