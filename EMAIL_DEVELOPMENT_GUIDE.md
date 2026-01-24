# Email Development Guide

## Problem
Resend's test domain (`onboarding@resend.dev`) only allows sending emails to your verified account email (swangui@kabarak.ac.ke). This prevents testing with other email addresses during development.

## Solution
The system now has **prominent console logging** for OTP codes when emails can't be sent.

---

## How It Works Now

### When Email Fails (Test Domain Restriction)
The OTP code is displayed prominently in the console:

```
============================================================
🔐 OTP CODE FOR TESTING (Email Restricted)
============================================================
📧 Email: testuser@example.com
🔢 OTP Code: 123456
📝 Subject: Your Verification Code - AI Genius Lab
============================================================
```

### Steps to Register New Users

1. **Start registration** with any email address
2. **Check the console** for the OTP code (it will be displayed prominently)
3. **Copy the 6-digit code** from the console
4. **Enter it** in the verification form
5. **Complete registration**

---

## Alternative: Bypass Email Completely

If you want to completely skip email sending during development, add this to your `.env.local`:

```env
BYPASS_EMAIL=true
```

With this setting:
- No emails will be sent (not even attempted)
- OTP codes will be logged to console
- Registration/verification will work normally
- Perfect for local development

---

## Current Console Output

### Successful Email (to verified address)
```
[EMAIL] Email sent successfully: {
  to: 'swangui@kabarak.ac.ke',
  subject: 'Your Verification Code - AI Genius Lab',
  id: 'e13ad0d3-2f7a-42a8-870a-821bd77dc83b',
  from: 'onboarding@resend.dev'
}
```

### Failed Email (test domain restriction)
```
[EMAIL] Resend error: {
  statusCode: 403,
  name: 'validation_error',
  message: 'You can only send testing emails to your own email address...'
}

[EMAIL] Resend test domain restriction: {
  message: 'Using test domain - emails can only be sent to account owner's email',
  suggestion: 'Verify a domain in Resend dashboard or use account owner's email for testing'
}

============================================================
🔐 OTP CODE FOR TESTING (Email Restricted)
============================================================
📧 Email: newuser@example.com
🔢 OTP Code: 456789
📝 Subject: Your Verification Code - AI Genius Lab
============================================================
```

---

## Production Setup

For production, you need to:

1. **Verify a domain** in Resend dashboard (resend.com/domains)
2. **Update EMAIL_FROM** in `.env`:
   ```env
   EMAIL_FROM=noreply@yourdomain.com
   ```
3. **Remove BYPASS_EMAIL** (or set to false)

---

## Environment Variables

### Current Setup (.env.local)
```env
# Resend API Key (required for sending emails)
RESEND_API_KEY=your_key_here

# Email sender address
# Development: Uses onboarding@resend.dev (test domain)
# Production: Use your verified domain
EMAIL_FROM=onboarding@resend.dev

# Optional: Bypass email sending completely (development only)
# BYPASS_EMAIL=true
```

---

## Testing Workflow

### Option 1: Use Console Logs (Current)
1. Register with any email
2. Check console for OTP code
3. Enter code to verify
4. ✅ Works for any email address

### Option 2: Use Your Verified Email
1. Register with `swangui@kabarak.ac.ke`
2. Check your actual email inbox
3. Enter code from email
4. ✅ Tests real email delivery

### Option 3: Enable BYPASS_EMAIL
1. Add `BYPASS_EMAIL=true` to `.env.local`
2. Restart server
3. Register with any email
4. Check console for OTP code
5. ✅ No email attempts, just logs

---

## Troubleshooting

### "I don't see the OTP code in console"
- Make sure you're looking at the **server console** (where `npm run dev` is running)
- Not the browser console
- Look for the box with `🔐 OTP CODE FOR TESTING`

### "Email still fails"
- This is expected with test domain
- The OTP code is logged to console
- Use the code from console to complete verification

### "I want to test real emails"
- Use your verified email: `swangui@kabarak.ac.ke`
- Or verify a domain in Resend dashboard

---

## Summary

✅ **Current Status**: OTP codes are logged prominently to console when emails fail
✅ **You can register any user**: Just use the OTP from console
✅ **No code changes needed**: System already handles this gracefully
✅ **Optional**: Set `BYPASS_EMAIL=true` to skip email attempts entirely

The system is ready for development - just look at the console for OTP codes! 🚀
