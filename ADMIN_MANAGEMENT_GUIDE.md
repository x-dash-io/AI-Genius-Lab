# Admin Management Guide

This guide explains how to manage all content types in your AI Genius Lab platform through the admin panel.

## 📚 Table of Contents
1. [Course Management](#course-management)
2. [Lesson & Content Management](#lesson--content-management)
3. [Learning Path Management](#learning-path-management)
4. [Blog Management](#blog-management)
5. [User Management](#user-management)
6. [Category Management](#category-management)
7. [Analytics & Reports](#analytics--reports)

---

## 🎓 Course Management

### Creating a New Course

1. Navigate to **Admin → Courses → New Course**
2. Fill in the course details:
   - **Title**: Course name (e.g., "AI Agents & Autonomous Systems 2026")
   - **Slug**: URL-friendly version (auto-generated from title)
   - **Description**: Detailed course description
   - **Price**: Set course price in cents (e.g., 19999 for $199.99)
   - **Category**: Select from predefined categories
   - **Level**: Beginner, Intermediate, or Advanced
   - **Duration**: Course length (e.g., "12 weeks")
   - **Instructor Info**: Name, bio, and avatar
   - **Prerequisites**: Required knowledge/skills
   - **Learning Outcomes**: What students will learn
   - **Tags**: Relevant keywords for search

3. Upload course thumbnail (recommended: 800x450px)
4. Set course status:
   - **Published**: Visible to all users
   - **Draft**: Hidden from users
   - **Featured**: Appears on homepage

### Managing Existing Courses

Navigate to **Admin → Courses** to see all courses. For each course you can:
- **Edit**: Modify course details
- **Preview**: See course as students see it
- **Duplicate**: Create a copy of the course
- **Delete**: Remove course (with confirmation)

---

## 📖 Lesson & Content Management

### Creating Lessons

1. Go to the course you want to add lessons to
2. Click "Add New Lesson"
3. Fill in lesson details:
   - **Title**: Lesson name
   - **Description**: Brief overview
   - **Type**: Video, Text, Interactive, Quiz, etc.
   - **Duration**: Estimated completion time
   - **Order**: Position in course
   - **Preview**: Free preview for non-enrolled users

### Adding Content to Lessons

Each lesson can contain multiple content items:

#### Video Content
- Upload video file or add streaming URL
- Add transcript for accessibility
- Set video thumbnail

#### Text Content
- Rich text editor for written content
- Support for markdown
- Code syntax highlighting

#### Interactive Content
- Code playgrounds
- Simulators
- Interactive diagrams

#### Resources
- PDF downloads
- External links
- GitHub repositories
- Tools and software

#### Quizzes
- Multiple choice questions
- True/false questions
- Coding challenges
- Set passing score
- Time limits

### Content Management Tips

- **Order content logically**: Start with basics, advance to complex topics
- **Mix content types**: Keep students engaged with variety
- **Add checkpoints**: Quizzes after major topics
- **Provide resources**: Additional learning materials

---

## 🛤️ Learning Path Management

### Creating Learning Paths

1. Navigate to **Admin → Learning Paths → New Path**
2. Define the path:
   - **Title**: Path name (e.g., "AI Engineer Path 2026")
   - **Description**: What students will achieve
   - **Category**: Subject area
   - **Level**: Overall difficulty
   - **Duration**: Total time to complete
   - **Image**: Path cover image

3. **Add Courses**:
   - Search and select courses
   - Set order of completion
   - Define prerequisites between courses

### Managing Paths

- **Track Progress**: See student completion rates
- **Update Curriculum**: Add/remove courses as needed
- **Bundle Pricing**: Offer path discounts
- **Certificates**: Auto-generate on completion

---

## 📝 Blog Management

### Creating Blog Posts

1. Go to **Admin → Blog → New Post**
2. Write your post:
   - **Title**: SEO-friendly title
   - **Slug**: URL path (auto-generated)
   - **Excerpt**: Brief summary for previews
   - **Content**: Full article content
   - **Author**: Post author name

3. **Add Images**:
   - **Cover Image**: Main post image
   - **Gallery**: Additional images with:
     - Drag & drop upload
     - Alt text for accessibility
     - Captions
     - Reorder functionality

4. **Metadata**:
   - **Category**: Select post category
   - **Tags**: Relevant keywords
   - **Featured**: Pin to homepage
   - **Publish Status**: Draft or Published

### Managing Blog Features

#### Image Management
- Upload up to 10 images per post
- Automatic optimization
- Responsive gallery display
- SEO-friendly alt attributes

#### Review System
- Users can rate posts 1-5 stars
- Optional comments
- Automatic rating averages
- Review moderation tools

### Blog Best Practices

- **SEO Optimization**: Use keywords in titles and content
- **Engaging Content**: Include images, videos, and interactive elements
- **Regular Posting**: Maintain consistent publishing schedule
- **Promotion**: Share on social media channels

---

## 👥 User Management

### Viewing Users

Navigate to **Admin → Users** to see:
- All registered users
- User roles (Admin/Customer)
- Registration dates
- Last login times
- Purchase history

### Managing User Roles

- **Admin**: Full access to admin panel
- **Customer**: Can purchase and access content
- **Instructor**: Can create and manage courses (future feature)

### User Actions

- **View Details**: See user profile and activity
- **Reset Password**: Send password reset email
- **Impersonate**: View site as user (debugging)
- **Ban/Unban**: Control access to platform
- **Export**: Download user data

---

## 📂 Category Management

### Managing Categories

1. Go to **Admin → Categories**
2. For each category you can:
   - Edit name and description
   - Change icon and color
   - Reorder categories
   - View course count
   - Delete (if no courses assigned)

### Category Best Practices

- **Clear Names**: Descriptive, user-friendly names
- **Logical Grouping**: Similar courses together
- **Visual Identity**: Unique icons and colors
- **Regular Updates**: Add new categories as needed

---

## 📊 Analytics & Reports

### Course Analytics

For each course, track:
- **Enrollment Numbers**: Total and active students
- **Completion Rates**: Percentage finishing course
- **Revenue**: Total earnings per course
- **Engagement**: Lesson completion stats
- **Reviews**: Student feedback and ratings

### User Analytics

- **Registration Trends**: New signups over time
- **Active Users**: Daily/weekly/monthly active
- **Revenue Per User**: Average spending
- **Course Preferences**: Popular categories

### Blog Analytics

- **Page Views**: Traffic per post
- **Engagement**: Comments and ratings
- **Popular Topics**: Most viewed categories
- **SEO Performance**: Search rankings

### Generating Reports

1. Navigate to desired analytics section
2. Select date range
3. Choose metrics to include
4. Export as CSV or PDF
5. Schedule regular reports (email)

---

## 🚀 Advanced Features

### Bulk Operations

- **Bulk Upload**: Import courses from CSV
- **Bulk Edit**: Update multiple items
- **Bulk Publish**: Publish multiple drafts
- **Bulk Delete**: Remove multiple items

### Automation

- **Scheduled Publishing**: Set posts to publish later
- **Drip Content**: Release lessons over time
- **Email Notifications**: Automated student updates
- **Backup Automation**: Regular data backups

### Integrations

- **Payment Gateways**: Stripe, PayPal
- **Email Services**: SendGrid, Mailchimp
- **Analytics**: Google Analytics, Mixpanel
- **CDN**: Cloudflare, AWS CloudFront

---

## 💡 Pro Tips

### Content Strategy

1. **Plan Ahead**: Create content calendars
2. **Quality Over Quantity**: Focus on value
3. **Student Feedback**: Use reviews to improve
4. **Stay Current**: Update content regularly

### SEO Optimization

1. **Keyword Research**: Use tools like Ahrefs
2. **Meta Descriptions**: Compelling summaries
3. **Internal Linking**: Connect related content
4. **Image Optimization**: Alt tags and compression

### User Experience

1. **Mobile First**: Ensure mobile compatibility
2. **Fast Loading**: Optimize images and code
3. **Clear Navigation**: Easy to find content
4. **Accessibility**: WCAG compliance

---

## 🔧 Troubleshooting

### Common Issues

**Course Not Appearing**
- Check publish status
- Verify category assignment
- Clear browser cache

**Video Not Playing**
- Check video URL
- Verify file format
- Test on different devices

**Payment Issues**
- Check payment gateway settings
- Verify webhook URLs
- Review error logs

### Getting Help

1. **Documentation**: Check this guide first
2. **Error Logs**: View in admin panel
3. **Support Team**: Contact via admin dashboard
4. **Community**: Join our Discord server

---

## 📝 Checklist Before Publishing

### Course Checklist
- [ ] All lessons created and ordered
- [ ] Video content uploaded and tested
- [ ] Quizzes created with correct answers
- [ ] Price set correctly
- [ ] Thumbnail image optimized
- [ ] Description is compelling
- [ ] Prerequisites clearly stated
- [ ] Learning outcomes defined

### Blog Post Checklist
- [ ] Content proofread
- [ ] Images optimized with alt text
- [ ] SEO title and meta description
- [ ] Categories and tags assigned
- [ ] Preview mode tested
- [ ] Social sharing images set
- [ ] Publication date scheduled

---

Remember: Your admin panel is powerful but requires careful management. Always test changes before publishing and keep regular backups of your content.
