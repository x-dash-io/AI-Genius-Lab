import {
  assertSubscriptionTransition,
  canTransitionSubscriptionStatus,
  getAllowedSubscriptionTransitions,
} from "@/lib/subscription-state";

describe("subscription-state", () => {
  it("allows valid transitions", () => {
    expect(canTransitionSubscriptionStatus("pending", "active")).toBe(true);
    expect(canTransitionSubscriptionStatus("active", "cancelled")).toBe(true);
    expect(canTransitionSubscriptionStatus("past_due", "expired")).toBe(true);
    expect(canTransitionSubscriptionStatus("expired", "active")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(canTransitionSubscriptionStatus("pending", "past_due")).toBe(false);
    expect(canTransitionSubscriptionStatus("active", "pending")).toBe(false);
    expect(canTransitionSubscriptionStatus("expired", "pending")).toBe(false);
  });

  it("treats no-op status update as valid", () => {
    expect(canTransitionSubscriptionStatus("active", "active")).toBe(true);
    expect(() => assertSubscriptionTransition("active", "active")).not.toThrow();
  });

  it("throws for invalid transition assertions", () => {
    expect(() => assertSubscriptionTransition("pending", "past_due")).toThrow(
      "INVALID_STATE_TRANSITION: pending -> past_due"
    );
  });

  it("exposes deterministic transition map", () => {
    expect(getAllowedSubscriptionTransitions("pending")).toEqual(
      expect.arrayContaining(["active", "expired", "cancelled"])
    );
  });
});
