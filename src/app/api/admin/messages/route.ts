import { NextResponse } from 'next/server';
import { exigerSession, erreurNonAutorise } from '@/lib/admin/guard';
import { getMessages, marquerMessageLu, supprimerMessage } from '@/lib/admin/store';
import { flush } from '@/lib/server/persistence';

export async function GET() {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  return NextResponse.json({ messages: getMessages() });
}

export async function PUT(request: Request) {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  const { id, lu } = (await request.json()) as { id: string; lu: boolean };
  marquerMessageLu(id, Boolean(lu));
  await flush(); // serverless : persister avant la réponse
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  try {
    await exigerSession();
  } catch {
    return erreurNonAutorise();
  }
  const { id } = (await request.json()) as { id: string };
  supprimerMessage(id);
  await flush(); // serverless : persister avant la réponse
  return NextResponse.json({ ok: true });
}
