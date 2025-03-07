-- Drop existing policies
DROP POLICY IF EXISTS "papers_select_policy" ON papers;
DROP POLICY IF EXISTS "papers_insert_policy" ON papers;
DROP POLICY IF EXISTS "papers_update_policy" ON papers;
DROP POLICY IF EXISTS "papers_delete_policy" ON papers;

-- Create new simplified policies
CREATE POLICY "enable_all_for_users" ON papers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;