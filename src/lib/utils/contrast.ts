/**
 * Calcul de contraste WCAG — utilisé pour garantir la lisibilité des thèmes
 * (texte des boutons, badges) sans champ supplémentaire à administrer.
 */

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Luminance relative WCAG (0 → 1). Fonctionne pour #RGB, #RRGGBB. */
export function relativeLuminance(color: string): number {
  if (!color.startsWith('#')) return 0.5;
  try {
    const [r, g, b] = hexToRgb(color);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  } catch {
    return 0.5;
  }
}

/** Ratio de contraste WCAG entre deux couleurs. */
export function contrastRatio(colorA: string, colorB: string): number {
  const la = relativeLuminance(colorA);
  const lb = relativeLuminance(colorB);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Retourne noir ou blanc — la couleur la plus lisible sur `background`. */
export function readableTextColor(background: string): string {
  return contrastRatio(background, '#FFFFFF') >= contrastRatio(background, '#111111')
    ? '#FFFFFF'
    : '#111111';
}
