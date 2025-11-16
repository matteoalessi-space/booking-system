import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Activity {
  id: string;
  shopify_variant_id: string | null;
  name: string;
  description: string | null;
  duration_minutes: number;
  max_capacity: number;
  color: string;
  is_active: boolean;
  widget_primary_color: string;
  widget_background_color: string;
  widget_text_color: string;
  widget_button_color: string;
  widget_button_text_color: string;
  widget_title: string | null;
  widget_description: string | null;
  widget_header_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityVariant {
  id: string;
  activity_id: string;
  name: string;
  shopify_variant_id: string | null;
  duration_minutes: number;
  max_capacity: number;
  price: number | null;
  is_active: boolean;
  order_position: number;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface WorkingHoursDateOverride {
  id: string;
  specific_date: string;
  start_time: string;
  end_time: string;
  is_open: boolean;
  label: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  activity_id: string;
  variant_id: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  number_of_people: number;
  shopify_order_id: string | null;
  source: string;
  status: string;
  notes: string | null;
  privacy_policy_accepted: boolean;
  privacy_policy_accepted_at: string | null;
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  waiver_accepted: boolean;
  waiver_accepted_at: string | null;
  waiver_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingFormField {
  id: string;
  activity_id: string;
  field_label: string;
  field_type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'email' | 'phone' | 'date';
  field_options: {
    select_options?: string[];
    min?: number;
    max?: number;
    validation_pattern?: string;
  };
  is_required: boolean;
  placeholder: string | null;
  order_position: number;
  created_at: string;
}

export interface BookingFieldResponse {
  id: string;
  booking_id: string;
  form_field_id: string;
  response_value: string;
  created_at: string;
}
