-- Update RLS policies to allow status updates
DROP POLICY IF EXISTS "Users can update own quizzes" ON "Quizzes";

CREATE POLICY "Users can update own quizzes" 
ON "Quizzes" 
FOR UPDATE 
USING (user_id = get_current_user_legacy_id());

-- Ensure default value is 'active'
ALTER TABLE "Quizzes" ALTER COLUMN status SET DEFAULT 'active';