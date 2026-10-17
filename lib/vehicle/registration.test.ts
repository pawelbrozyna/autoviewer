/**
 * UK registration display formatting.
 * Run: npx tsx lib/vehicle/registration.test.ts
 */
import assert from "node:assert/strict";
import {
  formatRegistrationDisplay,
  normalizeRegistration,
} from "@/lib/vehicle/registration";

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    throw error;
  }
}

run("current-style plates keep a space before the final three letters", () => {
  assert.equal(formatRegistrationDisplay("AB12CDE"), "AB12 CDE");
  assert.equal(formatRegistrationDisplay("ab12 cde"), "AB12 CDE");
});

run("prefix and suffix plates keep their usual spaces", () => {
  assert.equal(formatRegistrationDisplay("A123BCD"), "A123 BCD");
  assert.equal(formatRegistrationDisplay("ABC123A"), "ABC 123A");
});

run("dateless number-then-letter plates put a space after the numbers", () => {
  assert.equal(formatRegistrationDisplay("934HRR"), "934 HRR");
  assert.equal(formatRegistrationDisplay("934 HRR"), "934 HRR");
  assert.equal(formatRegistrationDisplay("1234AB"), "1234 AB");
  assert.equal(formatRegistrationDisplay("1ABC"), "1 ABC");
});

run("dateless letter-then-number plates put a space before the numbers", () => {
  assert.equal(formatRegistrationDisplay("ABC123"), "ABC 123");
  assert.equal(formatRegistrationDisplay("AB1234"), "AB 1234");
});

run("normalize still strips spaces for lookups", () => {
  assert.equal(normalizeRegistration("934 HRR"), "934HRR");
  assert.equal(normalizeRegistration("ab12 cde"), "AB12CDE");
});

console.log("All registration formatting tests passed.");
