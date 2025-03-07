/*
  # Initial schema for exam paper management system

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text)
      - full_name (text)
      - nickname (text)
      - address (text)
      - phone (text)
      - subscription_tier (text)
      - subscription_status (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - papers
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - file_path (text)
      - tags (text[])
      - is_correct (boolean)
      - last_practiced (timestamp)
      - next_practice_date (timestamp)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  nickname text,
  address text,
  phone text,
  subscription_tier text DEFAULT 'free',
  subscription_status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create papers table
CREATE TABLE papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  file_path text NOT NULL,
  tags text[] DEFAULT '{}',
  is_correct boolean DEFAULT false,
  last_practiced timestamptz,
  next_practice_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view own papers"
  ON papers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own papers"
  ON papers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own papers"
  ON papers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);