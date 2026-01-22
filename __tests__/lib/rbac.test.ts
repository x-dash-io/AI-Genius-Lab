import { hasRole, type Role } from "@/lib/rbac";

describe("RBAC utilities", () => {
  describe("hasRole", () => {
    it("should return true for matching roles", () => {
      expect(hasRole("admin", "admin")).toBe(true);
      expect(hasRole("customer", "customer")).toBe(true);
    });

    it("should return false for non-matching roles", () => {
      expect(hasRole("customer", "admin")).toBe(false);
      expect(hasRole("admin", "customer")).toBe(false);
    });

    it("should handle admin access correctly", () => {
      // Admin should have access to admin resources
      expect(hasRole("admin", "admin")).toBe(true);
    });
  });
});
