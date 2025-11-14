-- Add correct_answer_id column to Questions table
ALTER TABLE public."Questions" 
ADD COLUMN correct_answer_id bigint;

-- Add foreign key constraint to link to Answers table
ALTER TABLE public."Questions"
ADD CONSTRAINT fk_correct_answer 
FOREIGN KEY (correct_answer_id) 
REFERENCES public."Answers"(answer_id);