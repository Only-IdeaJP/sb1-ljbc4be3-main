/*
  # Add paper grades table

  1. New Tables
    - `paper_grades`
      - `id` (uuid, primary key)
      - `paper_id` (uuid, references papers)
      - `user_id` (uuid, references auth.users)
      - `is_correct` (boolean)
      - `graded_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `paper_grades` table
    - Add policies for authenticated users to manage their own grades
*/

-- Create paper_grades table
CREATE TABLE IF NOT EXISTS paper_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES papers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_correct boolean NOT NULL,
  graded_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE paper_grades ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "enable_select_for_users"
  ON paper_grades FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "enable_insert_for_users"
  ON paper_grades FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS paper_grades_paper_id_idx ON paper_grades(paper_id);
CREATE INDEX IF NOT EXISTS paper_grades_user_id_idx ON paper_grades(user_id);
CREATE INDEX IF NOT EXISTS paper_grades_graded_at_idx ON paper_grades(graded_at);