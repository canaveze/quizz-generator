import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Award, TrendingUp, Calendar } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

interface QuizResult {
  result_id: number;
  quiz_id: number;
  quiz_name: string;
  score: number;
  total: number;
  percentage: number;
  created_at: string;
}

interface Stats {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalCorrect: number;
  totalQuestions: number;
}

export default function MyResults() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalCorrect: 0,
    totalQuestions: 0,
  });
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      if (!user) return;

      // Buscar user_legacy_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_legacy_id')
        .eq('id', user.id)
        .single();

      if (!profile?.user_legacy_id) return;

      // Buscar resultados do aluno
      const { data: resultsData, error: resultsError } = await supabase
        .from('Results')
        .select(`
          result_id,
          quiz_id,
          score,
          total,
          created_at
        `)
        .eq('user_id', profile.user_legacy_id)
        .order('created_at', { ascending: false });

      if (resultsError) throw resultsError;

      // Buscar nomes dos quizzes
      const quizIds = [...new Set(resultsData?.map(r => r.quiz_id) || [])];
      const { data: quizzes } = await supabase
        .from('Quizzes')
        .select('quiz_id, name')
        .in('quiz_id', quizIds);

      // Combinar dados
      const formattedResults: QuizResult[] = (resultsData || []).map(result => {
        const quiz = quizzes?.find(q => q.quiz_id === result.quiz_id);
        return {
          result_id: result.result_id,
          quiz_id: result.quiz_id,
          quiz_name: quiz?.name || 'Unknown Quiz',
          score: result.score || 0,
          total: result.total || 0,
          percentage: result.total ? ((result.score || 0) / result.total) * 100 : 0,
          created_at: result.created_at,
        };
      });

      setResults(formattedResults);

      // Calcular estatísticas
      if (formattedResults.length > 0) {
        const totalCorrect = formattedResults.reduce((sum, r) => sum + r.score, 0);
        const totalQuestions = formattedResults.reduce((sum, r) => sum + r.total, 0);
        const averageScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
        const bestScore = Math.max(...formattedResults.map(r => r.percentage));

        setStats({
          totalQuizzes: formattedResults.length,
          averageScore,
          bestScore,
          totalCorrect,
          totalQuestions,
        });
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--fala-orange))]/10 to-[hsl(var(--fala-navy-light))]/10">
      <AppHeader title="Meus Resultados / My Results" />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Meus Resultados / My Results</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-foreground/85">Quizzes Realizados / Completed</p>
                  <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-foreground/85">Média Geral / Average</p>
                  <p className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-foreground/85">Melhor Resultado / Best</p>
                  <p className="text-2xl font-bold">{stats.bestScore.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-foreground/85">Total de Acertos / Total Correct</p>
                  <p className="text-2xl font-bold">
                    {stats.totalCorrect}/{stats.totalQuestions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results History */}
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico / History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/85">
                  Você ainda não completou nenhum quiz / You haven't completed any quizzes yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.result_id}
                    className="flex items-center justify-between p-4 bg-background/50 rounded-lg hover:bg-background/70 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{result.quiz_name}</h3>
                      <p className="text-sm text-foreground/85">
                        {new Date(result.created_at).toLocaleDateString()} -{' '}
                        {new Date(result.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-2xl font-bold">
                          {result.score}/{result.total}
                        </p>
                        <p className="text-sm text-foreground/85">
                          {result.percentage.toFixed(1)}%
                        </p>
                      </div>
                      <Badge
                        variant={result.percentage >= 70 ? 'default' : result.percentage >= 50 ? 'secondary' : 'destructive'}
                      >
                        {result.percentage >= 70 ? 'Excelente / Excellent' : result.percentage >= 50 ? 'Bom / Good' : 'Precisa Melhorar / Needs Improvement'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
