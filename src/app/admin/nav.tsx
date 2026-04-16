'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/gas', label: 'Refrigerants' },
  { href: '/admin/applications', label: 'Applications' },
  { href: '/admin/space-types', label: 'Space Types' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/calc-sheets', label: 'Calc Sheets' },
  { href: '/admin/engine', label: 'Engine' },
  { href: '/admin/engine-m2', label: 'Engine M2' },
  { href: '/admin/testlab', label: 'TestLab M1' },
  { href: '/admin/testlab-m2', label: 'TestLab M2' },
  { href: '/admin/simulator', label: 'Sim M1' },
  { href: '/admin/simulator-m2', label: 'Sim M2' },
  { href: '/admin/traceability', label: 'Traceability' },
  { href: '/sales', label: 'Sales' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#1a2332] text-white px-6 py-3 flex items-center gap-6">
      <Link href="/admin" className="text-red-500 font-bold text-lg tracking-wide">
        SafeRef <span className="text-gray-400 font-normal text-sm ml-1">Admin</span>
      </Link>
      <div className="flex gap-1 ml-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-1.5 rounded text-sm transition-colors ${
              pathname === link.href
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="ml-auto">
        <Link href="/configurator" className="text-gray-400 text-sm hover:text-white transition-colors">
          Configurator &rarr;
        </Link>
      </div>
    </nav>
  );
}
