/*
  # Fix papers table RLS policies

  1. Changes
    - Drop all existing policies to start fresh
    - Create new simplified policies for all operations
    - Ensure RLS is properly enabled

  2. Security
    - Maintain proper user isolation
    - Ensure authenticated users can only access their own data
    - Simplify policy structure to reduce complexity
*/

-- First, drop all existing policies
DROP POLICY IF EXISTS "papers_select" ON papers;
DROP POLICY IF EXISTS "papers_insert" ON papers;
DROP POLICY IF EXISTS "papers_update" ON papers;
DROP POLICY IF EXISTS "papers_delete" ON papers;
DROP POLICY IF EXISTS "papers_select_policy" ON papers;
DROP POLICY IF EXISTS "papers_insert_policy" ON papers;
DROP POLICY IF EXISTS "papers_update_policy" ON papers;
DROP POLICY IF EXISTS "papers_delete_policy" ON papers;

-- Create a single, comprehensive policy for all operations
CREATE POLICY "papers_access_policy" ON papers
  FOR ALL
  TO authenticated
  USING (
    -- For SELECT, UPDATE, and DELETE operations
    CASE WHEN current_setting('role') = 'authenticated' THEN
      user_id = auth.uid()
    ELSE
      false
    END
  )
  WITH CHECK (
    -- For INSERT and UPDATE operations
    CASE WHEN current_setting('role') = 'authenticated' THEN
      user_id = auth.uid()
    ELSE
      false
    END
  );

-- Ensure RLS is enabled and forced
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers FORCE ROW LEVEL SECURITY;