/*
  # Add Specific Date Overrides for Working Hours

  This migration adds support for specific date exceptions to the working hours system.
  For example, if you're normally closed on Mondays but want to be open on December 8th,
  you can add a specific date override.

  ## Changes

  1. New Table: `working_hours_date_overrides`
    - `id` (uuid, primary key)
    - `specific_date` (date, unique) - The specific date to override (e.g., 2024-12-08)
    - `start_time` (time) - Opening time for this date
    - `end_time` (time) - Closing time for this date
    - `is_open` (boolean) - Whether you're open on this date
    - `label` (text, optional) - A label for this override (e.g., "Immacolata", "Christmas Eve")
    - `created_at` (timestamp)

  2. Security
    - Enable RLS on the table
    - Allow anonymous users to read overrides (needed for widget)
    - Only allow reading specific date overrides

  ## Priority Order
  
  The widget will check in this order:
  1. Specific date override (this new feature)
  2. Activity-specific day override (existing feature)
  3. Default working hours (existing feature)
*/

CREATE TABLE IF NOT EXISTS working_hours_date_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specific_date date UNIQUE NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_open boolean DEFAULT true,
  label text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE working_hours_date_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view date overrides"
  ON working_hours_date_overrides FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert date overrides"
  ON working_hours_date_overrides FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update date overrides"
  ON working_hours_date_overrides FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete date overrides"
  ON working_hours_date_overrides FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_date_overrides_date ON working_hours_date_overrides(specific_date);