# 🚀 Quick Start Guide - AI Genius Lab 2026

This guide will get your AI Genius Lab platform up and running with 2026 content in minutes.

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Neon cloud database)
- Git installed

## ⚡ Quick Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-genius-lab
npm install
```

### 2. Environment Setup

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_genius_lab"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Upload (for blog images)
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880

# PayPal (optional)
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-secret"
PAYPAL_MODE="sandbox"
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Seed with 2026 data
npm run db:seed:2026
```

### 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🔑 Default Login

- **Admin**: admin@aigeniuslab.com / admin123
- **User**: john.doe@example.com / password123

## 📚 What's Included

### Courses (2026 Content)
- AI Agents & Autonomous Systems 2026
- Quantum Computing Fundamentals 2026
- Web3 & DeFi Development Masterclass 2026
- Next.js 15 & React 19 Full Stack 2026
- MLOps: Production Machine Learning 2026

### Blog Posts
- Latest 2026 tech trends
- AI breakthroughs
- Web3 adoption
- Quantum computing news
- Developer tools updates

### Features
- ✅ Course management
- ✅ Lesson content (video, text, quizzes)
- ✅ Learning paths
- ✅ Blog with reviews
- ✅ Image uploads
- ✅ User authentication
- ✅ Payment integration
- ✅ Admin dashboard

## 🎯 Next Steps

### For Admins

1. **Explore Admin Panel**
   - Visit `/admin`
   - Browse all management sections
   - Check the [Admin Management Guide](./ADMIN_MANAGEMENT_GUIDE.md)

2. **Customize Content**
   - Edit course details
   - Add your own lessons
   - Write blog posts
   - Upload images

3. **Configure Payments**
   - Set up Stripe/PayPal
   - Configure pricing
   - Test checkout flow

### For Developers

1. **Review Architecture**
   - Check `lib/` for utilities
   - Browse API routes in `app/api/`
   - Study database schema in `prisma/`

2. **Add Features**
   - Create new API endpoints
   - Add UI components
   - Extend database models

3. **Deploy**
   - Set up production database
   - Configure environment variables
   - Deploy to Vercel/Netlify

## 🔧 Common Tasks

### Adding a New Course

```bash
# 1. Go to admin panel
# 2. Navigate to Courses > New Course
# 3. Fill in details
# 4. Add lessons
# 5. Publish
```

### Creating a Blog Post

```bash
# 1. Go to Admin > Blog > New Post
# 2. Write content
# 3. Add images
# 4. Set SEO metadata
# 5. Publish
```

### Managing Users

```bash
# 1. Go to Admin > Users
# 2. View all users
# 3. Change roles
# 4. Reset passwords
```

## 📊 Monitoring

### Check Analytics

1. Visit `/admin/analytics`
2. View course performance
3. Monitor user engagement
4. Track revenue

### View Logs

```bash
# Development logs
npm run dev

# Production logs
# Check your hosting provider's dashboard
```

## 🆘 Troubleshooting

### Database Issues

```bash
# Reset database
npm run db:push

# Reseed data
npm run db:seed:2026
```

### Build Errors

```bash
# Clear build cache
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Common Issues

1. **"Can't reach database"**
   - Check DATABASE_URL
   - Verify database is running
   - Check firewall settings

2. **"NextAuth error"**
   - Verify NEXTAUTH_SECRET
   - Check NEXTAUTH_URL
   - Clear browser cookies

3. **"Upload failed"**
   - Check UPLOAD_DIR permissions
   - Verify MAX_FILE_SIZE
   - Check disk space

## 📚 Documentation

- [Admin Management Guide](./ADMIN_MANAGEMENT_GUIDE.md)
- [Blog Features](./BLOG_FEATURES.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 You're Ready!

Your AI Genius Lab platform is now running with 2026 content. Start exploring, creating courses, and building your educational empire!

---

Need help? Check our [Discord community](https://discord.gg/your-server) or open an issue on GitHub.
