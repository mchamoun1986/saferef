'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Role = 'admin' | 'sales' | 'management';

interface NavLink {
  href: string;
  label: string;
  roles: Role[];
}

const ALL_LINKS: NavLink[] = [
  { href: '/admin', label: 'Dashboard', roles: ['admin'] },
  { href: '/admin/gas', label: 'Refrigerants', roles: ['admin', 'management'] },
  { href: '/admin/applications', label: 'Applications', roles: ['admin', 'management'] },
  { href: '/admin/space-types', label: 'Space Types', roles: ['admin', 'management'] },
  { href: '/admin/products', label: 'Products', roles: ['admin', 'management'] },
  { href: '/admin/discount-matrix', label: 'Discounts', roles: ['admin', 'management'] },
  { href: '/admin/calc-sheets', label: 'Calc Sheets', roles: ['admin', 'management'] },
  { href: '/admin/engine', label: 'Engine', roles: ['admin'] },
  { href: '/admin/engine-m2', label: 'Engine M2', roles: ['admin'] },
  { href: '/admin/testlab', label: 'TestLab M1', roles: ['admin'] },
  { href: '/admin/testlab-m2', label: 'TestLab M2', roles: ['admin'] },
  { href: '/admin/simulator', label: 'Sim M1', roles: ['admin'] },
  { href: '/admin/simulator-m2', label: 'Sim M2', roles: ['admin'] },
  { href: '/admin/traceability', label: 'Traceability', roles: ['admin'] },
  { href: '/sales', label: 'Sales', roles: ['admin'] },
  { href: '/admin/architecture', label: 'Architecture', roles: ['admin'] },
];

const ROLE_BADGE: Record<Role, { label: string; color: string }> = {
  admin: { label: 'ADMIN', color: 'bg-red-600' },
  sales: { label: 'SALES', color: 'bg-blue-600' },
  management: { label: 'MANAGEMENT', color: 'bg-green-600' },
};

export default function AdminNav() {
  const pathname = usePathname();
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

  const links = role ? ALL_LINKS.filter(l => l.roles.includes(role)) : [];
  const badge = role ? ROLE_BADGE[role] : null;

  return (
    <nav className="bg-[#1a2332] text-white px-6 py-3 flex items-center gap-6">
      <Link href="/admin" className="flex items-center gap-2 shrink-0">
        <span className="text-red-500 font-bold text-lg tracking-wide">SafeRef</span>
        <span className="text-gray-400 font-normal text-sm">Admin</span>
      </Link>

      {badge && (
        <span className={`${badge.color} text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider`}>
          {badge.label}
        </span>
      )}

      <div className="flex gap-1 overflow-x-auto">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap ${
              pathname === link.href
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Link href="/calculator" className="text-gray-400 text-sm hover:text-white transition-colors">
          Calculator &rarr;
        </Link>
        {role && (
          <button onClick={handleLogout}
            className="text-gray-400 text-xs hover:text-white border border-gray-600 hover:border-gray-400 rounded px-3 py-1 transition-colors">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
