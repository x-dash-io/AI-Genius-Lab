# Deploying to Netlify

This guide provides detailed information for deploying the AI Genius Lab project on Netlify.

## Deployment Settings

When configuring your site on Netlify, use the following settings:

- **Base directory:** `/`
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Functions directory:** `netlify/functions`

## Required Environment Variables

You must configure the following environment variables in the Netlify UI (**Site settings > Build & deploy > Environment variables**):

### Database
- `DATABASE_URL`: Your PostgreSQL connection string (e.g., from Neon, Supabase, or AWS RDS).
- `DIRECT_URL`: Same as `DATABASE_URL`, required for Prisma migrations.

### Authentication (NextAuth)
- `NEXTAUTH_SECRET`: A secure, random string for session encryption.
- `NEXTAUTH_URL`: Your production site URL (e.g., `https://your-site.netlify.app`).

### Payment Processing (PayPal)
- `PAYPAL_ENV`: `sandbox` or `live`.
- `PAYPAL_CLIENT_ID`: Your PayPal Client ID.
- `PAYPAL_CLIENT_SECRET`: Your PayPal Client Secret.
- `PAYPAL_WEBHOOK_ID`: Your PayPal Webhook ID.

### Media Storage (Cloudinary)
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name.
- `CLOUDINARY_API_KEY`: Your Cloudinary API Key.
- `CLOUDINARY_API_SECRET`: Your Cloudinary API Secret.

### Email Service (Resend)
- `RESEND_API_KEY`: Your Resend API Key.
- `FROM_EMAIL`: The email address to send from.
- `SUPPORT_EMAIL`: Your support email address.

### Caching & Rate Limiting (Upstash)
- `UPSTASH_REDIS_REST_URL`: Your Upstash Redis URL.
- `UPSTASH_REDIS_REST_TOKEN`: Your Upstash Redis Token.

### Build Configuration (Already in netlify.toml)
- `PRISMA_CLIENT_ENGINE_TYPE`: `library`
- `NODE_VERSION`: `20`

## Prisma Post-Deployment

After the first successful deployment, you may need to run migrations to set up your database schema if you haven't done so already:

```bash
npx prisma migrate deploy
```

You can also seed the initial data:

```bash
npm run db:seed
```

## Troubleshooting

- **Build Failures**: Ensure `NODE_VERSION` is set to 18 or higher.
- **Prisma Errors**: Verify that `DATABASE_URL` and `DIRECT_URL` are correctly set and accessible from Netlify's build servers.
- **Next.js Features**: Netlify uses the `@netlify/plugin-nextjs` (Next.js Runtime) to support features like ISR, Middleware, and App Router API routes. This is included in the `netlify.toml`.
