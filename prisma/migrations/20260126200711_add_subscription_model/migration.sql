/*
  Warnings:

  - A unique constraint covering the columns `[subscriptionId]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('purchased', 'subscription');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('monthly', 'annual');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'cancelled', 'expired', 'paused', 'trial');

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "accessType" "AccessType" NOT NULL DEFAULT 'purchased',
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "subscriptionId" TEXT;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planType" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "lastBillingAt" TIMESTAMP(3),
    "nextBillingAt" TIMESTAMP(3),
    "provider" "PaymentProvider" NOT NULL,
    "providerRef" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_status_key" ON "Subscription"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_subscriptionId_key" ON "Enrollment"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
