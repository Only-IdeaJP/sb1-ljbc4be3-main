/*
  # Enable and Force RLS on papers table

  1. Changes
    - Enable RLS on papers table
    - Force RLS to be enabled
    - Ensure data security is maintained

  2. Security
    - Guarantees RLS is always enforced
    - Prevents accidental disabling of RLS
*/

-- Enable and force RLS on papers table
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers FORCE ROW LEVEL SECURITY;