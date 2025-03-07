/*
  # Update papers table RLS policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create new comprehensive policies for authenticated users
    - Add permissive policies for all CRUD operations
    - Ensure proper user isolation

  2. Security
    - Maintain data isolation between users
    - Allow authenticated users full access to their own data
    - Ensure proper user_id validation
*/

-- First, drop any existing policies
DROP POLICY IF EXISTS papers_insert_policy ON papers;
DROP POLICY IF EXISTS papers_select_policy ON papers;
DROP POLICY IF EXISTS papers_update_policy ON papers;
DROP POLICY IF EXISTS papers_delete_policy ON papers;

-- Create new policies with proper authentication checks
CREATE POLICY papers_select_policy ON papers 
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY papers_insert_policy ON papers 
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY papers_update_policy ON papers 
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY papers_delete_policy ON papers 
  FOR DELETE 
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE papers FORCE ROW LEVEL SECURITY;