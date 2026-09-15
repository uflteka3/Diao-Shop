import type { ShopSettings } from '@/lib/data/types';

/**
 * PARAMÈTRES DE DÉMONSTRATION — DONNÉES DE DÉMONSTRATION À REMPLACER.
 * - Aucune coordonnée inventée : téléphone, WhatsApp, email, adresse et
 *   réseaux sociaux sont volontairement VIDES — l'administrateur les remplira
 *   depuis le back-office (Phase 7).
 * - Zones de livraison : exemple Ouagadougou choisi par le client, à remplacer
 *   par les vraies zones et frais.
 * - Paiement : « Confirmation via WhatsApp » choisi par le client.
 */
export const DEMO_SETTINGS: ShopSettings = {
  shopName: 'Diao Shop',
  slogan: 'Le style de vos équipes, à portée de main', // issu des affiches — à valider par le client
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  socialLinks: {}, // vide : aucune coordonnée inventée
  currency: 'FCFA',
  deliverySettings: {
    // DONNÉES DE DÉMONSTRATION À REMPLACER (choix client : base Ouagadougou)
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
