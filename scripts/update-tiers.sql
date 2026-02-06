-- Update existing subscription tier values before enum migration
UPDATE "SubscriptionPlan" SET tier = 'professional' WHERE tier = 'pro';
UPDATE "SubscriptionPlan" SET tier = 'founder' WHERE tier = 'elite';
