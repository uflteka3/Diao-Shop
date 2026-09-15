import type { CSSProperties } from 'react';
import type { ProductTheme } from '@/lib/data/types';
import { readableTextColor } from '@/lib/utils/contrast';

/**
 * Mapping thème → variables CSS consommées exclusivement par les composants.
 * C'est le cœur du système de thèmes dynamiques : changer de produit =
 * changer ces variables = toute l'interface suit (transitions CSS .ds-anim).
 */
export function themeToCssVars(t: ProductTheme): CSSProperties {
  return {
    '--ds-bg': t.backgroundColor,
    '--ds-gradient': t.surfaceGradient,
    '--ds-primary': t.primaryColor,
    '--ds-secondary': t.secondaryColor,
    '--ds-accent': t.accentColor,
    '--ds-text': t.textColor,
    '--ds-muted': t.mutedTextColor,
    '--ds-button': t.buttonColor,
    '--ds-button-text': readableTextColor(t.buttonColor),
    '--ds-accent-text': readableTextColor(t.accentColor),
    '--ds-badge-text': readableTextColor(t.accentColor),
    '--ds-glow': t.glowColor,
    '--ds-glow-intensity': String(t.glowIntensity),
    '--ds-border': t.borderColor,
  } as CSSProperties;
}
