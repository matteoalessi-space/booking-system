/*
  # Allow Anonymous Updates to Working Hours

  This is a temporary fix to allow the admin interface to update working hours
  without authentication. In production, this should be replaced with proper
  authentication or the admin interface should use service role key.

  ## Changes

  1. Drop existing policy for authenticated users
  2. Create new policy allowing both authenticated and anonymous users to manage working hours

  ## Security Note
  
  WARNING: This allows anyone with the anon key to modify working hours.
  Consider implementing authentication for the admin interface in production.
*/

DROP POLICY IF EXISTS "Authenticated users can manage working hours" ON working_hours;

CREATE POLICY "Allow working hours management"
  ON working_hours
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);