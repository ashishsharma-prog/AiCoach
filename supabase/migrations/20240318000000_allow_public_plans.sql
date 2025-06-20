-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own plans" ON plans;

-- Create new policy that allows public access
CREATE POLICY "Anyone can view plans"
  ON plans
  FOR SELECT
  TO public
  USING (true); 