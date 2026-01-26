# Blog Features Documentation

## Overview
The blog module has been enhanced with two major features:
1. **Image Management** - Smart image handling with drag-and-drop upload
2. **Review & Rating System** - User reviews with 5-star ratings

## Image Management Features

### Admin Features
- **Drag & Drop Upload**: Intuitive image upload with react-dropzone
- **Multiple Images**: Support for up to 10 images per blog post
- **Image Metadata**: Alt text and captions for accessibility and SEO
- **Image Ordering**: Reorder images with up/down controls
- **File Validation**: 
  - Supported formats: JPEG, JPG, PNG, GIF, WebP
  - Maximum file size: 5MB per image
- **Smart Storage**: Images uploaded via `/api/admin/upload` endpoint

### Frontend Display
- **Gallery View**: Images displayed in a responsive grid layout
- **Alt Text Support**: Accessibility-friendly with alt attributes
- **Captions**: Optional captions displayed below images
- **Cover Image**: Separate featured image for blog post previews

## Review & Rating System

### User Features
- **5-Star Rating**: Intuitive star rating system
- **Comments**: Optional text feedback with reviews
- **One Review Per User**: Users can update but not duplicate reviews
- **Real-time Updates**: Reviews update without page refresh
- **Rating Summary**: Visual breakdown of all ratings (1-5 stars)

### Admin Benefits
- **User Engagement**: Increases user interaction with content
- **Content Quality**: Feedback helps improve blog posts
- **Social Proof**: Ratings build trust with new readers
- **Analytics**: Track which posts perform best

### Technical Implementation
- **Average Rating**: Automatically calculated from all reviews
- **Review Count**: Total number of reviews per post
- **Database Schema**: 
  - `BlogReview` model with user relations
  - `BlogImage` model with post relations
  - Rating fields added to `BlogPost` model

## API Endpoints

### Blog Reviews
- `GET /api/blog/[postId]/reviews` - Fetch all reviews for a post
- `POST /api/blog/[postId]/reviews` - Create/update a review

### Image Upload
- `POST /api/admin/upload` - Upload images (admin only)

## Database Schema Updates

### New Models
```prisma
model BlogImage {
  id        String   @id @default(cuid())
  postId    String
  url       String
  alt       String?
  caption   String?
  sortOrder Int      @default(0)
  post      BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
}

model BlogReview {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  rating    Int      // 1-5 stars
  comment   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  post      BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Updated BlogPost Model
```prisma
model BlogPost {
  // ... existing fields
  images       BlogImage[]
  ratingAvg    Float     @default(0)
  ratingCount  Int       @default(0)
  reviews      BlogReview[]
}
```

## UI Components

### Admin Components
- `BlogImageUpload` - Drag-and-drop image manager
- `BlogForm` - Updated with image upload integration

### Client Components
- `BlogReviewSection` - Display and submit reviews
- `BlogReviewClient` - Client-side review management
- `BlogContent` - Enhanced content renderer

## Usage Instructions

### For Admins
1. Navigate to `/admin/blog/new` or edit existing post
2. Add images using the drag-and-drop area
3. Add alt text and captions for each image
4. Reorder images as needed
5. Save the post

### For Users
1. Navigate to any blog post
2. Scroll to the reviews section
3. Click on stars to rate (1-5)
4. Add optional comment
5. Submit review

## Future Enhancements
- Image optimization and CDN integration
- Review moderation system
- Image lightbox/gallery view
- Review notifications
- Rich text editor for comments
- Social sharing of reviews

## Notes
- Images are stored via the existing upload system
- Reviews require user authentication
- All reviews are public and visible to all users
- Admins cannot delete user reviews (future enhancement)
