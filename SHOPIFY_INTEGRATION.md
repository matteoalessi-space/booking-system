# Shopify Integration Guide

This guide explains how to integrate the booking system with your Shopify store.

## Overview - Complete Customer Journey

**Each Shopify product page has its own embedded booking widget.**

### The Complete Flow:

1. **Product Page**: Customer visits a product page (e.g., "Sci Indoor" or "Trampolini elastici")
   - Widget is embedded on the page showing booking options
   - If product has multiple variants (1 Person, 2 People, etc.), customer selects one

2. **Select Booking Details**: Customer chooses:
   - Activity variant (if applicable)
   - Date from calendar
   - Available time slot
   - Number of people
   - Fills in contact information

3. **Add to Cart**: Customer clicks "Book Now"
   - Shopify product variant is added to cart
   - All booking details are attached as line item properties
   - Customer can continue shopping or proceed to checkout

4. **Checkout**: Customer completes Shopify checkout normally
   - Cart shows product with booking date/time
   - Payment processed through Shopify

5. **Booking Confirmed**: After successful payment
   - Shopify webhook triggers booking confirmation
   - Booking appears in your admin dashboard with "confirmed" status
   - Linked to Shopify order ID for tracking

6. **Order Confirmation Email**: Customer receives Shopify order confirmation
   - Standard order details (product, price, shipping)
   - **Plus formatted booking details**: Activity name, date, time, number of people
   - Reminder to arrive early and cancellation policy

---

## Step 1: Link Activities to Shopify Products

### A. Create Activity from Shopify Product

1. Log into your booking admin dashboard
2. Go to **Activities** → **Add Activity**
3. **Select a Shopify product** from the list
4. Configure default settings (duration, capacity)
5. Click **Create Activity & Variants**
6. All Shopify product variants are automatically created as activity variants

### B. Find Your Activity ID

1. In your admin dashboard, go to **Activities**
2. Find the activity you want to embed
3. Click the **external link icon** (🔗) next to the activity
4. Copy the ID from the URL: `?activityId=COPY_THIS_ID`

---

## Step 2: Embed Widget on Product Pages

You have two options: embed on all products or specific products.

### Option A: Embed on Specific Products (Recommended)

**1. Add Metafield to Product:**

In Shopify Admin:
1. Go to **Products** → Select your product
2. Scroll down to **Metafields** section
3. Click **Add metafield**
4. Configure:
   - **Namespace and key**: `custom.activity_id`
   - **Type**: Single line text
   - **Value**: Paste your activity ID (e.g., `7f187aa0-f43a-434c-b2c8-d84a15591ccf`)
5. Save the product

**2. Edit Product Template:**

In Shopify Admin:
1. Go to **Online Store** → **Themes**
2. Click **Actions** → **Edit code**
3. Find `sections/main-product.liquid` or your product template
4. Add this code after the product description (around line 200-300):

```liquid
{% if product.metafields.custom.activity_id != blank %}
<div id="booking-widget-section" style="margin: 60px 0; padding: 40px; background: #f9fafb; border-radius: 12px;">
  <h2 style="font-size: 28px; font-weight: bold; margin-bottom: 24px; color: #111827;">Book Your Experience</h2>
  <iframe
    id="booking-widget"
    src="https://YOUR_DOMAIN.com/widget.html?activityId={{ product.metafields.custom.activity_id }}"
    style="width: 100%; min-height: 700px; border: none; border-radius: 8px; background: white;"
    frameborder="0"
    scrolling="auto"
  ></iframe>
</div>
{% endif %}
```

**Important**: Replace `YOUR_DOMAIN.com` with your actual domain where the booking system is hosted.

### Option B: Embed on All Products

If you want the widget to appear on all product pages, use the same code but remove the `if` condition:

```liquid
<div id="booking-widget-section" style="margin: 60px 0;">
  <h2>Book Your Experience</h2>
  <iframe
    src="https://YOUR_DOMAIN.com/widget.html?activityId={{ product.metafields.custom.activity_id }}"
    style="width: 100%; min-height: 700px; border: none;"
  ></iframe>
</div>
```

