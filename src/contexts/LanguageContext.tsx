import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../locales/translations';

type TranslationKey = keyof typeof translations['id'];

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('id');

    useEffect(() => {
        const savedLang = localStorage.getItem('autochat_lang') as Language;
        if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('autochat_lang', lang);
    };

    const t = (key: string): string => {
        // Attempt to cast and grab translation.
        // If exact key doesn't exist, we fallback to the key string itself to prevent breaking crashes.
        return (translations[language] as any)[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
