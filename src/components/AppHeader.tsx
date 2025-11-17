import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import falaLogo from '@/assets/FALA_logo.svg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/ui/language-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  LogOut, 
  Home, 
  Plus, 
  FileText,
  ChevronDown 
} from 'lucide-react';

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserAvatar();
    }
  }, [user]);

  const loadUserAvatar = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_legacy_id')
      .eq('id', user.id)
      .single();

    if (profile?.user_legacy_id) {
      const { data: userData } = await supabase
        .from('Users')
        .select('avatar_url')
        .eq('user_id', profile.user_legacy_id)
        .maybeSingle();

      if (userData?.avatar_url) {
        setAvatarUrl(userData.avatar_url);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <img src={falaLogo} alt="FALA Education" className="h-10" />
        
        <div className="flex items-center gap-4">
          <LanguageToggle />
          
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl || user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getUserInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">{userName}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl || user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getUserInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              {t('header.home')}
            </DropdownMenuItem>
            
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate('/create-quiz')}>
                <Plus className="mr-2 h-4 w-4" />
                {t('header.createQuiz')}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={() => navigate('/my-quizzes')}>
              <FileText className="mr-2 h-4 w-4" />
              {t('header.myQuizzes')}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => navigate(isAdmin ? '/student-rankings' : '/my-results')}>
              <User className="mr-2 h-4 w-4" />
              {isAdmin ? t('header.myStudents') : t('header.myResults')}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {t('header.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
}