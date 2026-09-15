import type { ProductTheme } from '@/lib/data/types';

/**
 * THÈMES DE DÉMONSTRATION — DONNÉES DE DÉMONSTRATION À REMPLACER.
 * En production (Phase 8), ces valeurs proviennent de la table `product_themes`
 * et sont modifiables depuis le back-office, sans toucher au code.
 * Couleurs extraites des affiches fournies par le client.
 */
export const DEMO_THEMES: Record<string, ProductTheme> = {
  // Maillot RDC — Édition Lion 2026 (affiche principale : orange/or) — MIS EN AVANT
  'p-rdc': {
    backgroundColor: '#F59200',
    surfaceGradient: 'linear-gradient(135deg, #3D1F05 0%, #1C0E02 55%, #4A2708 100%)',
    primaryColor: '#EFA32B',
    secondaryColor: '#241102',
    accentColor: '#F5B62E',
    textColor: '#FFFFFF',
    mutedTextColor: '#F2D9B3',
    buttonColor: '#F0A62B',
    glowColor: '#FFA424',
    glowIntensity: 0.6,
    borderColor: 'rgba(255, 164, 36, 0.40)',
    mode: 'dark',
  },
  // Maillot Real Madrid (affiche : blanc/or, fond clair)
  'p-real-madrid': {
    backgroundColor: '#E2E4E8',
    surfaceGradient: 'linear-gradient(135deg, #FBFBFC 0%, #E7E8EC 100%)',
    primaryColor: '#A8894A',
    secondaryColor: '#F2F2F4',
    accentColor: '#B08D3E',
    textColor: '#191B20',
    mutedTextColor: '#5D6472',
    buttonColor: '#191B20',
    glowColor: '#C9B078',
    glowIntensity: 0.38,
    borderColor: 'rgba(25, 27, 32, 0.12)',
    mode: 'light',
  },
  // Maillot Manchester City (affiche : bleu ciel sur bleu nuit)
  'p-manchester-city': {
    backgroundColor: '#06122E',
    surfaceGradient: 'linear-gradient(135deg, #0E2B6B 0%, #0A1C44 55%, #154CB0 100%)',
    primaryColor: '#6CABDD',
    secondaryColor: '#0A1C44',
    accentColor: '#7EC8F0',
    textColor: '#FFFFFF',
    mutedTextColor: '#C3D9F2',
    buttonColor: '#6CABDD',
    glowColor: '#4FA3E8',
    glowIntensity: 0.55,
    borderColor: 'rgba(126, 200, 240, 0.30)',
    mode: 'dark',
  },
  // Maillot Arsenal (affiche : violet/magenta néon)
  'p-arsenal': {
    backgroundColor: '#150820',
    surfaceGradient: 'linear-gradient(135deg, #230B34 0%, #140719 60%, #3A1150 100%)',
    primaryColor: '#8B36D9',
    secondaryColor: '#1D0A2E',
    accentColor: '#E85BD0',
    textColor: '#FFFFFF',
    mutedTextColor: '#D9BFE8',
    buttonColor: '#D944C8',
    glowColor: '#D63BC8',
    glowIntensity: 0.65,
    borderColor: 'rgba(232, 91, 208, 0.30)',
    mode: 'dark',
  },
  // Maillot Paris Saint-Germain (affiche : bleu profond dégradé magenta)
  'p-psg': {
    backgroundColor: '#050B26',
    surfaceGradient: 'linear-gradient(160deg, #14246E 0%, #0A1540 48%, #5E1040 100%)',
    primaryColor: '#2E4FD0',
    secondaryColor: '#0A1540',
    accentColor: '#FF5A4A',
    textColor: '#FFFFFF',
    mutedTextColor: '#C2CDF3',
    buttonColor: '#D42B1F',
    glowColor: '#3D5BE8',
    glowIntensity: 0.55,
    borderColor: 'rgba(110, 140, 255, 0.30)',
    mode: 'dark',
  },
  // Maillot Espagne (affiche : bordeaux profond, détails or)
  'p-espagne': {
    backgroundColor: '#230608',
    surfaceGradient: 'linear-gradient(135deg, #3A0E12 0%, #1C0507 55%, #4A1216 100%)',
    primaryColor: '#A32430',
    secondaryColor: '#2B090C',
    accentColor: '#D9AE5F',
    textColor: '#FFF8F0',
    mutedTextColor: '#EBC9BC',
    buttonColor: '#D9AE5F',
    glowColor: '#C0392B',
    glowIntensity: 0.6,
    borderColor: 'rgba(217, 174, 95, 0.32)',
    mode: 'dark',
  },
  // Maillot Belgique (affiche : violet/or, stade lumineux)
  'p-belgique': {
    backgroundColor: '#17092B',
    surfaceGradient: 'linear-gradient(135deg, #2E1352 0%, #170A2C 55%, #3A1A66 100%)',
    primaryColor: '#6B2FD6',
    secondaryColor: '#221040',
    accentColor: '#E8B84B',
    textColor: '#FFFFFF',
    mutedTextColor: '#D4C2F0',
    buttonColor: '#E8B84B',
    glowColor: '#8A4BE8',
    glowIntensity: 0.6,
    borderColor: 'rgba(200, 150, 255, 0.28)',
    mode: 'dark',
  },
  // Maillot Stade Rennais (affiche : noir/rouge néon)
  'p-stade-rennais': {
    backgroundColor: '#200606',
    surfaceGradient: 'linear-gradient(135deg, #260808 0%, #0E0303 60%, #38100E 100%)',
    primaryColor: '#E23A2E',
    secondaryColor: '#1A0505',
    accentColor: '#FF6A5E',
    textColor: '#FFFFFF',
    mutedTextColor: '#F2CFC9',
    buttonColor: '#E23A2E',
    glowColor: '#FF3B30',
    glowIntensity: 0.65,
    borderColor: 'rgba(255, 106, 94, 0.30)',
    mode: 'dark',
  },
};

/**
 * THÈME DE SECOURS — appliqué automatiquement si un produit n'a pas de thème
 * enregistré (neutre premium or/sombre). Surchargable via le back-office plus tard.
 */
export const FALLBACK_THEME: ProductTheme = {
  backgroundColor: '#101319',
  surfaceGradient: 'linear-gradient(135deg, #171A22 0%, #101319 60%, #1E2230 100%)',
  primaryColor: '#F0A62B',
  secondaryColor: '#171A22',
  accentColor: '#F0A62B',
  textColor: '#FFFFFF',
  mutedTextColor: '#B8BDC9',
  buttonColor: '#F0A62B',
  glowColor: '#F0A62B',
  glowIntensity: 0.4,
  borderColor: 'rgba(240, 166, 43, 0.25)',
  mode: 'dark',
};
