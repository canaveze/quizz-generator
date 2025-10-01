import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Play, Plus, Trash2 } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
interface Quiz {
  quiz_id: number;
  name: string;
  objective: string;
  total_questions: number;
  created_at: string;
}
export default function MyQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fetchQuizzes = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('Quizzes').select('*').eq('status', 'active').order('created_at', {
        ascending: false
      });
      if (error) {
        throw error;
      }
      setQuizzes(data || []);
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: "Erro ao carregar quizzes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (user) {
      fetchQuizzes();
    }
  }, [user]);
  const handlePlayQuiz = (quizId: number) => {
    navigate(`/quiz/${quizId}`);
  };
  const handleDeleteQuiz = async (quizId: number, quizName: string) => {
    try {
      const {
        error
      } = await supabase.from('Quizzes').update({
        status: 'inactive'
      }).eq('quiz_id', quizId);
      if (error) {
        throw error;
      }
      toast({
        title: "Quiz removido",
        description: `O quiz "${quizName}" foi removido com sucesso.`
      });

      // Refresh the quizzes list
      fetchQuizzes();
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      toast({
        title: "Erro ao remover quiz",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--fala-orange))]/10 to-[hsl(var(--fala-navy-light))]/10 relative">
      <AppHeader title={t('page.myQuizzes')} />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-end mb-6">
          
        </div>

        {quizzes.length === 0 ? <Card className="text-center py-12 bg-background/80 backdrop-blur-sm border-border/50">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">{t('myQuizzes.noQuizzes')}</h2>
              <p className="text-muted-foreground mb-4">
                {t('myQuizzes.createFirst')}
              </p>
              <Button onClick={() => navigate('/create-quiz')}>
                <Plus className="mr-2 h-4 w-4" />
                {t('myQuizzes.createFirst')}
              </Button>
            </CardContent>
          </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map(quiz => <Card key={quiz.quiz_id} className="hover:shadow-lg transition-shadow bg-background/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{quiz.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Objetivo:</p>
                    <p className="text-sm">{quiz.objective}</p>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{quiz.total_questions} perguntas</span>
                    <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => handlePlayQuiz(quiz.quiz_id)}>
                      <Play className="mr-2 h-4 w-4" />
                      {t('myQuizzes.play')}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Quiz</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover o quiz "{quiz.name}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.quiz_id, quiz.name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </div>;
}