# AI Genius Lab Documentation

Welcome to the AI Genius Lab documentation! This folder contains comprehensive guides and documentation for the platform.

## 📚 Table of Contents

### Core Documentation

1. **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)**
   - Complete overview of all features
   - Architecture and design decisions
   - Feature breakdown

2. **[Certification System](CERTIFICATION_SYSTEM_SUMMARY.md)**
   - Certificate generation workflow
   - PDF creation and storage
   - Verification system
   - Email notifications

3. **[Content Security](CONTENT_SECURITY.md)**
   - Cloudinary integration
   - Signed URL generation
   - Access control
   - Content delivery

4. **[Learning Pathways](LEARNING_PATHWAYS.md)**
   - Learning path structure
   - Course sequencing
   - Progress tracking
   - Completion logic

5. **[Security Audit](SECURITY_AUDIT.md)**
   - Security best practices
   - Authentication & authorization
   - Data protection
   - API security

6. **[Testing Guide](TESTING_GUIDE.md)**
   - Running tests
   - Writing new tests
   - Test coverage
   - CI/CD integration

### Setup Guides

7. **[Ngrok Setup](NGROK_SETUP.md)**
   - Local webhook testing
   - PayPal webhook configuration
   - Troubleshooting

### Recent Fixes & Improvements

Located in the `fixes/` folder:

- **[Mobile Responsiveness Fixes](fixes/MOBILE_RESPONSIVENESS_FIXES.md)**
  - Fixed dual screen issue on mobile
  - Responsive layout improvements
  - Animation fixes

- **[Mobile Menu Fix](fixes/MOBILE_MENU_FIX.md)**
  - Slide-from-left animation
  - Fixed crash issues
  - Improved UX

- **[Dashboard Improvements](fixes/DASHBOARD_IMPROVEMENTS.md)**
  - Enhanced customer dashboard
  - Added analytics cards
  - Learning streak tracking
  - Achievements system

- **[JSON Parsing Fix](fixes/JSON_PARSING_FIX.md)**
  - Safe JSON parser utility
  - Better error handling
  - Content-Type validation

- **[Invoice PDF Enhancement](fixes/INVOICE_PDF_ENHANCEMENT.md)**
  - Professional invoice design
  - Print functionality
  - Email delivery

## 🚀 Quick Links

### For Developers
- [Project Structure](#project-structure)
- [Database Schema](../prisma/schema.prisma)
- [API Routes](../app/api/)
- [Testing Guide](TESTING_GUIDE.md)

### For Administrators
- [Admin Dashboard Guide](IMPLEMENTATION_SUMMARY.md#admin-dashboard)
- [Content Upload Guide](CONTENT_SECURITY.md#uploading-content)
- [User Management](IMPLEMENTATION_SUMMARY.md#user-management)

### For Users
- [Getting Started](#getting-started)
- [Course Enrollment](#course-enrollment)
- [Certificate Verification](CERTIFICATION_SYSTEM_SUMMARY.md#verification)

## 📖 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm/yarn/pnpm

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/ai-genius-lab.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Environment Setup
See the main [README.md](../README.md#environment-variables) for detailed environment variable configuration.

## 🏗️ Project Structure

```
ai-genius-lab/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin-only routes
│   ├── (app)/             # Authenticated user routes
│   ├── (public)/          # Public routes
│   └── api/               # API endpoints
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── auth/             # Authentication components
│   ├── cart/             # Shopping cart
│   ├── checkout/         # Checkout flow
│   ├── courses/          # Course components
│   ├── home/             # Landing page
│   ├── layout/           # Layout components
│   ├── learning-paths/   # Learning path components
│   ├── lessons/          # Lesson viewer
│   ├── profile/          # User profile
│   ├── providers/        # Context providers
│   ├── reviews/          # Review system
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions & business logic
│   ├── admin/            # Admin utilities
│   ├── cart/             # Cart logic
│   ├── seo/              # SEO utilities
│   ├── auth.ts           # Authentication config
│   ├── certificates.ts   # Certificate generation
│   ├── cloudinary.ts     # File storage
│   ├── email.ts          # Email sending
│   ├── prisma.ts         # Database client
│   └── ...               # Other utilities
├── prisma/               # Database
│   ├── migrations/       # Database migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── __tests__/            # Test files
│   ├── integration/      # Integration tests
│   ├── lib/              # Unit tests
│   └── utils/            # Test utilities
├── docs/                 # Documentation (you are here!)
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- user-flow

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

See [Testing Guide](TESTING_GUIDE.md) for detailed information.

## 🔒 Security

The platform implements multiple security layers:

- **Authentication**: NextAuth.js with JWT
- **Authorization**: Role-based access control (RBAC)
- **Password Security**: bcrypt hashing
- **API Protection**: Rate limiting
- **Content Security**: Signed URLs with expiration
- **SQL Injection**: Prisma ORM protection
- **XSS Protection**: React auto-escaping

See [Security Audit](SECURITY_AUDIT.md) for complete details.

## 📊 Database Schema

Key models:
- **User**: Authentication and profile
- **Course**: Course content and metadata
- **Section**: Course sections
- **Lesson**: Individual lessons
- **LessonContent**: Lesson content files
- **Purchase**: Payment records
- **Enrollment**: Course access
- **Progress**: Learning progress
- **Certificate**: Generated certificates
- **Review**: Course reviews
- **LearningPath**: Curated learning paths

See [schema.prisma](../prisma/schema.prisma) for complete schema.

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy automatically

### Database Options
- **Vercel Postgres**: Integrated with Vercel
- **Neon**: Serverless PostgreSQL (recommended)
- **Supabase**: Open-source alternative
- **Railway**: Simple deployment

See main [README.md](../README.md#deployment) for detailed deployment guide.

## 🤝 Contributing

We welcome contributions! Please:

1. Read the documentation
2. Check existing issues
3. Create a feature branch
4. Write tests
5. Submit a pull request

## 📞 Support

- **Documentation**: This folder
- **Issues**: GitHub Issues
- **Email**: support@aigeniuslab.com

## 📝 License

MIT License - see [LICENSE](../LICENSE) file.

---

**Last Updated**: January 2026