---

## Step 3: Configure Shopify Webhook

The webhook automatically creates confirmed bookings when orders are placed.

**1. Create Order Webhook:**

In Shopify Admin:
1. Go to **Settings** → **Notifications**
2. Scroll to **Webhooks** section
3. Click **Create webhook**
4. Configure:
   - **Event**: `Order creation`
   - **Format**: `JSON`
   - **URL**: `https://yryfcvopmbseyrnghsft.supabase.co/functions/v1/shopify-webhooks`
   - **Webhook API version**: `2024-10` (or latest)
5. Click **Save webhook**

**2. Create Order Updated Webhook (for payment confirmations):**

Repeat the above but select:
- **Event**: `Order updated`
- Use the same URL

**3. Verify Webhooks:**

After setup:
1. Make a test order
2. Go back to **Settings** → **Notifications** → **Webhooks**
3. Click on your webhook
4. Check **Recent deliveries** to see if it's working
5. Look for 200 status codes (success)

---

## Step 4: Customize Order Confirmation Email

This adds beautiful booking details to the order confirmation email.

**1. Edit Email Template:**

In Shopify Admin:
1. Go to **Settings** → **Notifications**
2. Find **Order confirmation** in the list
3. Click to edit

**2. Add Booking Details Section:**

Scroll down in the email template and add this code after the order items section (look for `{% for line in subtotal_line_items %}`):

```liquid
{% comment %} Booking Details Section {% endcomment %}
{% for line in line_items %}
  {% if line.properties.size > 0 %}
    {% assign has_booking = false %}
    {% for property in line.properties %}
      {% if property.first == "Booking Date" %}
        {% assign has_booking = true %}
      {% endif %}
    {% endfor %}

    {% if has_booking %}
      <table class="row" style="margin-top: 40px;">
        <tr>
          <td colspan="2" class="shop-name__cell">
            <h2 style="font-size: 24px; margin: 0 0 20px; color: #333;">📅 Your Booking Details</h2>
          </td>
        </tr>
      </table>

      <div style="background: #f8f9fa; padding: 24px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 16px; font-size: 20px; color: #333;">{{ line.title }}</h3>

        <table style="width: 100%; border-collapse: collapse;">
          {% for property in line.properties %}
            {% unless property.first contains "ID" %}
              <tr>
                <td style="padding: 10px 12px; font-weight: 600; color: #555; border-bottom: 1px solid #e5e7eb;">
                  {{ property.first }}:
                </td>
                <td style="padding: 10px 12px; color: #333; border-bottom: 1px solid #e5e7eb;">
                  {{ property.last }}
                </td>
              </tr>
            {% endunless %}
          {% endfor %}
        </table>

        <div style="margin-top: 24px; padding: 16px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-weight: 600;">Important Reminders:</p>
          <ul style="margin: 8px 0 0 20px; color: #856404;">
            <li>Please arrive 10 minutes before your scheduled time</li>
            <li>To reschedule, contact us at least 24 hours in advance</li>
            <li>Bring this confirmation with you</li>
          </ul>
        </div>
      </div>
    {% endif %}
  {% endif %}
{% endfor %}
```

**3. Save the template**

---

## Step 5: Test the Complete Flow

**1. Test on Product Page:**
1. Visit a product with the widget embedded
2. You should see the booking widget below the product description
3. Select a date, time, and fill in details

**2. Test Cart & Checkout:**
1. Click "Book Now" in the widget
2. Widget should show "Added to Cart"
3. Go to cart - you should see the product with booking date/time
4. Complete checkout (use Shopify test mode)

**3. Verify Booking Created:**
1. Go to your booking admin dashboard
2. Check **Bookings** page
3. You should see the new booking with status "confirmed"
4. It should have the Shopify order ID linked

**4. Check Email:**
1. Check the order confirmation email
2. You should see:
   - Standard order details
   - Booking details section with date, time, people
   - Reminder notes

---

## How It Works Technically

### Widget Smart Detection

