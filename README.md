# AI Genius Lab

A comprehensive online learning management system built for modern education. Deliver courses, track progress, issue certificates, and manage payments through a single, powerful platform.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)

## Overview

AI Genius Lab is a production-ready learning management system designed for educational institutions, training organizations, and content creators. The platform handles everything from course creation to payment processing, with built-in analytics and certificate generation.

## Core Capabilities

### Course Management
- Structured course creation with sections and lessons
- Support for video, PDF, and document content
- Drag-and-drop content organization
- Category-based course organization
- Learning path creation for guided curricula

### Student Experience
- Real-time progress tracking across all courses
- Automatic certificate generation upon completion
- Certificate verification system
- Course reviews and ratings
- Shopping cart and checkout flow
- Purchase history and invoices

### Administration
- Comprehensive analytics dashboard
- User management and role assignment
- Content upload and management
- Purchase tracking and reporting
- Revenue analytics with visual charts

### Security & Authentication
- Email and password authentication
- Google OAuth integration
- Two-factor authentication via OTP
- Secure password reset workflow
- Role-based access control
- Rate limiting on API endpoints

### Payment Processing
- PayPal integration for course purchases
- Automated invoice generation
- Email delivery of receipts
- Webhook handling for payment events
- Support for individual courses and learning paths

## Technology Stack

### Frontend
- Next.js 16 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Radix UI component library
- Framer Motion for animations
- Recharts for data visualization

### Backend
- PostgreSQL database
- Prisma ORM
- NextAuth.js for authentication
- Resend for email delivery
- Cloudinary for media storage
- Redis for caching (optional)

### Infrastructure
- Vercel-ready deployment
- Serverless API routes
- Edge-optimized delivery
- Automatic image optimization

## Getting Started

### Requirements

- Node.js 18 or higher
- PostgreSQL database
- Package manager (npm, yarn, or pnpm)

### Installation

1. Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd ai-genius-lab
npm install
```

2. Configure environment variables by creating a `.env.local` file:
```bash
# Database Connection
DATABASE_URL="postgresql://username:password@host:5432/database"
DIRECT_URL="postgresql://username:password@host:5432/database"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="<from-google-cloud-console>"
GOOGLE_CLIENT_SECRET="<from-google-cloud-console>"

# PayPal Configuration
PAYPAL_ENV="sandbox"
PAYPAL_CLIENT_ID="<from-paypal-developer>"
PAYPAL_CLIENT_SECRET="<from-paypal-developer>"
PAYPAL_WEBHOOK_ID="<from-paypal-developer>"

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME="<from-cloudinary-dashboard>"
CLOUDINARY_API_KEY="<from-cloudinary-dashboard>"
CLOUDINARY_API_SECRET="<from-cloudinary-dashboard>"

# Email Service
RESEND_API_KEY="<from-resend-dashboard>"
EMAIL_FROM="noreply@yourdomain.com"

# Redis Cache (Optional)
UPSTASH_REDIS_REST_URL="<from-upstash-console>"
UPSTASH_REDIS_REST_TOKEN="<from-upstash-console>"

# Prisma Configuration
PRISMA_CLIENT_ENGINE_TYPE="library"
```

3. Initialize the database:
```bash
npx prisma migrate dev
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

5. Access the application at `http://localhost:3000`

### Default Credentials

After seeding, use these credentials to access the platform:

**Administrator Account:**
- Email: admin@aigeniuslab.com
- Password: password123

**Customer Account:**
- Email: customer@aigeniuslab.com
- Password: password123

## Database Management

```bash
# Apply schema changes
npm run db:push

# Create new migration
npx prisma migrate dev --name migration_name

# Deploy to production
npx prisma migrate deploy

# Seed sample data
npm run db:seed

# Open database GUI
npx prisma studio

# Regenerate Prisma Client
npx prisma generate
```

## Testing

The platform includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test suite
npm test -- user-flow
```

Test coverage includes:
- Authentication workflows
- Course purchase flows
- Progress tracking
- Certificate generation
- Review system
- Role-based access control
- Password security

## Deployment

### Vercel Deployment

1. Push code to GitHub repository

2. Import project to Vercel:
   - Visit vercel.com/new
   - Select your repository
   - Vercel detects Next.js automatically

3. Configure environment variables in Vercel dashboard

4. Deploy - automatic on every push to main branch

### Database Options

**Neon (Recommended)**
- Serverless PostgreSQL
- Automatic scaling
- Free tier available
- Visit neon.tech

**Vercel Postgres**
- Integrated with Vercel
- Simple setup
- Install: `npm i @vercel/postgres`

**Supabase**
- PostgreSQL with additional features
- Real-time capabilities
- Visit supabase.com

After database setup, run migrations:
```bash
npx prisma migrate deploy
```

## Project Structure

```
ai-genius-lab/
├── app/                    # Next.js application
│   ├── (admin)/           # Admin dashboard routes
│   ├── (app)/             # Student portal routes
│   ├── (public)/          # Public pages
│   └── api/               # API endpoints
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication components
│   ├── cart/             # Shopping cart
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   ├── admin/            # Admin utilities
│   ├── cart/             # Cart logic
│   └── seo/              # SEO helpers
├── prisma/               # Database schema
├── __tests__/            # Test suites
└── docs/                 # Documentation
```

## Security Features

- bcrypt password hashing
- JWT-based session management
- CSRF protection
- Rate limiting on sensitive endpoints
- SQL injection prevention via Prisma
- XSS protection through React
- Signed URLs for content delivery
- Role-based access control

## Performance Optimizations

- Server-side rendering
- Automatic code splitting
- Image optimization
- Redis caching layer
- Database query optimization
- CDN delivery for media
- Edge function support

## Code Quality

```bash
# Lint codebase
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

## Documentation

Detailed documentation is available in the `docs/` directory:

- Implementation guides
- API documentation
- Security best practices
- Testing strategies
- Deployment procedures

## Support

For technical support or questions:
- Review documentation in the `docs/` folder
- Open an issue on GitHub
- Contact: support@aigeniuslab.com

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

Built with industry-leading open source technologies:
- Next.js - React framework
- Prisma - Database toolkit
- NextAuth.js - Authentication
- Tailwind CSS - Utility-first CSS
- Radix UI - Accessible components
- Cloudinary - Media management
- Resend - Email infrastructure
- PayPal - Payment processing

---

Built by the AI Genius Lab Team
