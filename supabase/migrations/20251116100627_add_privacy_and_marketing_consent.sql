/*
  # Add Privacy Policy and Marketing Consent Fields

  This migration adds fields to track customer consent for privacy policy
  and marketing communications.

  ## Changes

  1. Add columns to bookings table:
    - `privacy_policy_accepted` (boolean, required) - Customer must accept privacy policy
    - `marketing_consent` (boolean, default false) - Customer opts in to marketing
    - `privacy_policy_accepted_at` (timestamp) - When privacy policy was accepted
    - `marketing_consent_at` (timestamp) - When marketing consent was given

  2. Notes
    - Privacy policy acceptance is mandatory for all bookings
    - Marketing consent is optional
    - Timestamps help with compliance and auditing
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'privacy_policy_accepted'
  ) THEN
    ALTER TABLE bookings ADD COLUMN privacy_policy_accepted boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'marketing_consent'
  ) THEN
    ALTER TABLE bookings ADD COLUMN marketing_consent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'privacy_policy_accepted_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN privacy_policy_accepted_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'marketing_consent_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN marketing_consent_at timestamptz;
  END IF;
END $$;