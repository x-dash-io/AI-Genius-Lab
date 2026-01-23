# AI Genius Lab

AI Genius Lab is a modern online learning platform focused on AI education. Built with Next.js, TypeScript, Prisma, and PostgreSQL, it provides structured courses, learning paths, progress tracking, and secure payment processing.

## Features

- **Course Management**: Create and manage AI courses with structured lessons
- **Learning Paths**: Curated learning pathways for comprehensive skill development
- **Progress Tracking**: Track lesson completion and learning progress
- **Certificates**: Generate verifiable certificates upon course completion
- **Payment Processing**: Secure PayPal integration for course purchases
- **User Authentication**: Email/password and Google OAuth authentication with OTP verification
- **Password Reset**: Secure password reset flow via email
- **Invoice System**: Automated invoice generation and email delivery
- **Admin Dashboard**: Comprehensive analytics with charts and graphs
- **Responsive Design**: Mobile-first, fully responsive UI
- **Dark Mode**: Built-in theme switching

## Environment Variables

Create a `.env.local` file with the following values (do not commit real secrets):

```bash
DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DB_NAME"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace_with_random_secret"

# Google OAuth (optional but recommended)
GOOGLE_CLIENT_ID="replace_with_google_client_id"
GOOGLE_CLIENT_SECRET="replace_with_google_client_secret"

PAYPAL_ENV="sandbox"
PAYPAL_CLIENT_ID="replace_with_paypal_client_id"
PAYPAL_CLIENT_SECRET="replace_with_paypal_client_secret"
PAYPAL_WEBHOOK_ID="replace_with_paypal_webhook_id"

CLOUDINARY_CLOUD_NAME="replace_with_cloudinary_cloud_name"
CLOUDINARY_API_KEY="replace_with_cloudinary_api_key"
CLOUDINARY_API_SECRET="replace_with_cloudinary_api_secret"

# Resend Email (for email delivery)
RESEND_API_KEY="replace_with_resend_api_key"
# For development: Leave EMAIL_FROM unset to use Resend's test domain (onboarding@resend.dev)
# For production: Set EMAIL_FROM to your verified domain (e.g., noreply@yourdomain.com)
# You must verify your domain in Resend dashboard before using custom EMAIL_FROM
EMAIL_FROM="onboarding@resend.dev"

# Upstash Redis (for caching and rate limiting in production)
# Optional: Falls back to in-memory if not configured
# Get credentials from https://upstash.com/
UPSTASH_REDIS_REST_URL="replace_with_upstash_redis_url"
UPSTASH_REDIS_REST_TOKEN="replace_with_upstash_redis_token"

```

### Google OAuth Setup (Optional)

To enable Google sign-in:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret to your `.env.local` file

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Email Setup (Resend)

