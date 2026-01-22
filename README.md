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
