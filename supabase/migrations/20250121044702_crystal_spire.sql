-- First, drop all existing policies
DROP POLICY IF EXISTS "papers_select" ON papers;
DROP POLICY IF EXISTS "papers_insert" ON papers;
DROP POLICY IF EXISTS "papers_update" ON papers;
DROP POLICY IF EXISTS "papers_delete" ON papers;
DROP POLICY IF EXISTS "papers_select_policy" ON papers;
DROP POLICY IF EXISTS "papers_insert_policy" ON papers;
DROP POLICY IF EXISTS "papers_update_policy" ON papers;
DROP POLICY IF EXISTS "papers_delete_policy" ON papers;
DROP POLICY IF EXISTS "papers_access_policy" ON papers;

-- Create separate policies for each operation
CREATE POLICY "papers_select_policy" ON papers 
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "papers_insert_policy" ON papers 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "papers_update_policy" ON papers 
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "papers_delete_policy" ON papers 
  FOR DELETE 
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure RLS is enabled and forced
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers FORCE ROW LEVEL SECURITY;