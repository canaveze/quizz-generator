-- Remove all status constraints first and then recreate
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conname LIKE '%status%' 
        AND conrelid = 'public."Quizzes"'::regclass
    LOOP
        EXECUTE 'ALTER TABLE "Quizzes" DROP CONSTRAINT ' || constraint_name;
    END LOOP;
END $$;

-- Update status values
UPDATE "Quizzes" SET status = 'active' WHERE status = 'ativo';

-- Add new constraint
ALTER TABLE "Quizzes" ADD CONSTRAINT quizzes_status_check CHECK (status IN ('active', 'inactive'));