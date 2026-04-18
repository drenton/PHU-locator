import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Language } from '../types/phu';
import { t } from '../utils/i18n';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('phu-lang');
    return (stored === 'fr' ? 'fr' : 'en');
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('phu-lang', lang);
    document.documentElement.lang = lang;
    document.title = t('metaTitle', lang);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('metaDescription', lang));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  }, [language, setLanguage]);

  // Set title, meta description, and lang attribute on initial load
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('metaTitle', language);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('metaDescription', language));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
