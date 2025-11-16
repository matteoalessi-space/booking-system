# Shopify Activity Booking System - Setup Guide

## Overview
Your booking system is complete and ready to use. It includes:
- Admin dashboard to manage activities, working hours, and bookings
- Embeddable widget for Shopify product pages
- Shopify webhook integration for POS bookings
- Full capacity management and availability controls

## What You Can Do

### 1. Admin Dashboard (Main Application)
Access at: `http://your-domain.com`

**Dashboard View**: See overview statistics and recent bookings

**Activities Management**:
- Create unlimited activities with custom durations and capacity limits
- Set Shopify Product IDs to link activities to your products
- Choose custom colors for each activity
- Activate/deactivate activities
- Configure activity-specific availability overrides

**Working Hours**:
- Set default hours for each day of the week
- Mark days as open or closed
- Hours apply to all activities by default

**Bookings View**:
- See all bookings in one place
- Filter by status (confirmed/cancelled/completed)
- Filter by date (today/upcoming/past)
- Search by customer name, email, or activity
- Update booking status
- View customer details and booking source

### 2. Embeddable Widget
Access at: `http://your-domain.com/widget.html`

**Usage in Shopify**:
```html
<iframe
  src="https://your-domain.com/widget.html?product_id=YOUR_SHOPIFY_PRODUCT_ID"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>
```

Or link directly to a specific activity:
```html
<iframe
  src="https://your-domain.com/widget.html?activity_id=YOUR_ACTIVITY_ID"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>
```

**Widget Features**:
- Shows available time slots based on working hours
- Real-time capacity checking
- Customer information collection
- Booking confirmation
- Respects activity-specific availability overrides

### 3. Shopify Integration

**Webhook for POS Orders**:
Your edge function is deployed at:
```
https://your-supabase-project.supabase.co/functions/v1/shopify-webhook
```

**Setup in Shopify**:
1. Go to Settings > Notifications > Webhooks
2. Create webhook for "Order creation"
3. Set URL to the edge function above
4. When customers order activity products at POS, bookings are automatically created

**How It Works**:
- Link activities to Shopify products using Product ID
- When orders contain these products, bookings are auto-created
- Booking data can be passed via product properties
- All bookings appear in your dashboard

## Database Structure

### Activities Table
- Stores all your bookable activities
- Links to Shopify products via `shopify_product_id`
- Controls duration, capacity, and active status

### Working Hours Table
- Default schedule for Monday-Sunday
- Each day has start/end times and active status

### Activity Availability Overrides
- Override working hours for specific activities
- Can be recurring (every Monday) or one-time (specific date)
- Can block time slots or add extra availability

### Bookings Table
- All booking records with customer info
- Tracks source (widget/pos/manual)
- Status management (confirmed/cancelled/completed)
- Links to Shopify orders when applicable

## Quick Start

1. **Set Your Working Hours**
   - Navigate to "Working Hours" in the dashboard
   - Configure your default schedule
   - Save changes

2. **Create Activities**
   - Go to "Activities"
   - Click "Add Activity"
   - Set name, duration, capacity
   - Optionally add Shopify Product ID
   - Save

3. **Customize Activity Availability** (Optional)
   - In Activities, click the settings icon
   - Add overrides for specific days or dates
   - Block unavailable times or add extra slots

4. **Embed Widget in Shopify**
   - Copy the iframe code above
   - Paste into your product page templates
   - Replace YOUR_SHOPIFY_PRODUCT_ID with actual ID

5. **Setup Shopify Webhook** (Optional)
   - Add webhook in Shopify admin
   - Enables automatic booking from POS

## Tips

- **Capacity Management**: The system automatically tracks how many spots are filled and shows remaining capacity
- **Multiple Activities per Product**: If you have variants, create separate activities
- **Custom Availability**: Use overrides for holidays, special events, or activity-specific schedules
- **Booking Sources**: Track where bookings come from (widget, POS, or manual entry)
- **Status Workflow**: Confirmed → Completed or Cancelled

## Support

All data is stored securely in your Supabase database. The widget works standalone and can be embedded anywhere. The admin dashboard requires authentication for security.
