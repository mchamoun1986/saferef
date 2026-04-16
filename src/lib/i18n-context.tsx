'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Lang } from '@/components/configurator/i18n';

const COOKIE_NAME = 'saferef-lang';
const DEFAULT_LANG: Lang = 'en';

function getLangFromCookie(): Lang {
  if (typeof document === 'undefined') return DEFAULT_LANG;
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([a-z]{2})`));
  const val = match?.[1] as Lang | undefined;
  return val && ['en', 'fr', 'sv', 'de', 'es'].includes(val) ? val : DEFAULT_LANG;
}

function setLangCookie(lang: Lang) {
  document.cookie = `${COOKIE_NAME}=${lang};path=/;max-age=${365 * 86400};SameSite=Lax`;
}

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextValue>({ lang: DEFAULT_LANG, setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const saved = getLangFromCookie();
    if (saved !== lang) setLangState(saved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    setLangCookie(newLang);
  }, []);

  return (
    <I18nContext value={{ lang, setLang }}>
      {children}
    </I18nContext>
  );
}

export function useLang(): I18nContextValue {
  return useContext(I18nContext);
}
