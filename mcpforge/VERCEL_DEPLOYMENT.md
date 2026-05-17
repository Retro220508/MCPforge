# Vercel Deployment Guide

This guide explains how to deploy the MCPForge application to Vercel with NVIDIA NIM API integration.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/cli) installed (optional, for CLI deployment)
3. NVIDIA NIM API key from [NVIDIA Build](https://build.nvidia.com/)
4. All other required API keys (Supabase, Stripe, PostHog)

## Environment Variables

### Required Environment Variables

You must configure the following environment variables in your Vercel project settings:

#### NVIDIA NIM Configuration (AI Inference)
```
NVIDIA_NIM_API_KEY=nvapi-your_actual_api_key_here
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_NIM_PRIMARY_MODEL=meta/llama-3.1-70b-instruct
NVIDIA_NIM_FAST_MODEL=meta/llama-3.1-8b-instruct
```

**How to get your NVIDIA NIM API Key:**
1. Visit [https://build.nvidia.com/](https://build.nvidia.com/)
2. Sign in or create an account
3. Navigate to your API keys section
4. Generate a new API key
5. Copy the key (it starts with `nvapi-`)

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
STRIPE_PRO_PRICE_ID=price_your_pro_monthly_price_id
```

#### PostHog Analytics
```
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

#### System Configuration
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
CRON_SECRET=your_secure_random_cron_secret
BROADCAST_SECRET=your_secure_broadcast_secret
NODE_ENV=production
```

#### Optional Social Media Integration
```
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
```

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Your Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository (GitHub, GitLab, or Bitbucket)
   - Select the `mcpforge` directory as the root directory

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Root Directory: `mcpforge`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

3. **Add Environment Variables (IMPORTANT)**
   - **Before deploying**, click on "Environment Variables" section
   - Add each variable **one by one** by clicking "Add Another"
   - For each variable, enter:
     - **Key**: The variable name (e.g., `NVIDIA_NIM_API_KEY`)
     - **Value**: The actual value (e.g., `nvapi-your_actual_key`)
     - **Environments**: Select all three (Production, Preview, Development)
   
   **Required Variables to Add:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NVIDIA_NIM_API_KEY=nvapi-your_actual_key
   NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
   NVIDIA_NIM_PRIMARY_MODEL=meta/llama-3.1-70b-instruct
   NVIDIA_NIM_FAST_MODEL=meta/llama-3.1-8b-instruct
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
   STRIPE_PRO_PRICE_ID=price_your_pro_monthly_price_id
   NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   CRON_SECRET=your_secure_random_cron_secret
   BROADCAST_SECRET=your_secure_broadcast_secret
   NODE_ENV=production
   ```

4. **Deploy**
   - After adding all environment variables, click "Deploy"
   - Wait for the build to complete (usually 2-5 minutes)
   - Your app will be live at `https://your-project.vercel.app`

**Important Notes:**
- ⚠️ You MUST add environment variables BEFORE the first deployment
- If you forget, you can add them later in Project Settings → Environment Variables
- After adding variables to an existing project, you must redeploy for changes to take effect
- Environment variables are encrypted and secure in Vercel

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Project Directory**
   ```bash
   cd mcpforge
   ```

4. **Deploy**
   ```bash
   # For preview deployment
   vercel
   
   # For production deployment
   vercel --prod
   ```

5. **Add Environment Variables**
   ```bash
   # Add environment variables via CLI
   vercel env add NVIDIA_NIM_API_KEY
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   # ... add all other variables
   ```

## Post-Deployment Configuration

### 1. Update Supabase Settings
- Add your Vercel domain to Supabase's allowed redirect URLs
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add: `https://your-domain.vercel.app/auth/callback`

### 2. Configure Stripe Webhooks
- Go to Stripe Dashboard → Developers → Webhooks
- Add endpoint: `https://your-domain.vercel.app/api/billing/webhook`
- Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Copy the webhook signing secret and update `STRIPE_WEBHOOK_SECRET` in Vercel

### 3. Update Application URL
- Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables to your production domain

### 4. Test NVIDIA NIM Integration
- After deployment, test the AI features to ensure NVIDIA NIM API is working correctly
- Check Vercel logs for any API errors
- Monitor NVIDIA NIM usage in your NVIDIA Build dashboard

## Vercel-Specific Features

### Automatic Deployments
- Every push to your main branch triggers a production deployment
- Pull requests create preview deployments automatically

### Environment Variables per Branch
- Configure different API keys for production vs preview environments
- Use Vercel's environment variable scoping (Production, Preview, Development)

### Edge Functions
- API routes are automatically deployed as serverless functions
- Cold start times are minimal with Vercel's infrastructure

### Analytics
- Enable Vercel Analytics in your project settings for performance monitoring
- Monitor Core Web Vitals and user experience metrics

## Troubleshooting

### Build Failures
- Check Vercel build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation succeeds locally

### Environment Variable Issues
- Verify all required variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding/updating environment variables

### NVIDIA NIM API Errors
- Verify API key is correct and active
- Check API key has sufficient credits/quota
- Review NVIDIA NIM API status page for outages
- Check Vercel function logs for detailed error messages

### Runtime Errors
- Check Vercel function logs in the dashboard
- Enable detailed logging in production if needed
- Monitor error tracking with PostHog or Sentry

## Security Best Practices

1. **Never commit API keys** to your repository
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** regularly
4. **Enable Vercel's security features**:
   - DDoS protection
   - Automatic HTTPS
   - Security headers

5. **Monitor API usage** to detect unusual patterns
6. **Set up alerts** for failed deployments or high error rates

## Cost Optimization

1. **Monitor NVIDIA NIM usage** - API calls are metered
2. **Use appropriate models** - Fast model for simple tasks, primary for complex ones
3. **Implement caching** where possible to reduce API calls
4. **Set up usage limits** in NVIDIA Build dashboard
5. **Monitor Vercel usage** - Functions, bandwidth, and build minutes

## Support

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **NVIDIA NIM Documentation**: [build.nvidia.com/docs](https://build.nvidia.com/docs)
- **Project Issues**: Create an issue in your repository

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NVIDIA NIM API Reference](https://build.nvidia.com/docs/api-reference)
- [Environment Variables Best Practices](https://vercel.com/docs/concepts/projects/environment-variables)