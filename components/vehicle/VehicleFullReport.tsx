import Link from "next/link";
import type { ReactNode } from "react";
import { BuyerScore } from "@/components/vehicle/BuyerScore";
import { MileageHistory } from "@/components/vehicle/MileageHistory";
import { MobileVehicleDetails } from "@/components/vehicle/MobileVehicleDetails";
import { MotTimeline } from "@/components/vehicle/MotTimeline";
import {
  MotResultBadge,
  TaxStatusBadge,
} from "@/components/vehicle/StatusBadges";
import { VehicleReportDesktop } from "@/components/vehicle/VehicleReportDesktop";
import { VehicleSummaryMobile } from "@/components/vehicle/VehicleSummaryMobile";
import { formatDateUk } from "@/lib/utils";
import type { VehicleRecord } from "@/types/vehicle";

export function VehicleFullReport({
  vehicle,
  ownersLabel,
  mobileLargerImage = false,
  showExtendedDetails = false,
  showUnavailableStats = false,
}: {
  vehicle: VehicleRecord;
  ownersLabel?: string | null;
  mobileLargerImage?: boolean;
  showExtendedDetails?: boolean;
  showUnavailableStats?: boolean;
}) {
  const { summary } = vehicle;

  return (
    <>
      <div className="md:hidden">
        <VehicleSummaryMobile
          vehicle={vehicle}
          largerImage={mobileLargerImage}
          showDerivative
          showCta={false}
        />
        <MobileVehicleDetails
          vehicle={vehicle}
          showExtended={showExtendedDetails}
          unavailableLabel={showUnavailableStats ? "Not available" : "—"}
        />

        <div className="mt-6 space-y-5">
          <SectionCard id="mot-history" title="MOT history">
            <MotTimeline tests={vehicle.motTests} />
            <div className="mt-4 space-y-3">
              {vehicle.motTests.slice(0, 3).map((test) =>
                test.defects.length > 0 ? (
                  <div
                    key={`${test.completedDate}-defects`}
                    className="rounded-[10px] border border-border bg-surface-soft p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold text-navy">
                        {formatDateUk(test.completedDate)}
                      </span>
                      <MotResultBadge result={test.testResult} />
                    </div>
                    <ul className="space-y-2">
                      {test.defects.map((defect) => (
                        <li
                          key={`${defect.type}-${defect.text}`}
                          className="support-copy"
                        >
                          <span className="font-semibold text-navy">
                            {defect.type}
                          </span>
                          {" - "}
                          {defect.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </div>
          </SectionCard>

          <SectionCard id="mileage-history" title="Mileage history">
            <MileageHistory points={vehicle.mileageHistory} />
          </SectionCard>

          <SectionCard id="tax-information" title="Tax information">
            <div className="flex flex-wrap items-center gap-3">
              <TaxStatusBadge status={summary.tax.status} />
              {summary.tax.dueDate ? (
                <span className="support-copy">
                  Due date: {formatDateUk(summary.tax.dueDate)}
                </span>
              ) : null}
            </div>
            <p className="support-copy mt-3">
              Tax and SORN status can change. Confirm before driving or buying.
            </p>
          </SectionCard>

          <SectionCard id="recall-information" title="Recall information">
            {vehicle.recalls.dataAvailable === false ? (
              <p className="support-copy">Recall data is not available.</p>
            ) : vehicle.recalls.items.length > 0 ? (
              <ul className="space-y-3">
                {vehicle.recalls.items.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-[10px] border border-warning/20 bg-warning-bg p-4"
                  >
                    <div className="font-semibold text-navy">{item.title}</div>
                    {item.description ? (
                      <p className="support-copy mt-1">{item.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="support-copy">
                No outstanding recalls indicated in available data.
              </p>
            )}
            {vehicle.recalls.sourceNote ? (
              <p className="meta-copy mt-3">{vehicle.recalls.sourceNote}</p>
            ) : null}
          </SectionCard>

          <SectionCard title="Buyer insights">
            <BuyerScore result={vehicle.buyerScore} />
            {vehicle.buyerScore?.reasons?.length ? (
              <ul className="mt-4 list-disc space-y-1 pl-5 support-copy">
                {vehicle.buyerScore.reasons
                  .filter(
                    (item) =>
                      item.impact !== 0 ||
                      item.type === "insufficient-history",
                  )
                  .map((item) => (
                    <li key={`${item.type}-${item.label}`}>
                      {item.impact !== 0
                        ? `${item.label} (${item.impact > 0 ? "+" : ""}${item.impact})`
                        : item.label}
                    </li>
                  ))}
              </ul>
            ) : null}
            <p className="meta-copy mt-4">
              Buyer Score is an AutoViewer interpretation of available vehicle
              history. It is not a mechanical inspection or guarantee of
              vehicle condition.
            </p>
          </SectionCard>

          <div className="card-surface p-4">
            <h2 className="heading-card">Data notes</h2>
            <ul className="mt-3 space-y-2 support-copy">
              {vehicle.dataQuality.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <p className="meta-copy mt-3">
              Sources: {vehicle.dataQuality.sources.join(", ")}
            </p>
          </div>

          <div className="card-surface p-4">
            <h2 className="heading-card">Related checks</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              {[
                ["/mot-history", "MOT history checker"],
                ["/tax-mileage", "Tax & mileage check"],
                ["/compare-cars", "Compare cars"],
                ["/running-costs", "Running costs"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-blue hover:text-blue-hover"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[12px] border border-border bg-white p-4">
            <p className="meta-copy leading-relaxed">
              Outstanding finance, stolen status and write-off categories are
              not provided by DVLA/DVSA free vehicle data and are not shown
              here.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <VehicleReportDesktop
          vehicle={vehicle}
          ownersLabel={ownersLabel}
          highlightRegistration
          showUnavailableStats={showUnavailableStats}
        />
      </div>
    </>
  );
}

function SectionCard({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="card-surface scroll-mt-24 p-4 md:p-5">
      <h2 className="mb-3.5 text-[1.15rem] font-bold text-navy md:text-[1.25rem]">
        {title}
      </h2>
      {children}
    </section>
  );
}
