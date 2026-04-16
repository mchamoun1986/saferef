'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type Role = 'admin' | 'sales' | 'management';

const ROLE_BADGE: Record<Role, { label: string; color: string }> = {
  admin: { label: 'ADMIN', color: 'bg-red-600' },
  sales: { label: 'SALES', color: 'bg-blue-600' },
  management: { label: 'MANAGEMENT', color: 'bg-green-600' },
};

export default function SalesLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    fetch('/api/session').then(r => r.json()).then(d => setRole(d.role ?? null)).catch(() => setRole(null));
  }, []);

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const badge = role ? ROLE_BADGE[role] : null;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <nav className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] border-b-2 border-[#A7C031] px-6 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-wide">
            <span className="text-red-500">Safe</span>
            <span className="text-white">Ref</span>
          </span>
          <span className="text-gray-400 text-sm font-normal ml-1">Sales</span>
        </Link>

        {badge && (
          <span className={`${badge.color} text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider`}>
            {badge.label}
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <LanguageSwitcher compact />
          <Link href="/sales" className="px-4 py-1.5 rounded text-sm text-gray-300 hover:bg-white/10 transition-colors">Dashboard</Link>
          <Link href="/sales/quotes" className="px-4 py-1.5 rounded text-sm text-gray-300 hover:bg-white/10 transition-colors">Quotes</Link>
          {role === 'admin' && (
            <Link href="/admin" className="px-4 py-1.5 rounded text-sm text-gray-300 hover:bg-white/10 transition-colors">Admin</Link>
          )}
          <Link href="/selector" className="px-4 py-1.5 rounded text-sm font-medium text-[#0a1628] bg-[#A7C031] hover:bg-[#8fa828] transition-colors">New Quote &rarr;</Link>
          {role && (
            <button onClick={handleLogout}
              className="text-gray-300 text-xs hover:text-white border border-white/20 hover:border-white/40 rounded px-3 py-1 transition-colors">
              Logout
            </button>
          )}
        </div>
      </nav>
      {children}
    </div>
  );
}
