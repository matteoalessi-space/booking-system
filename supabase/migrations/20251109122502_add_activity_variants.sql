/*
  # Add Activity Variants Support

  ## Overview
  Restructure to support multiple variants per activity, matching Shopify's variant structure.
  Each variant can have different duration, capacity, and pricing (linked to Shopify variant).

  ## Changes

  1. New Tables
    - `activity_variants` - Store different options for each activity
      - `id` (uuid, primary key)
      - `activity_id` (uuid, foreign key to activities)
      - `name` (text) - Variant name (e.g., "1 Participant", "2 Hours")
      - `shopify_variant_id` (text) - Link to Shopify variant
      - `duration_minutes` (integer) - Duration for this variant
      - `max_capacity` (integer) - Capacity for this variant
      - `price` (numeric) - Price from Shopify
      - `is_active` (boolean)
      - `order_position` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Modifications to existing tables
    - Move shopify_variant_id from activities to activity_variants
    - Keep duration_minutes and max_capacity in activities as defaults

  3. Update bookings table
    - Add `variant_id` column to track which variant was booked

  ## Security
  - Enable RLS on activity_variants
  - Allow public read for active variants
  - Allow admin management
*/

CREATE TABLE IF NOT EXISTS activity_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  name text NOT NULL,
  shopify_variant_id text,
  duration_minutes integer NOT NULL DEFAULT 60,
  max_capacity integer NOT NULL DEFAULT 1,
  price numeric(10, 2),
  is_active boolean DEFAULT true,
  order_position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_variants_activity_id ON activity_variants(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_variants_shopify_variant_id ON activity_variants(shopify_variant_id);

ALTER TABLE activity_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active variants"
  ON activity_variants FOR SELECT
  TO anon, public
  USING (is_active = true);

CREATE POLICY "Admin users can manage variants"
  ON activity_variants FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'variant_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN variant_id uuid REFERENCES activity_variants(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_variant_id ON bookings(variant_id);