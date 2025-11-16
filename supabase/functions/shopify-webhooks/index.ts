import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Shopify-Topic, X-Shopify-Hmac-Sha256, X-Shopify-Shop-Domain',
};

interface ShopifyLineItem {
  id: number;
  variant_id: number;
  title: string;
  quantity: number;
  price: string;
  properties?: Array<{ name: string; value: string }>;
}

interface ShopifyOrder {
  id: number;
  order_number: number;
  email?: string;
  customer?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  line_items: ShopifyLineItem[];
  financial_status: string;
  created_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const shopifyTopic = req.headers.get('X-Shopify-Topic');
    const order: ShopifyOrder = await req.json();

    console.log(`Received webhook: ${shopifyTopic} for order #${order.order_number}`);

    if (shopifyTopic === 'orders/create' || shopifyTopic === 'orders/updated') {
      for (const lineItem of order.line_items) {
        const properties = lineItem.properties || [];

        const activityIdProp = properties.find(p => p.name === 'Activity ID');
        const variantIdProp = properties.find(p => p.name === 'Variant ID');
        const bookingDateProp = properties.find(p => p.name === 'Booking Date');
        const bookingTimeProp = properties.find(p => p.name === 'Booking Time');

        if (!activityIdProp || !bookingDateProp || !bookingTimeProp) {
          console.log(`Line item ${lineItem.id} is not a booking - skipping`);
          continue;
        }

        const activityId = activityIdProp.value;
        const variantId = variantIdProp?.value || null;
        const bookingDate = bookingDateProp.value;
        const [startTime, endTime] = bookingTimeProp.value.split(' - ');

        const existingBooking = await supabase
          .from('bookings')
          .select('id')
          .eq('shopify_order_id', order.id.toString())
          .eq('activity_id', activityId)
          .eq('booking_date', bookingDate)
          .eq('start_time', startTime)
          .maybeSingle();

        if (existingBooking.data) {
          console.log(`Booking already exists for order ${order.id} - skipping`);
          continue;
        }

        const customerName = properties.find(p => p.name === 'Customer Name')?.value
          || (order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 'Unknown');

        const customerEmail = properties.find(p => p.name === 'Customer Email')?.value
          || order.customer?.email
          || order.email
          || 'no-email@shopify.com';

        const customerPhone = properties.find(p => p.name === 'Customer Phone')?.value
          || order.customer?.phone
          || null;

        const numberOfPeople = parseInt(properties.find(p => p.name === 'Number of People')?.value || '1');
        const notes = properties.find(p => p.name === 'Notes')?.value || null;

        const privacyAccepted = properties.find(p => p.name === 'Privacy Policy Accepted')?.value === 'Yes';
        const marketingConsent = properties.find(p => p.name === 'Marketing Consent')?.value === 'Yes';
        const waiverAccepted = properties.find(p => p.name === 'Waiver Accepted')?.value === 'Yes';

        const status = order.financial_status === 'paid' ? 'confirmed' : 'pending';
        const now = new Date().toISOString();

        const bookingData = {
          activity_id: activityId,
          variant_id: variantId || null,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          number_of_people: numberOfPeople,
          shopify_order_id: order.id.toString(),
          source: 'shopify',
          status: status,
          notes: notes,
          privacy_policy_accepted: privacyAccepted,
          privacy_policy_accepted_at: privacyAccepted ? now : null,
          marketing_consent: marketingConsent,
          marketing_consent_at: marketingConsent ? now : null,
          waiver_accepted: waiverAccepted,
          waiver_accepted_at: waiverAccepted ? now : null,
          waiver_url: waiverAccepted ? 'https://www.spaceverbania.com/pages/liberatoria-unica-it' : null,
        };

        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .insert([bookingData])
          .select()
          .single();

        if (bookingError) {
          console.error('Error creating booking:', bookingError);
          continue;
        }

        console.log(`Created booking ${booking.id} for order ${order.id}`);

        if (order.customer && order.customer.id && waiverAccepted) {
          try {
            const shopifyDomain = Deno.env.get('SHOPIFY_SHOP_DOMAIN');
            const shopifyAccessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');

            if (shopifyDomain && shopifyAccessToken) {
              const shopifyApiUrl = `https://${shopifyDomain}/admin/api/2024-01/customers/${order.customer.id}.json`;

              const customerUpdateResponse = await fetch(shopifyApiUrl, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': shopifyAccessToken,
                },
                body: JSON.stringify({
                  customer: {
                    id: order.customer.id,
                    metafields: [
                      {
                        namespace: 'custom',
                        key: 'waiver_accepted',
                        value: 'true',
                        type: 'boolean',
                      },
                      {
                        namespace: 'custom',
                        key: 'waiver_accepted_at',
                        value: now,
                        type: 'date_time',
                      },
                      {
                        namespace: 'custom',
                        key: 'waiver_url',
                        value: 'https://www.spaceverbania.com/pages/liberatoria-unica-it',
                        type: 'single_line_text_field',
                      },
                    ],
                  },
                }),
              });

              if (customerUpdateResponse.ok) {
                console.log(`Updated Shopify customer ${order.customer.id} with waiver acceptance`);
              } else {
                const errorText = await customerUpdateResponse.text();
                console.error(`Failed to update Shopify customer metafields: ${errorText}`);
              }
            }
          } catch (metafieldError) {
            console.error('Error updating customer metafields:', metafieldError);
          }
        }

        const customFieldProps = properties.filter(
          p => !['Activity ID', 'Variant ID', 'Booking Date', 'Booking Time', 'Customer Name', 'Customer Email', 'Customer Phone', 'Number of People', 'Notes', 'Privacy Policy Accepted', 'Marketing Consent', 'Waiver Accepted'].includes(p.name)
        );

        if (customFieldProps.length > 0) {
          const { data: formFields } = await supabase
            .from('booking_form_fields')
            .select('id, field_label')
            .eq('activity_id', activityId);

          if (formFields && formFields.length > 0) {
            const responses = [];
            for (const prop of customFieldProps) {
              const field = formFields.find(f => f.field_label === prop.name);
              if (field) {
                responses.push({
                  booking_id: booking.id,
                  form_field_id: field.id,
                  response_value: prop.value,
                });
              }
            }

            if (responses.length > 0) {
              await supabase.from('booking_field_responses').insert(responses);
              console.log(`Added ${responses.length} custom field responses`);
            }
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Webhook processed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook topic not handled' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});