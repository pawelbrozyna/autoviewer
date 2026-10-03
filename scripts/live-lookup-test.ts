/**
 * Run the real report lookup (DVLA + DVSA + image matcher) for several registrations.
 *
 * Usage: npm run test:live-lookup -- AB12CDE CD34EFG ...
 * Reads API settings from .env.local and forces live mode. Prints report fields only, never credentials.
 */
import { lookupVehicle } from "@/lib/api/vehicle-service";

const REPORT_FIELDS = [
  ["make", (s: Summary) => s.make !== "Unknown" && s.make],
  ["model", (s: Summary) => s.model !== "Vehicle" && s.model],
  ["year", (s: Summary) => s.year],
  ["fuelType", (s: Summary) => s.fuelType],
  ["colour", (s: Summary) => s.colour],
  ["engineCapacity", (s: Summary) => s.engineCapacity],
  ["transmission", (s: Summary) => s.transmission],
  ["latestMileage", (s: Summary) => s.latestMileage],
  ["taxStatus", (s: Summary) => s.tax.status !== "Unknown" && s.tax.status],
  ["motStatus", (s: Summary) => s.motStatus.status !== "Unknown" && s.motStatus.status],
  ["image", (s: Summary) => s.imageSrc],
] as const;

type Summary = Extract<
  Awaited<ReturnType<typeof lookupVehicle>>,
  { ok: true }
>["data"]["summary"];

async function main() {
  process.env.USE_MOCK_DATA = "false";
  const registrations = process.argv.slice(2);
  if (registrations.length === 0) {
    console.error("Usage: npm run test:live-lookup -- <REG> [REG...]");
    process.exit(1);
  }

  for (const reg of registrations) {
    const started = Date.now();
    const result = await lookupVehicle(reg);
    const ms = Date.now() - started;
    if (!result.ok) {
      console.log(`\n${reg}: FAILED ${result.error.code} - ${result.error.message} (${ms} ms)`);
      continue;
    }

    const { summary: s, details: d, motTests, mileageHistory, buyerScore, dataQuality } =
      result.data;
    const missing = REPORT_FIELDS.filter(([, read]) => {
      const value = read(s);
      return value === null || value === undefined || value === false || value === "";
    }).map(([name]) => name);

    console.log(`\n${reg}: OK (${ms} ms) sources=${dataQuality.sources.join("+")}`);
    console.log({
      vehicle: `${s.year ?? "?"} ${s.make} ${s.model}`,
      fuel: s.fuelType,
      colour: s.colour,
      engineCc: s.engineCapacity,
      transmission: s.transmission,
      firstRegistered: d.monthOfFirstRegistration,
      tax: s.tax,
      mot: s.motStatus,
      latestMileage: s.latestMileage,
      motTests: motTests.length,
      mileagePoints: mileageHistory.length,
      recalls:
        s.recalls.dataAvailable === false
          ? "not available"
          : s.recalls.hasOpenRecalls
            ? s.recalls.count
            : 0,
      buyerScore: buyerScore ? `${buyerScore.score ?? "-"} ${buyerScore.label ?? ""}`.trim() : null,
      image: s.imageSrc ?? "none",
      imageConfidence: s.imageMatchConfidence,
      imageReason: s.imageMatchReason,
      imageFallback: s.imageFallbackUsed,
      imageAmbiguous: s.imageMatchAmbiguous,
      missing,
    });
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? `${err.name}: ${err.message}` : err);
  process.exit(1);
});
