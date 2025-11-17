import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Trophy, TrendingDown, Award, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AppHeader } from '@/components/AppHeader';

interface StudentStats {
  user_id: number;
  name: string;
  email: string;
  total_quizzes: number;
  total_score: number;
  average_score: number;
}

interface QuizRanking {
  quiz_id: number;
  quiz_name: string;
  students: Array<{
    user_id: number;
    name: string;
    score: number;
    total: number;
    percentage: number;
    completed: boolean;
  }>;
}

export default function StudentRankings() {
  const [loading, setLoading] = useState(true);
  const [topStudents, setTopStudents] = useState<StudentStats[]>([]);
  const [bottomStudents, setBottomStudents] = useState<StudentStats[]>([]);
  const [quizRankings, setQuizRankings] = useState<QuizRanking[]>([]);
  const [quizSearchTerm, setQuizSearchTerm] = useState('');
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchRankings();
    }
  }, [isAdmin]);

  const fetchRankings = async () => {
    try {
      // Buscar todos os resultados
      const { data: results, error: resultsError } = await supabase
        .from('Results')
        .select(`
          user_id,
          quiz_id,
          score,
          total
        `);

      if (resultsError) throw resultsError;

      // Buscar informações dos usuários
      const { data: users, error: usersError } = await supabase
        .from('Users')
        .select('user_id, name, email, user_type')
        .eq('user_type', 'aluno');

      if (usersError) throw usersError;

      // Buscar informações dos quizzes
      const { data: quizzes, error: quizzesError } = await supabase
        .from('Quizzes')
        .select('quiz_id, name');

      if (quizzesError) throw quizzesError;

      // Calcular estatísticas gerais dos alunos
      const studentStatsMap = new Map<number, StudentStats>();

      results?.forEach((result) => {
        const user = users?.find(u => u.user_id === result.user_id);
        if (!user || user.user_type === 'adm') return;

        if (!studentStatsMap.has(result.user_id)) {
          studentStatsMap.set(result.user_id, {
            user_id: result.user_id,
            name: user.name || user.email || 'Unknown',
            email: user.email || '',
            total_quizzes: 0,
            total_score: 0,
            average_score: 0,
          });
        }

        const stats = studentStatsMap.get(result.user_id)!;
        stats.total_quizzes += 1;
        
        // Calcular porcentagem para cada resultado
        const percentage = result.total ? ((result.score || 0) / result.total) * 100 : 0;
        stats.total_score += percentage;
      });

      // Calcular média percentual
      const studentStats = Array.from(studentStatsMap.values()).map(stats => ({
        ...stats,
        average_score: stats.total_quizzes > 0 ? stats.total_score / stats.total_quizzes : 0,
      }));

      const sortedByAverage = [...studentStats].sort((a, b) => b.average_score - a.average_score);
      setTopStudents(sortedByAverage.slice(0, 3));
      setBottomStudents(sortedByAverage.slice(-3).reverse());

      // Calcular rankings por quiz
      const quizRankingsMap = new Map<number, QuizRanking>();

      quizzes?.forEach((quiz) => {
        quizRankingsMap.set(Number(quiz.quiz_id), {
          quiz_id: quiz.quiz_id,
          quiz_name: quiz.name || 'Unnamed Quiz',
          students: [],
        });
      });

      results?.forEach((result) => {
        const user = users?.find(u => u.user_id === result.user_id);
        if (!user || user.user_type === 'adm') return;

        const ranking = quizRankingsMap.get(Number(result.quiz_id));
        if (ranking) {
          ranking.students.push({
            user_id: result.user_id,
            name: user.name || user.email || 'Unknown',
            score: result.score || 0,
            total: result.total || 0,
            percentage: result.total ? ((result.score || 0) / result.total) * 100 : 0,
            completed: true,
          });
        }
      });

      // Adicionar alunos que não fizeram cada quiz
      quizRankingsMap.forEach((ranking) => {
        const completedUserIds = new Set(ranking.students.map(s => s.user_id));
        
        users?.forEach((user) => {
          if (!completedUserIds.has(user.user_id)) {
            ranking.students.push({
              user_id: user.user_id,
              name: user.name || user.email || 'Unknown',
              score: 0,
              total: 0,
              percentage: 0,
              completed: false,
            });
          }
        });

        // Ordenar: primeiro os que completaram (por porcentagem), depois os que não completaram
        ranking.students.sort((a, b) => {
          if (a.completed && !b.completed) return -1;
          if (!a.completed && b.completed) return 1;
          return b.percentage - a.percentage;
        });
      });

      setQuizRankings(Array.from(quizRankingsMap.values()));
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--fala-orange))]/10 to-[hsl(var(--fala-navy-light))]/10">
      <AppHeader title={t('rankings.title')} />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{t('rankings.pageTitle')}</h1>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">{t('rankings.overview')}</TabsTrigger>
            <TabsTrigger value="by-quiz">{t('rankings.byQuiz')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Top 3 Students */}
            <Card className="bg-background/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {t('rankings.top3')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topStudents.length === 0 ? (
                  <p className="text-foreground/85">{t('rankings.noResults')}</p>
                ) : (
                  <div className="space-y-4">
                    {topStudents.map((student, index) => (
                      <div key={student.user_id} className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge variant={index === 0 ? 'default' : 'secondary'} className="text-lg">
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-foreground/85">{student.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{student.average_score.toFixed(1)}</p>
                          <p className="text-sm text-foreground/85">
                            {student.total_quizzes} {student.total_quizzes === 1 ? t('rankings.quiz') : t('rankings.quizzes')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bottom 3 Students */}
            <Card className="bg-background/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                  {t('rankings.needSupport')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bottomStudents.length === 0 ? (
                  <p className="text-foreground/85">{t('rankings.noResults')}</p>
                ) : (
                  <div className="space-y-4">
                    {bottomStudents.map((student) => (
                      <div key={student.user_id} className="flex items-center justify-between p-4 bg-orange-500/5 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Award className="h-8 w-8 text-orange-500" />
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-foreground/85">{student.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{student.average_score.toFixed(1)}</p>
                          <p className="text-sm text-foreground/85">
                            {student.total_quizzes} {student.total_quizzes === 1 ? t('rankings.quiz') : t('rankings.quizzes')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-quiz" className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('rankings.searchQuizzes')}
                value={quizSearchTerm}
                onChange={(e) => setQuizSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {quizRankings.filter(q => 
              q.quiz_name.toLowerCase().includes(quizSearchTerm.toLowerCase())
            ).length === 0 ? (
              <Card className="bg-background/80 backdrop-blur-sm border-border/50">
                <CardContent className="py-12 text-center">
                  <p className="text-foreground/85">
                    {quizSearchTerm ? t('rankings.noQuizzesFound') : t('rankings.noRankings')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              quizRankings
                .filter(q => q.quiz_name.toLowerCase().includes(quizSearchTerm.toLowerCase()))
                .map((quizRanking) => {
                const completedStudents = quizRanking.students.filter(s => s.completed);
                const notCompletedStudents = quizRanking.students.filter(s => !s.completed);
                const bestStudent = completedStudents[0];
                const worstStudent = completedStudents.length > 0 ? completedStudents[completedStudents.length - 1] : null;
                const showBoth = completedStudents.length > 1 && bestStudent && worstStudent && bestStudent.user_id !== worstStudent.user_id;

                return (
                  <Card key={quizRanking.quiz_id} className="bg-background/80 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle>{quizRanking.quiz_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Best Student */}
                        {bestStudent && (
                          <div className="p-4 bg-primary/5 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Trophy className="h-6 w-6 text-yellow-500" />
                                <div>
                                  <p className="text-sm text-foreground/85 mb-1">{t('rankings.bestStudent')}</p>
                                  <p className="font-semibold">{bestStudent.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold">
                                  {bestStudent.score} / {bestStudent.total}
                                </p>
                                <p className="text-sm text-foreground/85">
                                  {bestStudent.percentage.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Worst Student */}
                        {showBoth && worstStudent && (
                          <div className="p-4 bg-orange-500/5 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <TrendingDown className="h-6 w-6 text-orange-500" />
                                <div>
                                  <p className="text-sm text-foreground/85 mb-1">{t('rankings.worstStudent')}</p>
                                  <p className="font-semibold">{worstStudent.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold">
                                  {worstStudent.score} / {worstStudent.total}
                                </p>
                                <p className="text-sm text-foreground/85">
                                  {worstStudent.percentage.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {completedStudents.length === 0 && (
                          <p className="text-sm text-foreground/85 text-center py-2">
                            {t('rankings.noCompletedYet')}
                          </p>
                        )}

                        {completedStudents.length === 1 && !showBoth && (
                          <p className="text-sm text-foreground/85 text-center py-2">
                            {t('rankings.onlyOneStudent')}
                          </p>
                        )}

                        {/* Students who haven't completed */}
                        {notCompletedStudents.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-border/50">
                            <p className="text-sm text-foreground/85 font-medium mb-3">
                              {t('rankings.notCompleted')} ({notCompletedStudents.length})
                            </p>
                            <div className="space-y-2">
                              {notCompletedStudents.map((student) => (
                                <div key={student.user_id} className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                                  <p className="text-sm">{student.name}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {t('rankings.pending')}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
