# AI Genius Lab 🎓

A modern, full-featured online learning platform focused on AI education. Built with Next.js 16, TypeScript, Prisma, and PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)

## ✨ Features

### 🎯 Core Features
- **Course Management**: Create and manage AI courses with structured sections and lessons
- **Learning Paths**: Curated learning pathways for comprehensive skill development
- **Progress Tracking**: Real-time lesson completion and learning progress tracking
- **Certificates**: Automatic PDF certificate generation with verification system
- **Payment Processing**: Secure PayPal integration for course purchases
- **Invoice System**: Automated invoice generation and email delivery

### 🔐 Authentication & Security
- Email/password authentication with bcrypt hashing
- Google OAuth integration
- OTP verification for email confirmation
- Secure password reset flow via email
- Role-based access control (Admin/Customer)
- Rate limiting on sensitive endpoints

### 📊 Admin Dashboard
- Comprehensive analytics with interactive charts
- User management with role assignment
- Course and learning path management
- Purchase tracking and reporting
- Content upload with Cloudinary integration

### 🎨 User Experience
- **Responsive Design**: Mobile-first, fully responsive UI
- **Dark Mode**: Built-in theme switching
- **Modern UI**: Clean, professional interface with Radix UI components
- **Animations**: Smooth transitions with Framer Motion
- **Accessibility**: WCAG compliant components

### 📱 Mobile Optimized
- Slide-out navigation menus
- Touch-friendly interfaces
- Optimized layouts for all screen sizes
- Progressive Web App ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm/yarn/pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-genius-lab.git
   cd ai-genius-lab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration (see [Environment Variables](#environment-variables))

4. **Set up database**
   ```bash
   npx prisma migrate dev
   npm run db:seed  # Optional: seed with sample data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create a `.env.local` file with the following:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with_openssl_rand_base64_32"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# PayPal
PAYPAL_ENV="sandbox"  # or "live" for production
PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_client_secret"
PAYPAL_WEBHOOK_ID="your_webhook_id"

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Resend (Email)
RESEND_API_KEY="your_resend_api_key"
EMAIL_FROM="onboarding@resend.dev"  # Use verified domain in production

# Upstash Redis (Optional - for caching)
UPSTASH_REDIS_REST_URL="your_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"

# Prisma
PRISMA_CLIENT_ENGINE_TYPE="library"
```

### Detailed Setup Guides

- **[Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md)** - Enable Google sign-in
- **[PayPal Sandbox Setup](docs/PAYPAL_SANDBOX_SETUP.md)** - Test payments with fake money
- **[Email Setup (Resend)](docs/EMAIL_SETUP.md)** - Configure email delivery
- **[Ngrok Setup](docs/NGROK_SETUP.md)** - Test webhooks locally

## 📚 Documentation

### Core Documentation
- **[Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)** - Complete feature overview
- **[Certification System](docs/CERTIFICATION_SYSTEM_SUMMARY.md)** - Certificate generation & verification
- **[Content Security](docs/CONTENT_SECURITY.md)** - Cloudinary integration & signed URLs
- **[Learning Pathways](docs/LEARNING_PATHWAYS.md)** - Learning path implementation
- **[Security Audit](docs/SECURITY_AUDIT.md)** - Security best practices
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Running and writing tests

### Recent Fixes & Improvements
- **[Mobile Responsiveness](docs/fixes/MOBILE_RESPONSIVENESS_FIXES.md)** - Mobile layout fixes
- **[Dashboard Improvements](docs/fixes/DASHBOARD_IMPROVEMENTS.md)** - Enhanced customer dashboard
- **[JSON Parsing Fix](docs/fixes/JSON_PARSING_FIX.md)** - Safe JSON parsing utility

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### Backend
- **Database**: PostgreSQL 15
- **ORM**: Prisma 6.0
- **Authentication**: NextAuth.js
- **Email**: Resend
- **File Storage**: Cloudinary
- **PDF Generation**: pdf-lib
- **Caching**: Upstash Redis (optional)

### Payments & Analytics
- **Payments**: PayPal SDK
- **Analytics**: Vercel Analytics
- **Monitoring**: Built-in logging

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- user-flow
```

### Test Coverage
- ✅ User authentication flow
- ✅ Course purchase flow
- ✅ Learning path enrollment
- ✅ Lesson progress tracking
- ✅ Review system
- ✅ Certificate generation & verification
- ✅ RBAC (Role-Based Access Control)
- ✅ Password hashing & verification

## 📦 Database Commands

```bash
# Push schema changes to database
npm run db:push

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables**
   - Copy all variables from `.env.local`
   - Add them in Vercel project settings

4. **Deploy**
   - Vercel automatically deploys on push
   - Production URL provided

### Database Setup for Production

**Option 1: Vercel Postgres**
```bash
# Install Vercel Postgres
npm i @vercel/postgres

# Connect in Vercel dashboard
# Copy DATABASE_URL to environment variables
```

**Option 2: Neon (Recommended)**
- Sign up at [neon.tech](https://neon.tech)
- Create a new project
- Copy connection string to `DATABASE_URL`
- Run migrations: `npx prisma migrate deploy`

**Option 3: Supabase**
- Sign up at [supabase.com](https://supabase.com)
- Create a new project
- Get connection string from settings
- Add to `DATABASE_URL`

## 🛠️ Development

### Project Structure

```
ai-genius-lab/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin routes
│   ├── (app)/             # Customer routes
│   ├── (public)/          # Public routes
│   └── api/               # API routes
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── auth/             # Auth components
│   ├── cart/             # Cart components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                   # Utility functions
│   ├── admin/            # Admin utilities
│   ├── cart/             # Cart utilities
│   └── seo/              # SEO utilities
├── prisma/               # Database schema & migrations
├── __tests__/            # Test files
├── docs/                 # Documentation
└── public/               # Static assets
```

### Key Files

- `app/layout.tsx` - Root layout with providers
- `lib/auth.ts` - NextAuth configuration
- `lib/prisma.ts` - Prisma client with retry logic
- `middleware.ts` - Route protection & redirects
- `prisma/schema.prisma` - Database schema

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **CSRF Protection**: Built-in with NextAuth
- **Rate Limiting**: API endpoint protection
- **SQL Injection Prevention**: Prisma ORM
- **XSS Protection**: React auto-escaping
- **Content Security**: Signed Cloudinary URLs
- **Role-Based Access**: Admin/Customer separation

## 📈 Performance

- **Server Components**: Reduced client-side JavaScript
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Redis caching for expensive queries
- **Database Indexing**: Optimized Prisma schema
- **CDN**: Cloudinary for media delivery

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Use TypeScript for type safety
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commits

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Cloudinary](https://cloudinary.com/) - Media management
- [Resend](https://resend.com/) - Email delivery
- [PayPal](https://developer.paypal.com/) - Payment processing

## 📞 Support

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: Open an issue on GitHub
- **Email**: support@aigeniuslab.com

## 🗺️ Roadmap

- [ ] Video streaming with HLS
- [ ] Live classes with WebRTC
- [ ] Mobile app (React Native)
- [ ] AI-powered course recommendations
- [ ] Gamification (badges, leaderboards)
- [ ] Multi-language support
- [ ] Stripe payment integration
- [ ] Course marketplace

---

**Built with ❤️ by the AI Genius Lab Team**
