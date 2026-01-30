
import { createSubscriptionAction } from "@/app/(public)/checkout/subscription/page";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revisePayPalSubscription } from "@/lib/paypal";

jest.mock("next-auth");
jest.mock("@/lib/paypal");
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("createSubscriptionAction", () => {
  const mockGetServerSession = getServerSession as jest.Mock;
  const mockRevisePayPalSubscription = revisePayPalSubscription as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not call revisePayPalSubscription for a cancelled subscription", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "test-user-id" },
    });

    const formData = new FormData();
    formData.set("planId", "test-plan-id");
    formData.set("interval", "monthly");

    (prisma.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue({
      id: "test-plan-id",
      paypalMonthlyPlanId: "paypal-plan-id",
    });

    (prisma.subscription.findFirst as jest.Mock).mockResolvedValue({
      id: "test-sub-id",
      userId: "test-user-id",
      status: "cancelled",
      currentPeriodEnd: new Date(Date.now() + 86400000), // In the future
      paypalSubscriptionId: "paypal-sub-id",
    });

    await createSubscriptionAction(formData);

    expect(mockRevisePayPalSubscription).not.toHaveBeenCalled();
  });
});
