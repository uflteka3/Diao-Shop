import { NextResponse } from 'next/server';
import { commandeSchema } from '@/lib/validation/commande';
import { createOrder } from '@/lib/data/orderRepository';

/**
 * Création de commande — SERVEUR UNIQUEMENT.
 * Les prix, stocks et frais sont relus et recalculés ici (jamais depuis le client).
 * Erreurs renvoyées en français compréhensible ; détails techniques dans les logs.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = commandeSchema.safeParse(body);
    if (!parsed.success) {
      const premier = parsed.error.issues[0];
      return NextResponse.json(
        { erreur: { code: 'validation', message: premier?.message ?? 'Formulaire incomplet.' } },
        { status: 400 }
      );
    }

    const resultat = createOrder(parsed.data.customer, parsed.data.delivery, parsed.data.items);
    if (!resultat.ok) {
      return NextResponse.json(
        { erreur: { code: resultat.code, message: resultat.message } },
        { status: resultat.code === 'stock_insuffisant' ? 409 : 400 }
      );
    }

    return NextResponse.json(
      { numero: resultat.order.orderNumber, total: resultat.order.total },
      { status: 201 }
    );
  } catch (erreur) {
    console.error('[api/commandes] erreur:', erreur); // log développeur uniquement
    return NextResponse.json(
      { erreur: { code: 'interne', message: 'Une erreur est survenue. Merci de réessayer.' } },
      { status: 500 }
    );
  }
}
