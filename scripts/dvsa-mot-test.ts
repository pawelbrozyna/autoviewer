/**
 * Fetch MOT history for one registration from the live DVSA API.
 *
 * Usage: npm run test:dvsa -- AB12CDE
 * Reads DVSA_* variables from .env.local. Prints a summary only, never credentials.
 */
import { DvsaApiError, fetchMotHistory } from "@/lib/server/dvsa-client";

async function main() {
  const registration = process.argv[2];
  if (!registration) {
    console.error("Usage: npm run test:dvsa -- <REGISTRATION>");
    process.exit(1);
  }

  const started = Date.now();
  const vehicle = await fetchMotHistory(registration);
  const tests = vehicle.motTests ?? [];
  const latest = tests[0];

  console.log(`DVSA OK in ${Date.now() - started} ms`);
  console.log({
    registration: vehicle.registration,
    make: vehicle.make,
    model: vehicle.model,
    fuelType: vehicle.fuelType,
    primaryColour: vehicle.primaryColour,
    firstUsedDate: vehicle.firstUsedDate ?? vehicle.registrationDate,
    hasOutstandingRecall: vehicle.hasOutstandingRecall,
    motTestCount: tests.length,
    latestTest: latest
      ? {
          completedDate: latest.completedDate,
          testResult: latest.testResult,
          expiryDate: latest.expiryDate,
          odometer: `${latest.odometerValue ?? "-"} ${latest.odometerUnit ?? ""}`.trim(),
          defects: latest.defects?.length ?? 0,
        }
      : null,
  });

  const second = Date.now();
  await fetchMotHistory(registration);
  console.log(`Second call (cached token) in ${Date.now() - second} ms`);
}

main().catch((err) => {
  if (err instanceof DvsaApiError) {
    console.error(`DVSA ${err.code} (${err.status}): ${err.message}`);
    if (err.retryAfterSeconds != null) {
      console.error(`Retry after ${err.retryAfterSeconds}s`);
    }
  } else {
    console.error(err);
  }
  process.exit(1);
});
