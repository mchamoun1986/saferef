import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminNav from './nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]" suppressHydrationWarning>
      <AdminNav />
      {children}
    </div>
  );
}
