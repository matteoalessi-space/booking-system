# Deployment Guide

This guide explains how to deploy your booking system with two separate components:
1. **Admin Dashboard** - For your team to manage bookings
2. **Booking Widget** - For customers to book on Shopify

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Admin Dashboard (Netlify/Vercel)                      │
│  - Protected with authentication                       │
│  - Accessible only to your team                       │
│  - Manages activities, bookings, settings             │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │ (Supabase Database)
                           │
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Booking Widget (widget.html)                          │
│  - Embedded directly in Shopify product pages         │
│  - Public-facing for customers                        │
│  - Self-contained single file                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Part 1: Deploy Admin Dashboard

### Step 1: Create Admin Users in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **Add User** → **Create New User**
5. Enter email and password for each team member
6. Click **Create User**

**Important:** Only users created here can access the admin dashboard.

### Step 2: Deploy to Netlify (Recommended)

#### Option A: Deploy via Netlify UI

1. **Build your app:**
   ```bash
   npm run build
   ```

2. **Create a Netlify account:**
   - Go to https://netlify.com
   - Sign up with GitHub, GitLab, or email

3. **Deploy:**
   - Drag and drop the `dist` folder to Netlify
   - Your site will be live at a URL like: `https://your-site-name.netlify.app`

4. **Set Environment Variables:**
   - In Netlify Dashboard, go to **Site Settings** → **Environment Variables**
   - Add these variables:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - Redeploy after adding variables

#### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   npm run build
   netlify deploy --prod
   ```

4. **Follow the prompts:**
   - Create a new site or select existing
   - Set build folder to `dist`

### Step 3: Deploy to Vercel (Alternative)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables:**
   - In Vercel Dashboard, go to **Settings** → **Environment Variables**
   - Add:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

### Step 4: Give Access to Your Team

1. Share the deployed URL with your team (e.g., `https://your-admin.netlify.app`)
2. Each team member uses the credentials you created in Supabase
3. They can:
   - View and manage bookings
   - Create and edit activities
   - Set working hours
   - Configure Shopify integration
   - View booking analytics

## Part 2: Embed Widget in Shopify

### Step 1: Prepare the Widget

The `widget.html` file is already self-contained and ready to use. No deployment needed!

### Step 2: Add Widget to Shopify Product Pages

#### Method 1: Using Theme Editor (Recommended)

1. **Go to Shopify Admin:**
   - Online Store → Themes → Customize

2. **Add Custom Liquid Section:**
   - Navigate to a product page
   - Click "Add section" → "Custom Liquid"

3. **Paste Widget Code:**
   - Copy the entire contents of `widget.html`
   - Paste into the Custom Liquid section

4. **Configure Activity ID:**
   - In the widget code, find this line:
     ```javascript
     const activityId = new URLSearchParams(window.location.search).get('activity_id') || 'YOUR_ACTIVITY_ID';
     ```
   - Replace `'YOUR_ACTIVITY_ID'` with your actual activity ID from the admin dashboard

5. **Save and Publish**

#### Method 2: Using Product Description (Alternative)

1. **Go to Products** in Shopify Admin
2. **Edit a product**
3. **Switch to HTML editor** in the description
4. **Paste the widget code** from `widget.html`
5. **Update the activity ID** as mentioned above
6. **Save**

#### Method 3: Using Shopify App Block (Advanced)

If you want more control, you can create a custom Shopify app that embeds the widget. This requires Shopify Partner account and app development knowledge.

### Step 3: Link Activity to Shopify Product

1. **In Admin Dashboard:**
   - Go to Activities
   - Edit an activity
   - Scroll to "Shopify Settings"
   - Enter the Shopify Product ID or Variant ID
   - Save

2. **Get Product/Variant ID from Shopify:**
   - In Shopify Admin, go to Products
   - Click on a product
   - The ID is in the URL: `products/[PRODUCT_ID]`

## Part 3: Configure Shopify Webhooks

To automatically create bookings when customers checkout:

1. **Get Webhook URL:**
   - Your webhook URL is: `https://[your-project].supabase.co/functions/v1/shopify-webhooks`

2. **Add to Shopify:**
   - Shopify Admin → Settings → Notifications
   - Scroll to "Webhooks"
   - Click "Create webhook"
   - Event: `Order creation`
   - Format: `JSON`
   - URL: Your webhook URL from step 1
   - Click "Save"

3. **Repeat for Order Updates:**
   - Create another webhook
   - Event: `Order updated`
   - Same URL and format

## Part 4: Environment Variables Reference

### Admin Dashboard (.env for development)
```env
VITE_SUPABASE_URL=https://yryfcvopmbseyrnghsft.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Widget (Already embedded in widget.html)
The widget uses these values directly in the code:
```javascript
const supabaseUrl = 'https://yryfcvopmbseyrnghsft.supabase.co';
const supabaseKey = 'your_anon_key_here';
```

## Security Considerations

### Admin Dashboard
✅ **Protected** - Requires authentication
✅ Only invited users can access
✅ User sessions are managed by Supabase
✅ All data operations use RLS policies

### Booking Widget
✅ **Public-facing** - Anyone can book
✅ Uses anonymous Supabase client
✅ Row-Level Security (RLS) protects data
✅ Cannot access admin functions

### Database Security
✅ Row-Level Security (RLS) enabled on all tables
✅ Anonymous users can only:
  - Read activities and working hours
  - Create bookings (with consent tracking)
✅ Authenticated users (admin) can manage everything

## Troubleshooting

### Admin Dashboard

**Problem:** Can't login
- **Solution:** Make sure the user was created in Supabase Authentication
- Check that environment variables are set correctly

**Problem:** "Loading..." never finishes
- **Solution:** Check browser console for errors
- Verify Supabase URL and API key are correct

### Booking Widget

**Problem:** Widget doesn't load
- **Solution:** Check browser console for errors
- Verify activity ID is correct
- Ensure Supabase credentials in widget.html are correct

**Problem:** Bookings not appearing in Shopify
- **Solution:** Verify webhooks are configured
- Check that Shopify variant IDs are set in activities
- Review Supabase edge function logs

## Custom Domain (Optional)

### For Admin Dashboard

**Netlify:**
1. Go to Domain Settings in Netlify
2. Add custom domain
3. Follow DNS configuration instructions

**Vercel:**
1. Go to Domains in Vercel dashboard
2. Add your domain
3. Configure DNS records

## Support

If you need help:
1. Check Supabase logs: Dashboard → Logs
2. Check Edge Function logs: Dashboard → Edge Functions → Logs
3. Check browser console for frontend errors

## Next Steps

1. ✅ Deploy admin dashboard
2. ✅ Create team member accounts
3. ✅ Embed widget in Shopify
4. ✅ Configure webhooks
5. ✅ Test complete booking flow
6. ✅ Share admin URL with team

Your booking system is now ready to use! 🎉
