# Learning Pathways & Certification System

## Overview

Synapze provides structured learning pathways that guide users through comprehensive skill development, culminating in verifiable certificates of completion.

## Learning Pathway Structure

### Pathway Components

1. **Learning Paths**
   - Curated sequences of courses
   - Organized by skill level (beginner → intermediate → advanced)
   - Thematic grouping (e.g., "AI for Business", "Content Creation Mastery")
   - Sequential or flexible completion options

2. **Courses**
   - Individual courses within a path
   - Can belong to multiple paths
   - Self-contained learning units
   - Prerequisites can be enforced

3. **Sections**
   - Organized groupings within a course
   - Logical progression of topics
   - Can be reordered by admins

4. **Lessons**
   - Individual learning units
   - Multiple content types (video, audio, PDF, links)
   - Progress tracking per lesson
   - Completion requirements

## Pathway Types

### 1. Sequential Pathways (Recommended Order)
- Courses must be completed in order
- Each course unlocks the next
- Ensures foundational knowledge before advanced topics
- Best for: Technical skills, programming, structured curricula

**Example:**
```
AI Foundations → Machine Learning Basics → Advanced ML → ML Production
```

### 2. Flexible Pathways (Choose Your Order)
- Courses can be completed in any order
- User chooses their learning journey
- Best for: Business skills, creative topics, exploratory learning

**Example:**
```
Content Creation Path:
├── Video Editing (any order)
├── Script Writing (any order)
├── SEO Basics (any order)
└── Social Media Strategy (any order)
```

### 3. Tiered Pathways (Level-Based)
- Beginner → Intermediate → Advanced tiers
- Must complete tier before moving to next
- Best for: Comprehensive skill mastery

**Example:**
```
Tier 1: Fundamentals (3 courses)
  ↓ Complete all
Tier 2: Intermediate (4 courses)
  ↓ Complete all
Tier 3: Advanced (3 courses)
  ↓ Complete all
Certificate of Mastery
```

## Certification Pathways

### Course Completion Certificate

**Pathway:**
```
1. User purchases course
   ↓
2. User accesses course content
   ↓
3. User completes lessons sequentially
   ↓
4. System tracks progress (completionPercent, completedAt)
   ↓
5. When final lesson is completed:
   - Check: All lessons completed? ✓
   - Check: Course purchased? ✓
   - Generate certificate automatically
   ↓
6. Certificate includes:
   - Course title
   - Student name
   - Completion date
   - Unique certificate ID
   - Verification URL
```

**Requirements:**
- ✅ Course purchase (status: "paid")
- ✅ 100% lesson completion
- ✅ All lessons marked as completed (completedAt !== null)

### Learning Path Completion Certificate

**Pathway:**
```
1. User enrolls in learning path
   - Purchases all courses in path (or path bundle)
   ↓
2. User completes courses in path
   - Can be sequential or flexible (based on path config)
   ↓
3. System tracks course completion within path
   ↓
4. When final course is completed:
   - Check: All courses in path completed? ✓
   - Check: All courses purchased? ✓
   - Generate path certificate automatically
   ↓
5. Certificate includes:
   - Learning path title
   - Student name
   - Completion date
   - List of completed courses
   - Total courses completed
   - Unique certificate ID
   - Verification URL
```

**Requirements:**
- ✅ All courses in path purchased
- ✅ 100% completion of all courses
- ✅ All lessons in all courses completed

## Progress Tracking System

### Lesson-Level Tracking
- `startedAt`: When user first accesses lesson
- `completedAt`: When lesson is marked complete
- `completionPercent`: Progress percentage (0-100)
- `lastPosition`: Last watched position (for videos)

### Course-Level Tracking
- Calculated from lesson progress
- `totalLessons`: Total lessons in course
- `completedLessons`: Number of completed lessons
- `completionPercent`: Percentage complete

### Path-Level Tracking
- Calculated from course completion
- `totalCourses`: Courses in path
- `completedCourses`: Number of completed courses
- `completionPercent`: Percentage complete

## Certificate Generation Flow

### Automatic Generation

**Trigger Points:**
1. **Lesson Completion** → Check course completion → Generate course certificate
2. **Course Completion** → Check path completion → Generate path certificate

