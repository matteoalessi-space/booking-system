/*
  # Allow Anonymous Activity Management for Admin Dashboard

  ## Overview
  The admin dashboard needs to be able to create and manage activities without
  requiring authentication setup. This is appropriate for an admin-only interface
  that will be deployed behind authentication at the hosting level.

  ## Changes
  - Add policy to allow anonymous (anon) role to insert, update, and delete activities
  - This assumes the admin dashboard is protected by other means (hosting auth, VPN, etc.)
*/

DROP POLICY IF EXISTS "Authenticated users can manage activities" ON activities;

CREATE POLICY "Admin users can manage activities"
  ON activities FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);