The widget automatically detects if it's on Shopify:
```javascript
if (typeof window.Shopify !== 'undefined') {
  // Add to Shopify cart
} else {
  // Create booking directly
}
```

### Booking Data Flow

1. **Cart Properties** - Widget adds these to Shopify cart:
   - Booking Date
   - Booking Time (start - end)
   - Number of People
   - Customer Name
   - Customer Email
   - Customer Phone
   - Activity ID (hidden)
   - Variant ID (hidden)
   - Notes
   - Any custom form fields

2. **Webhook Processing** - When order is created:
   - Extracts line item properties
   - Creates booking in database
   - Links to Shopify order ID
   - Sets status based on payment status

3. **Status Management**:
   - `pending` - Added to cart, not yet paid
   - `confirmed` - Payment successful
   - `cancelled` - Order refunded/cancelled

### URL Parameters

Widget supports multiple URL formats:
- `?activityId=xxx` - Load specific activity
- `?variantId=xxx` - Load by Shopify variant ID
- Both work with camelCase or snake_case

---

## Troubleshooting

### Widget Shows "Activity not found"

**Possible causes:**
- Activity ID in metafield is incorrect
- Activity is set to inactive in admin
- Database connection issue

**Solution:**
1. Check activity ID matches exactly
2. In admin, verify activity is marked as "active"
3. Click external link icon in admin to test widget directly

### Bookings Not Created After Checkout

**Possible causes:**
- Webhook not configured correctly
- Webhook deliveries failing

**Solution:**
1. Go to Shopify Admin → Settings → Notifications → Webhooks
2. Click on your webhook
3. Check "Recent deliveries"
4. Look for failed attempts (non-200 status)
5. Click to see error details
6. Verify webhook URL is correct

### Booking Details Not in Email

**Possible causes:**
- Email template code not saved
- Code placed in wrong section

**Solution:**
1. Verify you saved the email template
2. Make a test order to see the email
3. Ensure code is after the line items loop
4. Check for Liquid syntax errors (Shopify shows these when saving)

### Widget Not Loading on Product Page

**Possible causes:**
- Metafield not set on product
- Theme code not saved
- Wrong template file edited

**Solution:**
1. Verify product has `custom.activity_id` metafield
2. Check correct template file (might be in a section vs template)
3. Clear theme cache and reload page
4. Check browser console for errors

---

## Advanced Configuration

### Multiple Products, One Activity

If you want multiple Shopify products to use the same booking widget:
1. Set the same `activity_id` metafield on all products
2. They'll all share the same availability calendar
3. Useful for bundled products or product variants

### Custom Styling

To match your theme, add CSS to the iframe container:

```liquid
<style>
  #booking-widget-section {
    background: {{ settings.accent_color }};
    padding: 40px;
    border-radius: 12px;
  }

  #booking-widget-section h2 {
    color: {{ settings.heading_color }};
    font-family: {{ settings.heading_font }};
  }
</style>
```

### Availability Display

The widget automatically:
- Shows only available time slots
- Reduces capacity as bookings are made
- Marks fully booked slots as disabled
- Updates in real-time

---

## Support & Monitoring

### View Bookings

In your admin dashboard:
1. Go to **Bookings** page
2. Filter by status, date, or activity
3. See customer details and Shopify order link
4. Export to CSV for reporting

### Check Webhook Logs

In Supabase Dashboard:
1. Go to **Edge Functions**
2. Click on `shopify-webhooks`
3. View logs to see webhook processing
4. Debug any errors

### Monitor Availability

1. Set working hours in **Settings**
2. View calendar in **Bookings** page
3. See capacity utilization
4. Adjust as needed

---

## Summary

This integration creates a seamless experience where:

✅ Each product page has its own booking widget
✅ Customers select activities and book directly
✅ Bookings feed into Shopify cart
✅ Checkout processes payment normally
✅ Webhooks auto-confirm bookings
✅ Order emails include booking details
✅ Everything is tracked in your admin dashboard

Your customers get a professional booking experience without leaving Shopify!
