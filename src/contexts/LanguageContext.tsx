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
    
    // Home page
    'home.welcome': 'Bem-vindo',
    'home.createQuiz.title': 'Criar Novo Quiz',
    'home.createQuiz.description': 'Use IA para gerar perguntas personalizadas',
    'home.createQuiz.content': 'Crie quizzes únicos baseados em seus próprios prompts e objetivos.',
    'home.myQuizzes.title': 'Meus Quiz',
    'home.myQuizzes.description': 'Visualize e jogue seus quizzes criados',
    'home.myQuizzes.content': 'Acesse todos os quizzes que você já criou e teste seus conhecimentos.',
    'home.howItWorks': 'Como funciona?',
    'home.step1.title': 'Descreva seu tema',
    'home.step1.description': 'Escreva sobre que assunto você quer criar o quiz',
    'home.step2.title': 'IA gera as perguntas',
    'home.step2.description': 'Nossa IA cria perguntas personalizadas automaticamente',
    'home.step3.title': 'Jogue e aprenda',
    'home.step3.description': 'Teste seus conhecimentos e veja seus resultados',
    
    // Auth page
    'auth.signin': 'Entrar',
    'auth.signup': 'Criar conta',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.confirmPassword': 'Confirmar senha',
    'auth.forgotPassword': 'Esqueci minha senha',
    'auth.resetPassword': 'Redefinir senha',
    'auth.dontHaveAccount': 'Não tem uma conta?',
    'auth.alreadyHaveAccount': 'Já tem uma conta?',
    'auth.signInWithGoogle': 'Entrar com Google',
    'auth.orContinueWith': 'Ou continue com',
    
    // Create Quiz page
    'createQuiz.title': 'Criar Novo Quiz',
    'createQuiz.prompt': 'Descreva o tema do seu quiz',
    'createQuiz.promptPlaceholder': 'Ex: Matemática básica para 5º ano, História do Brasil, Vocabulário em inglês...',
    'createQuiz.generate': 'Gerar Quiz',
    'createQuiz.generating': 'Gerando quiz...',
    'createQuiz.error': 'Erro ao gerar quiz. Tente novamente.',
    
    // My Quizzes page
    'myQuizzes.title': 'Meus Quizzes',
    'myQuizzes.noQuizzes': 'Você ainda não criou nenhum quiz.',
    'myQuizzes.createFirst': 'Criar meu primeiro quiz',
    'myQuizzes.play': 'Jogar',
    'myQuizzes.createdAt': 'Criado em',
    
    // Quiz Play page
    'quiz.question': 'Pergunta',
    'quiz.of': 'de',
    'quiz.next': 'Próxima',
    'quiz.finish': 'Finalizar',
    'quiz.results': 'Resultados',
    'quiz.score': 'Sua pontuação',
    'quiz.correct': 'Corretas',
    'quiz.playAgain': 'Jogar novamente',
    'quiz.backToQuizzes': 'Voltar aos meus quizzes',
    
    // Common
    'common.welcome': 'Bem-vindo',
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.cancel': 'Cancelar',
    'common.save': 'Salvar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
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
    
    // Home page
    'home.welcome': 'Welcome',
    'home.createQuiz.title': 'Create New Quiz',
    'home.createQuiz.description': 'Use AI to generate personalized questions',
    'home.createQuiz.content': 'Create unique quizzes based on your own prompts and objectives.',
    'home.myQuizzes.title': 'My Quizzes',
    'home.myQuizzes.description': 'View and play your created quizzes',
    'home.myQuizzes.content': 'Access all the quizzes you have created and test your knowledge.',
    'home.howItWorks': 'How does it work?',
    'home.step1.title': 'Describe your topic',
    'home.step1.description': 'Write about the subject you want to create the quiz about',
    'home.step2.title': 'AI generates questions',
    'home.step2.description': 'Our AI automatically creates personalized questions',
    'home.step3.title': 'Play and learn',
    'home.step3.description': 'Test your knowledge and see your results',
    
    // Auth page
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm password',
    'auth.forgotPassword': 'Forgot password',
    'auth.resetPassword': 'Reset password',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signInWithGoogle': 'Sign in with Google',
    'auth.orContinueWith': 'Or continue with',
    
    // Create Quiz page
    'createQuiz.title': 'Create New Quiz',
    'createQuiz.prompt': 'Describe your quiz topic',
    'createQuiz.promptPlaceholder': 'Ex: Basic math for 5th grade, Brazilian history, English vocabulary...',
    'createQuiz.generate': 'Generate Quiz',
    'createQuiz.generating': 'Generating quiz...',
    'createQuiz.error': 'Error generating quiz. Please try again.',
    
    // My Quizzes page
    'myQuizzes.title': 'My Quizzes',
    'myQuizzes.noQuizzes': "You haven't created any quizzes yet.",
    'myQuizzes.createFirst': 'Create my first quiz',
    'myQuizzes.play': 'Play',
    'myQuizzes.createdAt': 'Created at',
    
    // Quiz Play page
    'quiz.question': 'Question',
    'quiz.of': 'of',
    'quiz.next': 'Next',
    'quiz.finish': 'Finish',
    'quiz.results': 'Results',
    'quiz.score': 'Your score',
    'quiz.correct': 'Correct',
    'quiz.playAgain': 'Play again',
    'quiz.backToQuizzes': 'Back to my quizzes',
    
    // Common
    'common.welcome': 'Welcome',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
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