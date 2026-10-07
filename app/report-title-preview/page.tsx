import type { Metadata } from "next";
import { FreeReportHtml } from "@/components/reports/FreeReportHtml";
import { getMockVehicle } from "@/lib/api/mock";
import { resolveImageFieldsForVehicle } from "@/lib/vehicle/images";
import { modelTitleFields } from "@/lib/vehicle/model-title";
import { formatRegistrationDisplay } from "@/lib/vehicle/registration";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { VehicleRecord } from "@/types/vehicle";

export const metadata: Metadata = buildPageMetadata({
  title: "Report Title Preview",
  description: "Internal layout preview of the vehicle report heading.",
  path: "/report-title-preview",
  noIndex: true,
});

type DemoTitle = {
  registration: string;
  make: string;
  rawModel: string;
  year: number;
  firstRegistered: string;
  fuelType: string;
  transmission: string;
  colour: string;
  engineCapacity: number;
};

const DEMOS: DemoTitle[] = [
  {
    registration: "AV26SCL",
    make: "Mercedes-Benz",
    rawModel: "S 450 L AMG L N Prem + Exec E A",
    year: 2026,
    firstRegistered: "2026-03",
    fuelType: "Petrol",
    transmission: "Automatic",
    colour: "Black",
    engineCapacity: 2999,
  },
  {
    registration: "AV22CMB",
    make: "Vauxhall",
    rawModel: "Combo 2300 Dynamic TD",
    year: 2022,
    firstRegistered: "2022-06",
    fuelType: "Diesel",
    transmission: "Manual",
    colour: "White",
    engineCapacity: 1499,
  },
];

function demoVehicle(demo: DemoTitle): VehicleRecord {
  const base = getMockVehicle("AV23GLC")!;
  const image = resolveImageFieldsForVehicle({
    make: demo.make,
    model: demo.rawModel,
    year: demo.year,
    firstRegistrationDate: demo.firstRegistered,
  });
  return {
    ...base,
    summary: {
      ...base.summary,
      registration: demo.registration,
      displayRegistration: formatRegistrationDisplay(demo.registration),
      make: demo.make,
      model: demo.rawModel,
      year: demo.year,
      fuelType: demo.fuelType,
      transmission: demo.transmission,
      colour: demo.colour,
      engineCapacity: demo.engineCapacity,
      imageSrc: image.imageSrc,
      imageIsRepresentative: image.imageIsRepresentative,
      ...modelTitleFields(demo.make, demo.rawModel),
    },
    details: {
      ...base.details,
      registration: demo.registration,
      make: demo.make,
      model: demo.rawModel,
      colour: demo.colour,
      fuelType: demo.fuelType,
      transmission: demo.transmission,
      engineCapacity: demo.engineCapacity,
      yearOfManufacture: demo.year,
      monthOfFirstRegistration: demo.firstRegistered,
    },
  };
}

export default function ReportTitlePreviewPage() {
  return (
    <main className="mx-auto flex max-w-[860px] flex-col gap-10 px-4 py-8">
      {DEMOS.map((demo) => (
        <section key={demo.registration} aria-label={`${demo.make} report preview`}>
          <FreeReportHtml vehicle={demoVehicle(demo)} />
        </section>
      ))}
    </main>
  );
}
