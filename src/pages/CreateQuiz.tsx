import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function CreateQuiz() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    prompt: '',
    totalQuestions: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          name: formData.name,
          objective: formData.objective,
          prompt: formData.prompt,
          totalQuestions: formData.totalQuestions,
        },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Quiz criado com sucesso!",
          description: "Redirecionando para seus quizzes...",
        });
        navigate('/my-quizzes');
      } else {
        throw new Error(data.error || 'Erro ao criar quiz');
      }
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      toast({
        title: "Erro ao criar quiz",
        description: error.message || 'Tente novamente mais tarde.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Criar QUIZ</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/my-quizzes')}>
              Meus Quiz
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Sair
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Novo Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Quiz</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome do seu quiz"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo</Label>
                <Input
                  id="objective"
                  placeholder="Qual o objetivo deste quiz?"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Descrição/Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Descreva sobre o que devem ser as perguntas do quiz..."
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questions">Quantidade de Perguntas</Label>
                <Select
                  value={formData.totalQuestions.toString()}
                  onValueChange={(value) => setFormData({ ...formData, totalQuestions: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 perguntas</SelectItem>
                    <SelectItem value="10">10 perguntas</SelectItem>
                    <SelectItem value="15">15 perguntas</SelectItem>
                    <SelectItem value="20">20 perguntas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Quiz...
                  </>
                ) : (
                  'Gerar Quiz'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}