import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Buscar o profile para obter o user_legacy_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_legacy_id')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Buscar o user_type da tabela Users
        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select('user_type')
          .eq('user_id', profile.user_legacy_id)
          .single();

        if (userError) throw userError;

        setIsAdmin(userData?.user_type === 'adm');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
}
