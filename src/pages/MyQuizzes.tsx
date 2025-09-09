import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Play, Plus } from 'lucide-react';

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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('Quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setQuizzes(data || []);
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: "Erro ao carregar quizzes",
        description: error.message,
        variant: "destructive",
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handlePlayQuiz = (quizId: number) => {
    navigate(`/quiz/${quizId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Meus Quiz</h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/create-quiz')}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Quiz
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Sair
            </Button>
          </div>
        </div>

        {quizzes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">Nenhum quiz criado ainda</h2>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro quiz!
              </p>
              <Button onClick={() => navigate('/create-quiz')}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.quiz_id} className="hover:shadow-lg transition-shadow">
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
                  <Button 
                    className="w-full" 
                    onClick={() => handlePlayQuiz(quiz.quiz_id)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Jogar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}