**Process:**
```
Lesson Completed
  ↓
Update Progress (completedAt = now)
  ↓
Check: Is this the last lesson in course?
  ↓ YES
Check: Are all lessons completed?
  ↓ YES
Check: Is course purchased?
  ↓ YES
Generate Course Certificate
  ↓
Check: Is this course part of a learning path?
  ↓ YES
Check: Are all courses in path completed?
  ↓ YES
Generate Learning Path Certificate
```

### Manual Generation (Admin)

- Admins can manually generate certificates
- Useful for:
  - Legacy completions
  - Special circumstances
  - Testing purposes

## Certificate Verification

### Public Verification System

**URL Format:** `/certificates/[certificateId]/verify`

**Features:**
- ✅ Public access (no login required)
- ✅ Verifies certificate authenticity
- ✅ Shows certificate details
- ✅ Prevents forgery
- ✅ Shareable verification link

**Verification Response:**
```json
{
  "valid": true,
  "certificate": {
    "type": "course",
    "studentName": "John Doe",
    "courseName": "AI Foundations",
    "issuedAt": "2024-01-15T10:30:00Z",
    "certificateId": "CERT-1704067200-a3f9k2"
  }
}
```

## Integration Points

### 1. Progress API (`/api/progress`)
- Updates lesson progress
- Triggers completion checks
- Automatically generates certificates

### 2. Certificate API (`/api/certificates`)
- List user certificates
- Get certificate details
- Download certificate PDF

### 3. Verification API (`/api/certificates/[id]/verify`)
- Public verification endpoint
- Certificate authenticity check

### 4. User Profile
- Display certificates section
- Show achievements
- Certificate download links

### 5. Course/Learning Path Pages
- Show completion status
- Display certificate badge
- Link to certificate

## Certificate Features

### 1. Unique Certificate IDs
- Format: `CERT-{timestamp}-{random}`
- Example: `CERT-1704067200-a3f9k2`
- Cryptographically secure
- Non-guessable

### 2. PDF Generation
- Professional design
- Branded with Synapze logo
- Includes QR code for verification
- Print-friendly format

### 3. Email Notifications
- Certificate issued email
- Download link
- Verification link
- Congratulations message

### 4. Social Sharing
- Shareable verification links
- LinkedIn integration (future)
- Digital badges (future)

## Pathway Examples

### Example 1: AI Business Mastery Path

```
Path: "AI Business Mastery"
├── Course 1: AI Fundamentals (5 lessons)
│   ├── What is AI?
│   ├── AI Applications
│   ├── AI Ethics
│   ├── Getting Started
│   └── Quiz
├── Course 2: AI for Marketing (8 lessons)
│   ├── AI in Content Creation
│   ├── AI-Powered SEO
│   ├── Chatbots & Customer Service
│   └── ... (5 more lessons)
├── Course 3: AI Automation (6 lessons)
│   └── ... (automation topics)
└── Course 4: AI Strategy (4 lessons)
    └── ... (strategy topics)

Total: 23 lessons across 4 courses
Certificate: "AI Business Mastery Certificate"
```

### Example 2: Content Creator Path

```
Path: "Content Creator Mastery"
├── Course 1: Video Production Basics
├── Course 2: Script Writing Mastery
├── Course 3: SEO for Content
└── Course 4: Social Media Strategy

Completion: Flexible order
Certificate: "Content Creator Mastery Certificate"
```

## Future Enhancements

### 1. Prerequisites System
- Course A must be completed before Course B
- Enforced sequential learning
- Prerequisite validation

### 2. Certificate Levels
- Bronze: 50% completion
- Silver: 75% completion
- Gold: 100% completion

### 3. Specialized Certificates
- Industry-specific certificates
- Skill badges
- Micro-certifications

### 4. Continuing Education
- Certificate renewal
- Updated content
- Expiration dates

### 5. Certificate Marketplace
- Showcase achievements
- Verification widgets
- Portfolio integration

## Testing Strategy

### Unit Tests
- ✅ Certificate ID generation
- ✅ Completion checking logic
- ✅ Progress calculation
- ✅ Verification logic

### Integration Tests
- ✅ Course completion flow
- ✅ Path completion flow
- ✅ Certificate generation
- ✅ Verification endpoint

### E2E Tests
- ✅ User completes course → Certificate generated
- ✅ User completes path → Path certificate generated
- ✅ Certificate verification works
- ✅ Certificate download works
