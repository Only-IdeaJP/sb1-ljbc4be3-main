/*
  # Fix RLS policies for papers table

  1. Changes
    - Drop existing RLS policies for papers table
    - Create new, more permissive policies for authenticated users
    - Ensure users can perform all CRUD operations on their own papers

  2. Security
    - Maintain user data isolation
    - Allow authenticated users full control over their own papers
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own papers" ON papers;
DROP POLICY IF EXISTS "Users can insert own papers" ON papers;
DROP POLICY IF EXISTS "Users can update own papers" ON papers;
DROP POLICY IF EXISTS "Users can delete own papers" ON papers;

-- Create new policies
CREATE POLICY "Enable read for users own papers"
  ON papers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users"
  ON papers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users own papers"
  ON papers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users own papers"
  ON papers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);