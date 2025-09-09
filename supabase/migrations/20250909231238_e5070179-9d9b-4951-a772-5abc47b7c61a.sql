-- First remove all check constraints on status column
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        JOIN pg_attribute ON pg_attribute.attnum = ANY(pg_constraint.conkey)
        JOIN pg_class ON pg_class.oid = pg_constraint.conrelid
        WHERE pg_class.relname = 'Quizzes' 
        AND pg_attribute.attname = 'status'
        AND pg_constraint.contype = 'c'
    LOOP
        EXECUTE 'ALTER TABLE "Quizzes" DROP CONSTRAINT ' || constraint_name;
    END LOOP;
END $$;

-- Now update existing values
UPDATE "Quizzes" SET status = 'ativo' WHERE status = 'active';
UPDATE "Quizzes" SET status = 'inativo' WHERE status IN ('inactive', 'deleted');

-- Set default
ALTER TABLE "Quizzes" ALTER COLUMN status SET DEFAULT 'ativo';

-- Add new constraint
ALTER TABLE "Quizzes" ADD CONSTRAINT quizzes_status_check CHECK (status IN ('ativo', 'inativo'));