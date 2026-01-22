import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en, TranslationKeys } from '@/locales/en';
import { bn } from '@/locales/bn';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  isLoading: boolean;
}

const translations: Record<Language, TranslationKeys> = {
  en,
  bn,
};

const LANGUAGE_STORAGE_KEY = 'medflowx-language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  
  // Initialize from localStorage first for immediate effect
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'en' || stored === 'bn') {
        return stored;
      }
    }
    return 'en'; // Default to English
  });
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync with profile when available (profile takes precedence if set)
  useEffect(() => {
    if (profile?.language && !isInitialized) {
      const profileLang = profile.language as Language;
      if (profileLang === 'en' || profileLang === 'bn') {
        setLanguageState(profileLang);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, profileLang);
      }
      setIsInitialized(true);
    } else if (!profileLoading && !isInitialized) {
      // No profile or profile has no language, keep localStorage value
      setIsInitialized(true);
    }
  }, [profile, profileLoading, isInitialized]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Save to localStorage immediately
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    // Save to profile if user is logged in
    if (profile) {
      updateProfile.mutate({ language: lang });
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading: profileLoading && !isInitialized }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return default values if provider is not available yet
    // This can happen during initial render before providers are mounted
    return {
      language: 'en' as const,
      setLanguage: () => {},
      t: translations.en,
      isLoading: true,
    };
  }
  return context;
}
