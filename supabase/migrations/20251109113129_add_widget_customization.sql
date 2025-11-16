/*
  # Add Widget Customization and Custom Form Fields

  ## Overview
  Enables per-activity customization of widget appearance and booking form fields.
  Each activity can have unique branding, colors, and custom questions.

  ## Changes to Existing Tables

  ### activities table - New columns
  - `widget_primary_color` (text) - Primary brand color for widget
  - `widget_background_color` (text) - Background color
  - `widget_text_color` (text) - Text color
  - `widget_button_color` (text) - Button color
  - `widget_button_text_color` (text) - Button text color
  - `widget_title` (text) - Custom title for booking widget
  - `widget_description` (text) - Custom description/instructions
  - `widget_header_image` (text) - Optional header image URL

  ## New Tables

  ### booking_form_fields
  Custom fields for each activity's booking form
  - `id` (uuid, primary key)
  - `activity_id` (uuid, foreign key to activities)
  - `field_label` (text) - Display label for the field
  - `field_type` (text) - 'text', 'textarea', 'select', 'checkbox', 'number', 'email', 'phone'
  - `field_options` (jsonb) - Options for select fields, validation rules
  - `is_required` (boolean) - Whether field is mandatory
  - `placeholder` (text) - Placeholder text
  - `order_position` (integer) - Display order
  - `created_at` (timestamptz)

  ### booking_field_responses
  Stores customer responses to custom fields
  - `id` (uuid, primary key)
  - `booking_id` (uuid, foreign key to bookings)
  - `form_field_id` (uuid, foreign key to booking_form_fields)
  - `response_value` (text) - Customer's answer
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on new tables
  - Public read for active activities' form fields
  - Public insert for responses (widget access)
  - Authenticated full access for admin

  ## Indexes
  - Fast lookups by activity
  - Ordered retrieval of form fields
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'widget_primary_color'
  ) THEN
    ALTER TABLE activities ADD COLUMN widget_primary_color text DEFAULT '#3B82F6';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'widget_background_color'
  ) THEN
    ALTER TABLE activities ADD COLUMN widget_background_color text DEFAULT '#FFFFFF';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'widget_text_color'
  ) THEN
    ALTER TABLE activities ADD COLUMN widget_text_color text DEFAULT '#1F2937';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'widget_button_color'
  ) THEN
    ALTER TABLE activities ADD COLUMN widget_button_color text DEFAULT '#3B82F6';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'widget_button_text_color'
  ) THEN
    ALTER TABLE activities ADD COLUMN widget_button_text_color text DEFAULT '#FFFFFF';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'widget_title'
  ) THEN
    ALTER TABLE activities ADD COLUMN widget_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'widget_description'
  ) THEN
    ALTER TABLE activities ADD COLUMN widget_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name = 'widget_header_image'
  ) THEN
    ALTER TABLE activities ADD COLUMN widget_header_image text;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS booking_form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  field_label text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('text', 'textarea', 'select', 'checkbox', 'number', 'email', 'phone', 'date')),
  field_options jsonb DEFAULT '{}',
  is_required boolean DEFAULT false,
  placeholder text,
  order_position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS booking_field_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  form_field_id uuid NOT NULL REFERENCES booking_form_fields(id) ON DELETE CASCADE,
  response_value text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_form_fields_activity ON booking_form_fields(activity_id, order_position);
CREATE INDEX IF NOT EXISTS idx_field_responses_booking ON booking_field_responses(booking_id);

ALTER TABLE booking_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_field_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read form fields for active activities"
  ON booking_form_fields FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM activities
      WHERE activities.id = booking_form_fields.activity_id
      AND activities.is_active = true
    )
  );

CREATE POLICY "Authenticated users can manage form fields"
  ON booking_form_fields FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can create field responses"
  ON booking_field_responses FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read field responses"
  ON booking_field_responses FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage field responses"
  ON booking_field_responses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);