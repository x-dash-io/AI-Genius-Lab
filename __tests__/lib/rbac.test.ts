import { hasRole } from "@/lib/rbac";

describe("RBAC utilities", () => {
  describe("hasRole", () => {
    it("should return true for matching roles", () => {
      expect(hasRole("admin", "admin")).toBe(true);
      expect(hasRole("customer", "customer")).toBe(true);
    });

    it("should return false when user role is lower than required", () => {
      // Customer cannot access admin resources
      expect(hasRole("customer", "admin")).toBe(false);
    });

    it("should return true when user role is higher than required", () => {
      // Admin can access customer resources (hierarchical system)
      expect(hasRole("admin", "customer")).toBe(true);
    });

    it("should handle admin access correctly", () => {
      // Admin should have access to admin resources
      expect(hasRole("admin", "admin")).toBe(true);
    });
  });
});
