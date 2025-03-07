/*
  # Update RLS policies for papers table

  1. Changes
    - Drop existing RLS policies for papers table
    - Create new, more permissive policies for authenticated users
    - Ensure users can perform all CRUD operations on their own papers

  2. Security
    - Maintain user data isolation
    - Allow authenticated users full control over their own papers
*/

-- Drop existing policies
DROP POLICY IF EXISTS papers_insert_policy ON papers;
DROP POLICY IF EXISTS papers_select_policy ON papers;
DROP POLICY IF EXISTS papers_update_policy ON papers;
DROP POLICY IF EXISTS papers_delete_policy ON papers;

-- Create new policies with specified names
CREATE POLICY papers_insert_policy ON papers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY papers_select_policy ON papers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY papers_update_policy ON papers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY papers_delete_policy ON papers FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Force RLS to be enabled
ALTER TABLE papers FORCE ROW LEVEL SECURITY;