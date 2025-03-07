/*
  # Add additional policies for paper_grades table

  1. Security Updates
    - Add UPDATE and DELETE policies for paper_grades table
    - Ensure users can only modify their own grades
*/

-- Add UPDATE policy
CREATE POLICY "enable_update_for_users"
  ON paper_grades FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add DELETE policy
CREATE POLICY "enable_delete_for_users"
  ON paper_grades FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add composite index for better query performance
CREATE INDEX IF NOT EXISTS paper_grades_user_paper_idx 
  ON paper_grades(user_id, paper_id);