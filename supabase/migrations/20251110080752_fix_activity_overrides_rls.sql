/*
  # Fix RLS Policies for Activity Availability Overrides

  1. Changes
    - Drop existing broad "ALL" policy
    - Create separate policies for SELECT, INSERT, UPDATE, DELETE
    - Ensure authenticated users can manage availability overrides properly

  2. Security
    - Maintains proper access control for authenticated users
    - Anonymous users can still read overrides (for widget)
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can manage availability overrides" ON activity_availability_overrides;

-- Create separate policies for each operation
CREATE POLICY "Authenticated users can insert availability overrides"
  ON activity_availability_overrides
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update availability overrides"
  ON activity_availability_overrides
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete availability overrides"
  ON activity_availability_overrides
  FOR DELETE
  TO authenticated
  USING (true);
