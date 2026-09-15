'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ContactMessage } from '@/lib/admin/store';

export default function MessagesAdmin({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [occupe, setOccupe] = useState<string | null>(null);

  async function marquerLu(id: string, lu: boolean) {
    setOccupe(id);
    await fetch('/api/admin/messages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, lu }),
    });
    setOccupe(null);
    router.refresh();
  }

  async function supprimer(id: string) {
    if (!window.confirm('Supprimer ce message ?')) return;
    setOccupe(id);
    await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setOccupe(null);
    router.refresh();
  }

  if (messages.length === 0) {
    return (
      <p className="rounded-panel border border-dashed border-[#262B38] p-8 text-center text-sm text-[#9AA1B2]">
        Aucun message — ceux du formulaire « Contact » arriveront ici.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {messages.map((m) => (
        <li key={m.id} className="rounded-panel border border-[#262B38] bg-[#161922] p-4" style={{ opacity: occupe === m.id ? 0.5 : 1 }}>
          <div className="flex flex-wrap items-center gap-3">
            <p className="min-w-0 flex-1 font-bold">
              {m.name} {!m.lu && <span className="ml-1 rounded-pill bg-[rgba(92,168,255,.15)] px-2 py-0.5 text-[10.5px] font-bold text-[#5CA8FF]">Nouveau</span>}
            </p>
            <p className="text-[12px] text-[#9AA1B2]">{new Date(m.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</p>
          </div>
          <p className="mt-1 text-[12.5px] text-[#9AA1B2]">
            {m.email && <>✉️ {m.email} </>}
            {m.phone && <>📞 {m.phone}</>}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm">{m.message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => marquerLu(m.id, !m.lu)} className="focus-ring rounded-input border border-[#262B38] px-3 py-2 text-[12.5px] font-semibold hover:bg-[#1B1F2B]">
              {m.lu ? 'Marquer non lu' : 'Marquer lu'}
            </button>
            <button type="button" onClick={() => supprimer(m.id)} className="focus-ring rounded-input border border-[#3A1E1E] px-3 py-2 text-[12.5px] font-semibold text-[#FF5C5C] hover:bg-[#1B1F2B]">
              Supprimer
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
