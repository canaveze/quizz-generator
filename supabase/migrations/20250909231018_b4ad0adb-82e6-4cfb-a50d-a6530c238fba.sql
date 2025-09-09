-- Ensure status column exists and has correct constraints
ALTER TABLE "Quizzes" ALTER COLUMN status SET DEFAULT 'active';

-- Add a check constraint to ensure status is either 'active' or 'inactive'
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'quizzes_status_check'
    ) THEN
        ALTER TABLE "Quizzes" ADD CONSTRAINT quizzes_status_check 
        CHECK (status IN ('active', 'inactive'));
    END IF;
END $$;

-- Update RLS policy for quiz updates to allow status changes
DROP POLICY IF EXISTS "Users can update own quizzes" ON "Quizzes";

CREATE POLICY "Users can update own quizzes" 
ON "Quizzes" 
FOR UPDATE 
USING (user_id = get_current_user_legacy_id())
WITH CHECK (user_id = get_current_user_legacy_id());

-- Update the SELECT policy to also show inactive quizzes (so users can see their deleted quizzes if needed)
DROP POLICY IF EXISTS "Users can view own active quizzes" ON "Quizzes";

CREATE POLICY "Users can view own quizzes" 
ON "Quizzes" 
FOR SELECT 
USING (user_id = get_current_user_legacy_id());