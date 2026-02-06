-- Data Migration: Update Subscription Tier Values
-- This SQL script updates existing subscription plan records from old tier names
-- (pro, elite) to new tier names (professional, founder)

-- First, let's see what we have
SELECT id, name, tier FROM "SubscriptionPlan";

-- Update 'pro' to 'professional'
UPDATE "SubscriptionPlan" 
SET tier = 'professional'::text::"SubscriptionTier"
WHERE tier = 'pro'::text::"SubscriptionTier";

-- Update 'elite' to 'founder'
UPDATE "SubscriptionPlan" 
SET tier = 'founder'::text::"SubscriptionTier"
WHERE tier = 'elite'::text::"SubscriptionTier";

-- Verify the changes
SELECT id, name, tier FROM "SubscriptionPlan";
