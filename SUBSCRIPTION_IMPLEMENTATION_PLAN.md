# Subscription Implementation Plan

## Overview
This document outlines the implementation of a premium subscription model for the AI Genius Lab platform. The subscription will be positioned as a premium feature that provides access to all courses while maintaining individual course purchases as an alternative.

## Business Model

### Subscription Tiers
- **Monthly Plan**: $29.99/month - Access to all courses
- **Annual Plan**: $299.99/year (~$25/month) - Access to all courses + 2 months free
- **Individual Courses**: One-time purchase with lifetime access (existing model)

### Premium Features for Subscribers
- Access to ALL courses in the platform
- Priority support
- Exclusive content and workshops
- Certificate issuance upon completion
- Early access to new courses

## Technical Architecture

### Database Schema Changes

#### New Models
```prisma
model Subscription {
  id           String             @id
  userId       String
  planType     SubscriptionPlan
  status       SubscriptionStatus
  startDate    DateTime
  endDate      DateTime?
  lastBillingAt DateTime?
  nextBillingAt DateTime?
  provider     PaymentProvider
  providerRef  String?
  cancelledAt  DateTime?
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
  User         User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  Enrollment   Enrollment[]
  Payment      Payment[]

  @@unique([userId, status]) // Only one active subscription per user
}

enum SubscriptionPlan {
  monthly
  annual
}

enum SubscriptionStatus {
  active
  cancelled
  expired
  paused
  trial
}
```

#### Modified Models
```prisma
model Enrollment {
  id             String       @id
  userId         String
  courseId       String
  purchaseId     String?      @unique
  subscriptionId String?      @unique
  accessType     AccessType   @default(purchased)
  grantedAt      DateTime     @default(now())
  expiresAt      DateTime?    // For subscription access
  Course         Course       @relation(fields: [courseId], references: [id], onDelete: Cascade)
  Purchase       Purchase?    @relation(fields: [purchaseId], references: [id])
  Subscription   Subscription? @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  User           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId])
}

enum AccessType {
  purchased    // One-time purchase
  subscription // Via subscription
}
```

### API Endpoints

#### Subscription Management
- `GET /api/subscription` - Get current subscription status
- `POST /api/subscription/subscribe` - Create new subscription
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/reactivate` - Reactivate cancelled subscription
- `GET /api/subscription/plans` - Get available subscription plans

#### Payment Integration
- `POST /api/payments/subscribe` - Initiate subscription payment
- `POST /api/webhooks/stripe` - Handle Stripe webhooks
- `POST /api/webhooks/paypal` - Handle PayPal subscription webhooks

### Access Control Logic

#### Course Access Check
```typescript
async function hasCourseAccess(userId: string, courseId: string) {
  // Check purchased access (lifetime)
  const purchasedAccess = await prisma.enrollment.findFirst({
    where: {
      userId,
      courseId,
      accessType: 'purchased'
    }
  });
  
  if (purchasedAccess) return { hasAccess: true, type: 'purchased' };
  
  // Check subscription access
  const subscriptionAccess = await prisma.enrollment.findFirst({
    where: {
      userId,
      courseId,
      accessType: 'subscription',
      Subscription: {
        status: 'active',
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      }
    }
  });
  
  if (subscriptionAccess) {
    return { 
      hasAccess: true, 
      type: 'subscription',
      expiresAt: subscriptionAccess.expiresAt 
    };
  }
  
  return { hasAccess: false };
}
```

### UI Components

#### Subscription Cards
- Pricing cards on homepage
- Subscription comparison table
- Upgrade prompts on course pages
- Subscription status in user dashboard

#### Checkout Flow
- New subscription checkout page
- Plan selection interface
- Payment method setup
- Success confirmation with premium features highlighted

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
1. Update Prisma schema
2. Create database migration
3. Implement subscription library functions
4. Add access control logic

### Phase 2: API & Payment Integration (Week 2)
1. Create subscription API endpoints
2. Integrate with Stripe/PayPal for recurring payments
3. Implement webhook handlers
4. Add subscription middleware

### Phase 3: UI Implementation (Week 3)
1. Create subscription components
2. Build pricing page
3. Update checkout flow
4. Add subscription status indicators

### Phase 4: Admin & Analytics (Week 4)
1. Update admin dashboard
2. Add subscription analytics
3. Create subscription management tools
4. Implement customer support features

## Key Features to Implement

### Subscription Management
- Automatic billing and renewal
- Grace period for failed payments
- Easy cancellation and reactivation
- Proration for plan changes
- Trial period support (future)

### Premium Experience
- "Premium" badges on subscribed courses
- Exclusive content sections
- Priority support queue
- Advanced analytics dashboard
- Early access notifications

### Fair Usage Policies
- Prevent abuse of subscription cancellation
- Rate limiting for course access
- Device limits (optional)
- Progress retention after cancellation

## Migration Strategy

Since the platform has no users yet:
1. Deploy schema changes directly
2. No need for migration scripts for existing data
3. Launch with both models available from day one
4. Monitor adoption and adjust pricing as needed

## Success Metrics

### Subscription Metrics
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Customer Lifetime Value (CLV)
- Churn Rate
- Conversion Rate from free to paid

### Platform Metrics
- Course engagement per user
- Time spent on platform
- Certificate completion rate
- Support ticket volume

## Future Enhancements

### Short Term (3-6 months)
- Team/Enterprise subscriptions
- Gift subscriptions
- Student discounts
- Regional pricing

### Long Term (6-12 months)
- Course bundles
- Tiered content access
- Instructor revenue sharing
- API access for premium users

## Security Considerations

1. **Payment Security**: PCI compliance for card handling
2. **Access Control**: Regular validation of subscription status
3. **Rate Limiting**: Prevent subscription abuse
4. **Data Privacy**: GDPR compliance for subscription data
5. **Audit Logs**: Track all subscription changes

## Testing Strategy

1. **Unit Tests**: All subscription logic functions
2. **Integration Tests**: API endpoints and webhooks
3. **E2E Tests**: Complete subscription flow
4. **Load Testing**: Billing cycle processing
5. **Security Tests**: Access control bypass attempts

## Rollout Plan

1. **Internal Testing**: 1 week with test cards
2. **Beta Launch**: Invite-only with discount
3. **Public Launch**: Full availability
4. **Marketing Push**: Highlight premium features

## Support Documentation

1. **FAQ**: Subscription vs purchase comparison
2. **Help Center**: Managing subscriptions
3. **Video Tutorials**: Premium features walkthrough
4. **Email Templates**: Billing notifications

## Conclusion

This subscription model provides a premium tier that complements individual course sales without devaluing existing purchases. The implementation is designed to be scalable, secure, and user-friendly, with clear separation between purchased and subscription-based access.
