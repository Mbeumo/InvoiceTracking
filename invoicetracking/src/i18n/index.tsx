import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from './locales/en.json';
import fr from './locales/fr.json';

type LocaleKey = 'en' | 'fr';
type Messages = Record<string, string>;

const localeToMessages: Record<LocaleKey, Messages> = { en, fr } as const;

interface I18nContextValue {
    locale: LocaleKey;
    t: (key: string) => string;
    setLocale: (locale: LocaleKey) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocaleState] = useState<LocaleKey>('en');

    useEffect(() => {
        const saved = localStorage.getItem('locale') as LocaleKey | null;
        if (saved === 'en' || saved === 'fr') {
            setLocaleState(saved);
        } else {
            const browserLang = navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
            setLocaleState(browserLang as LocaleKey);
        }
    }, []);

    const setLocale = (l: LocaleKey) => {
        setLocaleState(l);
        localStorage.setItem('locale', l);
    };

    const t = useMemo(() => {
        const messages = localeToMessages[locale] || {};
        return (key: string) => messages[key] ?? key;
    }, [locale]);

    const value: I18nContextValue = useMemo(() => ({ locale, t, setLocale }), [locale, t]);
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
};


