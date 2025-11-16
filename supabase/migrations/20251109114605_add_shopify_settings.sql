/*
  # Add Shopify Settings Storage

  ## Overview
  Store Shopify API credentials and configuration for direct API integration.
  This allows the app to fetch products and variants directly from the store.

  ## New Tables

  ### shopify_settings
  Stores Shopify API credentials (single row table)
  - `id` (uuid, primary key)
  - `shop_domain` (text) - e.g., mystore.myshopify.com
  - `access_token` (text) - Shopify Admin API access token
  - `api_version` (text) - API version to use (e.g., 2024-01)
  - `is_configured` (boolean) - Whether settings are complete
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS
  - Allow anon/authenticated to read and update (admin interface)
*/

CREATE TABLE IF NOT EXISTS shopify_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain text NOT NULL,
  access_token text NOT NULL,
  api_version text DEFAULT '2024-01',
  is_configured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shopify_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage Shopify settings"
  ON shopify_settings FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO shopify_settings (shop_domain, access_token, is_configured)
VALUES ('', '', false)
ON CONFLICT DO NOTHING;