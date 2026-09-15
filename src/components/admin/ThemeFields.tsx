'use client';

import type { ProductTheme } from '@/lib/data/types';
import { readableTextColor } from '@/lib/utils/contrast';

const CHAMPS: { cle: keyof ProductTheme; label: string }[] = [
  { cle: 'backgroundColor', label: 'Fond extérieur' },
  { cle: 'accentColor', label: 'Accent' },
  { cle: 'primaryColor', label: 'Primaire' },
  { cle: 'secondaryColor', label: 'Secondaire' },
  { cle: 'textColor', label: 'Texte' },
  { cle: 'mutedTextColor', label: 'Texte secondaire' },
  { cle: 'buttonColor', label: 'Bouton' },
  { cle: 'glowColor', label: 'Glow' },
];

/** Champs d'édition du thème + aperçu live (partagé produit/themes). */
export default function ThemeFields({
  theme,
  onChange,
  titre,
  sousTitre,
  prix,
  miniature,
}: {
  theme: ProductTheme;
  onChange: (t: ProductTheme) => void;
  titre: string;
  sousTitre: string;
  prix: string;
  miniature?: string;
}) {
  function set(cle: keyof ProductTheme, valeur: string | number) {
    onChange({ ...theme, [cle]: valeur } as ProductTheme);
  }

  const texteBouton = readableTextColor(theme.buttonColor);
  const ratioTexte = ((): number => {
    const L = (hex: string) => {
      let h = hex.replace('#', '');
      if (h.length === 3) h = h.split('').map((c) => c + c).join('');
      const n = parseInt(h, 16);
      const f = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
    };
    const a = L(theme.textColor);
    const b = L(theme.secondaryColor); // le texte repose sur la carte (surface secondaire)
    const [hi, lo] = a >= b ? [a, b] : [b, a];
    return (hi + 0.05) / (lo + 0.05);
  })();
  const contrasteOK = ratioTexte >= 4.5;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* ----- Champs ----- */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {CHAMPS.map((c) => (
            <label key={c.cle} className="block">
              <span className="mb-1 block text-[12px] font-semibold text-[#9AA1B2]">{c.label}</span>
              <span className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme[c.cle] as string}
                  onChange={(e) => set(c.cle, e.target.value)}
                  aria-label={`${c.label} — sélecteur`}
                  className="h-10 w-10 flex-none cursor-pointer rounded-input border border-[#262B38] bg-transparent p-1"
                />
                <input
                  type="text"
                  value={theme[c.cle] as string}
                  onChange={(e) => set(c.cle, e.target.value)}
                  aria-label={`${c.label} — valeur HEX`}
                  className="focus-ring price-tnum h-10 w-full rounded-input border border-[#262B38] bg-transparent px-2 text-[12.5px] font-semibold uppercase"
                />
              </span>
            </label>
          ))}
        </div>

        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold text-[#9AA1B2]">Dégradé de la carte (CSS)</span>
          <input
            type="text"
            value={theme.surfaceGradient}
            onChange={(e) => set('surfaceGradient', e.target.value)}
            className="focus-ring h-10 w-full rounded-input border border-[#262B38] bg-transparent px-3 text-[12px]"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-[#9AA1B2]">Intensité du glow ({theme.glowIntensity})</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={theme.glowIntensity}
              onChange={(e) => set('glowIntensity', Number(e.target.value))}
              className="w-full accent-[#F0A62B]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-[#9AA1B2]">Mode</span>
            <select
              value={theme.mode}
              onChange={(e) => set('mode', e.target.value)}
              className="focus-ring h-10 w-full rounded-input border border-[#262B38] bg-transparent px-3 text-[13px]"
            >
              <option value="dark" className="text-black">Sombre</option>
              <option value="light" className="text-black">Clair</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold text-[#9AA1B2]">Bordure lumineuse (rgba ou hex)</span>
          <input
            type="text"
            value={theme.borderColor}
            onChange={(e) => set('borderColor', e.target.value)}
            className="focus-ring h-10 w-full rounded-input border border-[#262B38] bg-transparent px-3 text-[12.5px]"
          />
        </label>

        {!contrasteOK && (
          <p className="rounded-input border border-[rgba(240,166,43,.4)] p-3 text-[12px] font-medium text-[#F0A62B]">
            ⚠ Contraste texte/carte = {ratioTexte.toFixed(2)}:1 (minimum recommandé : 4.5:1). Ajustez la couleur du texte ou la couleur « Secondaire » de la carte.
          </p>
        )}
      </div>

      {/* ----- Aperçu live ----- */}
      <div>
        <span className="mb-2 block text-[12px] font-semibold text-[#9AA1B2]">Aperçu (proche de la page d’accueil)</span>
        <div className="overflow-hidden rounded-panel" style={{ backgroundColor: theme.backgroundColor }}>
          <div className="p-4">
            <div
              className="rounded-panel border p-5"
              style={{ borderColor: theme.borderColor, backgroundColor: theme.secondaryColor, backgroundImage: theme.surfaceGradient }}
            >
              <p className="text-[12px] font-bold" style={{ color: theme.accentColor }}>
                👑 Diao shop
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[10.5px]" style={{ color: theme.mutedTextColor }}>
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.accentColor }} /> Maillots de football
                  </p>
                  <p className="title-tight mt-1 line-clamp-2 text-lg font-extrabold leading-tight" style={{ color: theme.textColor }}>
                    {titre} <span style={{ color: theme.accentColor }}>/ {sousTitre}</span>
                  </p>
                  <button type="button" className="mt-3 inline-flex h-9 items-center whitespace-nowrap rounded-pill px-3.5 text-[11px] font-bold" style={{ backgroundColor: theme.buttonColor, color: texteBouton }}>
                    Ajouter au panier →
                  </button>
                </div>
                <div className="relative flex h-24 w-24 flex-none items-center justify-center">
                  <span
                    className="absolute h-16 w-16 rounded-full blur-xl"
                    style={{ backgroundColor: theme.glowColor, opacity: theme.glowIntensity * 0.6 }}
                  />
                  {miniature ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={miniature} alt="" className="relative h-20 w-20 object-contain" />
                  ) : (
                    <span className="relative text-2xl">👕</span>
                  )}
                </div>
                <div className="flex-none text-right">
                  <p className="price-tnum text-lg font-extrabold" style={{ color: theme.textColor }}>
                    {prix}
                  </p>
                  <div className="mt-2 flex gap-1.5">
                    {['S', 'M', 'L'].map((t, i) => (
                      <span
                        key={t}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-pill border text-[10px] font-bold"
                        style={
                          i === 1
                            ? { backgroundColor: theme.accentColor, color: readableTextColor(theme.accentColor), borderColor: theme.accentColor }
                            : { borderColor: theme.borderColor, color: theme.textColor }
                        }
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
