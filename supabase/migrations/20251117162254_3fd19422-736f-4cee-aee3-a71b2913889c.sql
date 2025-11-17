-- Etapa 1: Criar função para sincronizar profile com Users
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insere ou atualiza registro na tabela Users com user_legacy_id da tabela profiles
  INSERT INTO public."Users" (user_id, name, email, created_at)
  VALUES (
    NEW.user_legacy_id,
    NEW.name,
    NEW.email,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$;

-- Trigger que dispara após insert ou update na tabela profiles
DROP TRIGGER IF EXISTS on_profile_created_or_updated ON public.profiles;
CREATE TRIGGER on_profile_created_or_updated
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.user_legacy_id IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Etapa 2: Popular tabela Users com dados existentes de profiles
INSERT INTO public."Users" (user_id, name, email, created_at)
SELECT 
  p.user_legacy_id,
  p.name,
  p.email,
  COALESCE(p.created_at, NOW())
FROM public.profiles p
WHERE p.user_legacy_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public."Users" u 
    WHERE u.user_id = p.user_legacy_id
  );