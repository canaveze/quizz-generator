-- Fix constraint syntax and update status values
ALTER TABLE "Quizzes" DROP CONSTRAINT IF EXISTS quizzes_status_check;
ALTER TABLE "Quizzes" ADD CONSTRAINT quizzes_status_check CHECK (status IN ('active', 'inactive'));