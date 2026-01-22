# Certification System Design

## Overview

The Synapze certification system provides verifiable certificates upon completion of courses and learning paths. Certificates serve as proof of completion and can be shared on professional profiles.

## Certification Pathways

### 1. Course Completion Certificates

**Requirements:**
- User must have purchased the course (status: "paid")
- User must have completed all lessons in the course
- Minimum completion threshold: 100% of lessons completed

**Certificate Details:**
- Course title
- Student name
- Completion date
- Certificate ID (unique, verifiable)
- Course description/summary
- Instructor/Platform name: "Synapze"

**Generation:**
- Automatically generated upon course completion
- Stored in database with unique certificate ID
- PDF format for download
- Shareable URL for verification

### 2. Learning Path Completion Certificates

**Requirements:**
- User must have enrolled in the learning path
- User must have completed ALL courses in the path (100% completion)
- All courses must be completed in order (if sequential)

**Certificate Details:**
- Learning path title
- Student name
- Completion date
- List of completed courses
- Total courses completed
- Certificate ID (unique, verifiable)

**Generation:**
- Automatically generated when all courses in path are completed
- Higher value certificate (shows mastery of entire path)
- Can be used to demonstrate comprehensive knowledge

## Database Schema

```prisma
model Certificate {
  id            String   @id @default(cuid())
  userId        String
  type          CertificateType
  courseId      String?  // For course certificates
  pathId        String?  // For learning path certificates
  certificateId String   @unique // Public certificate ID for verification
  issuedAt      DateTime @default(now())
  expiresAt     DateTime? // Optional expiration
  metadata      Json?    // Additional certificate data
  pdfUrl        String?  // URL to generated PDF
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  course        Course?  @relation(fields: [courseId], references: [id])
  path          LearningPath? @relation(fields: [pathId], references: [id])

  @@index([userId])
  @@index([certificateId])
}

enum CertificateType {
  course
  learning_path
}
```

## Certificate Generation Flow

### Course Certificate Flow

```
1. User completes final lesson in course
   ↓
2. System checks if all lessons completed
   ↓
3. System verifies course purchase status
   ↓
4. Generate certificate ID (unique)
   ↓
5. Create certificate record in database
   ↓
6. Generate PDF certificate
   ↓
7. Upload PDF to Cloudinary
   ↓
8. Send certificate email to user
   ↓
9. Display certificate in user's profile/library
```

### Learning Path Certificate Flow

```
1. User completes final lesson in final course
   ↓
2. System checks if all courses in path are completed
   ↓
3. System verifies all course purchases
   ↓
4. Generate certificate ID (unique)
   ↓
5. Create certificate record in database
   ↓
6. Generate PDF certificate with course list
   ↓
7. Upload PDF to Cloudinary
   ↓
8. Send certificate email to user
   ↓
9. Display certificate in user's profile/library
```

## Certificate Verification

### Public Verification Endpoint

**URL:** `/certificates/[certificateId]/verify`

**Features:**
- Public access (no authentication required)
- Verifies certificate authenticity
- Shows certificate details:
  - Student name
  - Course/Path name
  - Issue date
  - Completion status
- Prevents certificate forgery

**Implementation:**
```typescript
// Certificate ID format: CERT-{timestamp}-{random}
// Example: CERT-1704067200-a3f9k2

export async function verifyCertificate(certificateId: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateId },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true, description: true } },
      path: { select: { title: true, description: true } },
    },
  });

  if (!certificate) {
    return { valid: false, error: "Certificate not found" };
  }

  if (certificate.expiresAt && certificate.expiresAt < new Date()) {
    return { valid: false, error: "Certificate has expired" };
  }

  return {
    valid: true,
    certificate: {
      type: certificate.type,
      studentName: certificate.user.name,
      courseName: certificate.course?.title,
      pathName: certificate.path?.title,
      issuedAt: certificate.issuedAt,
      expiresAt: certificate.expiresAt,
    },
  };
}
```

## Certificate Display

### User Profile Page
- "Certificates" section showing all earned certificates
- Download PDF button
- Share certificate link
- Verification link

### Course/Learning Path Pages
- Certificate badge when completed
- "View Certificate" button
- Completion percentage indicator

## Certificate PDF Design

### Design Elements:
- Professional header with Synapze branding
- Certificate title (e.g., "Certificate of Completion")
- Student name (prominently displayed)
- Course/Path name
- Completion date
- Certificate ID (for verification)
- QR code linking to verification page
- Digital signature/seal
- Footer with verification URL

### PDF Generation:
- Use libraries like `pdfkit` or `puppeteer`
- Template-based design
- Consistent branding
- Print-friendly format

## Email Notifications

### Certificate Issued Email:
- Subject: "Congratulations! Your Certificate is Ready"
- Includes:
  - Certificate preview
  - Download link
  - Verification link
  - Congratulations message
  - Next steps (share on LinkedIn, etc.)

## API Endpoints

### GET `/api/certificates`
- Get user's certificates (authenticated)
- Returns list of certificates with metadata

### GET `/api/certificates/[certificateId]`
- Get specific certificate details
- Includes PDF download URL

### GET `/api/certificates/[certificateId]/verify`
- Public verification endpoint
- Returns certificate validity and details

### POST `/api/certificates/generate`
- Admin-only endpoint
- Manually generate certificate (for edge cases)

## Integration Points

### 1. Progress Tracking
- Monitor lesson completion
- Trigger certificate generation when threshold met
- Update certificate status

### 2. Learning Paths
- Track course completion within paths
- Generate path certificate when all courses complete
- Maintain completion order (if sequential)

### 3. User Profile
- Display certificates section
- Show certificate achievements
- Certificate download functionality

### 4. Activity Log
- Log certificate issuance events
- Track certificate views/downloads

## Security Considerations

1. **Certificate ID Uniqueness**
   - Use cryptographically secure random generation
   - Prevent ID guessing/brute force

2. **PDF Integrity**
   - Store PDFs securely (Cloudinary)
   - Prevent tampering
   - Use signed URLs for access

3. **Verification Security**
   - Rate limit verification endpoint
   - Prevent certificate ID enumeration
   - Validate certificate authenticity

4. **Privacy**
   - Only show certificate owner's name
   - Public verification shows minimal info
   - User controls certificate visibility

## Future Enhancements

1. **Certificate Badges**
   - Digital badges (Open Badges standard)
   - Shareable on social media
   - LinkedIn integration

2. **Certificate Expiration**
   - Optional expiration dates
   - Renewal process
   - Continuing education credits

3. **Certificate Levels**
   - Bronze/Silver/Gold tiers
   - Based on performance/score
   - Special achievements

4. **Instructor Signatures**
   - Digital signatures from instructors
   - Multiple signature support
   - Signature verification

5. **Certificate Marketplace**
   - Showcase certificates
   - Certificate verification widget
   - Embed certificates in websites

## Implementation Priority

### Phase 1: Basic Certification (MVP)
1. Database schema for certificates
2. Certificate generation on course completion
3. Basic PDF generation
4. Certificate display in profile
5. Public verification endpoint

### Phase 2: Enhanced Features
1. Learning path certificates
2. Email notifications
3. Certificate sharing
4. Improved PDF design

### Phase 3: Advanced Features
1. Certificate badges
2. Social media integration
3. Certificate marketplace
4. Analytics and insights
