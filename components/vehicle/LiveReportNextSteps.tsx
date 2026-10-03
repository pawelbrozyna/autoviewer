"use client";

import Link from "next/link";
import { ArrowLeftRight, Search } from "lucide-react";
import { useDvlaLookup } from "@/components/vehicle/DvlaLookupContext";
import { reportActionButtonClass } from "@/components/vehicle/ExampleReportActions";
import { registrationToSlug } from "@/lib/vehicle/registration";
import type { VehicleRecord } from "@/types/vehicle";

export function LiveReportNextSteps({ vehicle }: { vehicle: VehicleRecord }) {
  const lookup = useDvlaLookup();
  const compareHref = `/compare-cars?left=${registrationToSlug(vehicle.summary.registration)}`;

  function checkAnother() {
    lookup?.setVehicle(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>("main input")?.focus({
        preventScroll: true,
      });
    }, 300);
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-center md:mt-5">
      {lookup ? (
        <button
          type="button"
          className={reportActionButtonClass}
          onClick={checkAnother}
        >
          <Search className="h-4 w-4" aria-hidden />
          Check another vehicle
        </button>
      ) : (
        <Link href="/check-a-vehicle" className={reportActionButtonClass}>
          <Search className="h-4 w-4" aria-hidden />
          Check another vehicle
        </Link>
      )}
      <Link href={compareHref} className={reportActionButtonClass}>
        <ArrowLeftRight className="h-4 w-4" aria-hidden />
        Compare this car
      </Link>
    </div>
  );
}
