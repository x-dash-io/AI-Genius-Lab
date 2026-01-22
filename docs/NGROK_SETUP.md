# Ngrok Setup Guide

## Quick Fix for ERR_NGROK_8012

If you're seeing `ERR_NGROK_8012` (connection refused on port 80), ngrok is pointing to the wrong port.

### The Problem
- Ngrok is trying to connect to `http://localhost:80`
- But Next.js runs on `http://localhost:3000` by default

### The Solution

**1. Stop your current ngrok tunnel** (Ctrl+C)

**2. Start ngrok pointing to port 3000:**
```bash
ngrok http 3000
```

**3. Copy the HTTPS URL** ngrok gives you (e.g., `https://abc123.ngrok-free.dev`)

**4. Update your `.env.local`:**
```bash
NEXTAUTH_URL="https://abc123.ngrok-free.dev"
```

**5. Restart your Next.js dev server:**
```bash
npm run dev
```

## Complete Setup Steps

### 1. Start Your Next.js App
```bash
npm run dev
```
Your app should be running on `http://localhost:3000`

### 2. Start Ngrok Tunnel
In a **new terminal**, run:
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.dev -> http://localhost:3000
```

### 3. Update Environment Variables
Copy the HTTPS URL from ngrok and add to `.env.local`:
```bash
NEXTAUTH_URL="https://abc123.ngrok-free.dev"
```

### 4. Restart Dev Server
After updating `.env.local`, restart your Next.js server:
```bash
# Stop with Ctrl+C, then:
npm run dev
```

## Verifying It Works

1. **Check ngrok dashboard**: Visit `http://localhost:4040` to see requests
2. **Test your app**: Visit `https://your-ngrok-url.ngrok-free.dev`
3. **Test PayPal**: The redirect URLs will now use your ngrok URL

## Common Issues

### Issue: "Connection refused" on port 80
**Fix**: Make sure ngrok is pointing to port 3000, not 80:
```bash
ngrok http 3000  # ✅ Correct
ngrok http 80     # ❌ Wrong
```

### Issue: PayPal redirects to localhost instead of ngrok
**Fix**: Make sure `NEXTAUTH_URL` in `.env.local` matches your ngrok URL exactly

### Issue: "Invalid redirect URI" in PayPal
**Fix**: 
1. Check your PayPal app settings
2. Make sure return URLs use your ngrok URL
3. Update webhook URL in PayPal dashboard if needed

## Ngrok Free vs Paid

**Free Plan:**
- Random URLs each time you restart
- Need to update `NEXTAUTH_URL` each time
- Good for testing

**Paid Plan:**
- Static domain (e.g., `your-app.ngrok.io`)
- Don't need to update URLs
- Better for development

## Testing PayPal with Ngrok

1. **Start Next.js**: `npm run dev` (port 3000)
2. **Start ngrok**: `ngrok http 3000`
3. **Update `.env.local`**: Set `NEXTAUTH_URL` to ngrok URL
4. **Restart Next.js**: So it picks up the new URL
5. **Test payment**: Click enroll/purchase, should redirect to PayPal
6. **Complete payment**: In PayPal sandbox
7. **Return**: PayPal redirects back to your ngrok URL

## Troubleshooting

**Check if Next.js is running:**
```bash
curl http://localhost:3000
```

**Check if ngrok is forwarding correctly:**
Visit `http://localhost:4040` (ngrok web interface)

**Check environment variables:**
```bash
# Make sure these are set:
echo $NEXTAUTH_URL
```

**Check PayPal webhook:**
- In PayPal Developer Dashboard
- Go to your app → Webhooks
- Make sure webhook URL is: `https://your-ngrok-url.ngrok-free.dev/api/webhooks/paypal`
