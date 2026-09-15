'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

/** Upload + aperçu d'image (JPEG/PNG/WebP, 5 Mo max) — storage local démo, Supabase Storage en Phase 8. */
export default function ImageUploader({
  valeur,
  onChange,
  label,
  ariaLabel,
}: {
  valeur: string;
  onChange: (url: string) => void;
  label?: string;
  ariaLabel?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function televerser(fichier: File) {
    setErreur(null);
    setEnvoi(true);
    const fd = new FormData();
    fd.set('fichier', fichier);
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = (await r.json()) as { url?: string; erreur?: { message: string } };
    if (!r.ok || !data.url) setErreur(data.erreur?.message ?? 'Upload impossible.');
    else onChange(data.url);
    setEnvoi(false);
  }

  return (
    <div>
      {label && <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>}
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 flex-none overflow-hidden rounded-input border border-[#262B38] bg-[#12141C]">
          {valeur ? (
            <Image src={valeur} alt="" fill sizes="80px" className="object-contain p-1" />
          ) : (
            <span className="flex h-full items-center justify-center text-[10px] text-[#5D6472]">Aucune</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="text"
            value={valeur}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/demo/… ou https://…"
            aria-label={ariaLabel ?? label ?? 'URL de l’image'}
            className="focus-ring h-11 w-full rounded-input border border-[#262B38] bg-transparent px-3 text-[13px]"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={envoi}
              className="focus-ring rounded-input border border-[#262B38] px-3 py-2 text-[12.5px] font-semibold hover:bg-[#1B1F2B]"
            >
              {envoi ? 'Envoi…' : 'Téléverser un fichier'}
            </button>
            {valeur && (
              <button type="button" onClick={() => onChange('')} className="focus-ring text-[12px] text-[#FF5C5C] underline underline-offset-4">
                Retirer
              </button>
            )}
          </div>
          {erreur && <p className="text-[12px] text-[#FF5C5C]">{erreur}</p>}
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) televerser(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
