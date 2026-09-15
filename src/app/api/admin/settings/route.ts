import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { exigerSession, erreurNonAutorise } from '@/lib/admin/guard';
import { enregistrerParametres, getParametres } from '@/lib/admin/store';
import type { ShopSettings } from '@/lib/data/types';

export async function GET() {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  return NextResponse.json({ parametres: getParametres() });
}

export async function PUT(request: Request) {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  const body = (await request.json()) as Partial<ShopSettings>;

  if (body.shopName != null && body.shopName.trim().length < 2) {
    return NextResponse.json({ erreur: { message: 'Nom de boutique trop court.' } }, { status: 400 });
  }
  if (body.email != null && body.email !== '' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    return NextResponse.json({ erreur: { message: 'Email invalide.' } }, { status: 400 });
  }

  enregistrerParametres({
    shopName: body.shopName?.trim(),
    slogan: body.slogan?.trim(),
    phone: body.phone?.trim(),
    whatsapp: body.whatsapp?.trim(),
    email: body.email?.trim(),
    address: body.address?.trim(),
    socialLinks: body.socialLinks,
    currency: body.currency?.trim() || 'FCFA',
    deliverySettings: body.deliverySettings,
    paymentSettings: body.paymentSettings,
    aboutText: body.aboutText,
    contactText: body.contactText,
  } as Partial<ShopSettings>);

  revalidatePath('/');
  revalidatePath('/contact');
  revalidatePath('/a-propos');
  revalidatePath('/admin/parametres');
  return NextResponse.json({ ok: true, parametres: getParametres() });
}
