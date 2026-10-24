"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { DEFAULT_LANGUAGE, isSupportedLanguage } from "@/lib/languages";
import { uiStrings, type UiStrings } from "@/lib/i18n";

const KEY = "indiagov:lang:v1";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

const getSnapshot = () => {
  const v = window.localStorage.getItem(KEY);
  return v && isSupportedLanguage(v) ? v : DEFAULT_LANGUAGE;
};
const getServerSnapshot = () => DEFAULT_LANGUAGE;

type Ctx = { lang: string; setLang: (code: string) => void; t: UiStrings };
const LanguageContext = createContext<Ctx>({
  lang: DEFAULT_LANGUAGE,
  setLang: () => {},
  t: uiStrings(DEFAULT_LANGUAGE),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setLang = useCallback((code: string) => {
    if (!isSupportedLanguage(code)) return;
    window.localStorage.setItem(KEY, code);
    document.documentElement.lang = code.split("-")[0];
    listeners.forEach((l) => l());
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang.split("-")[0];
  }, [lang]);
  const value = useMemo(() => ({ lang, setLang, t: uiStrings(lang) }), [lang, setLang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
