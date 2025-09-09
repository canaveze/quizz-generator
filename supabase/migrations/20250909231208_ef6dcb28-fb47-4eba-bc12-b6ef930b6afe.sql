-- Migrate status values to Portuguese and enforce constraints
BEGIN;

-- Backfill existing values
UPDATE "Quizzes" SET status = 'ativo' WHERE status = 'active';
UPDATE "Quizzes" SET status = 'inativo' WHERE status IN ('inactive', 'deleted');

-- Set default to 'ativo'
ALTER TABLE "Quizzes" ALTER COLUMN status SET DEFAULT 'ativo';

-- Drop old check if exists and add new one
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'quizzes_status_check'
    ) THEN
        ALTER TABLE "Quizzes" DROP CONSTRAINT quizzes_status_check;
    END IF;
END $$;

ALTER TABLE "Quizzes" ADD CONSTRAINT quizzes_status_check CHECK (status IN ('ativo','inativo'));

-- RLS stays as "own quizzes" select and update
DROP POLICY IF EXISTS "Users can view own quizzes" ON "Quizzes";
CREATE POLICY "Users can view own quizzes" ON "Quizzes" FOR SELECT USING (user_id = get_current_user_legacy_id());

DROP POLICY IF EXISTS "Users can update own quizzes" ON "Quizzes";
CREATE POLICY "Users can update own quizzes" ON "Quizzes" FOR UPDATE USING (user_id = get_current_user_legacy_id()) WITH CHECK (user_id = get_current_user_legacy_id());

COMMIT;