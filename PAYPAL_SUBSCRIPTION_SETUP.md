# PayPal Subscription Integration Setup

## Overview
This guide explains how to set up PayPal subscriptions for the AI Genius Lab platform. The integration allows customers to subscribe to monthly or annual plans using PayPal's recurring payment system.

## Prerequisites
- PayPal Business account
- PayPal Developer credentials (Client ID and Client Secret)
- Webhook endpoint configured in PayPal Developer Dashboard

## Environment Variables
Add these to your `.env` file:
```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENV=sandbox  # or "live" for production
PAYPAL_WEBHOOK_ID=your_webhook_id_from_paypal
```

## PayPal Developer Setup

### 1. Create PayPal App
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a new app
3. Select "Business" account type
4. Copy Client ID and Client Secret to your environment variables

### 2. Configure Webhooks
1. In PayPal Developer Dashboard, go to "Webhooks"
2. Add a new webhook with URL: `https://yourdomain.com/api/webhooks/paypal/subscription`
3. Subscribe to these events:
   - BILLING.SUBSCRIPTION.ACTIVATED
   - BILLING.SUBSCRIPTION.CANCELLED
   - BILLING.SUBSCRIPTION.SUSPENDED
   - BILLING.SUBSCRIPTION.EXPIRED
   - PAYMENT.SALE.COMPLETED
4. Copy the Webhook ID to your environment variables

## How It Works

### Subscription Creation Flow
1. User clicks "Subscribe" on the pricing page
2. Frontend sends request to `/api/subscription/subscribe`
3. Backend creates subscription record in database
4. Backend calls PayPal to create subscription
5. PayPal returns approval URL
6. User is redirected to PayPal for approval
7. After approval, PayPal redirects to `/api/subscription/paypal/success`
8. Backend activates subscription and enrolls user in all courses

### Webhook Processing
PayPal sends webhook events to keep the subscription status synchronized:
- **ACTIVATED**: Sets subscription to active
- **CANCELLED**: Marks as cancelled (keeps access until end date)
- **SUSPENDED**: Pauses subscription (payment failure)
- **EXPIRED**: Marks as expired (removes all access)
- **PAYMENT COMPLETED**: Updates next billing date

## API Endpoints

### Create Subscription
```
POST /api/subscription/subscribe
Body: { planType: "monthly" | "annual" }
Response: { success: true, approvalUrl: "https://paypal.com/..." }
```

### PayPal Success Callback
```
GET /api/subscription/paypal/success?subscription_id=...
Redirects to: /subscription?success=true
```

### Cancel Subscription
```
POST /api/subscription/cancel
Body: { subscriptionId: "..." }
Response: { success: true, endDate: "..." }
```

## Testing in Sandbox Mode

### Test Accounts
1. In PayPal Developer Dashboard, create test accounts
2. Use buyer account for testing subscriptions
3. Use seller account to view transactions

### Test Scenarios
1. **Successful Subscription**: Complete the full flow
2. **Payment Failure**: Use insufficient funds test scenario
3. **Cancellation**: Test immediate and end-of-period cancellation
4. **Webhook Events**: Use PayPal webhook simulator

## Production Deployment

### Switch to Live Mode
1. Change `PAYPAL_ENV=live` in environment variables
2. Use live PayPal API credentials
3. Update webhook URL to production domain
4. Test with real PayPal account (small amounts)

### Security Considerations
- Always verify webhook signatures
- Use HTTPS for all endpoints
- Store PayPal credentials securely
- Log all webhook events for debugging

## Troubleshooting

### Common Issues
1. **"Invalid subscription ID"**: Check if providerRef is saved correctly
2. **Webhook not received**: Verify webhook URL and SSL certificate
3. **Payment failures**: Check PayPal account balance and funding sources
4. **Access not granted**: Ensure webhook processing completed successfully

### Debug Mode
Add these logs to track issues:
```typescript
console.log("PayPal subscription ID:", subscriptionId);
console.log("Webhook event type:", eventType);
console.log("Subscription status update:", status);
```

## Monitoring

### Key Metrics to Track
- Subscription conversion rate
- Payment failure rate
- Churn rate
- Webhook processing success rate

### Alerts
Set up alerts for:
- High webhook failure rate
- Payment processing errors
- Subscription status mismatches

## Support Resources
- [PayPal Subscriptions API Documentation](https://developer.paypal.com/docs/api/subscriptions/)
- [PayPal Webhooks Guide](https://developer.paypal.com/docs/api/webhooks/v1/)
- [PayPal Sandbox Testing](https://developer.paypal.com/tools/sandbox/)

## Notes
- PayPal charges 2.9% + $0.30 per transaction for US accounts
- Subscriptions can be cancelled anytime but remain active until the end of billing period
- PayPal handles all currency conversions automatically
- Test thoroughly in sandbox before going live
