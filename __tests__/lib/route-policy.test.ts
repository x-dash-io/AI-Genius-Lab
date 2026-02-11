import {
  isAdminRoute,
  isCustomerOnlyRoute,
  pathMatchesPrefix,
  requiresAuthRoute,
  DEFAULT_REDIRECTS,
} from "@/lib/route-policy";

describe("route-policy", () => {
  it("matches prefix helper correctly", () => {
    expect(pathMatchesPrefix("/dashboard", ["/dashboard"])).toBe(true);
    expect(pathMatchesPrefix("/dashboard/overview", ["/dashboard"])).toBe(true);
    expect(pathMatchesPrefix("/courses", ["/dashboard"])).toBe(false);
  });

  it("classifies admin routes", () => {
    expect(isAdminRoute("/admin")).toBe(true);
    expect(isAdminRoute("/admin/users")).toBe(true);
    expect(isAdminRoute("/dashboard")).toBe(false);
  });

  it("classifies auth required routes", () => {
    expect(requiresAuthRoute("/dashboard")).toBe(true);
    expect(requiresAuthRoute("/library/course-1")).toBe(true);
    expect(requiresAuthRoute("/profile/subscription")).toBe(true);
    expect(requiresAuthRoute("/activity")).toBe(true);
    expect(requiresAuthRoute("/courses")).toBe(false);
  });

  it("classifies customer-only routes", () => {
    expect(isCustomerOnlyRoute("/dashboard")).toBe(true);
    expect(isCustomerOnlyRoute("/library/abc")).toBe(true);
    expect(isCustomerOnlyRoute("/admin")).toBe(false);
  });

  it("exposes stable default redirect targets", () => {
    expect(DEFAULT_REDIRECTS.signIn).toBe("/sign-in");
    expect(DEFAULT_REDIRECTS.adminHome).toBe("/admin");
    expect(DEFAULT_REDIRECTS.customerHome).toBe("/dashboard");
  });
});
