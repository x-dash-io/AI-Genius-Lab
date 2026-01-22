This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

STRIPE_SECRET_KEY="replace_with_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="replace_with_stripe_webhook_secret"

CLOUDINARY_CLOUD_NAME="replace_with_cloudinary_cloud_name"
CLOUDINARY_API_KEY="replace_with_cloudinary_api_key"
CLOUDINARY_API_SECRET="replace_with_cloudinary_api_secret"

# Resend Email (for production email delivery)
RESEND_API_KEY="replace_with_resend_api_key"
EMAIL_FROM="noreply@yourdomain.com"

# Google Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
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
4. Set `EMAIL_FROM` to your verified domain email (e.g., `noreply@yourdomain.com`)
5. Verify your domain in Resend dashboard (required for production)

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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
