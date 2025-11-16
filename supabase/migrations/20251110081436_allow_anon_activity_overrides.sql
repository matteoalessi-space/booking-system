/*
  # Allow Anonymous Access to Activity Availability Overrides

  1. Changes
    - Add policies for anonymous users to manage availability overrides
    - This is needed since the admin interface doesn't have authentication yet

  2. Security
    - Anonymous users can manage overrides (for admin interface)
    - In production, you should add authentication to the admin interface
*/

-- Allow anonymous users to insert
CREATE POLICY "Anonymous users can insert availability overrides"
  ON activity_availability_overrides
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to update
CREATE POLICY "Anonymous users can update availability overrides"
  ON activity_availability_overrides
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to delete
CREATE POLICY "Anonymous users can delete availability overrides"
  ON activity_availability_overrides
  FOR DELETE
  TO anon
  USING (true);
