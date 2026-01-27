# Navigation Layout Fix Plan

## Current Issues

1. **Sign In/Sign Up/Sign Out buttons not visible** - Need to verify visibility and styling
2. **Mobile layout confusion** - Both logged-in and non-logged-in users should use sidebar on mobile
3. **Desktop layout confusion** - Non-logged-in users should have top bar, logged-in users should have sidebar

## Desired Behavior

### Desktop (md and above)
- **Non-logged-in users**: Top navigation bar with Sign In/Sign Up buttons
- **Logged-in users**: Left sidebar with user profile and Sign Out button

### Mobile (below md)
- **Both logged-in and non-logged-in users**: Hamburger menu that opens a sidebar from the left
- **Non-logged-in users**: Sidebar should show Sign In/Sign Up buttons at the bottom
- **Logged-in users**: Sidebar should show user profile and Sign Out button at the bottom

## Current Structure Analysis

### PublicLayoutClient (for non-logged-in users)
- ✅ Desktop: Has top bar with Sign In/Sign Up buttons
- ✅ Mobile: Has hamburger menu with sidebar that includes Sign In/Sign Up buttons
- **Status**: Should be working correctly

### AppLayoutClient (for logged-in users)
- ✅ Desktop: Has left sidebar with user profile and Sign Out
- ✅ Mobile: Has hamburger menu with sidebar that includes user profile and Sign Out
- **Status**: Should be working correctly

### Layout Routing (app/(public)/layout.tsx)
- Currently switches between PublicLayoutClient and AppLayoutClient based on session
- **Status**: Logic is correct

## Root Cause Analysis

The issue is likely:
1. **CSS/Styling conflicts** - Buttons might be rendered but hidden
2. **Session state** - Session might not be loading correctly
3. **Hydration mismatch** - Server and client rendering differently
4. **Z-index issues** - Elements might be behind other elements

## Fix Implementation Steps

### Step 1: Verify Button Visibility
- Check if buttons are in DOM but hidden
- Verify z-index values
- Check for CSS conflicts
- Ensure proper contrast for theme (light/dark mode)

### Step 2: Add Debug Logging
- Add console logs to verify session state
- Log when components mount
- Verify which layout is being used

### Step 3: Fix Styling Issues
- Ensure buttons have proper visibility
- Fix any z-index conflicts
- Ensure proper spacing and sizing
- Test in both light and dark modes

### Step 4: Test Responsive Behavior
- Test on mobile viewport
- Test on tablet viewport
- Test on desktop viewport
- Test layout switching when logging in/out

### Step 5: Verify Session Handling
- Ensure session loads correctly
- Verify session updates trigger re-renders
- Check for race conditions

## Files to Modify

1. `components/layout/PublicLayoutClient.tsx` - Non-logged-in user layout
2. `components/layout/AppLayoutClient.tsx` - Logged-in user layout
3. `app/(public)/layout.tsx` - Layout routing logic
4. `components/auth/SignOutButton.tsx` - Sign out button component

## Testing Checklist

- [ ] Non-logged-in user on desktop sees top bar with Sign In/Sign Up
- [ ] Non-logged-in user on mobile sees hamburger menu
- [ ] Non-logged-in user mobile sidebar shows Sign In/Sign Up at bottom
- [ ] Logged-in user on desktop sees left sidebar
- [ ] Logged-in user on mobile sees hamburger menu
- [ ] Logged-in user mobile sidebar shows profile and Sign Out at bottom
- [ ] Sign Out button works and redirects properly
- [ ] Sign In/Sign Up buttons navigate to correct pages
- [ ] Layout switches correctly when logging in
- [ ] Layout switches correctly when logging out
- [ ] Works in both light and dark themes

## Implementation Priority

1. **HIGH**: Fix button visibility (Sign In/Sign Up/Sign Out)
2. **MEDIUM**: Verify mobile sidebar behavior
3. **LOW**: Polish animations and transitions