1. Sign up for a free account at [Resend](https://resend.com)
2. Create an API key in the Resend dashboard
3. Add `RESEND_API_KEY` to your `.env.local` file

**For Development:**
- Leave `EMAIL_FROM` unset or use `onboarding@resend.dev` (Resend's test domain)
- Emails will send successfully without domain verification

**For Production:**
- Verify your domain in Resend dashboard (add DNS records)
- Set `EMAIL_FROM` to your verified domain email (e.g., `noreply@yourdomain.com`)
- Without domain verification, emails will fail to send in production

## PayPal Sandbox Setup (Testing with Fake Money)

PayPal Sandbox allows you to test payments without using real money. Here's how to set it up:

### 1. Create PayPal Developer Account

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Sign in with your PayPal account (or create one)
3. Navigate to **Dashboard** → **My Apps & Credentials**

### 2. Create Sandbox App

1. Click **Create App**
2. Fill in:
   - **App Name**: `Synapze Sandbox` (or any name)
   - **Merchant**: Select your sandbox business account
   - **Features**: Select **Accept Payments**
3. Click **Create App**
4. Copy the **Client ID** and **Secret** to your `.env.local`:
   ```bash
   PAYPAL_CLIENT_ID="your_sandbox_client_id"
   PAYPAL_CLIENT_SECRET="your_sandbox_secret"
   ```

### 3. Create Sandbox Test Accounts

1. Go to **Dashboard** → **Accounts** (under Sandbox section)
2. Click **Create Account** to create test accounts:
   - **Business Account** (seller): Already created with your app
   - **Personal Account** (buyer): Create one for testing

### 4. PayPal Sandbox Test Credentials

PayPal provides pre-configured test accounts. You can use these or create your own:

**Pre-configured Personal Account (Buyer):**
- Email: `sb-xxxxx@personal.example.com` (check PayPal dashboard)
- Password: Use the password shown in PayPal dashboard
- Or create your own test account

**Pre-configured Business Account (Seller):**
- Email: `sb-xxxxx@business.example.com` (check PayPal dashboard)
- Password: Use the password shown in PayPal dashboard

### 5. Testing Payments

When testing:

1. **Start your app** with `PAYPAL_ENV="sandbox"` (default)
2. **Click "Enroll" or "Purchase"** - you'll be redirected to PayPal Sandbox
3. **Sign in** with your sandbox personal account credentials
4. **Complete the payment** - no real money is charged!
5. **Test different scenarios**:
   - Successful payment
   - Cancel payment
   - Payment failure

### 6. Test Credit Cards (Alternative)

PayPal Sandbox also accepts test credit cards:

**Visa:**
- Card Number: `4032031085371234`
- Expiry: Any future date (e.g., `12/25`)
- CVV: `123`
- Name: Any name

**Mastercard:**
- Card Number: `5421698999991059`
- Expiry: Any future date
- CVV: `123`

**Note**: These cards only work in PayPal Sandbox, not in production!

### 7. Webhook Setup (Optional for Testing)

For webhook testing with ngrok:

1. **Start your Next.js app first**: `npm run dev` (runs on port 3000)
2. **Start ngrok pointing to port 3000**: `ngrok http 3000` ⚠️ **Important: Use port 3000, not 80!**
3. Copy your ngrok HTTPS URL (e.g., `https://abc123.ngrok-free.dev`)
4. **Update `.env.local`** with your ngrok URL:
   ```bash
   NEXTAUTH_URL="https://abc123.ngrok-free.dev"
   ```
5. **Restart your Next.js server** so it picks up the new URL
6. In PayPal Developer Dashboard:
   - Go to **My Apps & Credentials** → Your App
   - Scroll to **Webhooks**
   - Click **Add Webhook**
   - URL: `https://your-ngrok-url.ngrok-free.dev/api/webhooks/paypal`
   - Event types: Select `PAYMENT.CAPTURE.COMPLETED` and `CHECKOUT.ORDER.APPROVED`
7. Copy the **Webhook ID** to your `.env.local`:
   ```bash
   PAYPAL_WEBHOOK_ID="your_webhook_id"
   ```

**⚠️ Common Mistake**: If you see `ERR_NGROK_8012` (connection refused), ngrok is pointing to the wrong port. Make sure you run `ngrok http 3000` not `ngrok http 80`.

### 8. Environment Variables Summary

```bash
# PayPal Sandbox (for testing)
PAYPAL_ENV="sandbox"
PAYPAL_CLIENT_ID="your_sandbox_client_id"
PAYPAL_CLIENT_SECRET="your_sandbox_secret"
PAYPAL_WEBHOOK_ID="your_webhook_id"  # Optional for testing

# Make sure NEXTAUTH_URL points to your ngrok URL when testing webhooks
NEXTAUTH_URL="https://your-ngrok-url.ngrok.io"
```

### 9. Switching to Production

When ready for production:

1. Create a **Live App** in PayPal Developer Dashboard
2. Get **Live Client ID** and **Secret**
3. Update `.env.local`:
   ```bash
   PAYPAL_ENV="live"
   PAYPAL_CLIENT_ID="your_live_client_id"
   PAYPAL_CLIENT_SECRET="your_live_secret"
   ```
4. Set up production webhook with your actual domain

### Troubleshooting

- **"Failed to create PayPal order"**: Check your Client ID and Secret
- **Redirect not working**: Ensure `NEXTAUTH_URL` matches your ngrok URL
- **Webhook not receiving events**: Verify webhook URL in PayPal dashboard
- **Payment not completing**: Check browser console and server logs

## Analytics Setup

### Vercel Analytics (Automatic)
- Automatically enabled when deployed to Vercel
- View analytics in your Vercel dashboard
- Includes page views, performance metrics, and custom events
- No additional configuration needed

### Google Analytics (Optional)
1. Create a Google Analytics 4 property at [Google Analytics](https://analytics.google.com)
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to your `.env.local` file
4. Analytics will automatically track page views and custom events

## Deployment

### Vercel Deployment

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard
4. Deploy

Vercel will automatically:
- Detect Next.js framework
- Run build commands
- Optimize for production
- Enable Vercel Analytics

### Environment Variables for Production

Ensure all environment variables from `.env.local` are set in your Vercel project settings.

### Database Setup

1. Set up a PostgreSQL database (recommended: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or [Supabase](https://supabase.com))
2. Add `DATABASE_URL` to Vercel environment variables
3. Run migrations: `npx prisma migrate deploy`

## Development

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm/yarn/pnpm

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in values
4. Run database migrations: `npx prisma migrate dev`
5. Seed database (optional): `npm run db:seed`
6. Start development server: `npm run dev`

### Database Commands

- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data

### Testing

- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: PayPal
- **Email**: Resend
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Charts**: Recharts
- **Analytics**: Vercel Analytics
