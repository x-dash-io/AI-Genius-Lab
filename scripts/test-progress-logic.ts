/**
 * Test script to verify the progress logic fix
 * This demonstrates the difference between !== null and != null
 */

console.log("🧪 Testing Progress Logic Fix\n");

// Simulate progress records
const progressWithCompletion = { completedAt: new Date() };
const progressWithoutCompletion = { completedAt: null };
const noProgress = undefined;

console.log("Test Case 1: Progress with completion date");
console.log(`  progressWithCompletion?.completedAt !== null: ${progressWithCompletion?.completedAt !== null}`);
console.log(`  progressWithCompletion?.completedAt != null: ${progressWithCompletion?.completedAt != null}`);
console.log(`  ✓ Both should be true\n`);

console.log("Test Case 2: Progress without completion (null)");
console.log(`  progressWithoutCompletion?.completedAt !== null: ${progressWithoutCompletion?.completedAt !== null}`);
console.log(`  progressWithoutCompletion?.completedAt != null: ${progressWithoutCompletion?.completedAt != null}`);
console.log(`  ✓ Both should be false\n`);

console.log("Test Case 3: No progress record (undefined) - THE BUG");
console.log(`  noProgress?.completedAt !== null: ${noProgress?.completedAt !== null}`);
console.log(`  noProgress?.completedAt != null: ${noProgress?.completedAt != null}`);
console.log(`  ✗ !== null returns true (BUG - shows as completed)`);
console.log(`  ✓ != null returns false (FIXED - shows as not started)\n`);

// Demonstrate the fix
console.log("📊 Summary:");
console.log("  Using !== null with optional chaining:");
console.log(`    - Completed: ${progressWithCompletion?.completedAt !== null ? "✓" : "✗"}`);
console.log(`    - Not completed: ${progressWithoutCompletion?.completedAt !== null ? "✗" : "✓"}`);
console.log(`    - No record: ${noProgress?.completedAt !== null ? "✗ BUG!" : "✓"}`);
console.log("");
console.log("  Using != null with optional chaining (FIXED):");
console.log(`    - Completed: ${progressWithCompletion?.completedAt != null ? "✓" : "✗"}`);
console.log(`    - Not completed: ${progressWithoutCompletion?.completedAt != null ? "✗" : "✓"}`);
console.log(`    - No record: ${noProgress?.completedAt != null ? "✗" : "✓"}`);
console.log("");

console.log("✅ Fix verified: Using != null correctly handles undefined values\n");
