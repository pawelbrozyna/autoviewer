import {
  Calendar,
  CalendarCheck,
  Car,
  Gauge,
  Globe2,
  Landmark,
  Leaf,
  Palette,
  Settings2,
  Users,
  Zap,
} from "lucide-react";
import { VehicleColour } from "@/components/vehicle/VehicleColour";
import type { VehicleRecord } from "@/types/vehicle";

export function MobileVehicleDetails({
  vehicle,
  showExtended = false,
  unavailableLabel = "-",
}: {
  vehicle: VehicleRecord;
  showExtended?: boolean;
  unavailableLabel?: string;
}) {
  const { summary, details } = vehicle;
  const fields = [
    {
      label: "Year",
      icon: Calendar,
      value:
        summary.year?.toString() ??
        details.yearOfManufacture?.toString() ??
        unavailableLabel,
    },
    {
      label: "Colour",
      icon: Palette,
      value: (
        <VehicleColour
          colour={details.colour}
          unavailableLabel={unavailableLabel}
        />
      ),
    },
    {
      label: "Engine",
      icon: Gauge,
      value:
        details.engineCapacity != null
          ? `${details.engineCapacity.toLocaleString("en-GB")} cc`
          : unavailableLabel,
    },
    {
      label: "Transmission",
      icon: Settings2,
      value: details.transmission ?? unavailableLabel,
    },
    { label: "Owners", icon: Users, value: unavailableLabel },
    {
      label: "Road tax",
      icon: Landmark,
      value:
        summary.annualRoadTaxGbp != null
          ? `£${summary.annualRoadTaxGbp.toLocaleString("en-GB")} / year`
          : unavailableLabel,
    },
    {
      label: "First registered",
      icon: CalendarCheck,
      value: details.monthOfFirstRegistration ?? unavailableLabel,
    },
    {
      label: "Euro status",
      icon: Globe2,
      value: details.euroStatus ?? unavailableLabel,
    },
    {
      label: "CO₂ emissions",
      icon: Leaf,
      value:
        details.co2Emissions != null
          ? `${details.co2Emissions} g/km`
          : unavailableLabel,
    },
    {
      label: "Power",
      icon: Zap,
      value:
        summary.powerBhp != null
          ? `${summary.powerBhp} bhp`
          : unavailableLabel,
    },
    ...(showExtended
      ? [
          {
            label: "Type approval",
            icon: Car,
            value: details.typeApproval ?? unavailableLabel,
          },
          {
            label: "Wheelplan",
            icon: Settings2,
            value: details.wheelplan ?? unavailableLabel,
          },
          {
            label: "Export status",
            icon: Globe2,
            value:
              details.markedForExport == null
                ? unavailableLabel
                : details.markedForExport
                  ? "Marked for export"
                  : "Not marked for export",
          },
          {
            label: "Revenue weight",
            icon: Gauge,
            value:
              details.revenueWeight != null
                ? `${details.revenueWeight.toLocaleString("en-GB")} kg`
                : unavailableLabel,
          },
          {
            label: "Last V5C issued",
            icon: CalendarCheck,
            value: details.dateOfLastV5CIssued ?? unavailableLabel,
          },
          {
            label: "RDE",
            icon: Leaf,
            value: details.realDrivingEmissions ?? unavailableLabel,
          },
        ]
      : []),
  ];

  return (
    <section className="card-surface mt-3.5 p-4">
      <h2 className="text-[1.15rem] font-bold text-navy">Vehicle details</h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-4">
        {fields.map((field, index) => {
          const Icon = field.icon;
          return (
            <div
              key={field.label}
              className={`text-center ${
                index < 2 ? "pb-2.5" : "border-t border-border py-2.5"
              }`}
            >
              <dt className="flex items-center justify-center gap-1 text-[12px] font-medium text-muted">
                <Icon
                  className="h-3.5 w-3.5 shrink-0 text-navy/45"
                  aria-hidden
                />
                {field.label}
              </dt>
              <dd className="mt-0.5 text-[16px] font-semibold text-navy">
                {field.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
