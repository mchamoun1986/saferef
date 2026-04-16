'use client';

import { useLang } from '@/lib/i18n-context';
import { LANGS, LANG_FLAGS, LANG_NAMES, type Lang } from '@/components/configurator/i18n';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();

  if (compact) {
    return (
      <select
        value={lang}
        onChange={e => setLang(e.target.value as Lang)}
        className="bg-transparent text-sm border border-white/20 rounded px-1.5 py-0.5 text-white cursor-pointer focus:outline-none"
      >
        {LANGS.map(l => (
          <option key={l} value={l} className="bg-[#16354B] text-white">
            {LANG_FLAGS[l]} {l.toUpperCase()}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {LANGS.map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
            l === lang
              ? 'bg-white/20 text-white font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
          title={LANG_NAMES[l]}
        >
          {LANG_FLAGS[l]}
        </button>
      ))}
    </div>
  );
}
