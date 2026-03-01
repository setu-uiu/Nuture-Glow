
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';
import { translations } from './translations';

interface I18nContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (keyPath: string, variables?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Language>(() => {
    const saved = localStorage.getItem('nurture_glow_locale');
    return (saved as Language) || 'en';
  });

  const setLocale = (lang: Language) => {
    setLocaleState(lang);
    localStorage.setItem('nurture_glow_locale', lang);
  };

  // Apply lang attribute to body for font switching
  useEffect(() => {
    document.documentElement.setAttribute('lang', locale);
    document.body.setAttribute('lang', locale);
  }, [locale]);

  const t = (keyPath: string, variables?: Record<string, string>): string => {
    const keys = keyPath.split('.');
    let value: any = translations[locale];

    for (const key of keys) {
      value = value?.[key];
    }

    if (typeof value !== 'string') return keyPath;

    if (variables) {
      let replaced = value;
      Object.entries(variables).forEach(([key, val]) => {
        replaced = replaced.replace(`{${key}}`, val);
      });
      return replaced;
    }

    return value;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslations = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslations must be used within an I18nProvider');
  }
  return context;
};
