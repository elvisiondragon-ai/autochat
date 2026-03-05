import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs font-medium border border-border/50 bg-card hover:bg-secondary/50 rounded-lg shadow-sm transition-all"
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
        >
            <span className="mr-1.5 text-base leading-none">
                {language === 'id' ? '🇮🇩' : '🇬🇧'}
            </span>
            {language === 'id' ? 'ID' : 'EN'}
        </Button>
    );
};
