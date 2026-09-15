import MessagesAdmin from '@/components/admin/MessagesAdmin';
import { getMessages } from '@/lib/admin/store';
import { rafraichirMessages } from '@/lib/server/commandesDirectes';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  // Résynchro : les messages arrivent du site public (autres instances Vercel).
  await rafraichirMessages();
  return (
    <div>
      <h1 className="title-tight text-2xl font-extrabold sm:text-3xl">Messages</h1>
      <p className="mt-1 text-sm text-[#9AA1B2]">Messages reçus via le formulaire de contact.</p>
      <div className="mt-5">
        <MessagesAdmin messages={getMessages()} />
      </div>
    </div>
  );
}
