/*
  # Fix RLS policies for papers table

  1. Changes
    - Drop all existing RLS policies for papers table
    - Create new, simplified policies for authenticated users
    - Ensure proper access control for all CRUD operations

  2. Security
    - Maintain user data isolation
    - Allow authenticated users to manage their own papers
    - Prevent unauthorized access
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read for users own papers" ON papers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON papers;
DROP POLICY IF EXISTS "Enable update for users own papers" ON papers;
DROP POLICY IF EXISTS "Enable delete for users own papers" ON papers;
DROP POLICY IF EXISTS "papers_insert_policy" ON papers;
DROP POLICY IF EXISTS "papers_select_policy" ON papers;
DROP POLICY IF EXISTS "papers_update_policy" ON papers;
DROP POLICY IF EXISTS "papers_delete_policy" ON papers;

-- Create new simplified policies
CREATE POLICY "papers_access_policy" ON papers
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE papers FORCE ROW LEVEL SECURITY;