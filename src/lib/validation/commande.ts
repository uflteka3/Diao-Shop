import { z } from 'zod';

/** Validation partagée client/serveur de la commande (Zod — stack Phase 2). */
export const commandeSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(3, 'Merci d’indiquer votre nom complet.'),
    phone: z
      .string()
      .trim()
      .min(8, 'Numéro de téléphone invalide — exemple : 70 12 34 56.')
      .max(20, 'Numéro trop long.'),
    whatsapp: z.string().trim().max(20).optional().or(z.literal('')),
    email: z.string().trim().email('Adresse email invalide.').optional().or(z.literal('')),
  }),
  delivery: z.object({
    address: z.string().trim().min(5, 'Merci d’indiquer votre adresse ou un lieu de livraison.'),
    city: z.string().trim().min(2, 'Merci d’indiquer votre ville.'),
    zoneId: z.string().trim().min(1, 'Merci de choisir une zone de livraison.'),
    notes: z.string().trim().max(500).optional().or(z.literal('')),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, 'Votre panier est vide.'),
});

export type CommandeInput = z.infer<typeof commandeSchema>;
