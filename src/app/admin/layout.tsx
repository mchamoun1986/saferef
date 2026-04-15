import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminNav from './nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('refcalc-admin-session');

  if (!session?.value) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]" suppressHydrationWarning>
      <AdminNav />
      {children}
    </div>
  );
}
