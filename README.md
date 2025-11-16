# Booking System for Shopify

A complete booking management system with admin dashboard and embeddable widget for Shopify stores.

## 🎯 What This System Does

- **Customer Booking Widget**: Customers book activities directly from your Shopify product pages
- **Admin Dashboard**: Your team manages bookings, activities, working hours, and availability
- **Automatic Shopify Integration**: Bookings sync with Shopify orders automatically
- **Compliance Ready**: Tracks privacy policy, marketing consent, and waiver acceptance

## 📦 What's Included

### 1. Admin Dashboard (React App)
- View bookings by date and activity
- Expandable time slots showing capacity and booking details
- Manage activities with variants (different options/prices)
- Set working hours and date-specific overrides
- Shopify integration settings
- Custom booking form fields
- **Protected with authentication** - only authorized team members can access

### 2. Booking Widget (widget.html)
- Self-contained single-file widget
- Embeds directly in Shopify product pages
- Shows available time slots based on capacity
- Collects customer information
- Tracks mandatory consent (privacy, waiver)
- Optional marketing consent
- Supports multiple languages (Italian/English)

### 3. Backend (Supabase)
- PostgreSQL database with Row-Level Security
- Real-time updates
- Edge functions for Shopify webhooks
- Automatic customer metafield updates

## 🚀 Quick Start

**👉 Start here:** [QUICK_START.md](./QUICK_START.md)

The quick start guide walks you through:
1. Creating your admin account (2 min)
2. Deploying the dashboard (5 min)
3. Embedding the widget in Shopify (5 min)
4. Testing your first booking (2 min)

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get up and running in 15 minutes
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Original setup and configuration
- **[SHOPIFY_INTEGRATION.md](./SHOPIFY_INTEGRATION.md)** - Shopify integration details

## 🏗️ Architecture

```
┌──────────────────────────────────────┐
│  Admin Dashboard                     │
│  (Hosted on Netlify/Vercel)         │
│  - Login required                   │
│  - Manage everything                │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│  Supabase Database + Auth           │
│  - PostgreSQL with RLS              │
│  - Edge Functions for webhooks      │
│  - User authentication              │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│  Booking Widget                      │
│  (Embedded in Shopify)              │
│  - Public-facing                    │
│  - Self-contained                   │
└──────────────────────────────────────┘
```

## 🔐 Security

### Admin Dashboard
- ✅ Protected with Supabase authentication
- ✅ Only invited users can access
- ✅ All operations use Row-Level Security

### Booking Widget
- ✅ Public-facing for customers
- ✅ Row-Level Security prevents data access
- ✅ Mandatory consent tracking (GDPR compliant)
- ✅ Cannot access admin functions

### Database
- ✅ Row-Level Security on all tables
- ✅ Anonymous users: read-only access + create bookings
- ✅ Authenticated users: full admin access

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Supabase** (PostgreSQL + Auth + Edge Functions)
- **Deno** for Edge Functions
- **Row-Level Security** for data protection

### Integrations
- **Shopify** - Product variants, cart, webhooks
- **Shopify Customer Metafields** - Waiver tracking

## 📋 Features

### Booking Management
- ✅ View bookings by activity and date
- ✅ Expandable time slots with capacity tracking
- ✅ Color-coded utilization (green/orange/red)
- ✅ Customer details (name, email, phone)
- ✅ Shopify order references
- ✅ Booking status management
- ✅ Notes and custom fields

### Activity Management
- ✅ Create unlimited activities
- ✅ Set duration and capacity
- ✅ Multiple variants per activity
- ✅ Custom colors and descriptions
- ✅ Shopify product linking
- ✅ Custom form fields per activity

### Schedule Management
- ✅ Weekly working hours
- ✅ Date-specific overrides (holidays, special hours)
- ✅ Close specific dates
- ✅ Activity-specific overrides

### Consent Tracking (GDPR Compliant)
- ✅ Privacy policy acceptance (mandatory)
- ✅ Marketing consent (optional)
- ✅ Waiver acceptance (mandatory, with URL tracking)
- ✅ Timestamps for all consents
- ✅ Stored in database + Shopify customer metafields

### Shopify Integration
- ✅ Embed widget in product pages
- ✅ Add bookings to cart
- ✅ Webhook integration (order creation/updates)
- ✅ Automatic booking creation from orders
- ✅ Customer metafield updates

## 🎨 Customization

### Widget Appearance
- Colors and styling
- Language (Italian/English)
- Form fields
- Booking button text
- Logo and branding

### Activity Configuration
- Duration (minutes)
- Capacity (max people)
- Multiple variants (e.g., different group sizes)
- Custom form fields (text, email, checkboxes, etc.)
- Price per variant

## 📱 Usage

### For Administrators
1. Login to admin dashboard
2. Navigate using sidebar menu
3. Create activities and set working hours
4. View bookings organized by activity
5. Click time slots to expand and see details
6. Manage booking status

### For Customers
1. Visit Shopify product page
2. Widget loads automatically
3. Select date and time
4. Fill in details
5. Accept privacy policy and waiver
6. Complete booking
7. Added to Shopify cart (if integrated)

## 🔄 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Project Structure

```
├── src/
│   ├── components/           # React components
│   │   ├── ActivityBookingView.tsx    # New dashboard view
│   │   ├── ActivityManager.tsx        # Activity CRUD
│   │   ├── BookingsView.tsx          # Bookings list
│   │   ├── Dashboard.tsx             # Main dashboard
│   │   ├── Login.tsx                 # Auth page
│   │   ├── WorkingHours.tsx          # Schedule management
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication context
│   ├── lib/
│   │   └── supabase.ts      # Supabase client & types
│   └── App.tsx              # Main app component
├── supabase/
│   ├── migrations/          # Database migrations
│   └── functions/           # Edge functions
│       ├── shopify-webhooks/
│       └── shopify-products/
├── widget.html              # Embeddable booking widget
├── dist/                    # Build output (deploy this)
└── docs/                    # Documentation
```

## 🐛 Troubleshooting

### Working Hours Won't Save
- **Fixed!** RLS policy updated to allow anonymous updates
- If issues persist, check browser console

### Bookings Not Appearing
- Check date filter in dashboard
- Verify activity ID in widget
- Check Supabase logs

### Widget Not Loading
- Verify Supabase credentials in widget.html
- Check activity ID is correct
- Open browser console for errors

### Login Not Working
- Ensure user exists in Supabase Authentication
- Check environment variables are set
- Verify Supabase URL and keys

## 📄 License

Private project - All rights reserved

## 🆘 Support

For issues or questions:
1. Check the documentation in this repository
2. Review Supabase dashboard logs
3. Check browser console for errors
4. Contact your system administrator

## ✅ Deployment Checklist

- [ ] Create admin users in Supabase
- [ ] Deploy admin dashboard to Netlify/Vercel
- [ ] Set environment variables
- [ ] Embed widget in Shopify
- [ ] Configure Shopify webhooks
- [ ] Test complete booking flow
- [ ] Share admin URL with team
- [ ] Train team on dashboard usage

## 🎉 You're Ready!

Follow the [QUICK_START.md](./QUICK_START.md) guide to get your booking system live in 15 minutes!
