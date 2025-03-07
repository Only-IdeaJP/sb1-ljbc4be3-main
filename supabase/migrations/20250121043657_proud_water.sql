/*
  # Fix papers table RLS policies

  1. Changes
    - Drop all existing policies to start fresh
    - Create new, more permissive policies for authenticated users
    - Add explicit policies for each operation type
    - Ensure RLS is properly enabled

  2. Security
    - Maintain data isolation between users
    - Allow authenticated users full access to their own data
    - Prevent access to other users' data
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "papers_access_policy" ON papers;

-- Create explicit policies for each operation
CREATE POLICY "papers_select" ON papers
  FOR SELECT
  TO authenticated
  USING (
    -- Allow users to view their own papers
    user_id = auth.uid()
  );

CREATE POLICY "papers_insert" ON papers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow users to insert papers with their own user_id
    user_id = auth.uid()
  );

CREATE POLICY "papers_update" ON papers
  FOR UPDATE
  TO authenticated
  USING (
    -- Only allow updating own papers
    user_id = auth.uid()
  )
  WITH CHECK (
    -- Ensure updated rows still belong to the same user
    user_id = auth.uid()
  );

CREATE POLICY "papers_delete" ON papers
  FOR DELETE
  TO authenticated
  USING (
    -- Only allow deleting own papers
    user_id = auth.uid()
  );

-- Ensure RLS is enabled and enforced
ALTER TABLE papers FORCE ROW LEVEL SECURITY;