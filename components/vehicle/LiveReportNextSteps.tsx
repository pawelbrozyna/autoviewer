"use client";

import Link from "next/link";
import { ArrowLeftRight, ChevronRight, Search } from "lucide-react";
import { useDvlaLookup } from "@/components/vehicle/DvlaLookupContext";
import { reportActionButtonClass } from "@/components/vehicle/ExampleReportActions";
import { registrationToSlug } from "@/lib/vehicle/registration";
import type { VehicleRecord } from "@/types/vehicle";

const compareLinkClass = `${reportActionButtonClass} max-md:mx-auto max-md:mt-1 max-md:min-h-10 max-md:gap-1.5 max-md:border-transparent max-md:bg-transparent max-md:text-blue max-md:hover:border-transparent max-md:hover:bg-transparent max-md:hover:underline`;

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
    <div className="mt-5 grid grid-cols-1 gap-2 md:flex md:flex-wrap md:justify-center">
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
      <Link href={compareHref} className={compareLinkClass}>
        <ArrowLeftRight className="h-4 w-4" aria-hidden />
        Compare this car
        <ChevronRight className="h-4 w-4 md:hidden" aria-hidden />
      </Link>
    </div>
  );
}
