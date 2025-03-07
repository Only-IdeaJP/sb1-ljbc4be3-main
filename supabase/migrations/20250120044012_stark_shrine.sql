/*
  # Create paper_makeaccount table

  1. New Tables
    - `paper_makeaccount`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text, not null)
      - `account_type` (text, not null)
      - `status` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `paper_makeaccount` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS paper_makeaccount (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  account_type text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE paper_makeaccount ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own account"
  ON paper_makeaccount FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own account"
  ON paper_makeaccount FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own account"
  ON paper_makeaccount FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);