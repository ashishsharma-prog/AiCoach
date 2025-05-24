/*
  # Initial Schema Setup for AI Coach App

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `updated_at` (timestamp with time zone)

    - `plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `category` (text)
      - `is_ai_generated` (boolean)

    - `plan_steps`
      - `id` (uuid, primary key)
      - `plan_id` (uuid, references plans)
      - `title` (text)
      - `description` (text)
      - `order` (integer)
      - `completed` (boolean)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create plans table
CREATE TABLE plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  category text,
  is_ai_generated boolean DEFAULT false
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plans"
  ON plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans"
  ON plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create plan_steps table
CREATE TABLE plan_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES plans ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  order_number integer NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE plan_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view steps of their plans"
  ON plan_steps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = plan_steps.plan_id
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create steps for their plans"
  ON plan_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = plan_steps.plan_id
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update steps of their plans"
  ON plan_steps
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = plan_steps.plan_id
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete steps of their plans"
  ON plan_steps
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = plan_steps.plan_id
      AND plans.user_id = auth.uid()
    )
  );

-- Create function to handle updating timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON plan_steps
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();