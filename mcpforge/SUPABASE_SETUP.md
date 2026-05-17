# Supabase Setup Guide

This guide explains how to set up Supabase for your MCPForge application and get all the required environment variables.

## Step 1: Create a Supabase Project

1. **Go to Supabase**
   - Visit [https://supabase.com](https://supabase.com)
   - Click "Start your project" or "Sign In"

2. **Create an Account**
   - Sign up with GitHub, Google, or email
   - Verify your email if required

3. **Create a New Project**
   - Click "New Project" in your dashboard
   - Fill in the project details:
     - **Name:** `mcpforge` (or your preferred name)
     - **Database Password:** Create a strong password (save this!)
     - **Region:** Choose the closest region to your users
     - **Pricing Plan:** Start with the Free tier
   - Click "Create new project"
   - Wait 2-3 minutes for the project to be provisioned

## Step 2: Get Your Environment Variables

### NEXT_PUBLIC_SUPABASE_URL

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. Under "Project URL", you'll see your URL:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
4. Copy this URL - this is your `NEXT_PUBLIC_SUPABASE_URL`

### NEXT_PUBLIC_SUPABASE_ANON_KEY

1. On the same **API** settings page
2. Under "Project API keys", find the **anon public** key
3. Click the copy icon to copy the key
4. This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - It's safe to use in client-side code
   - It starts with `eyJ...`

### SUPABASE_SERVICE_ROLE_KEY

1. On the same **API** settings page
2. Under "Project API keys", find the **service_role** key
3. Click the copy icon to copy the key
4. This is your `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **NEVER expose this key in client-side code**
   - Only use it in server-side code and environment variables
   - It starts with `eyJ...`

## Step 3: Update Your Environment Variables

### For Local Development

1. Open `mcpforge/.env.local`
2. Update the Supabase variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### For Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Make sure to add them for all environments (Production, Preview, Development)

## Step 4: Set Up Database Schema

### Option 1: Using Supabase Dashboard (Recommended for beginners)

1. In your Supabase project, click on **SQL Editor** in the left sidebar
2. Click "New query"
3. Copy and paste your database schema SQL
4. Click "Run" to execute the query

### Option 2: Using Supabase CLI (Recommended for development)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   cd mcpforge
   supabase link --project-ref xxxxxxxxxxxxx
   ```
   (Replace `xxxxxxxxxxxxx` with your project reference ID from the URL)

4. **Push migrations:**
   ```bash
   supabase db push
   ```

## Step 5: Configure Authentication

### Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates if desired

### Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add your site URLs:
   - **Site URL:** `http://localhost:3000` (for development)
   - **Redirect URLs:** Add these URLs:
     ```
     http://localhost:3000/auth/callback
     https://your-domain.vercel.app/auth/callback
     ```

### Enable OAuth Providers (Optional)

1. Go to **Authentication** → **Providers**
2. Enable providers like Google, GitHub, etc.
3. Follow the setup instructions for each provider

## Step 6: Set Up Row Level Security (RLS)

For production security, enable RLS on your tables:

1. Go to **Database** → **Tables**
2. For each table, click the three dots → **Edit table**
3. Enable "Enable Row Level Security (RLS)"
4. Add policies to control access

Example policy for a `profiles` table:
```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

## Step 7: Test Your Connection

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Test authentication:**
   - Go to `http://localhost:3000/signup`
   - Try creating an account
   - Check if the user appears in Supabase dashboard under **Authentication** → **Users**

3. **Check database connection:**
   - Try any database operations in your app
   - Check the Supabase logs for any errors

## Common Issues and Solutions

### Issue: "Invalid API key"
- **Solution:** Double-check that you copied the correct keys
- Make sure there are no extra spaces or line breaks
- Restart your development server after updating `.env.local`

### Issue: "Failed to fetch"
- **Solution:** Check your Supabase project URL is correct
- Ensure your project is not paused (free tier projects pause after inactivity)
- Check your internet connection

### Issue: "JWT expired" or "Invalid JWT"
- **Solution:** The anon key might be incorrect
- Regenerate the keys in Supabase dashboard if needed
- Clear your browser cache and cookies

### Issue: "Row Level Security policy violation"
- **Solution:** Check your RLS policies
- Temporarily disable RLS for testing (not recommended for production)
- Review the Supabase logs for detailed error messages

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. **Use service_role key** only in server-side code
3. **Enable RLS** on all tables in production
4. **Rotate keys** regularly
5. **Monitor usage** in Supabase dashboard
6. **Set up alerts** for unusual activity
7. **Use environment-specific** projects (dev, staging, production)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## Quick Reference

| Variable | Where to Find | Usage |
|----------|---------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL | Client & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon public | Client & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role | Server Only ⚠️ |

## Need Help?

- [Supabase Discord](https://discord.supabase.com/)
- [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)