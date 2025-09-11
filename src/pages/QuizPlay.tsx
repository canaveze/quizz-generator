import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { SplashCursor } from '@/components/ui/splash-cursor';
import { Spotlight } from '@/components/ui/spotlight';

interface Question {
  question_id: number;
  question_text: string;
  correct_answer_id: number;
  answers: Answer[];
}

interface Answer {
  answer_id: number;
  answer_text: string;
  is_correct: boolean;
}

interface QuizResult {
  question: Question;
  selectedAnswerId: number | null;
  isCorrect: boolean;
}

export default function QuizPlay() {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (quizId && user) {
      fetchQuizData();
    }
  }, [quizId, user]);

  const fetchQuizData = async () => {
    try {
      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('Quizzes')
        .select('*')
        .eq('quiz_id', parseInt(quizId!))
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('Questions')
        .select('*')
        .eq('quiz_id', quizId!);

      if (questionsError) throw questionsError;

      // Fetch answers for each question
      const questionsWithAnswers: Question[] = [];
      for (const question of questionsData || []) {
        const { data: answersData, error: answersError } = await supabase
          .from('Answers')
          .select('*')
          .eq('question_id', question.question_id);

        if (answersError) throw answersError;

        questionsWithAnswers.push({
          question_id: question.question_id,
          question_text: String(question.question_text || ''),
          correct_answer_id: question.correct_answer_id || 0,
          answers: answersData || []
        });
      }

      setQuestions(questionsWithAnswers);
    } catch (error: any) {
      console.error('Error fetching quiz:', error);
      toast({
        title: "Erro ao carregar quiz",
        description: error.message,
        variant: "destructive",
      });
      navigate('/my-quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerId: number) => {
    setSelectedAnswerId(answerId);
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion.answers.find(a => a.answer_id === selectedAnswerId);
    
    const result: QuizResult = {
      question: currentQuestion,
      selectedAnswerId,
      isCorrect: selectedAnswer?.is_correct || false,
    };

    setResults([...results, result]);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswerId(null);
    } else {
      finishQuiz([...results, result]);
    }
  };

  const finishQuiz = async (finalResults: QuizResult[]) => {
    setIsFinished(true);
    
    try {
      // Get user profile for legacy_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_legacy_id')
        .eq('id', user?.id)
        .single();

      if (profile) {
        const correctAnswers = finalResults.filter(r => r.isCorrect).length;
        
        // Save result to database
        const { data: result, error: resultError } = await supabase
          .from('Results')
          .insert({
            user_id: profile.user_legacy_id,
            quiz_id: parseInt(quizId!),
            score: correctAnswers,
            total: questions.length,
          })
          .select()
          .single();

        if (resultError) throw resultError;

        // Save user answers
        for (const res of finalResults) {
          if (res.selectedAnswerId) {
            await supabase
              .from('User_Answers')
              .insert({
                result_id: result.result_id,
                question_id: res.question.question_id,
                answer_id: res.selectedAnswerId,
              });
          }
        }
      }
    } catch (error: any) {
      console.error('Error saving results:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <SplashCursor />
        <Card className="relative text-center bg-background/80 backdrop-blur-sm border-border/50 overflow-hidden">
          <Spotlight className="from-primary/30 via-primary/20 to-transparent" size={200} />
          <CardContent className="pt-6">
            <p>Quiz não encontrado ou sem perguntas.</p>
            <Button onClick={() => navigate('/my-quizzes')} className="mt-4">
              Voltar aos Meus Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFinished) {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4 relative">
        <SplashCursor />
        <div className="max-w-2xl mx-auto">
          <Card className="relative bg-background/80 backdrop-blur-sm border-border/50 overflow-hidden">
            <Spotlight className="from-primary/30 via-primary/20 to-transparent" size={300} />
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Quiz Finalizado!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {correctAnswers} / {questions.length}
                </div>
                <p className="text-lg text-muted-foreground">
                  Você acertou {Math.round((correctAnswers / questions.length) * 100)}% das perguntas
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Respostas:</h3>
                {results.map((result, index) => (
                  <Card key={index} className="relative p-4 bg-background/60 backdrop-blur-sm border-border/40 overflow-hidden">
                    <Spotlight className="from-primary/20 via-primary/10 to-transparent" size={120} />
                    <div className="flex items-start gap-3">
                      {result.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">{result.question.question_text}</p>
                        <div className="space-y-1">
                          {result.question.answers.map((answer) => {
                            const isSelected = answer.answer_id === result.selectedAnswerId;
                            const isCorrect = answer.is_correct;
                            
                            let className = "p-2 rounded text-sm ";
                            if (isCorrect) {
                              className += "bg-green-100 text-green-800 border border-green-300";
                            } else if (isSelected && !isCorrect) {
                              className += "bg-red-100 text-red-800 border border-red-300";
                            } else {
                              className += "bg-gray-50 text-gray-600";
                            }
                            
                            return (
                              <div key={answer.answer_id} className={className}>
                                {answer.answer_text}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={() => navigate('/my-quizzes')} 
                className="w-full"
              >
                Voltar aos Meus Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4 relative">
      <SplashCursor />
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">{quiz.name}</h1>
            <span className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <Card className="relative bg-background/80 backdrop-blur-sm border-border/50 overflow-hidden">
          <Spotlight className="from-primary/30 via-primary/20 to-transparent" size={250} />
          <CardHeader>
            <CardTitle className="text-lg">{currentQuestion.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup 
              value={selectedAnswerId?.toString()} 
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            >
              {currentQuestion.answers.map((answer) => (
                <div key={answer.answer_id} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={answer.answer_id.toString()} 
                    id={answer.answer_id.toString()} 
                  />
                  <Label 
                    htmlFor={answer.answer_id.toString()}
                    className="flex-1 cursor-pointer"
                  >
                    {answer.answer_text}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleNext}
                disabled={!selectedAnswerId}
                className="min-w-24"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Próxima' : 'Finalizar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}