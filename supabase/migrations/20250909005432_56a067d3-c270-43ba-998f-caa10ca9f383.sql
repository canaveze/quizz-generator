-- Enable RLS on existing tables only
ALTER TABLE public.Quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.User_Answers ENABLE ROW LEVEL SECURITY;

-- Create profiles table for auth integration
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Fix data types
ALTER TABLE public.Quizzes ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid;
ALTER TABLE public.Questions ALTER COLUMN question_text TYPE TEXT;
ALTER TABLE public.Results ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid;
ALTER TABLE public.Results ALTER COLUMN quiz_id TYPE BIGINT USING quiz_id::bigint;

-- Add foreign key constraints
ALTER TABLE public.Quizzes ADD CONSTRAINT fk_quizzes_user FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.Questions ADD CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES public.Quizzes(quiz_id);
ALTER TABLE public.Answers ADD CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES public.Questions(question_id);
ALTER TABLE public.Results ADD CONSTRAINT fk_results_user FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.Results ADD CONSTRAINT fk_results_quiz FOREIGN KEY (quiz_id) REFERENCES public.Quizzes(quiz_id);
ALTER TABLE public.User_Answers ADD CONSTRAINT fk_user_answers_result FOREIGN KEY (result_id) REFERENCES public.Results(result_id);
ALTER TABLE public.User_Answers ADD CONSTRAINT fk_user_answers_question FOREIGN KEY (question_id) REFERENCES public.Questions(question_id);
ALTER TABLE public.User_Answers ADD CONSTRAINT fk_user_answers_answer FOREIGN KEY (answer_id) REFERENCES public.Answers(answer_id);

-- RLS Policies for Quizzes
CREATE POLICY "Users can view own quizzes" ON public.Quizzes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quizzes" ON public.Quizzes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quizzes" ON public.Quizzes
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Questions
CREATE POLICY "Users can view questions of own quizzes" ON public.Questions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.Quizzes 
    WHERE Quizzes.quiz_id = Questions.quiz_id::bigint 
    AND Quizzes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create questions for own quizzes" ON public.Questions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.Quizzes 
    WHERE Quizzes.quiz_id = NEW.quiz_id::bigint 
    AND Quizzes.user_id = auth.uid()
  )
);

-- RLS Policies for Answers
CREATE POLICY "Users can view answers of own quiz questions" ON public.Answers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.Questions q
    JOIN public.Quizzes quiz ON quiz.quiz_id = q.quiz_id::bigint
    WHERE q.question_id = Answers.question_id 
    AND quiz.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create answers for own quiz questions" ON public.Answers
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.Questions q
    JOIN public.Quizzes quiz ON quiz.quiz_id = q.quiz_id::bigint
    WHERE q.question_id = NEW.question_id 
    AND quiz.user_id = auth.uid()
  )
);

-- RLS Policies for Results
CREATE POLICY "Users can view own results" ON public.Results
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own results" ON public.Results
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for User_Answers
CREATE POLICY "Users can view own answers" ON public.User_Answers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.Results 
    WHERE Results.result_id = User_Answers.result_id 
    AND Results.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own answers" ON public.User_Answers
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.Results 
    WHERE Results.result_id = NEW.result_id 
    AND Results.user_id = auth.uid()
  )
);

-- Create trigger function for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();