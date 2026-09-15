import type { ShopSettings } from '@/lib/data/types';

/**
 * PARAMÈTRES PAR DÉFAUT DE LA BOUTIQUE.
 * - Coordonnées réelles fournies par le gérant (septembre 2026) — modifiables
 *   à tout moment depuis le back-office (Paramètres).
 * - Zones de livraison : base Ouagadougou — frais donnés à titre indicatif,
 *   à ajuster depuis le back-office (Paramètres → Livraison).
 * - Paiement : « Confirmation via WhatsApp » (choix du gérant).
 */
export const DEMO_SETTINGS: ShopSettings = {
  shopName: 'Diao Shop',
  slogan: 'Le style de vos équipes, à portée de main',
  phone: '+226 74 11 97 50',
  whatsapp: '+226 73 98 52 49',
  email: 'amadoudi1210@gmail.com',
  address: 'Ouagadougou, Burkina Faso',
  socialLinks: {}, // renseigné depuis le back-office si besoin
  currency: 'FCFA',
  aboutText: `Bienvenue chez Diao Shop — la boutique burkinabè des maillots de football premium.

Nous sommes d'abord des passionnés de ballon rond. Notre mission est simple : vous permettre de porter fièrement les couleurs de vos équipes — grands clubs européens et sélections nationales — avec des maillots choisis avec exigence, au juste prix, ici à Ouagadougou.

Ce que nous vous garantissons :
• La qualité premium : des maillots légers, respirants et confortables, pensés pour le terrain comme pour la ville ;
• La transparence : le stock affiché est le stock réel — ce que vous voyez est disponible ;
• La simplicité : commandez en quelques clics, puis confirmez directement sur WhatsApp — sans carte bancaire ni frais cachés ;
• La proximité : une équipe joignable qui répond vite, du choix de la taille jusqu'à la livraison ;
• La rapidité : la livraison est assurée à Ouagadougou, quartier par quartier.

Chez Diao Shop, chaque maillot est une promesse : le style de vos équipes, à portée de main.`,
  contactText:
    'Une question sur un maillot, une taille ou une livraison ? L’équipe Diao Shop vous répond au plus vite — par téléphone, sur WhatsApp ou via le formulaire ci-contre.',
  deliverySettings: {
    // Base Ouagadougou — frais indicatifs modifiables dans le back-office.
    zones: [
      { id: 'ouaga-centre', label: 'Ouagadougou — Centre', fee: 1000 },
      { id: 'ouaga-peripherie', label: 'Ouagadougou — Périphérie', fee: 1500 },
      { id: 'autre', label: 'Autre ville / à préciser', fee: 0 },
    ],
  },
  paymentSettings: {
    method: 'whatsapp',
    label: 'Confirmation via WhatsApp',
    instructions:
      'Votre commande est confirmée et réglée via la conversation WhatsApp de la boutique. Après validation, nous vous contactons sur votre numéro pour finaliser.',
  },
};
