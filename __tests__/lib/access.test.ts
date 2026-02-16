import { getCourseAccessState, hasCourseAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { getUserSubscription, isSubscriptionActiveNow } from "@/lib/subscriptions";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    purchase: {
      findFirst: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
  },
  withRetry: async <T>(operation: () => Promise<T>) => operation(),
}));

jest.mock("@/lib/subscriptions", () => ({
  getUserSubscription: jest.fn(),
  isSubscriptionActiveNow: jest.fn(),
  SUBSCRIPTION_TIERS: ["starter", "professional", "founder"],
}));

describe("access model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("grants lifetime access via paid purchase", async () => {
    (prisma.purchase.findFirst as jest.Mock).mockResolvedValue({ id: "purchase_1" });
    (prisma.course.findUnique as jest.Mock).mockResolvedValue({ tier: "PREMIUM" });
    (getUserSubscription as jest.Mock).mockResolvedValue(null);
    (isSubscriptionActiveNow as jest.Mock).mockReturnValue(false);

    const access = await getCourseAccessState("user_1", "customer", "course_1");

    expect(access.granted).toBe(true);
    expect(access.source).toBe("purchase");
    expect(access.owned).toBe(true);
  });

  it("grants access via active professional/founder subscription when not purchased", async () => {
    (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.course.findUnique as jest.Mock).mockResolvedValue({ tier: "PREMIUM" });
    (getUserSubscription as jest.Mock).mockResolvedValue({
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 60_000),
      plan: { tier: "professional" },
    });
    (isSubscriptionActiveNow as jest.Mock).mockReturnValue(true);

    const access = await getCourseAccessState("user_1", "customer", "course_1");

    expect(access.granted).toBe(true);
    expect(access.source).toBe("subscription");
    expect(access.owned).toBe(false);
  });

  it("denies premium access for starter subscription without purchase", async () => {
    (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.course.findUnique as jest.Mock).mockResolvedValue({ tier: "PREMIUM" });
    (getUserSubscription as jest.Mock).mockResolvedValue({
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 60_000),
      plan: { tier: "starter" },
    });
    (isSubscriptionActiveNow as jest.Mock).mockReturnValue(true);

    const access = await getCourseAccessState("user_1", "customer", "course_1");

    expect(access.granted).toBe(false);
    expect(access.source).toBe("none");
  });

  it("denies subscription access when subscription is not active", async () => {
    (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.course.findUnique as jest.Mock).mockResolvedValue({ tier: "STANDARD" });
    (getUserSubscription as jest.Mock).mockResolvedValue({
      status: "cancelled",
      currentPeriodEnd: new Date(Date.now() + 60_000),
      plan: { tier: "founder" },
    });
    (isSubscriptionActiveNow as jest.Mock).mockReturnValue(false);

    const hasAccess = await hasCourseAccess("user_1", "customer", "course_1");
    expect(hasAccess).toBe(false);
  });

  it("always grants admin access", async () => {
    const access = await getCourseAccessState("admin_1", "admin", "course_1");
    expect(access.granted).toBe(true);
    expect(access.source).toBe("admin");
  });
});
