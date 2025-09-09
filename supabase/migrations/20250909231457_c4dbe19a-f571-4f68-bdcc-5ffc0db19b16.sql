-- First update all existing status values, then add constraint
UPDATE "Quizzes" SET status = 'active' WHERE status = 'ativo';
ALTER TABLE "Quizzes" ADD CONSTRAINT quizzes_status_check CHECK (status IN ('active', 'inactive'));