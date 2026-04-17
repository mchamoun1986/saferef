'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

type Role = 'admin' | 'sales' | 'management';

interface NavLink {
  href: string;
  label: string;
  roles: Role[];
  group?: string;
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
  { href: '/admin/testlab', label: 'TestLab M1', roles: ['admin'], group: 'Lab & Sim' },
  { href: '/admin/testlab-m2', label: 'TestLab M2', roles: ['admin'], group: 'Lab & Sim' },
  { href: '/admin/simulator', label: 'Sim M1', roles: ['admin'], group: 'Lab & Sim' },
  { href: '/admin/simulator-m2', label: 'Sim M2', roles: ['admin'], group: 'Lab & Sim' },
  { href: '/admin/traceability', label: 'Traceability', roles: ['admin'] },
  { href: '/admin/quotes', label: 'Quotes', roles: ['admin', 'sales', 'management'] },
  { href: '/admin/architecture', label: 'Architecture', roles: ['admin'] },
  { href: '/admin/settings', label: 'Settings', roles: ['admin'] },
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

  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  const links = role ? ALL_LINKS.filter(l => l.roles.includes(role)) : [];
  const badge = role ? ROLE_BADGE[role] : null;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) setOpenGroup(null);
    }
    if (openGroup) { document.addEventListener('mousedown', handleClick); return () => document.removeEventListener('mousedown', handleClick); }
  }, [openGroup]);

  // Split links into flat + grouped
  const flatLinks = links.filter(l => !l.group);
  const groups = new Map<string, NavLink[]>();
  links.filter(l => l.group).forEach(l => {
    if (!groups.has(l.group!)) groups.set(l.group!, []);
    groups.get(l.group!)!.push(l);
  });

  // Insert groups at the position of their first item in ALL_LINKS
  const groupPositions = new Map<string, number>();
  ALL_LINKS.forEach((l, i) => { if (l.group && !groupPositions.has(l.group)) groupPositions.set(l.group, i); });

  type NavItem = { type: 'link'; link: NavLink } | { type: 'group'; name: string; links: NavLink[] };
  const navItems: NavItem[] = [];
  const usedGroups = new Set<string>();
  links.forEach(l => {
    if (l.group) {
      if (!usedGroups.has(l.group)) {
        usedGroups.add(l.group);
        navItems.push({ type: 'group', name: l.group, links: groups.get(l.group)! });
      }
    } else {
      navItems.push({ type: 'link', link: l });
    }
  });

  const labSimPaths = [...groups.values()].flat().map(l => l.href);
  const isLabSimActive = labSimPaths.includes(pathname);

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

      <div className="flex gap-1 overflow-x-auto items-center">
        {navItems.map((item) => {
          if (item.type === 'link') {
            return (
              <Link key={item.link.href} href={item.link.href}
                className={`px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap ${
                  pathname === item.link.href ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}>
                {item.link.label}
              </Link>
            );
          }
          // Group dropdown
          const isActive = item.links.some(l => pathname === l.href);
          return (
            <div key={item.name} className="relative" ref={groupRef}>
              <button onClick={() => setOpenGroup(openGroup === item.name ? null : item.name)}
                className={`px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap flex items-center gap-1 ${
                  isActive ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}>
                {item.name}
                <svg className={`w-3 h-3 transition-transform ${openGroup === item.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openGroup === item.name && (
                <div className="absolute top-full left-0 mt-1 bg-[#1a2332] border border-gray-700 rounded-lg shadow-xl z-50 min-w-[160px] overflow-hidden">
                  {item.links.map(l => (
                    <Link key={l.href} href={l.href} onClick={() => setOpenGroup(null)}
                      className={`block px-4 py-2.5 text-xs transition-colors ${
                        pathname === l.href ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                      }`}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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
