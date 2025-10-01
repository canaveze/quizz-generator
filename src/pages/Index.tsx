import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";
import { SplashCursor } from "@/components/ui/splash-cursor";
import { AppHeader } from "@/components/AppHeader";
export default function Index() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    t
  } = useLanguage();
  return <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--fala-orange))]/10 to-[hsl(var(--fala-navy-light))]/10 relative">
      <SplashCursor />
      <AppHeader title={t('page.home')} />
      
    </div>;
}