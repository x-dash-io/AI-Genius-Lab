# Email Configuration for Subscription Notifications

## Overview
The subscription system sends automated email notifications to both users and administrators when subscription events occur.

## Environment Variables

Add these to your `.env` file:

```env
# Email Service Configuration
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@aigeniuslab.com
ADMIN_EMAIL=admin@aigeniuslab.com

# Development Settings
BYPASS_EMAIL=true  # Set to true to skip email sending in development
NODE_ENV=development
```

## Email Templates

### 1. Welcome Email (New Subscription)
- **Sent to**: User who subscribed
- **Trigger**: After successful PayPal subscription activation
- **Content**:
  - Welcome message
  - Subscription details (plan, price, next billing date)
  - List of premium benefits
  - Links to start learning and manage subscription

### 2. Cancellation Email
- **Sent to**: User who cancelled
- **Trigger**: When user cancels their subscription
- **Content**:
  - Confirmation of cancellation
  - Access end date
  - What happens next
  - Reactivation option
  - Feedback request

### 3. Admin Notification
- **Sent to**: Admin email address
- **Trigger**: New subscription activation
- **Content**:
  - Customer details (name, email)
  - Plan type and price
  - Link to admin subscription dashboard

## Email Service Setup (Resend)

### 1. Create Resend Account
1. Go to [Resend.com](https://resend.com)
2. Sign up for an account
3. Verify your email domain

### 2. Get API Key
1. In Resend dashboard, go to "API Keys"
2. Create a new API key
3. Copy the key to `RESEND_API_KEY` in your `.env`

### 3. Configure Domain
1. Add your domain to Resend
2. Update DNS records as instructed
3. Set `EMAIL_FROM` to your verified domain email

## Development Setup

### Option 1: Use Resend Test Domain
```env
RESEND_API_KEY=your_test_api_key
EMAIL_FROM=onboarding@resend.dev
BYPASS_EMAIL=false
```

### Option 2: Bypass Email (Development Only)
```env
BYPASS_EMAIL=true
```
When `BYPASS_EMAIL=true`, emails are logged to console instead of being sent.

## Testing Emails

### Test Welcome Email
```typescript
import { sendSubscriptionWelcomeEmail } from "@/lib/email";

await sendSubscriptionWelcomeEmail(
  "test@example.com",
  "Test User",
  "monthly",
  "29.99",
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
);
```

### Test Cancellation Email
```typescript
import { sendSubscriptionCancelledEmail } from "@/lib/email";

await sendSubscriptionCancelledEmail(
  "test@example.com",
  "Test User",
  "annual",
  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
);
```

### Test Admin Notification
```typescript
import { sendAdminSubscriptionNotification } from "@/lib/email";

await sendAdminSubscriptionNotification(
  "admin@example.com",
  "user@example.com",
  "Test User",
  "monthly",
  "29.99"
);
```

## Production Checklist

- [ ] Resend API key configured
- [ ] Custom domain verified in Resend
- [ ] `EMAIL_FROM` set to production email
- [ ] `ADMIN_EMAIL` set to correct admin address
- [ ] `BYPASS_EMAIL` set to `false` or removed
- [ ] Test all email templates in production
- [ ] Check spam score of email templates
- [ ] Set up email monitoring/analytics

## Troubleshooting

### Emails Not Sending
1. Check `RESEND_API_KEY` is correct
2. Verify domain is properly configured
3. Check console for error logs
4. Ensure `BYPASS_EMAIL=false` in production

### Emails Going to Spam
1. Verify SPF/DKIM records for your domain
2. Check email content for spam triggers
3. Use plain text version (automatically included)
4. Test with tools like Mail-Tester

### Rate Limits
- Resend free tier: 100 emails/day
- Consider upgrading for higher volume
- Implement queue system for bulk emails

## Customization

### Modify Email Templates
Edit the functions in `/lib/email.ts`:
- `sendSubscriptionWelcomeEmail()` - Customize welcome email
- `sendSubscriptionCancelledEmail()` - Customize cancellation email
- `sendAdminSubscriptionNotification()` - Customize admin notification

### Add New Email Types
1. Create new function in `/lib/email.ts`
2. Use the existing `sendEmail()` helper
3. Include both HTML and text versions
4. Follow the same error handling pattern

## Security Notes
- Never commit API keys to version control
- Use environment-specific API keys
- Validate email addresses before sending
- Implement rate limiting to prevent abuse
- Log all email sends for audit trail
