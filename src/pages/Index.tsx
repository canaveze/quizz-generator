import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--fala-orange))]/10 to-[hsl(var(--fala-navy-light))]/10 relative">
      <AppHeader title={t('page.home')} />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <p className="text-xl text-foreground/80">
            {t('home.welcome')}, {user?.user_metadata?.name || user?.email}!
          </p>
        </div>

        <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : ''} gap-6`}>
          {isAdmin && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-background/80 backdrop-blur-sm border-border/50" onClick={() => navigate('/create-quiz')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Plus className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>{t('home.createQuiz.title')}</CardTitle>
                    <CardDescription className="text-foreground/85">
                      {t('home.createQuiz.description')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/85">
                  {t('home.createQuiz.content')}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-background/80 backdrop-blur-sm border-border/50" onClick={() => navigate('/my-quizzes')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-secondary" />
                <div>
                  <CardTitle>{t('home.myQuizzes.title')}</CardTitle>
                  <CardDescription className="text-foreground/85">
                    {t('home.myQuizzes.description')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/85">
                {t('home.myQuizzes.content')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">{t('home.howItWorks')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold">{t('home.step1.title')}</h3>
              <p className="text-sm text-foreground/85">
                {t('home.step1.description')}
              </p>
            </div>
            <div className="space-y-2">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <span className="text-primary font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold">{t('home.step2.title')}</h3>
              <p className="text-sm text-foreground/85">
                {t('home.step2.description')}
              </p>
            </div>
            <div className="space-y-2">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <span className="text-primary font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold">{t('home.step3.title')}</h3>
              <p className="text-sm text-foreground/85">
                {t('home.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}