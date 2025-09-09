-- Enable RLS on existing tables
ALTER TABLE public."Answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Questions" ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public."Quizzes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User_Answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;

-- Create profiles table for auth integration
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_legacy_id BIGINT UNIQUE,
  name TEXT,
  email TEXT,  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles  
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Create security definer function to get user legacy id
CREATE OR REPLACE FUNCTION public.get_current_user_legacy_id()
RETURNS BIGINT AS $$
  SELECT user_legacy_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for Quizzes
CREATE POLICY "Users can view own quizzes" ON public."Quizzes"
FOR SELECT USING (user_id = public.get_current_user_legacy_id());

CREATE POLICY "Users can create own quizzes" ON public."Quizzes"
FOR INSERT WITH CHECK (user_id = public.get_current_user_legacy_id());

CREATE POLICY "Users can update own quizzes" ON public."Quizzes"
FOR UPDATE USING (user_id = public.get_current_user_legacy_id());

-- RLS Policies for Questions
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

-- RLS Policies for Answers  
CREATE POLICY "Users can view answers of own quiz questions" ON public."Answers"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public."Questions" q
    JOIN public."Quizzes" quiz ON quiz.quiz_id = q.quiz_id::bigint
    WHERE q.question_id = "Answers".question_id 
    AND quiz.user_id = public.get_current_user_legacy_id()
  )
);

CREATE POLICY "Users can create answers for own quiz questions" ON public."Answers"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."Questions" q
    JOIN public."Quizzes" quiz ON quiz.quiz_id = q.quiz_id::bigint
    WHERE q.question_id = question_id 
    AND quiz.user_id = public.get_current_user_legacy_id()
  )
);

-- RLS Policies for Results
CREATE POLICY "Users can view own results" ON public."Results"
FOR SELECT USING (user_id = public.get_current_user_legacy_id());

CREATE POLICY "Users can create own results" ON public."Results"  
FOR INSERT WITH CHECK (user_id = public.get_current_user_legacy_id());

-- RLS Policies for User_Answers
CREATE POLICY "Users can view own answers" ON public."User_Answers"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public."Results" 
    WHERE "Results".result_id = "User_Answers".result_id 
    AND "Results".user_id = public.get_current_user_legacy_id()
  )
);

CREATE POLICY "Users can create own answers" ON public."User_Answers"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."Results" r
    WHERE r.result_id = result_id 
    AND r.user_id = public.get_current_user_legacy_id()
  )
);

-- Create trigger function for profile creation
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
  
  INSERT INTO public.profiles (id, user_legacy_id, name, email)
  VALUES (NEW.id, next_legacy_id, NEW.raw_user_meta_data->>'name', NEW.email);
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation  
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();