-- Enable RLS on existing tables (skip if already enabled)
DO $$ 
BEGIN 
    IF NOT (SELECT pg_class.relrowsecurity FROM pg_class WHERE pg_class.relname = 'Answers') THEN
        ALTER TABLE public."Answers" ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT pg_class.relrowsecurity FROM pg_class WHERE pg_class.relname = 'Questions') THEN
        ALTER TABLE public."Questions" ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT pg_class.relrowsecurity FROM pg_class WHERE pg_class.relname = 'Quizzes') THEN
        ALTER TABLE public."Quizzes" ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT pg_class.relrowsecurity FROM pg_class WHERE pg_class.relname = 'Results') THEN
        ALTER TABLE public."Results" ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT pg_class.relrowsecurity FROM pg_class WHERE pg_class.relname = 'User_Answers') THEN
        ALTER TABLE public."User_Answers" ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT pg_class.relrowsecurity FROM pg_class WHERE pg_class.relname = 'Users') THEN
        ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Add user_legacy_id column to profiles if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_legacy_id') THEN
        ALTER TABLE public.profiles ADD COLUMN user_legacy_id BIGINT UNIQUE;
    END IF;
END $$;

-- Create security definer function to get user legacy id
CREATE OR REPLACE FUNCTION public.get_current_user_legacy_id()
RETURNS BIGINT AS $$
  SELECT user_legacy_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own quizzes" ON public."Quizzes";
DROP POLICY IF EXISTS "Users can create own quizzes" ON public."Quizzes";
DROP POLICY IF EXISTS "Users can update own quizzes" ON public."Quizzes";

-- RLS Policies for Quizzes
CREATE POLICY "Users can view own quizzes" ON public."Quizzes"
FOR SELECT USING (user_id = public.get_current_user_legacy_id());

CREATE POLICY "Users can create own quizzes" ON public."Quizzes"
FOR INSERT WITH CHECK (user_id = public.get_current_user_legacy_id());

CREATE POLICY "Users can update own quizzes" ON public."Quizzes"
FOR UPDATE USING (user_id = public.get_current_user_legacy_id());

-- Drop and recreate policies for other tables
DROP POLICY IF EXISTS "Users can view questions of own quizzes" ON public."Questions";
DROP POLICY IF EXISTS "Users can create questions for own quizzes" ON public."Questions";

CREATE POLICY "Users can view questions of own quizzes" ON public."Questions"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public."Quizzes" 
    WHERE "Quizzes".quiz_id = "Questions".quiz_id::bigint 
    AND "Quizzes".user_id = public.get_current_user_legacy_id()
  )
);

CREATE POLICY "Users can create questions for own quizzes" ON public."Questions"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."Quizzes" q
    WHERE q.quiz_id = quiz_id::bigint 
    AND q.user_id = public.get_current_user_legacy_id()
  )
);

-- Update trigger function to handle profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  next_legacy_id BIGINT;
BEGIN
  -- Get next available legacy ID
  SELECT COALESCE(MAX(user_id), 0) + 1 INTO next_legacy_id FROM public."Users";
  
  -- Update existing profile or create new one
  INSERT INTO public.profiles (id, user_legacy_id, name, email)
  VALUES (NEW.id, next_legacy_id, NEW.raw_user_meta_data->>'name', NEW.email)
  ON CONFLICT (id) DO UPDATE SET
    user_legacy_id = next_legacy_id,
    name = NEW.raw_user_meta_data->>'name',
    email = NEW.email;
    
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();