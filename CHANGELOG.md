# Changelog

All notable changes to AI Genius Lab will be documented in this file.

## [Unreleased]

### Added
- Comprehensive README.md with full documentation
- Organized documentation in `docs/` folder
- Documentation index with quick links

### Changed
- Moved fix documentation to `docs/fixes/` folder
- Updated project structure documentation
- Improved setup guides

## [2.0.0] - 2026-01-24

### Added - Mobile & UI Improvements
- **Mobile Responsiveness**: Fixed dual screen issue, proper responsive classes
- **Modernized Sidebar**: Gradient logo icons, better spacing, removed redundant theme toggle
- **Enhanced Dashboard**: Added analytics cards (Learning Streak, This Week, Avg Progress, Learning Time)
- **Achievements System**: Badge system for milestones (Course Completer, On Fire, Dedicated Learner, Certified)
- **Better Error Handling**: Improved content delivery error messages

### Fixed
- **Mobile Menu**: Fixed crash on customer side, slide-from-left animation
- **Header Alignment**: Consistent h-16 height across all layouts
- **Profile Section**: Better positioning in mobile menu
- **JSON Parsing**: Safe JSON parser utility for API responses
- **Content Delivery**: Better handling of missing content with detailed logging

### Changed
- **Theme Toggle**: Removed redundant toggle, kept only in mobile header
- **Dashboard Layout**: 2-column layout for Continue Learning and Achievements
- **Avatar Sizing**: Increased to h-10 w-10 for better visibility
- **Navigation Spacing**: Changed from grid gap-2 to space-y-1 for cleaner look

## [1.5.0] - 2026-01-23

### Added - Certification System
- **Automatic Certificate Generation**: Generates on course/path completion
- **Professional PDF Certificates**: Beautiful design with pdf-lib
- **Certificate Verification**: Public verification endpoint
- **Email Notifications**: Congratulatory emails with download links
- **Activity Logging**: Tracks certificate issuance

### Testing
- ✅ All 22 tests passing
- ✅ Certificate generation tests
- ✅ Certificate verification tests
- ✅ Duplicate prevention tests

## [1.4.0] - 2026-01-22

### Added - Content Security
- **Signed Cloudinary URLs**: 10-minute expiration for security
- **Per-Request Validation**: Authentication check on each content request
- **User-Specific URLs**: URLs tied to user ID
- **Content Type Detection**: Automatic resource type resolution

### Fixed
- **Content Access**: Proper authorization checks
- **URL Generation**: Better error handling for invalid public IDs
- **Migration Support**: Handles both old and new schema formats

## [1.3.0] - 2026-01-21

### Added - Learning Paths
- **Curated Pathways**: Structured learning sequences
- **Progress Tracking**: Track completion across multiple courses
- **Path Certificates**: Generate certificates for path completion
- **Enrollment System**: Automatic enrollment in path courses

## [1.2.0] - 2026-01-20

### Added - Admin Dashboard
- **Analytics Charts**: Interactive charts with Recharts
- **User Management**: Role assignment and user filtering
- **Purchase Tracking**: Comprehensive purchase reports
- **Content Upload**: Cloudinary integration for media

### Improved
- **Performance**: Added caching for expensive queries
- **Security**: Rate limiting on admin endpoints
- **UX**: Better loading states and error messages

## [1.1.0] - 2026-01-19

### Added - Payment System
- **PayPal Integration**: Sandbox and live payment processing
- **Invoice Generation**: Automated PDF invoices
- **Email Delivery**: Invoice emails via Resend
- **Webhook Handling**: PayPal webhook processing

### Security
- **Payment Verification**: Server-side payment validation
- **Webhook Signatures**: Verify PayPal webhook authenticity
- **Duplicate Prevention**: Prevent duplicate purchases

## [1.0.0] - 2026-01-18

### Initial Release
- **Course Management**: Create and manage courses
- **User Authentication**: Email/password and Google OAuth
- **Progress Tracking**: Track lesson completion
- **Review System**: Course reviews and ratings
- **Responsive Design**: Mobile-first UI
- **Dark Mode**: Theme switching

### Tech Stack
- Next.js 16 (App Router)
- TypeScript 5.0
- Prisma 6.0
- PostgreSQL 15
- Tailwind CSS
- NextAuth.js

---

## Version Format

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

## Categories

- **Added**: New features
- **Changed**: Changes to existing features
- **Deprecated**: Features to be removed
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
