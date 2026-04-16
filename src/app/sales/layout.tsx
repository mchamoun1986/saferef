'use client';

import type { ReactNode } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function SalesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <nav className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] border-b-2 border-[#A7C031] px-6 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-wide">
            <span className="text-red-500">Safe</span>
            <span className="text-white">Ref</span>
          </span>
          <span className="text-gray-400 text-sm font-normal ml-1">Sales</span>
        </a>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <a href="/sales" className="px-4 py-1.5 rounded text-sm text-gray-300 hover:bg-white/10 transition-colors">Dashboard</a>
          <a href="/sales/quotes" className="px-4 py-1.5 rounded text-sm text-gray-300 hover:bg-white/10 transition-colors">Quotes</a>
          <a href="/selector" className="px-4 py-1.5 rounded text-sm font-medium text-[#0a1628] bg-[#A7C031] hover:bg-[#8fa828] transition-colors ml-2">New Quote &rarr;</a>
        </div>
      </nav>
      {children}
    </div>
  );
}
