/*
  # Fix RLS policies for papers and paper_grades tables

  1. Changes
    - Simplify papers table policies
    - Add proper checks for paper ownership
    - Ensure consistent RLS enforcement

  2. Security
    - Enable RLS on both tables
    - Add proper user checks
    - Ensure data integrity
*/

-- First, drop all existing policies
DROP POLICY IF EXISTS "enable_all_for_users" ON papers;
DROP POLICY IF EXISTS "paper_grades_select" ON paper_grades;
DROP POLICY IF EXISTS "paper_grades_insert" ON paper_grades;
DROP POLICY IF EXISTS "paper_grades_update" ON paper_grades;
DROP POLICY IF EXISTS "paper_grades_delete" ON paper_grades;

-- Create new policies for papers table
CREATE POLICY "papers_select" ON papers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "papers_insert" ON papers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "papers_update" ON papers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "papers_delete" ON papers
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create new policies for paper_grades table
CREATE POLICY "paper_grades_select" ON paper_grades
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "paper_grades_insert" ON paper_grades
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM papers
      WHERE id = paper_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "paper_grades_update" ON paper_grades
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM papers
      WHERE id = paper_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "paper_grades_delete" ON paper_grades
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure RLS is enabled and forced
ALTER TABLE papers FORCE ROW LEVEL SECURITY;
ALTER TABLE paper_grades FORCE ROW LEVEL SECURITY;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS ensure_paper_grade_user ON paper_grades;
DROP FUNCTION IF EXISTS check_paper_grade_user();

-- Create new function and trigger for additional validation
CREATE OR REPLACE FUNCTION check_paper_grade_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot create or update grades for other users';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM papers
    WHERE id = NEW.paper_id
    AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'User does not own this paper';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ensure_paper_grade_user
  BEFORE INSERT OR UPDATE ON paper_grades
  FOR EACH ROW
  EXECUTE FUNCTION check_paper_grade_user();