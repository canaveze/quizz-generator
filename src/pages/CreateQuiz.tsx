import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

export default function CreateQuiz() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
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
          title: t('common.success'),
          description: t('createQuiz.successDescription'),
        });
        navigate('/my-quizzes');
      } else {
        throw new Error(data.error || t('createQuiz.error'));
      }
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      toast({
        title: t('createQuiz.error'),
        description: error.message || t('createQuiz.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--fala-orange))]/10 to-[hsl(var(--fala-navy-light))]/10 relative">
      <AppHeader title={t('page.createQuiz')} />
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>{t('createQuiz.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('createQuiz.name')}</Label>
                <Input
                  id="name"
                  placeholder={t('createQuiz.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">{t('createQuiz.objective')}</Label>
                <Input
                  id="objective"
                  placeholder={t('createQuiz.objectivePlaceholder')}
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">{t('createQuiz.description')}</Label>
                <Textarea
                  id="prompt"
                  placeholder={t('createQuiz.descriptionPlaceholder')}
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questions">{t('createQuiz.numberOfQuestions')}</Label>
                <Select
                  value={formData.totalQuestions.toString()}
                  onValueChange={(value) => setFormData({ ...formData, totalQuestions: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">{t('createQuiz.questionsCount').replace('{count}', '5')}</SelectItem>
                    <SelectItem value="10">{t('createQuiz.questionsCount').replace('{count}', '10')}</SelectItem>
                    <SelectItem value="15">{t('createQuiz.questionsCount').replace('{count}', '15')}</SelectItem>
                    <SelectItem value="20">{t('createQuiz.questionsCount').replace('{count}', '20')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('createQuiz.generating')}
                  </>
                ) : (
                  t('createQuiz.generate')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}