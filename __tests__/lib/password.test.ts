import { hashPassword, verifyPassword } from "@/lib/password";

describe("Password utilities", () => {
  const testPassword = "TestPassword123!";

  it("should hash a password", async () => {
    const hash = await hashPassword(testPassword);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(testPassword);
    expect(hash.length).toBeGreaterThan(0);
  });

  it("should verify a correct password", async () => {
    const hash = await hashPassword(testPassword);
    const isValid = await verifyPassword(testPassword, hash);
    expect(isValid).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const hash = await hashPassword(testPassword);
    const isValid = await verifyPassword("WrongPassword", hash);
    expect(isValid).toBe(false);
  });

  it("should produce different hashes for the same password", async () => {
    const hash1 = await hashPassword(testPassword);
    const hash2 = await hashPassword(testPassword);
    expect(hash1).not.toBe(hash2); // bcrypt uses salt
  });
});
