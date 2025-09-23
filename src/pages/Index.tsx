import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";
import { SplashCursor } from "@/components/ui/splash-cursor";
import { AppHeader } from "@/components/AppHeader";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 relative">
      <SplashCursor />
      <AppHeader title="FALA Education Quiz" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <p className="text-xl text-muted-foreground">
            Bem-vindo, {user?.user_metadata?.name || user?.email}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-background/80 backdrop-blur-sm border-border/50" onClick={() => navigate('/create-quiz')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Plus className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Criar Novo Quiz</CardTitle>
                  <CardDescription>
                    Use IA para gerar perguntas personalizadas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crie quizzes únicos baseados em seus próprios prompts e objetivos.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-background/80 backdrop-blur-sm border-border/50" onClick={() => navigate('/my-quizzes')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-secondary" />
                <div>
                  <CardTitle>Meus Quiz</CardTitle>
                  <CardDescription>
                    Visualize e jogue seus quizzes criados
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acesse todos os quizzes que você já criou e teste seus conhecimentos.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Como funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold">Descreva seu tema</h3>
              <p className="text-sm text-muted-foreground">
                Escreva sobre que assunto você quer criar o quiz
              </p>
            </div>
            <div className="space-y-2">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <span className="text-primary font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold">IA gera as perguntas</h3>
              <p className="text-sm text-muted-foreground">
                Nossa IA cria perguntas personalizadas automaticamente
              </p>
            </div>
            <div className="space-y-2">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <span className="text-primary font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold">Jogue e aprenda</h3>
              <p className="text-sm text-muted-foreground">
                Teste seus conhecimentos e veja seus resultados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}