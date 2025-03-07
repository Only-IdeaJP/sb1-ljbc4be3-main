/*
  # Fix papers grading system

  1. Changes
    - Add default value for is_correct column
    - Add check constraint to ensure is_correct is not null
    - Add comment to clarify the meaning of is_correct

  2. Security
    - Maintain existing RLS policies
    - No data loss or modification of existing records
*/

-- Add comment to clarify the meaning of is_correct
COMMENT ON COLUMN papers.is_correct IS '丸付けの結果を記録。true = 正解、false = 不正解または未採点';

-- Add check constraint to ensure is_correct is not null
ALTER TABLE papers 
  ALTER COLUMN is_correct SET DEFAULT false,
  ALTER COLUMN is_correct SET NOT NULL;