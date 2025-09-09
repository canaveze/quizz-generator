-- Fix status values to use 'active' and 'inactive' consistently
DROP CONSTRAINT IF EXISTS quizzes_status_check;
ALTER TABLE "Quizzes" ADD CONSTRAINT quizzes_status_check CHECK (status IN ('active', 'inactive'));