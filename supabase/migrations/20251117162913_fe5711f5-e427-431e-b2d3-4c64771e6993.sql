-- Função para verificar se usuário é administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."Users"
    WHERE user_id = get_current_user_legacy_id()
      AND user_type = 'adm'
  );
$$;

-- Atualizar políticas RLS da tabela Quizzes
DROP POLICY IF EXISTS "Users can create own quizzes" ON public."Quizzes";
DROP POLICY IF EXISTS "Users can update own quizzes" ON public."Quizzes";
DROP POLICY IF EXISTS "Users can view own quizzes" ON public."Quizzes";

-- Apenas admins podem criar quizzes
CREATE POLICY "Admins can create quizzes"
ON public."Quizzes"
FOR INSERT
TO authenticated
WITH CHECK (is_admin() AND user_id = get_current_user_legacy_id());

-- Apenas admins podem atualizar seus próprios quizzes
CREATE POLICY "Admins can update own quizzes"
ON public."Quizzes"
FOR UPDATE
TO authenticated
USING (is_admin() AND user_id = get_current_user_legacy_id());

-- Admins veem seus quizzes, alunos veem todos os quizzes ativos
CREATE POLICY "Users can view quizzes"
ON public."Quizzes"
FOR SELECT
TO authenticated
USING (
  (is_admin() AND user_id = get_current_user_legacy_id()) 
  OR 
  (NOT is_admin() AND status = 'active')
);

-- Atualizar políticas de Questions para seguir o mesmo padrão
DROP POLICY IF EXISTS "Users can create questions for own quizzes" ON public."Questions";
DROP POLICY IF EXISTS "Users can view questions of own quizzes" ON public."Questions";

CREATE POLICY "Admins can create questions for own quizzes"
ON public."Questions"
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin() AND EXISTS (
    SELECT 1 FROM public."Quizzes" q
    WHERE q.quiz_id = ("Questions".quiz_id)::bigint 
      AND q.user_id = get_current_user_legacy_id()
  )
);

CREATE POLICY "Users can view questions of quizzes"
ON public."Questions"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public."Quizzes" q
    WHERE q.quiz_id = ("Questions".quiz_id)::bigint
      AND (
        (is_admin() AND q.user_id = get_current_user_legacy_id())
        OR
        (NOT is_admin() AND q.status = 'active')
      )
  )
);

-- Atualizar políticas de Answers
DROP POLICY IF EXISTS "Users can create answers for own quiz questions" ON public."Answers";
DROP POLICY IF EXISTS "Users can view answers of own quiz questions" ON public."Answers";

CREATE POLICY "Admins can create answers for own quiz questions"
ON public."Answers"
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin() AND EXISTS (
    SELECT 1
    FROM public."Questions" q
    JOIN public."Quizzes" quiz ON quiz.quiz_id = (q.quiz_id)::bigint
    WHERE q.question_id = "Answers".question_id
      AND quiz.user_id = get_current_user_legacy_id()
  )
);

CREATE POLICY "Users can view answers of quizzes"
ON public."Answers"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."Questions" q
    JOIN public."Quizzes" quiz ON quiz.quiz_id = (q.quiz_id)::bigint
    WHERE q.question_id = "Answers".question_id
      AND (
        (is_admin() AND quiz.user_id = get_current_user_legacy_id())
        OR
        (NOT is_admin() AND quiz.status = 'active')
      )
  )
);