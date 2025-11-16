/*
  # Add Waiver Acceptance to Bookings

  This migration adds fields to track customer acceptance of the waiver (liberatoria).

  ## Changes

  1. Add columns to bookings table:
    - `waiver_accepted` (boolean, required) - Customer must accept waiver
    - `waiver_accepted_at` (timestamp) - When waiver was accepted
    - `waiver_url` (text) - URL of the waiver document accepted

  2. Notes
    - Waiver acceptance is mandatory for all bookings
    - Timestamp helps with compliance and legal requirements
    - URL is stored to track which version of the waiver was accepted
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'waiver_accepted'
  ) THEN
    ALTER TABLE bookings ADD COLUMN waiver_accepted boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'waiver_accepted_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN waiver_accepted_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'waiver_url'
  ) THEN
    ALTER TABLE bookings ADD COLUMN waiver_url text;
  END IF;
END $$;