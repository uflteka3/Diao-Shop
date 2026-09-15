import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { exigerSession, erreurNonAutorise } from '@/lib/admin/guard';

/** Upload d'images.
 *  - DATA_PROVIDER=mock : fichiers locaux public/uploads/ (démonstration) ;
 *  - DATA_PROVIDER=supabase : bucket Storage public « produits ».
 *  Validations identiques : JPEG/PNG/WebP, 5 Mo max. */
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const TAILLE_MAX = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  const formData = await request.formData();
  const fichier = formData.get('fichier') as File | null;
  if (!fichier) return NextResponse.json({ erreur: { message: 'Aucun fichier reçu.' } }, { status: 400 });
  if (!TYPES.includes(fichier.type)) {
    return NextResponse.json({ erreur: { message: 'Format non supporté (JPEG, PNG ou WebP).' } }, { status: 400 });
  }
  if (fichier.size > TAILLE_MAX) {
    return NextResponse.json({ erreur: { message: 'Fichier trop lourd (5 Mo maximum).' } }, { status: 400 });
  }

  const ext = fichier.type === 'image/png' ? 'png' : fichier.type === 'image/webp' ? 'webp' : 'jpg';
  const nom = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const contenu = new Uint8Array(await fichier.arrayBuffer());

  if (process.env.DATA_PROVIDER === 'supabase' && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Bucket créé automatiquement au premier upload (idempotent côté Supabase)
    await sb.storage.createBucket('produits', { public: true }).catch(() => undefined);
    const { error } = await sb.storage.from('produits').upload(nom, contenu, { contentType: fichier.type });
    if (error) {
      console.error('[upload] Supabase Storage :', error.message);
      return NextResponse.json({ erreur: { message: 'Téléversement impossible. Réessayez.' } }, { status: 500 });
    }
    const { data } = sb.storage.from('produits').getPublicUrl(nom);
    return NextResponse.json({ url: data.publicUrl }, { status: 201 });
  }

  const dossier = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dossier, { recursive: true });
  await writeFile(path.join(dossier, nom), contenu);
  return NextResponse.json({ url: `/uploads/${nom}` }, { status: 201 });
}
