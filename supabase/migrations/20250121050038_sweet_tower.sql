/*
  # Fix paper_grades policies

  1. Security Updates
    - Drop existing policies
    - Create new comprehensive policies with proper user checks
    - Add additional validation checks
*/

-- First, drop all existing policies
DROP POLICY IF EXISTS "enable_select_for_users" ON paper_grades;
DROP POLICY IF EXISTS "enable_insert_for_users" ON paper_grades;
DROP POLICY IF EXISTS "enable_update_for_users" ON paper_grades;
DROP POLICY IF EXISTS "enable_delete_for_users" ON paper_grades;

-- Create new comprehensive policies
CREATE POLICY "paper_grades_select"
  ON paper_grades FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "paper_grades_insert"
  ON paper_grades FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM papers
      WHERE papers.id = paper_id
      AND papers.user_id = auth.uid()
    )
  );

CREATE POLICY "paper_grades_update"
  ON paper_grades FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM papers
      WHERE papers.id = paper_id
      AND papers.user_id = auth.uid()
    )
  );

CREATE POLICY "paper_grades_delete"
  ON paper_grades FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Force RLS
ALTER TABLE paper_grades FORCE ROW LEVEL SECURITY;

-- Add trigger to ensure user_id matches paper owner
CREATE OR REPLACE FUNCTION check_paper_grade_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM papers
    WHERE papers.id = NEW.paper_id
    AND papers.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'User does not own this paper';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_paper_grade_user
  BEFORE INSERT OR UPDATE ON paper_grades
  FOR EACH ROW
  EXECUTE FUNCTION check_paper_grade_user();