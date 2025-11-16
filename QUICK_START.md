# Quick Start Guide

## What You Have

You now have a complete booking system split into two components:

### 1. Admin Dashboard (`dist/` folder)
- Full-featured admin interface
- **Protected with login** - only your team can access
- Manage bookings, activities, working hours, Shopify integration
- Must be hosted (Netlify/Vercel/Cloudflare)

### 2. Booking Widget (`widget.html`)
- Single self-contained file
- **Public-facing** - for customers to book
- Embed directly in Shopify product pages
- No hosting needed - paste directly into Shopify

---

## Getting Started in 5 Steps

### Step 1: Create Your Admin Account (2 minutes)

1. Go to: https://supabase.com/dashboard
2. Find your project (yryfcvopmbseyrnghsft)
3. Click **Authentication** in left sidebar
4. Click **Users** tab
5. Click **Add User** button
6. Enter your email and a password
7. Click **Create User**

✅ You can now login to the admin dashboard!

### Step 2: Deploy Admin Dashboard (5 minutes)

**Option A: Drag & Drop (Easiest)**

1. Go to: https://netlify.com
2. Sign up (free account)
3. Drag the `dist` folder onto Netlify
4. Wait 30 seconds - your site is live!
5. Go to **Site Settings** → **Environment Variables**
6. Add these two variables:
   ```
   VITE_SUPABASE_URL = https://yryfcvopmbseyrnghsft.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyeWZjdm9wbWJzZXlybmdoc2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Nzc4OTEsImV4cCI6MjA3ODI1Mzg5MX0.l8P9KMifqe8NvWaLFmiaJk-J9qSHysUSl23hLLN8FF8
   ```
7. Click **Redeploy** button

Your admin dashboard is now live at: `https://your-site.netlify.app`

**Option B: Using Netlify CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
npm run build
netlify deploy --prod

# Follow prompts, select "dist" as build folder
```

### Step 3: Test Admin Dashboard (1 minute)

1. Visit your deployed URL (e.g., `https://your-site.netlify.app`)
2. Login with the email/password from Step 1
3. You should see the dashboard!
4. Create a test activity to make sure everything works

### Step 4: Embed Widget in Shopify (5 minutes)

1. **Open Shopify Admin**
   - Go to: Online Store → Themes → Customize

2. **Add Custom Liquid Section**
   - Navigate to any product page
   - Click "Add section"
   - Choose "Custom Liquid"

3. **Paste Widget Code**
   - Open `widget.html` in a text editor
   - Copy ALL the code (Ctrl+A, Ctrl+C)
   - Paste into the Custom Liquid section

4. **Get Your Activity ID**
   - Go to your admin dashboard
   - Click "Activities"
   - Copy the ID of the activity you want to use (looks like: `abc123-def456-...`)

5. **Update Widget Code**
   - Find this line in the pasted code:
     ```javascript
     const activityId = new URLSearchParams(window.location.search).get('activity_id') || 'YOUR_ACTIVITY_ID';
     ```
   - Replace `'YOUR_ACTIVITY_ID'` with your actual ID:
     ```javascript
     const activityId = new URLSearchParams(window.location.search).get('activity_id') || 'abc123-def456-...';
     ```

6. **Save and Publish**

### Step 5: Test Booking Flow (2 minutes)

1. Visit your Shopify product page
2. You should see the booking widget
3. Try making a test booking
4. Check your admin dashboard - the booking should appear!

---

## Adding Team Members

To give access to other people:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter their email and create a password
4. Share these credentials with them
5. Share your admin dashboard URL
6. They can now login and manage bookings!

---

## Widget in Multiple Products

To use the same activity across multiple products:

**Method 1: Same Activity**
- Use the same widget code on all product pages
- All products will book the same activity

**Method 2: Different Activities**
- Create separate activities in admin dashboard
- Use different activity IDs in each product's widget code

**Method 3: URL Parameter (Advanced)**
- Use: `?activity_id=abc123` in your product URL
- The widget will automatically use that activity
- No need to hardcode activity ID

---

## Connecting Shopify Orders

To automatically create bookings from Shopify orders:

1. **In Admin Dashboard:**
   - Go to Activities
   - Edit an activity
   - Scroll to "Shopify Settings"
   - Enter your Shopify Product ID or Variant ID
   - Save

2. **In Shopify Admin:**
   - Settings → Notifications → Webhooks
   - Create webhook for "Order creation"
   - URL: `https://yryfcvopmbseyrnghsft.supabase.co/functions/v1/shopify-webhooks`
   - Format: JSON
   - Save

3. **Add Access Token (if needed):**
   - Go to Shopify Admin → Settings → Apps and sales channels → Develop apps
   - Create a private app if you haven't
   - Copy the Admin API access token
   - Add to Supabase environment variables (in dashboard)

---

## Common Tasks

### Change Working Hours
1. Login to admin dashboard
2. Go to "Working Hours"
3. Adjust times for each day
4. Click "Save"

### View Today's Bookings
1. Login to admin dashboard
2. Go to "Dashboard"
3. Set date picker to today
4. Click on any time slot to expand and see details

### Cancel a Booking
1. Go to "Bookings"
2. Find the booking
3. Change status to "Cancelled"

### Add New Activity
1. Go to "Activities"
2. Click "Add Activity"
3. Fill in details (name, duration, capacity, etc.)
4. Save
5. Copy the activity ID
6. Update widget code with new ID

---

## URLs You'll Need

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Your Project:** https://supabase.com/dashboard/project/yryfcvopmbseyrnghsft
- **Admin Dashboard:** (Your Netlify URL)
- **Shopify Admin:** (Your Shopify store admin)

---

## Troubleshooting

### Can't login to admin
- Make sure you created a user in Supabase Authentication
- Check you're using the correct email/password
- Try resetting password in Supabase

### Widget not showing on Shopify
- Check that you pasted the entire widget.html code
- Verify the activity ID is correct
- Check browser console for errors (F12)

### Bookings not appearing
- Check "Bookings" section in admin dashboard
- Verify date filter is set correctly
- Ensure the booking was completed (not abandoned)

### Working hours won't save
- You should have already fixed this! If still having issues:
- Check browser console for errors
- Try refreshing the page and saving again

---

## Need Help?

1. Check browser console (F12) for error messages
2. Check Supabase logs in dashboard
3. Review the full DEPLOYMENT_GUIDE.md for detailed troubleshooting

---

## What's Next?

✅ Set up admin account
✅ Deploy dashboard
✅ Embed widget
✅ Test bookings
⬜ Add team members
⬜ Customize widget colors
⬜ Connect Shopify webhooks
⬜ Set up working hours for all activities

You're all set! 🚀
