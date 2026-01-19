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

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language from profile on mount
  useEffect(() => {
    if (profile?.language && !isInitialized) {
      const profileLang = profile.language as Language;
      if (profileLang === 'en' || profileLang === 'bn') {
        setLanguageState(profileLang);
      }
      setIsInitialized(true);
    } else if (!profileLoading && !profile && !isInitialized) {
      // No profile, use default
      setIsInitialized(true);
    }
  }, [profile, profileLoading, isInitialized]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Save to profile
    updateProfile.mutate({ language: lang });
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
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
