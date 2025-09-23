import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  pt: {
    // Header
    'header.home': 'Início',
    'header.createQuiz': 'Criar Quiz',
    'header.myQuizzes': 'Meus Quizzes',
    'header.changePhoto': 'Alterar Foto',
    'header.profile': 'Perfil',
    'header.logout': 'Sair',
    
    // Pages
    'page.home': 'FALA Education Quiz',
    'page.createQuiz': 'Criar Novo Quiz',
    'page.myQuizzes': 'Meus Quizzes',
    'page.playQuiz': 'Quiz',
    
    // Common
    'common.welcome': 'Bem-vindo',
    'common.loading': 'Carregando...',
  },
  en: {
    // Header
    'header.home': 'Home',
    'header.createQuiz': 'Create Quiz',
    'header.myQuizzes': 'My Quizzes',
    'header.changePhoto': 'Change Photo',
    'header.profile': 'Profile',
    'header.logout': 'Logout',
    
    // Pages
    'page.home': 'FALA Education Quiz',
    'page.createQuiz': 'Create New Quiz',
    'page.myQuizzes': 'My Quizzes',
    'page.playQuiz': 'Quiz',
    
    // Common
    'common.welcome': 'Welcome',
    'common.loading': 'Loading...',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('pt');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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