-- Add status column to Quizzes table for soft delete functionality
ALTER TABLE public."Quizzes" ADD COLUMN status VARCHAR(20) DEFAULT 'active' NOT NULL;

-- Add index for better performance on status queries
CREATE INDEX idx_quizzes_status ON public."Quizzes"(status);

-- Update RLS policies to only show active quizzes by default
DROP POLICY IF EXISTS "Users can view own quizzes" ON public."Quizzes";
CREATE POLICY "Users can view own active quizzes" ON public."Quizzes"
FOR SELECT USING (user_id = public.get_current_user_legacy_id() AND status = 'active');