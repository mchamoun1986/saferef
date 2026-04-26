'use client';

import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLang } from '@/lib/i18n-context';
import { HOME, t } from '@/lib/i18n-common';

export default function Home() {
  const { lang } = useLang();
  const h = t(HOME, lang);

  const RISK_COLORS = {
    fire: { border: 'border-t-[#E63946]', tag: 'bg-red-50 text-[#E63946]' },
    suff: { border: 'border-t-[#E63946]', tag: 'bg-red-50 text-[#E63946]' },
    poison: { border: 'border-t-[#2196F3]', tag: 'bg-blue-50 text-[#2196F3]' },
    climate: { border: 'border-t-[#7C3AED]', tag: 'bg-purple-50 text-[#7C3AED]' },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
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

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0f2535] via-[#16354B] to-[#1e4a6a] px-4 sm:px-6 py-16 sm:py-24 text-center">
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
            {h.heroHeadline1}{' '}<br className="hidden sm:block" />
            {h.heroHeadline2} <span className="text-[#3DE8B0]">{h.heroHeadlineAccent}</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300/90 max-w-2xl mx-auto mb-8 leading-relaxed">{h.heroSubtitle}</p>
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8">
            {[
              { emoji: '\uD83D\uDD25', label: h.riskFlammable },
              { emoji: '\uD83E\uDEC1', label: h.riskAsphyxiating },
              { emoji: '\u2620\uFE0F', label: h.riskToxic },
              { emoji: '\uD83C\uDF0D', label: h.riskClimate },
            ].map(({ emoji, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-2xl sm:text-3xl">{emoji}</div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <a href="#tools" className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#3DE8B0] text-[#0f2535] font-bold text-sm hover:bg-[#2fd9a0] transition-colors shadow-lg shadow-[#3DE8B0]/25">
              {h.heroCta} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
            <a href="#safety" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white/80 font-semibold text-sm hover:bg-white/5 transition-colors">
              {h.heroLearn} <span className="text-xs">&#8595;</span>
            </a>
          </div>
          <p className="text-xs text-gray-500">{h.heroTrust}</p>
        </div>
      </section>

      {/* ═══ TOOLS ═══ */}
      <section id="tools" className="px-4 sm:px-6 py-12 sm:py-16 bg-gradient-to-b from-[#1e4a6a] to-[#16354B] scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">{h.toolsHeading}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <Link href="/calculator" className="group bg-white/5 backdrop-blur border-2 border-white/10 hover:border-[#E63946] rounded-2xl p-5 sm:p-8 text-left transition-all hover:bg-white/10">
              <div className="w-14 h-14 rounded-xl bg-[#E63946] flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{h.designerTitle}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{h.designerDesc}</p>
              <span className="inline-flex items-center gap-1 text-[#E63946] font-semibold text-sm group-hover:gap-2 transition-all">{h.startDesigner} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></span>
            </Link>
            <Link href="/selector" className="group bg-white/5 backdrop-blur border-2 border-white/10 hover:border-[#A7C031] rounded-2xl p-5 sm:p-8 text-left transition-all hover:bg-white/10">
              <div className="w-14 h-14 rounded-xl bg-[#A7C031] flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{h.selectorTitle}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{h.selectorDesc}</p>
              <span className="inline-flex items-center gap-1 text-[#A7C031] font-semibold text-sm group-hover:gap-2 transition-all">{h.startSelector} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></span>
            </Link>
            <Link href="/fgas-checker" className="group bg-white/5 backdrop-blur border-2 border-white/10 hover:border-[#2196F3] rounded-2xl p-5 sm:p-8 text-left transition-all hover:bg-white/10">
              <div className="w-14 h-14 rounded-xl bg-[#2196F3] flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{h.fgasTitle}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{h.fgasDesc}</p>
              <span className="inline-flex items-center gap-1 text-[#2196F3] font-semibold text-sm group-hover:gap-2 transition-all">{h.startFgas} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOUR RISKS ═══ */}
      <section id="safety" className="py-14 sm:py-20 px-4 sm:px-6 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#E63946] mb-2">{h.risksLabel}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#16354B] mb-3">{h.risksHeading}</h2>
          <p className="text-gray-500 max-w-xl mb-10">{h.risksSubtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { k: 'fire' as const, emoji: '\uD83D\uDD25', tagLabel: h.riskFlammable, title: h.riskFireTitle, desc: h.riskFireDesc, tag1: h.riskFireTag1, tag2: h.riskFireTag2, refs: h.riskFireRefs },
              { k: 'suff' as const, emoji: '\uD83E\uDEC1', tagLabel: h.riskAsphyxiating, title: h.riskSuffTitle, desc: h.riskSuffDesc, tag1: h.riskSuffTag1, tag2: h.riskSuffTag2, refs: h.riskSuffRefs },
              { k: 'poison' as const, emoji: '\u2620\uFE0F', tagLabel: h.riskToxic, title: h.riskPoisonTitle, desc: h.riskPoisonDesc, tag1: h.riskPoisonTag1, tag2: h.riskPoisonTag2, refs: h.riskPoisonRefs },
              { k: 'climate' as const, emoji: '\uD83C\uDF0D', tagLabel: h.riskClimate, title: h.riskClimateTitle, desc: h.riskClimateDesc, tag1: h.riskClimateTag1, tag2: h.riskClimateTag2, refs: h.riskClimateRefs },
            ].map(({ k, emoji, tagLabel, title, desc, tag1, tag2, refs }) => (
              <div key={k} className={`bg-white rounded-xl border border-gray-200 ${RISK_COLORS[k].border} border-t-4 p-6 hover:shadow-lg transition-shadow`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">{emoji}</div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${RISK_COLORS[k].tag}`}>{tagLabel}</span>
                </div>
                <h3 className="text-lg font-extrabold text-[#16354B] mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{desc}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-medium text-[#16354B] bg-gray-100 px-2 py-1 rounded border border-gray-200">{tag1}</span>
                  <span className="text-[10px] font-medium text-[#16354B] bg-gray-100 px-2 py-1 rounded border border-gray-200">{tag2}</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{refs}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPLIANCE BRIDGE ═══ */}
      <section className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] px-4 sm:px-6 py-12 sm:py-16 text-center">
        <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          {h.complianceLine
            .replace(/<en378>(.*?)<\/en378>/g, '')
            .replace(/<fgas>(.*?)<\/fgas>/g, '')
            .replace(/<safe>(.*?)<\/safe>/g, '')
            .split(/(<en378>|<\/en378>|<fgas>|<\/fgas>|<safe>|<\/safe>)/)
            .length > 0 && (
            <>
              {h.complianceLine.split(/<\/?(?:en378|fgas|safe)>/g).map((part: string, i: number) => {
                if (i === 1) return <span key={i} className="font-extrabold text-white">{part}</span>;
                if (i === 2) return <span key={i} className="font-extrabold text-white">{part}</span>;
                if (i === 3) return <span key={i} className="text-[#3DE8B0] font-bold">{part}</span>;
                return <span key={i}>{part}</span>;
              })}
            </>
          )}
        </p>
      </section>

      {/* ═══ HOW DETECTION WORKS ═══ */}
      <section id="detection" className="py-14 sm:py-20 px-4 sm:px-6 bg-gray-50 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#A7C031] mb-2">{h.detectionLabel}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#16354B] mb-3">{h.detectionHeading}</h2>
          <p className="text-gray-500 max-w-xl mb-10">{h.detectionSubtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: h.detectMonitorTitle, desc: h.detectMonitorDesc, note: h.detectMonitorNote, emoji: '\uD83D\uDC41\uFE0F', bg: 'bg-blue-50' },
              { title: h.detectAlarmTitle, desc: h.detectAlarmDesc, note: h.detectAlarmNote, emoji: '\uD83D\uDEA8', bg: 'bg-red-50' },
              { title: h.detectResponseTitle, desc: h.detectResponseDesc, note: h.detectResponseNote, emoji: '\uD83D\uDC9A', bg: 'bg-green-50' },
            ].map(({ title, desc, note, emoji, bg }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center text-2xl mx-auto mb-4`}>{emoji}</div>
                <h3 className="text-lg font-bold text-[#16354B] mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{desc}</p>
                <p className="text-xs text-[#A7C031] italic">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REFRIGERANT SPOTLIGHT ═══ */}
      <section id="refrigerants" className="py-14 sm:py-20 px-4 sm:px-6 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2196F3] mb-2">{h.refLabel}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#16354B] mb-3">{h.refHeading}</h2>
          <p className="text-gray-500 max-w-xl mb-10">{h.refSubtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* R-744 */}
            <div className="rounded-xl border border-gray-200 border-t-4 border-t-[#E63946] p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-extrabold text-[#E63946] mb-1">R-744</h3>
              <p className="text-sm text-gray-500 mb-3">{h.ref744Name}</p>
              <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-red-50 text-[#E63946]">{h.ref744Tag}</span>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><span className="text-[#E63946] mt-0.5">&#8226;</span>{h.ref744B1}</li>
                <li className="flex items-start gap-2"><span className="text-[#E63946] mt-0.5">&#8226;</span>{h.ref744B2}</li>
                <li className="flex items-start gap-2"><span className="text-[#E63946] mt-0.5">&#8226;</span>{h.ref744B3}</li>
                <li className="flex items-start gap-2"><span className="text-[#E63946] mt-0.5">&#8226;</span>{h.ref744B4}</li>
              </ul>
              <p className="mt-4 text-[10px] text-gray-400">{h.ref744Footer}</p>
            </div>
            {/* R-410A */}
            <div className="rounded-xl border border-gray-200 border-t-4 border-t-[#2196F3] p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-extrabold text-[#2196F3] mb-1">R-410A</h3>
              <p className="text-sm text-gray-500 mb-3">{h.ref410Name}</p>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-blue-50 text-[#2196F3]">{h.ref410Tag1}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-red-50 text-[#E63946]">{h.ref410Tag2}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><span className="text-[#2196F3] mt-0.5">&#8226;</span>{h.ref410B1}</li>
                <li className="flex items-start gap-2"><span className="text-[#2196F3] mt-0.5">&#8226;</span>{h.ref410B2}</li>
                <li className="flex items-start gap-2"><span className="text-[#2196F3] mt-0.5">&#8226;</span>{h.ref410B3}</li>
                <li className="flex items-start gap-2"><span className="text-[#2196F3] mt-0.5">&#8226;</span>{h.ref410B4}</li>
              </ul>
              <p className="mt-4 text-[10px] text-gray-400">{h.ref410Footer}</p>
            </div>
            {/* R-717 */}
            <div className="rounded-xl border border-gray-200 border-t-4 border-t-[#7C3AED] p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-extrabold text-[#7C3AED] mb-1">R-717</h3>
              <p className="text-sm text-gray-500 mb-3">{h.ref717Name}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-gray-100 text-gray-700">{h.ref717Tag1}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-red-50 text-[#E63946]">{h.ref717Tag2}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-red-50 text-[#E63946]">{h.ref717Tag3}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><span className="text-[#7C3AED] mt-0.5">&#8226;</span>{h.ref717B1}</li>
                <li className="flex items-start gap-2"><span className="text-[#7C3AED] mt-0.5">&#8226;</span>{h.ref717B2}</li>
                <li className="flex items-start gap-2"><span className="text-[#7C3AED] mt-0.5">&#8226;</span>{h.ref717B3}</li>
                <li className="flex items-start gap-2"><span className="text-[#7C3AED] mt-0.5">&#8226;</span>{h.ref717B4}</li>
              </ul>
              <p className="mt-4 text-[10px] text-gray-400">{h.ref717Footer}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STANDARDS BAR ═══ */}
      <section className="py-8 px-4 sm:px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">{h.standardsLabel}</p>
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap text-sm sm:text-base font-semibold text-[#16354B]">
            <span>EN 378</span>
            <span>EN 14624</span>
            <span>EU 2024/573</span>
            <span>ASHRAE 15</span>
            <span>ISO 5149</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#16354B] text-gray-400 text-center py-6 text-sm">
        Powered by <span className="text-white font-semibold">SafeRef</span> — {h.footer}
      </footer>
    </div>
  );
}
