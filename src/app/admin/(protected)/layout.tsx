import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AdminShell from '@/components/admin/AdminShell';
import { ADMIN_COOKIE, verifierToken } from '@/lib/admin/session';

export const metadata = { title: 'Administration' };

/** Garde serveur du back-office (redondant avec le middleware — défense en profondeur). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifierToken(cookies().get(ADMIN_COOKIE)?.value);
  if (!session) redirect('/admin/login');
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
