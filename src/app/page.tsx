'use client';

import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLang } from '@/lib/i18n-context';
import { HOME, t } from '@/lib/i18n-common';

export default function Home() {
  const { lang } = useLang();
  const h = t(HOME, lang);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b-2 border-[#E63946]">
        <div className="flex items-center gap-1">
          <span className="text-[#E63946] font-extrabold text-xl tracking-wide">Safe</span>
          <span className="text-white font-extrabold text-xl">Ref</span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher compact />
          <Link href="/login" className="text-gray-500 hover:text-gray-300 transition-colors" title="Staff access">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 text-center bg-gradient-to-b from-[#16354B] to-[#1e4a6a]">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
          <span className="text-[#E63946]">Safe</span>Ref
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mb-2">
          {h.subtitle}
        </p>
        <p className="text-sm sm:text-base text-gray-400 max-w-xl mb-12">
          {h.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
          <Link href="/calculator"
            className="group bg-white/5 backdrop-blur border-2 border-white/10 hover:border-[#E63946] rounded-2xl p-5 sm:p-8 text-left transition-all hover:bg-white/10">
            <div className="w-14 h-14 rounded-xl bg-[#E63946] flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{h.designerTitle}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{h.designerDesc}</p>
            <span className="inline-flex items-center gap-1 text-[#E63946] font-semibold text-sm group-hover:gap-2 transition-all">
              {h.startDesigner}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>

          <Link href="/selector"
            className="group bg-white/5 backdrop-blur border-2 border-white/10 hover:border-[#A7C031] rounded-2xl p-5 sm:p-8 text-left transition-all hover:bg-white/10">
            <div className="w-14 h-14 rounded-xl bg-[#A7C031] flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{h.selectorTitle}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{h.selectorDesc}</p>
            <span className="inline-flex items-center gap-1 text-[#A7C031] font-semibold text-sm group-hover:gap-2 transition-all">
              {h.startSelector}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>

          <Link href="/fgas-checker"
            className="group bg-white/5 backdrop-blur border-2 border-white/10 hover:border-[#2196F3] rounded-2xl p-5 sm:p-8 text-left transition-all hover:bg-white/10">
            <div className="w-14 h-14 rounded-xl bg-[#2196F3] flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{h.fgasTitle}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{h.fgasDesc}</p>
            <span className="inline-flex items-center gap-1 text-[#2196F3] font-semibold text-sm group-hover:gap-2 transition-all">
              {h.startFgas}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#16354B] text-center mb-12">{h.featuresTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: h.multiReg, desc: h.multiRegDesc, color: '#16354B', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { title: h.refrigerants, desc: h.refrigerantsDesc, color: '#E63946', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
              { title: h.products, desc: h.productsDesc, color: '#A7C031', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
              { title: h.pdfQuotes, desc: h.pdfQuotesDesc, color: '#16354B', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            ].map(({ title, desc, color, icon }) => (
              <div key={title} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: color }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#16354B] mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#16354B] text-gray-400 text-center py-6 text-sm">
        Powered by <span className="text-white font-semibold">SafeRef</span> — {h.footer}
      </footer>
    </div>
  );
}
