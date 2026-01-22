# Content Security Model

## Overview

This document explains how paid content is secured to prevent unauthorized access and sharing.

## Current Security Implementation

### 1. **Access Control (Server-Side)**
- **Authentication Required**: Users must be logged in to access any lesson content
- **Purchase Verification**: Server checks if user has a paid purchase for the course before generating content URLs
- **Admin Override**: Admins have access to all content for management purposes

### 2. **Signed URLs (Cloudinary)**
- **10-Minute Expiry**: All signed URLs expire after 10 minutes
- **User-Specific**: URLs are generated per-user with user ID embedded in the signature
- **Per-Request Generation**: Each page load generates a fresh signed URL
- **Non-Shareable**: Even if a URL is copied, it expires quickly and is tied to the original user

### 3. **Proxy Endpoint** (`/api/content/[lessonId]`)
- **Per-Request Validation**: Every content request validates:
  - User authentication
  - Course purchase status
  - Lesson access permissions
- **Fresh URLs**: Generates new signed URLs on each request
- **No Caching**: Headers prevent browser/CDN caching

## How It Prevents Link Sharing

### Scenario 1: User Shares Signed URL
1. User A gets a signed URL: `https://cloudinary.com/...?signature=abc123&expires=1234567890`
2. User A shares this URL with User B
3. **Result**: 
   - URL expires in 10 minutes (very short window)
   - Even if accessed within 10 minutes, Cloudinary validates the signature
   - The signature includes user-specific data, so User B's request would fail validation

### Scenario 2: User Shares Proxy URL
1. User A gets content via: `/api/content/lesson-123`
2. User A shares this URL with User B
3. **Result**:
   - User B must be authenticated
   - Server checks if User B purchased the course
   - If User B hasn't purchased, access is denied (403 Forbidden)
   - Even if User B has purchased, they get their own fresh signed URL

### Scenario 3: Direct Cloudinary Public ID Sharing
1. User A finds the Cloudinary public ID: `synapze-content/lesson-1-video`
2. User A tries to access directly: `https://res.cloudinary.com/.../synapze-content/lesson-1-video`
3. **Result**:
   - Cloudinary uses "authenticated" delivery type
   - Direct access without signature is blocked
   - Only signed URLs work, and signatures expire quickly

## Security Layers

```
┌─────────────────────────────────────────┐
│  User Request                           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Layer 1: Authentication Check         │
│  - Must be logged in                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Layer 2: Purchase Verification         │
│  - Check if user purchased course       │
│  - Verify purchase status = "paid"       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Layer 3: Signed URL Generation         │
│  - Generate user-specific signature     │
│  - 10-minute expiry                     │
│  - Include user ID in token             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Layer 4: Cloudinary Validation         │
│  - Cloudinary validates signature        │
│  - Checks expiry timestamp              │
│  - Validates resource access            │
└─────────────────────────────────────────┘
```

## Additional Security Measures

### File Upload Security
- **Admin-Only**: Only admins can upload content
- **File Validation**: 
  - File type checking (MIME type + extension)
  - File size limits (500MB for video, 100MB for audio, 50MB for PDF)
  - Server-side validation before upload
- **Server-Side Upload**: Files are uploaded server-side, never exposing Cloudinary API keys

### Rate Limiting (Recommended)
Consider adding rate limiting to:
- Prevent brute force access attempts
- Limit upload requests per admin
- Prevent URL enumeration attacks

### IP Binding (Future Enhancement)
Could add IP address binding to signed URLs, but this has limitations:
- Users behind VPNs/proxies would be blocked
- Mobile users switching networks would lose access
- Not recommended for most use cases

### Watermarking (Future Enhancement)
For video content, consider:
- Dynamic watermarking with user ID/email
- Visible watermarks on video frames
- Helps identify source of leaked content

## Best Practices

1. **Never expose Cloudinary API secrets** to the client
2. **Always validate access** server-side before generating URLs
3. **Use short expiry times** for signed URLs (10 minutes is good)
4. **Generate fresh URLs** on each request, don't cache them
5. **Monitor access logs** for suspicious patterns
6. **Regular security audits** of access control logic

## Limitations

1. **10-Minute Window**: URLs can still be shared within the 10-minute expiry window
2. **Downloaded Content**: Once downloaded, content can be shared (mitigated by `allowDownload` flag)
3. **Screen Recording**: Users can record videos (common limitation, hard to prevent)
4. **Link Type**: External links bypass Cloudinary security (by design)

## Recommendations for Production

1. **Implement rate limiting** on content endpoints
2. **Add access logging** to track who accesses what content
3. **Consider DRM** for high-value video content
4. **Add watermarking** for video content
5. **Monitor for suspicious patterns** (multiple IPs, rapid access, etc.)
6. **Regular security reviews** of the access control logic
