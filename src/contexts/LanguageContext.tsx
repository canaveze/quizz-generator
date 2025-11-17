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
    'header.myStudents': 'Meus alunos',
    'header.myResults': 'Meus resultados',
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
    'home.studentStep1.title': 'Acesse os quizzes',
    'home.studentStep1.description': 'Visualize os quizzes disponibilizados pelo seu professor',
    'home.studentStep2.title': 'Responda as perguntas',
    'home.studentStep2.description': 'Complete cada quiz no seu próprio ritmo',
    'home.studentStep3.title': 'Acompanhe seu progresso',
    'home.studentStep3.description': 'Veja suas pontuações e acompanhe seu desempenho',
    
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
    'myQuizzes.objective': 'Objetivo:',
    'myQuizzes.questions': 'perguntas',
    'myQuizzes.delete': 'Remover',
    'myQuizzes.deleteDialog.title': 'Remover Quiz',
    'myQuizzes.deleteDialog.description': 'Tem certeza que deseja remover o quiz "{name}"? Esta ação não pode ser desfeita.',
    'myQuizzes.deleteSuccess': 'Quiz removido',
    'myQuizzes.deleteSuccessDescription': 'O quiz "{name}" foi removido com sucesso.',
    'myQuizzes.loadError': 'Erro ao carregar quizzes',
    'myQuizzes.deleteError': 'Erro ao remover quiz',
    'myQuizzes.searchPlaceholder': 'Buscar quizzes por nome ou objetivo...',
    'myQuizzes.noResults': 'Nenhum quiz encontrado',
    'myQuizzes.noResultsDescription': 'Tente ajustar sua busca',
    
    'createQuiz.successDescription': 'Redirecionando para seus quizzes...',
    'createQuiz.errorDescription': 'Tente novamente mais tarde.',
    
    // Create Quiz page labels
    'createQuiz.name': 'Nome do Quiz',
    'createQuiz.namePlaceholder': 'Digite o nome do seu quiz',
    'createQuiz.objective': 'Objetivo',
    'createQuiz.objectivePlaceholder': 'Qual o objetivo deste quiz?',
    'createQuiz.description': 'Descrição/Prompt',
    'createQuiz.descriptionPlaceholder': 'Descreva sobre o que devem ser as perguntas do quiz...',
    'createQuiz.numberOfQuestions': 'Quantidade de Perguntas',
    'createQuiz.questionsCount': '{count} perguntas',
    
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
    
    // My Results page
    'myResults.title': 'Meus Resultados',
    'myResults.completed': 'Quizzes Realizados',
    'myResults.average': 'Média Geral',
    'myResults.best': 'Melhor Resultado',
    'myResults.totalCorrect': 'Total de Acertos',
    'myResults.history': 'Histórico',
    'myResults.noQuizzes': 'Você ainda não completou nenhum quiz',
    'myResults.excellent': 'Excelente',
    'myResults.good': 'Bom',
    'myResults.needsImprovement': 'Precisa Melhorar',
    
    // Student Rankings page
    'rankings.title': 'Meus Alunos',
    'rankings.pageTitle': 'Rankings dos Alunos',
    'rankings.overview': 'Visão Geral',
    'rankings.byQuiz': 'Por Quiz',
    'rankings.top3': 'Top 3 Alunos',
    'rankings.needSupport': 'Alunos que Precisam de Apoio',
    'rankings.noResults': 'Nenhum resultado disponível',
    'rankings.noRankings': 'Nenhum ranking disponível',
    'rankings.quiz': 'quiz',
    'rankings.quizzes': 'quizzes',
    'rankings.bestStudent': 'Melhor Aluno',
    'rankings.worstStudent': 'Aluno com Mais Dificuldade',
    'rankings.onlyOneStudent': 'Apenas um aluno fez este quiz',
    'rankings.noCompletedYet': 'Nenhum aluno completou este quiz ainda',
    'rankings.notCompleted': 'Alunos que não fizeram',
    'rankings.pending': 'Pendente',
    'rankings.searchQuizzes': 'Buscar quizzes por nome...',
    'rankings.noQuizzesFound': 'Nenhum quiz encontrado',
    'rankings.sendReminder': 'Enviar Lembrete',
    'rankings.reminderSent': 'Lembrete enviado',
    'rankings.reminderSentDescription': 'Lembrete enviado para {name} com sucesso',
    'rankings.reminderError': 'Erro ao enviar lembrete',
    'rankings.reminderErrorDescription': 'Não foi possível enviar o lembrete. Tente novamente.',
  },
  en: {
    // Header
    'header.home': 'Home',
    'header.createQuiz': 'Create Quiz',
    'header.myQuizzes': 'My Quizzes',
    'header.changePhoto': 'Change Photo',
    'header.profile': 'Profile',
    'header.myStudents': 'My Students',
    'header.myResults': 'My Results',
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
    'home.studentStep1.title': 'Access quizzes',
    'home.studentStep1.description': 'View quizzes made available by your teacher',
    'home.studentStep2.title': 'Answer the questions',
    'home.studentStep2.description': 'Complete each quiz at your own pace',
    'home.studentStep3.title': 'Track your progress',
    'home.studentStep3.description': 'See your scores and track your performance',
    
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
    'myQuizzes.objective': 'Objective:',
    'myQuizzes.questions': 'questions',
    'myQuizzes.delete': 'Delete',
    'myQuizzes.deleteDialog.title': 'Delete Quiz',
    'myQuizzes.deleteDialog.description': 'Are you sure you want to delete the quiz "{name}"? This action cannot be undone.',
    'myQuizzes.deleteSuccess': 'Quiz deleted',
    'myQuizzes.deleteSuccessDescription': 'The quiz "{name}" was successfully deleted.',
    'myQuizzes.loadError': 'Error loading quizzes',
    'myQuizzes.deleteError': 'Error deleting quiz',
    'myQuizzes.searchPlaceholder': 'Search quizzes by name or objective...',
    'myQuizzes.noResults': 'No quizzes found',
    'myQuizzes.noResultsDescription': 'Try adjusting your search',
    
    'createQuiz.successDescription': 'Redirecting to your quizzes...',
    'createQuiz.errorDescription': 'Please try again later.',
    
    // Create Quiz page labels
    'createQuiz.name': 'Quiz Name',
    'createQuiz.namePlaceholder': 'Enter your quiz name',
    'createQuiz.objective': 'Objective',
    'createQuiz.objectivePlaceholder': 'What is the objective of this quiz?',
    'createQuiz.description': 'Description/Prompt',
    'createQuiz.descriptionPlaceholder': 'Describe what the quiz questions should be about...',
    'createQuiz.numberOfQuestions': 'Number of Questions',
    'createQuiz.questionsCount': '{count} questions',
    
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
    
    // My Results page
    'myResults.title': 'My Results',
    'myResults.completed': 'Completed',
    'myResults.average': 'Average',
    'myResults.best': 'Best',
    'myResults.totalCorrect': 'Total Correct',
    'myResults.history': 'History',
    'myResults.noQuizzes': "You haven't completed any quizzes yet",
    'myResults.excellent': 'Excellent',
    'myResults.good': 'Good',
    'myResults.needsImprovement': 'Needs Improvement',
    
    // Student Rankings page
    'rankings.title': 'My Students',
    'rankings.pageTitle': 'Student Rankings',
    'rankings.overview': 'Overview',
    'rankings.byQuiz': 'By Quiz',
    'rankings.top3': 'Top 3 Students',
    'rankings.needSupport': 'Students Needing Support',
    'rankings.noResults': 'No results available',
    'rankings.noRankings': 'No rankings available',
    'rankings.quiz': 'quiz',
    'rankings.quizzes': 'quizzes',
    'rankings.bestStudent': 'Best Student',
    'rankings.worstStudent': 'Student with Most Difficulty',
    'rankings.onlyOneStudent': 'Only one student took this quiz',
    'rankings.noCompletedYet': 'No students have completed this quiz yet',
    'rankings.notCompleted': 'Students who haven\'t taken it',
    'rankings.pending': 'Pending',
    'rankings.searchQuizzes': 'Search quizzes by name...',
    'rankings.noQuizzesFound': 'No quizzes found',
    'rankings.sendReminder': 'Send Reminder',
    'rankings.reminderSent': 'Reminder sent',
    'rankings.reminderSentDescription': 'Reminder sent to {name} successfully',
    'rankings.reminderError': 'Error sending reminder',
    'rankings.reminderErrorDescription': 'Could not send the reminder. Please try again.',
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