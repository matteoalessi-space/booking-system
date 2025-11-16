# Deploy Your Booking App to Netlify

Follow these steps to deploy your booking system and access the admin panel from Chrome.

## Option 1: Deploy via Netlify Website (Easiest - No GitHub Required)

### Step 1: Sign Up for Netlify
1. Go to [https://www.netlify.com](https://www.netlify.com)
2. Click **Sign Up** (it's free)
3. Sign up with email or Google

### Step 2: Deploy with Drag & Drop
1. After signing in, you'll see your dashboard
2. Look for the **"Add new site"** button and click it
3. Select **"Deploy manually"** (drag and drop option)
4. Open your project folder on your computer and find the **`dist`** folder
5. **Drag and drop the entire `dist` folder** onto the Netlify deploy area
6. Netlify will upload and deploy your site in seconds

### Step 3: Configure Environment Variables
1. Once deployed, click on **"Site configuration"** in the left menu
2. Go to **"Environment variables"** section
3. Click **"Add a variable"** and add these two:

   **Variable 1:**
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://yryfcvopmbseyrnghsft.supabase.co`

   **Variable 2:**
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyeWZjdm9wbWJzZXlybmdoc2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Nzc4OTEsImV4cCI6MjA3ODI1Mzg5MX0.l8P9KMifqe8NvWaLFmiaJk-J9qSHysUSl23hLLN8FF8`

4. Click **"Save"**

### Step 4: Redeploy (Important!)
1. Go to **"Deploys"** in the left menu
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for the deployment to complete (about 1 minute)

### Step 5: Access Your Admin Panel
1. Once deployed, Netlify will give you a URL like: `https://random-name-123456.netlify.app`
2. Open this URL in Chrome
3. You should see the login page
4. Log in with your email and password

**Done!** Your admin panel is now live and accessible from anywhere.

---

## Option 2: Deploy via GitHub + Netlify (Automatic Updates)

This option is better if you want automatic deployments when you make changes.

### Step 1: Create a GitHub Repository
1. Go to [https://github.com](https://github.com)
2. Sign in or create an account
3. Click the **+** icon in the top right → **"New repository"**
4. Name it something like `booking-system`
5. Keep it **Public** (or Private if you prefer)
6. Click **"Create repository"**

### Step 2: Push Your Code to GitHub
Open your terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/booking-system.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Connect Netlify to GitHub
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select your repository (`booking-system`)
6. Netlify will auto-detect the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click **"Deploy site"**

### Step 4: Configure Environment Variables
1. Go to **"Site configuration"** → **"Environment variables"**
2. Add the same two variables from Option 1 above
3. Click **"Save"**

### Step 5: Trigger Rebuild
1. Go to **"Deploys"**
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait for deployment to complete

### Step 6: Access Your Admin Panel
1. Copy your Netlify URL (e.g., `https://your-site-name.netlify.app`)
2. Open in Chrome
3. Log in with your credentials

**Benefit:** Every time you push changes to GitHub, Netlify will automatically rebuild and redeploy your site!

---

## Option 3: Deploy to Vercel (Alternative to Netlify)

### Step 1: Sign Up for Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"** (free)
3. Sign up with GitHub (recommended) or email

### Step 2: Deploy from GitHub
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Vercel will auto-detect settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

### Step 3: Add Environment Variables
Before clicking "Deploy", expand **"Environment Variables"** and add:
- `VITE_SUPABASE_URL`: `https://yryfcvopmbseyrnghsft.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyeWZjdm9wbWJzZXlybmdoc2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Nzc4OTEsImV4cCI6MjA3ODI1Mzg5MX0.l8P9KMifqe8NvWaLFmiaJk-J9qSHysUSl23hLLN8FF8`

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for deployment (1-2 minutes)
3. Vercel will give you a URL like: `https://booking-system.vercel.app`

### Step 5: Access Your Admin
1. Open the Vercel URL in Chrome
2. Log in with your email and password

---

## After Deployment: Update Widget URL

Once deployed, you need to update the widget URL in the Shopify integration guide:

1. Copy your deployed URL (e.g., `https://your-site-name.netlify.app`)
2. When embedding in Shopify, use:
   ```
   https://your-site-name.netlify.app/widget.html?activityId=ACTIVITY_ID
   ```

---

## Troubleshooting

### "Activity not found" or blank page
- Make sure environment variables are set correctly
- Trigger a new deployment after adding variables
- Check browser console for errors (F12 in Chrome)

### Can't log in
- Check that you have a user account in Supabase
- Go to Supabase dashboard → Authentication → Users
- Create a new user if needed

### Widget not loading
- Ensure the URL includes `/widget.html?activityId=xxx`
- Check that the activity exists and is marked as active in the admin

---

## Recommended: Custom Domain (Optional)

Both Netlify and Vercel allow you to add a custom domain for free:

1. Go to **"Domain settings"** in Netlify/Vercel
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `booking.yourdomain.com`)
4. Follow the DNS setup instructions
5. SSL certificate is automatically provisioned

---

## Which Option Should I Choose?

- **Option 1 (Drag & Drop)**: Fastest and easiest, no GitHub needed
- **Option 2 (GitHub + Netlify)**: Best for automatic updates when you make changes
- **Option 3 (Vercel)**: Similar to Netlify, slightly different interface

**My Recommendation:** Start with **Option 1** to get up and running immediately. You can always switch to Option 2 later for automatic deployments.
