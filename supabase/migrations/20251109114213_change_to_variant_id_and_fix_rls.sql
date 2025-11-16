/*
  # Change Shopify Product ID to Variant ID and Fix Policies

  ## Overview
  - Rename shopify_product_id to shopify_variant_id for more accurate linking
  - This allows linking to specific product variants instead of just products
  - Shopify variants are more precise for booking different activity types

  ## Changes
  1. Rename column in activities table
  2. Update index for variant lookups
  3. Update widget query to use variant_id parameter
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'shopify_product_id'
  ) THEN
    ALTER TABLE activities RENAME COLUMN shopify_product_id TO shopify_variant_id;
  END IF;
END $$;

DROP INDEX IF EXISTS idx_activities_shopify_product;
CREATE INDEX IF NOT EXISTS idx_activities_shopify_variant ON activities(shopify_variant_id);