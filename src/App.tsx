import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { LanguageProvider } from "./contexts/LanguageContext";
import AuthGuard from "./components/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CreateQuiz from "./pages/CreateQuiz";
import MyQuizzes from "./pages/MyQuizzes";
import QuizPlay from "./pages/QuizPlay";
import StudentRankings from "./pages/StudentRankings";
import MyResults from "./pages/MyResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <AuthGuard>
                <Index />
              </AuthGuard>
            } />
            <Route path="/create-quiz" element={
              <AuthGuard>
                <CreateQuiz />
              </AuthGuard>
            } />
            <Route path="/my-quizzes" element={
              <AuthGuard>
                <MyQuizzes />
              </AuthGuard>
            } />
            <Route path="/quiz/:quizId" element={
              <AuthGuard>
                <QuizPlay />
              </AuthGuard>
            } />
            <Route path="/student-rankings" element={
              <AuthGuard>
                <StudentRankings />
              </AuthGuard>
            } />
            <Route path="/my-results" element={
              <AuthGuard>
                <MyResults />
              </AuthGuard>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </HashRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
