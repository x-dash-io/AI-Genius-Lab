# Security Audit - Authentication & Authorization

## Overview
This document outlines the security measures implemented to protect authenticated routes and prevent unauthorized access.

## Protected Routes

### Middleware Protection (`middleware.ts`)
The following routes are protected at the middleware level:
- `/admin/*` - Admin-only routes (requires admin role)
- `/dashboard` - User dashboard
- `/library` - User's purchased courses
- `/profile` - User profile page
- `/activity` - User activity log

**Implementation:**
- Uses NextAuth JWT token verification
- Redirects unauthenticated users to `/sign-in` with callback URL
- Checks admin role for `/admin/*` routes

### Layout-Level Protection

#### `(app)/layout.tsx`
- Requires authentication for all routes in `(app)` folder
- Redirects to `/sign-in` if no session exists
- This provides an additional layer of protection beyond middleware

#### `(admin)/layout.tsx`
- Requires admin role via `requireRole("admin")`
- Redirects non-admin users to `/dashboard`

### Page-Level Protection
All pages in `(app)` folder have server-side authentication checks:
- `/dashboard` - Checks session before rendering
- `/library` - Checks session before rendering
- `/library/[courseId]` - Checks session and course access
- `/library/[courseId]/lesson/[lessonId]` - Checks session and lesson access
- `/profile` - Checks session before rendering
- `/activity` - Client component, but API requires auth

## API Route Protection

### Authentication Required
All API routes that require authentication use one of:
1. `requireUser()` - Throws error if not authenticated
2. `getServerSession()` + manual check - Returns 401 if not authenticated

**Protected API Routes:**
- `/api/progress` - Requires authentication
- `/api/activity` - Requires authentication
- `/api/certificates` - Requires authentication
- `/api/profile/avatar` - Requires authentication
- `/api/content/[lessonId]` - Requires authentication + course purchase
- `/api/reviews/user` - Requires authentication
- `/api/reviews` (POST) - Requires authentication
- `/api/reviews/[reviewId]` (DELETE) - Requires authentication

### Admin-Only Routes
- `/api/admin/upload` - Requires admin role
- `/api/admin/upload-url` - Requires admin role
- `/api/certificates/generate` - Requires admin role

## Navigation Updates

### Public Header (`PublicLayoutClient.tsx`)
- Added "Learning Paths" link to navigation
- Visible to all users (authenticated and guests)

### App Sidebar (`AppLayoutClient.tsx`)
- Added "Learning Paths" link to navigation
- Visible to authenticated users only

## Guest Access Prevention

### How Guests Are Prevented from Accessing Protected Routes:

1. **Middleware Layer:**
   - Checks JWT token before allowing access
   - Redirects to sign-in if no valid token

2. **Layout Layer:**
   - `(app)/layout.tsx` checks session before rendering
   - `(admin)/layout.tsx` checks admin role

3. **Page Layer:**
   - Each page checks session before rendering content
   - Uses `redirect("/sign-in")` if not authenticated

4. **API Layer:**
   - All protected APIs check authentication
   - Return 401 Unauthorized if not authenticated

### Session Creation
- Sessions are only created after successful authentication:
  - Credentials provider: Validates email/password
  - Google OAuth: Validates OAuth token
- No guest sessions are created
- Session callback validates user exists in database

## Security Best Practices Implemented

1. **Defense in Depth:**
   - Multiple layers of protection (middleware, layout, page, API)
   - Each layer independently validates authentication

2. **Server-Side Validation:**
   - All authentication checks happen on the server
   - Client-side checks are for UX only, not security

3. **Role-Based Access Control:**
   - Admin routes check for admin role
   - Customer routes check for authentication only

4. **Secure Redirects:**
   - Callback URLs preserve intended destination
   - Prevents open redirect vulnerabilities

5. **API Security:**
   - All protected APIs validate authentication
   - Content access validates course purchase
   - User-specific data scoped to authenticated user

## Testing Checklist

- [ ] Unauthenticated user cannot access `/dashboard`
- [ ] Unauthenticated user cannot access `/library`
- [ ] Unauthenticated user cannot access `/profile`
- [ ] Unauthenticated user cannot access `/activity`
- [ ] Unauthenticated user cannot access `/admin/*`
- [ ] Customer cannot access `/admin/*`
- [ ] Authenticated user can access their own data
- [ ] User cannot access another user's data
- [ ] API routes return 401 for unauthenticated requests
- [ ] Learning Paths link appears in navigation

## Known Limitations

1. **Public Routes:**
   - Routes in `(public)` folder are accessible to all users
   - This is intentional for marketing/browsing pages
   - Purchase/checkout requires authentication

2. **Session Validation:**
   - Sessions are validated via JWT tokens
   - Token expiration is set to 30 days
   - No automatic session refresh (user must re-authenticate)

## Future Enhancements

1. **Rate Limiting:**
   - Add rate limiting to authentication endpoints
   - Prevent brute force attacks

2. **Session Management:**
   - Add session timeout warnings
   - Add "Remember Me" functionality

3. **Two-Factor Authentication:**
   - Add 2FA for admin accounts
   - Add 2FA for sensitive operations

4. **Audit Logging:**
   - Log all authentication attempts
   - Log access to sensitive routes
