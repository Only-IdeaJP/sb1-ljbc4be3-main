/*
  # Fix papers table RLS policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create new comprehensive policies for authenticated users
    - Add a permissive policy for inserts
    - Ensure proper access control for all operations

  2. Security
    - Maintain data isolation between users
    - Allow authenticated users full access to their own data
    - Allow inserts with proper user_id validation
*/

-- First, drop any existing policies to start fresh
DROP POLICY IF EXISTS "papers_select" ON papers;
DROP POLICY IF EXISTS "papers_insert" ON papers;
DROP POLICY IF EXISTS "papers_update" ON papers;
DROP POLICY IF EXISTS "papers_delete" ON papers;
DROP POLICY IF EXISTS "allow_all" ON papers;

-- Create comprehensive policies for authenticated users
CREATE POLICY "papers_select" ON papers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create a permissive insert policy that still validates user_id
CREATE POLICY "papers_insert" ON papers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Ensure the user_id matches the authenticated user
    user_id = auth.uid()
  );

CREATE POLICY "papers_update" ON papers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "papers_delete" ON papers
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure RLS is enabled and enforced
ALTER TABLE papers FORCE ROW LEVEL SECURITY;