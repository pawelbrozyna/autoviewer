import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { InfoTip } from "@/components/ui/InfoTip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MotTimeline } from "@/components/vehicle/MotTimeline";
import { ScoreGauge } from "@/components/vehicle/ScoreGauge";
import { VehicleSummaryMobile } from "@/components/vehicle/VehicleSummaryMobile";
import { VehicleThumbnail } from "@/components/vehicle/VehicleThumbnail";
import { getMockVehicle } from "@/lib/api/mock";
import {
  buyerScoreBandLabel,
  buyerScoreInsufficientMessage,
} from "@/lib/vehicle/score";
import { cn } from "@/lib/utils";

export function ExampleReport() {
  const vehicle = getMockVehicle("AB12CDE")!;
  const buyerScore = vehicle.buyerScore;
  const reportPath = `/vehicle/${vehicle.summary.registration}`;
  const scoreValue =
    buyerScore?.score != null ? `${buyerScore.score}/100` : "-";
  const scoreHint =
    buyerScore?.score != null
      ? (buyerScore.label ?? buyerScoreBandLabel(buyerScore.band))
      : buyerScoreInsufficientMessage();
  const scoreHintTone =
    buyerScore?.band === "excellent-history" ||
    buyerScore?.band === "good-history"
      ? ("success" as const)
      : buyerScore?.band === "mixed-history"
        ? ("warning" as const)
        : buyerScore?.band === "needs-attention"
          ? ("danger" as const)
          : undefined;

  const metrics = [
    {
      key: "mileage",
      label: "Mileage",
      value: "67,420",
      hint: "miles" as string | undefined,
      hintTone: undefined as "success" | "warning" | "danger" | undefined,
      withInfo: false,
    },
    {
      key: "owners",
      label: "Owners",
      value: "2",
      hint: undefined,
      hintTone: undefined,
      withInfo: false,
    },
    {
      key: "tax",
      label: "Road tax",
      value: "£195",
      hint: "per year",
      hintTone: undefined,
      withInfo: false,
    },
    {
      key: "score",
      label: "Buyer score",
      value: scoreValue,
      hint: scoreHint,
      hintTone: scoreHintTone,
      withInfo: true,
    },
  ];

  return (
    <section className="bg-[#F9FBFE] pb-3 pt-0.5 md:bg-surface-soft md:pb-4 md:pt-7 lg:pb-3.5 lg:pt-6">
      <Container>
        {/* Mobile: same layout as vehicle result summary */}
        <div className="md:hidden">
          <VehicleSummaryMobile
            vehicle={vehicle}
            titleAs="h2"
            reportPath={reportPath}
          />
        </div>

        {/* Desktop: existing layout */}
        <div className="card-surface hidden overflow-hidden p-5 pb-3.5 md:block lg:p-4.5 lg:pb-3">
          <div className="mb-3.5 flex flex-wrap items-center gap-2.5 lg:mb-3">
            <p className="eyebrow mb-0">Example report</p>
            <StatusBadge tone="info">Demo data</StatusBadge>
          </div>

          <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2 lg:mb-3.5 lg:gap-x-5">
            <div className="min-w-0">
              <h2 className="text-[1.35rem] font-bold tracking-tight text-navy md:text-[1.55rem] lg:text-[1.4rem]">
                {vehicle.summary.make} {vehicle.summary.model}
              </h2>
              <p className="mt-1 text-[14px] text-muted md:text-[15px]">
                {vehicle.summary.displayRegistration} | {vehicle.summary.year} |{" "}
                {vehicle.summary.fuelType} | {vehicle.summary.transmission}
              </p>
            </div>
            <ScoreGauge result={buyerScore} className="-mt-2.5" />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_315px] lg:items-start lg:gap-5">
            <div>
              <div className="grid gap-4 sm:grid-cols-[235px_minmax(0,1fr)] sm:items-stretch sm:gap-5">
                <div className="w-full sm:w-[235px]">
                  <VehicleThumbnail
                    label={`${vehicle.summary.make} ${vehicle.summary.model}`}
                    src={vehicle.summary.imageSrc}
                    light
                    showIllustrationLabel
                    className="w-full sm:max-w-none"
                  />
                </div>

                <div className="flex h-full flex-col rounded-[12px] border border-border bg-white px-2 pb-2.5 pt-2.5 md:px-3 md:pb-2.5 md:pt-3">
                  <div className="grid flex-1 grid-cols-2 content-start lg:grid-cols-[1.1fr_0.6fr_minmax(5.5rem,1.15fr)_1.3fr]">
                    {metrics.map((metric, index) => (
                      <div
                        key={metric.key}
                        className={cn(
                          "px-2.5 py-1 text-center md:px-3 md:py-0",
                          metric.key === "owners" && "px-1.5 md:px-2",
                          index % 2 === 1 && "border-l border-border",
                          index >= 2 && "border-t border-border lg:border-t-0",
                          index > 0 && "lg:border-l lg:border-border",
                        )}
                      >
                        <div className="mb-1 flex items-center justify-center gap-1 text-[12px] font-semibold uppercase tracking-[0.04em] text-muted md:text-[13px]">
                          <span className="whitespace-nowrap">{metric.label}</span>
                          {metric.withInfo ? (
                            <InfoTip
                              label="About Buyer score"
                              text="Buyer Score is an AutoViewer interpretation of available vehicle history. It is not a mechanical inspection or guarantee of vehicle condition."
                            />
                          ) : null}
                        </div>
                        <div
                          className={cn(
                            "tracking-tight text-navy",
                            metric.key === "score"
                              ? "text-[22px] font-extrabold md:text-[24px]"
                              : "text-[22px] font-bold md:text-[24px]",
                          )}
                        >
                          {metric.value}
                        </div>
                        {metric.hint ? (
                          <p
                            className={cn(
                              "mt-0.5 text-[13px]",
                              metric.hintTone === "success"
                                ? "font-semibold text-success"
                                : metric.hintTone === "warning"
                                  ? "font-semibold text-warning"
                                  : metric.hintTone === "danger"
                                    ? "font-semibold text-danger"
                                    : "text-muted",
                            )}
                          >
                            {metric.hint}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-center gap-1.5 border-t border-border pt-2">
                    <StatusBadge
                      tone="success"
                      icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    >
                      Taxed
                    </StatusBadge>
                    <StatusBadge
                      tone="success"
                      icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    >
                      MOT valid
                    </StatusBadge>
                    <StatusBadge
                      tone="warning"
                      icon={<AlertTriangle className="h-3.5 w-3.5" />}
                    >
                      1 recall
                    </StatusBadge>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[15px] text-muted md:text-[16px]">
                Example data -{" "}
                <Link
                  href="/check-a-vehicle"
                  className="font-semibold text-blue hover:text-blue-hover"
                >
                  check a real registration →
                </Link>
              </p>
            </div>

            <MotTimeline
              tests={vehicle.motTests}
              limit={3}
              viewAllHref={reportPath}
              compact
              className="lg:min-w-[300px]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
