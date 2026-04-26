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
      {/* Float animation for R-code labels */}
      <style>{`@keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }`}</style>
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

      {/* Hero — Marketing */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0f2535] via-[#16354B] to-[#1e4a6a] px-4 sm:px-6 py-16 sm:py-24 text-center">
        {/* Floating R-codes */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <span className="absolute top-[8%] left-[5%] text-xs font-mono bg-white/5 text-white/20 px-2 py-1 rounded-md border border-white/5 animate-[float_8s_ease-in-out_infinite]">R-1234ze</span>
          <span className="absolute top-[12%] right-[8%] text-xs font-mono bg-[#E63946]/15 text-[#E63946]/40 px-2 py-1 rounded-md border border-[#E63946]/10 animate-[float_6s_ease-in-out_infinite_1s]">R-32</span>
          <span className="absolute top-[45%] left-[3%] text-xs font-mono bg-[#A7C031]/10 text-[#A7C031]/30 px-2 py-1 rounded-md border border-[#A7C031]/10 animate-[float_7s_ease-in-out_infinite_2s]">R-454B</span>
          <span className="absolute bottom-[30%] right-[4%] text-xs font-mono bg-[#E63946]/10 text-[#E63946]/30 px-2 py-1 rounded-md border border-[#E63946]/10 animate-[float_9s_ease-in-out_infinite_0.5s]">R-290</span>
          <span className="absolute bottom-[15%] left-[12%] text-xs font-mono bg-white/5 text-white/15 px-2 py-1 rounded-md border border-white/5 animate-[float_10s_ease-in-out_infinite_3s]">R-744</span>
          <span className="absolute top-[30%] right-[15%] text-xs font-mono bg-white/5 text-white/15 px-2 py-1 rounded-md border border-white/5 animate-[float_8s_ease-in-out_infinite_4s]">R-410A</span>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Stay safe with{' '}
            <br className="hidden sm:block" />
            every <span className="text-[#3DE8B0]">refrigerant.</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Refrigerants can be flammable, asphyxiating, toxic, and harmful to the climate.
            SafeRef helps you understand the risks, meet the regulations, and protect what matters.
          </p>

          {/* 4 Risk Icons */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8">
            {[
              { emoji: '\uD83D\uDD25', label: 'FLAMMABLE' },
              { emoji: '\uD83E\uDEC1', label: 'ASPHYXIATING' },
              { emoji: '\u2620\uFE0F', label: 'TOXIC' },
              { emoji: '\uD83C\uDF0D', label: 'CLIMATE' },
            ].map(({ emoji, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-2xl sm:text-3xl">
                  {emoji}
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <a href="#tools" className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#3DE8B0] text-[#0f2535] font-bold text-sm hover:bg-[#2fd9a0] transition-colors shadow-lg shadow-[#3DE8B0]/25">
              Be Safe — Start Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
            <a href="#features" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white/80 font-semibold text-sm hover:bg-white/5 transition-colors">
              Learn more <span className="text-xs">&#8595;</span>
            </a>
          </div>
          <p className="text-xs text-gray-500">Free &middot; No signup &middot; EN 378 &amp; F-Gas compliant</p>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="px-4 sm:px-6 py-12 sm:py-16 bg-gradient-to-b from-[#1e4a6a] to-[#16354B] scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">What do you need?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
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
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-10 sm:py-16 px-4 sm:px-6 bg-gray-50 scroll-mt-16">
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
