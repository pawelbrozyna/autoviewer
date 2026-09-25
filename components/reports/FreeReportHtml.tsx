import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { ArrowRight } from "lucide-react";
import { FULL_REPORT_PRICE, fullReportHref } from "@/lib/full-report";
import {
  FREE_ADVISORY_LIMIT,
  FREE_MILEAGE_LIMIT,
  FREE_SPEC_LIMIT,
  advisoryRowsForPdf,
  collectAdvisories,
  mileageRowsForPdf,
  motRowsForFreePdf,
} from "@/lib/reports/pdf-limits";
import type { VehicleRecord } from "@/types/vehicle";

const plateFont = localFont({
  src: "../../public/fonts/BarlowCondensed-SemiBold.ttf",
  weight: "600",
  display: "swap",
});

/** Convert PDF points to container-width units (A4 content width = 595pt). */
function pt(value: number) {
  return `${((value / 595) * 100).toFixed(3)}cqw`;
}

function formatPdfDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value.length === 7 ? `${value}-01T12:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: value.length === 7 ? undefined : "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function ReportIcon({ name, sizePt }: { name: string; sizePt: number }) {
  const size = Math.round((sizePt / 595) * 920);
  return (
    <Image
      src={`/report-icons/${name}.png`}
      alt=""
      width={size}
      height={size}
      className="shrink-0 object-contain"
      style={{ width: pt(sizePt), height: pt(sizePt) }}
      unoptimized
    />
  );
}

function statusColor(value: string) {
  return value === "Valid" || value === "Taxed" || value === "Yes"
    ? "text-success"
    : "text-navy";
}

function motResultColor(result: string) {
  if (result === "PASS") return "text-success";
  if (result === "FAIL") return "text-danger";
  return "text-warning";
}

function SectionCard({
  title,
  children,
  headerExtra,
  tone = "default",
  className = "",
  marginTopPt = 12,
}: {
  title: string;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
  tone?: "default" | "amber";
  className?: string;
  marginTopPt?: number;
}) {
  const amber = tone === "amber";
  return (
    <section
      className={`overflow-hidden rounded-[6px] border ${
        amber ? "border-[#f0d9a0] bg-warning-bg" : "border-border bg-white"
      } ${className}`}
      style={{ marginTop: pt(marginTopPt) }}
    >
      <div
        className={`flex items-center border-b ${
          amber
            ? "border-[#f0d9a0] bg-[#fff5d6]"
            : "border-border bg-[#ecf0f5]"
        }`}
        style={{ minHeight: pt(26), gap: pt(10), paddingInline: pt(12) }}
      >
        <h4
          className="min-w-0 flex-1 truncate font-bold text-navy"
          style={{ fontSize: pt(12.5) }}
        >
          {title}
        </h4>
        {headerExtra}
      </div>
      {children}
    </section>
  );
}

export type FreeReportHtmlMode = "preview" | "full";

/**
 * Continuous HTML recreation of the free AutoViewer PDF report.
 * `preview` = homepage crop of page 1. `full` = entire report, no page breaks.
 */
export function FreeReportHtml({
  vehicle,
  mode = "full",
}: {
  vehicle: VehicleRecord;
  mode?: FreeReportHtmlMode;
}) {
  const { summary, details } = vehicle;
  const generatedAt = new Date("2026-09-20T12:00:00Z");
  const generatedDate = generatedAt.toLocaleDateString("en-GB");
  const reportId = `AV-${summary.registration}-${generatedAt
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}`;
  const upgradeHref = fullReportHref(summary.registration);
  const needsAttention =
    summary.recalls.dataAvailable !== false && summary.recalls.hasOpenRecalls;
  const vehicleTitle = [summary.year, summary.make, summary.model]
    .filter(Boolean)
    .join(" ");
  const specParts = [summary.colour, summary.fuelType, summary.transmission].filter(
    Boolean,
  ) as string[];
  const isPreview = mode === "preview";

  const facts: Array<{ label: string; value: string; icon: string }> = [
    { label: "MOT status", value: summary.motStatus.status, icon: "shield-check" },
    {
      label: "Mileage",
      value:
        summary.latestMileage != null
          ? `${summary.latestMileage.toLocaleString("en-GB")} miles`
          : "Not available",
      icon: "mileage",
    },
    {
      label: "MOT expiry date",
      value: formatPdfDate(summary.motStatus.expiryDate),
      icon: "calendar",
    },
    {
      label: "Engine size",
      value:
        summary.engineCapacity != null
          ? `${summary.engineCapacity.toLocaleString("en-GB")} cc`
          : "Not available",
      icon: "engine",
    },
    { label: "Tax status", value: summary.tax.status, icon: "car" },
    {
      label: "CO2 emissions",
      value:
        details.co2Emissions != null
          ? `${details.co2Emissions} g/km`
          : "Not available",
      icon: "co2",
    },
    {
      label: "Tax due date",
      value: formatPdfDate(summary.tax.dueDate),
      icon: "calendar",
    },
    {
      label: "Euro status",
      value: details.euroStatus ?? "Not available",
      icon: "leaf",
    },
    {
      label: "Overall score",
      value:
        vehicle.buyerScore?.score != null
          ? `${vehicle.buyerScore.score}/100`
          : "Not available",
      icon: "info",
    },
    { label: "ULEZ status", value: "Not checked", icon: "check" },
  ];

  const checks = [
    {
      title: "DVLA registration details",
      detail: "Make, model, colour and status",
    },
    { title: "MOT status", detail: "Current status and history" },
    { title: "Tax status", detail: "Vehicle tax and due date" },
    {
      title: "Mileage consistency",
      detail: "Checked for irregularities",
    },
    {
      title: "Vehicle identity basics",
      detail: "Make, model and engine details",
    },
    {
      title: "MOT advisories",
      detail: "Notable advisories from past tests",
    },
  ];

  const lockedItems = [
    {
      title: "Finance check",
      detail: "Outstanding finance, hire purchase",
      icon: "pound",
    },
    {
      title: "Write-off check",
      detail: "Insurance write-off history",
      icon: "document",
    },
    {
      title: "Stolen check",
      detail: "Stolen vehicle database check",
      icon: "car",
    },
    {
      title: "Previous owners",
      detail: "Number of keepers and history",
      icon: "user",
    },
    {
      title: "Keeper changes",
      detail: "Timeline of registered keepers",
      icon: "history",
    },
    {
      title: "Recall check",
      detail: "Manufacturer safety recalls",
      icon: "wrench",
    },
  ] as const;

  const motSlice = motRowsForFreePdf(vehicle.motTests);
  const mileageSlice = mileageRowsForPdf(
    [...vehicle.mileageHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
    FREE_MILEAGE_LIMIT,
  );
  const advisoryItems = collectAdvisories(vehicle);
  const advisorySource = [
    ...(advisoryItems.length > 0
      ? advisoryItems
      : [
          {
            date: "",
            type: "No advisories recorded",
            text: "No MOT advisories are shown in the available history.",
          },
        ]),
    ...(vehicle.recalls.dataAvailable !== false && vehicle.recalls.hasOpenRecalls
      ? vehicle.recalls.items.map((item) => ({
          date: item.date ?? "",
          type: "Open recall",
          text: item.title,
        }))
      : []),
    ...(vehicle.buyerScore?.score != null
      ? [
          {
            date: "",
            type: `Buyer Score ${vehicle.buyerScore.score}/100`,
            text: vehicle.buyerScore.label ?? "Available history assessed",
          },
        ]
      : []),
    ...vehicle.dataQuality.notes.slice(0, 2).map((note) => ({
      date: "",
      type: "Data note",
      text: note,
    })),
  ];
  const advisorySlice = advisoryRowsForPdf(advisorySource, FREE_ADVISORY_LIMIT);
  const specifications = [
    ["Colour", details.colour],
    [
      "Engine",
      details.engineCapacity != null
        ? `${details.engineCapacity.toLocaleString("en-GB")} cc`
        : null,
    ],
    ["Fuel", details.fuelType],
    ["Transmission", details.transmission],
    ["Power", summary.powerBhp != null ? `${summary.powerBhp} bhp` : null],
    [
      "CO2",
      details.co2Emissions != null ? `${details.co2Emissions} g/km` : null,
    ],
    ["Euro status", details.euroStatus],
    ["MOT test number", motSlice.shown[0]?.motTestNumber ?? null],
    ["First registered", formatPdfDate(details.monthOfFirstRegistration)],
    ["Tax status", summary.tax.status],
    ["MOT expiry", formatPdfDate(summary.motStatus.expiryDate)],
    ["V5C issued", formatPdfDate(details.dateOfLastV5CIssued)],
    ["Wheelplan", details.wheelplan],
    ["Type approval", details.typeApproval],
  ].filter(
    (item): item is [string, string] =>
      typeof item[1] === "string" && item[1].length > 0 && item[1] !== "Not available",
  );

  const reportBody = (
    <article
      className="w-full bg-white text-navy"
      style={{
        paddingLeft: pt(34),
        paddingRight: pt(34),
        paddingTop: pt(22),
        paddingBottom: isPreview ? undefined : pt(28),
      }}
      aria-label="AutoViewer free vehicle report"
    >
      <header
        className="flex items-start justify-between gap-4 border-b-[1.4px] border-blue"
        style={{ paddingBottom: pt(10) }}
      >
        <div className="min-w-0">
          <p
            className="font-extrabold leading-none tracking-tight"
            style={{ fontSize: pt(22) }}
          >
            Auto<span className="text-blue">Viewer</span>
          </p>
          <div
            className="flex flex-wrap items-center gap-2 leading-none"
            style={{ marginTop: pt(2) }}
          >
            <p
              className="font-semibold uppercase tracking-[0.08em] text-muted leading-none"
              style={{ fontSize: pt(6.2) }}
            >
              Clearer cars. Brighter decisions.
            </p>
            {summary.isDemo ? (
              <span
                className="rounded-[3px] border border-border bg-[#edf5ff] font-bold uppercase tracking-[0.04em] text-blue leading-none"
                style={{
                  fontSize: pt(6.5),
                  paddingInline: pt(8),
                  paddingBlock: pt(2),
                }}
              >
                Demo data
              </span>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold leading-none" style={{ fontSize: pt(15) }}>
            Vehicle Report
          </p>
          <p
            className="leading-snug text-muted"
            style={{ marginTop: pt(4), fontSize: pt(7.8) }}
          >
            Report ID&nbsp;&nbsp;{reportId}
            <br />
            Generated&nbsp;&nbsp;{generatedDate}
          </p>
        </div>
      </header>

      <div
        className="relative overflow-visible"
        style={{ marginTop: pt(10), minHeight: pt(184) }}
      >
        <div className="absolute inset-y-0 right-0 w-[55%]">
          {summary.imageSrc ? (
            <Image
              src={summary.imageSrc}
              alt={`${summary.make} ${summary.model}`}
              fill
              sizes="(max-width: 768px) 58vw, 500px"
              className="origin-center translate-y-[-8%] scale-90 object-contain object-center"
              priority
            />
          ) : null}
        </div>

        <h3
          className="relative z-10 whitespace-nowrap font-bold leading-none text-navy"
          style={{
            paddingTop: pt(4),
            fontSize: pt(16),
            maxWidth: "96%",
            overflow: "visible",
          }}
          title={vehicleTitle}
        >
          {vehicleTitle}
        </h3>

        <div
          className="relative z-10 min-w-0"
          style={{ marginTop: pt(10), maxWidth: "48%" }}
        >
          <span
            className={`${plateFont.className} inline-flex items-center justify-center rounded-[5px] border-[3px] border-black bg-[#fac023] font-semibold leading-none tracking-[0.04em] text-black`}
            style={{
              minHeight: pt(38),
              minWidth: pt(150),
              paddingInline: pt(15),
              fontSize: pt(29),
            }}
          >
            {summary.displayRegistration}
          </span>
        </div>

        <div
          className="relative z-10"
          style={{ marginTop: pt(14), maxWidth: "48%" }}
        >
          <p className="leading-none" style={{ fontSize: pt(11.2) }}>
            {specParts.length > 0 ? (
              specParts.map((part, index) => (
                <span key={part}>
                  {index > 0 ? (
                    <span className="text-muted">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                  ) : null}
                  {part}
                </span>
              ))
            ) : (
              "Specification not available"
            )}
          </p>
          <p
            className="leading-none text-muted"
            style={{ marginTop: pt(14), fontSize: pt(8.5) }}
          >
            First registered
          </p>
          <p
            className="font-bold leading-none text-navy"
            style={{ marginTop: pt(7), fontSize: pt(12) }}
          >
            {formatPdfDate(details.monthOfFirstRegistration)}
          </p>
        </div>

        {!summary.imageSrc ? (
          <p
            className="absolute right-0 top-1/2 -translate-y-1/2 text-muted"
            style={{ fontSize: pt(9) }}
          >
            Representative image unavailable
          </p>
        ) : null}
      </div>

      <div
        className={`relative z-20 flex items-center rounded-[6px] border ${
          needsAttention
            ? "border-[#f5d9a8] bg-warning-bg"
            : "border-success/25 bg-success-bg"
        }`}
          style={{
            marginTop: pt(-32),
            minHeight: pt(44),
            gap: pt(12),
            paddingInline: pt(16),
            paddingBlock: pt(7),
          }}
        >
        <ReportIcon name={needsAttention ? "warning" : "check"} sizePt={28} />
        <div className="min-w-0">
          <p
            className={`font-bold leading-tight ${
              needsAttention ? "text-navy" : "text-success"
            }`}
            style={{ fontSize: pt(13) }}
          >
            Summary:{" "}
            {needsAttention
              ? "Items need attention"
              : "No immediate issues indicated"}
          </p>
          <p className="text-muted" style={{ marginTop: pt(3), fontSize: pt(8.3) }}>
            {needsAttention
              ? "Review the available recall information below."
              : "Based only on the free public and demonstration data shown in this report."}
          </p>
        </div>
      </div>

      <SectionCard title="Key facts" marginTopPt={10}>
        <div className="grid grid-cols-2">
          {facts.map((fact, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            return (
              <div
                key={fact.label}
                className={`flex items-center ${
                  col === 0 ? "border-r border-border" : ""
                } ${row > 0 ? "border-t border-border" : ""}`}
                style={{
                  minHeight: pt(26),
                  gap: pt(8),
                  paddingInline: pt(11),
                }}
              >
                <ReportIcon name={fact.icon} sizePt={14} />
                <span
                  className="min-w-0 flex-1 truncate text-muted"
                  style={{ fontSize: pt(8.6) }}
                >
                  {fact.label}
                </span>
                <span
                  className={`shrink-0 text-right font-bold ${statusColor(fact.value)}`}
                  style={{ fontSize: pt(9.2) }}
                >
                  {fact.value}
                </span>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="What we checked">
        <div className="grid grid-cols-2">
          {checks.map((item, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            return (
              <div
                key={item.title}
                className={`flex items-center ${
                  col === 0 ? "border-r border-border" : ""
                } ${row > 0 ? "border-t border-border" : ""}`}
                style={{
                  minHeight: pt(34),
                  gap: pt(8),
                  paddingInline: pt(14),
                }}
              >
                <ReportIcon name="check" sizePt={13} />
                <div className="min-w-0">
                  <p
                    className="font-bold leading-tight text-navy"
                    style={{ fontSize: pt(9) }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="leading-snug text-muted"
                    style={{ marginTop: pt(2), fontSize: pt(7.5) }}
                  >
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="More available in Full Report"
        tone="amber"
        headerExtra={
          <>
            <span
              className="shrink-0 font-bold uppercase tracking-[0.06em] text-warning"
              style={{ fontSize: pt(6.5) }}
            >
              Coming soon
            </span>
            <span className="shrink-0 font-bold text-navy" style={{ fontSize: pt(13) }}>
              {FULL_REPORT_PRICE}
            </span>
          </>
        }
      >
        <div className="grid grid-cols-2">
          {lockedItems.map((item, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            return (
              <Link
                key={item.title}
                href={upgradeHref}
                className={`flex items-center transition hover:bg-white/45 ${
                  col === 0 ? "border-r border-[#f0d9a0]/70" : ""
                } ${row > 0 ? "border-t border-[#f0d9a0]/70" : ""}`}
                style={{
                  minHeight: pt(29),
                  gap: pt(8),
                  paddingInline: pt(14),
                }}
              >
                <ReportIcon name={item.icon} sizePt={13} />
                <div className="min-w-0">
                  <p
                    className="font-bold leading-tight text-navy"
                    style={{ fontSize: pt(8.5) }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="leading-snug text-muted"
                    style={{ marginTop: pt(2), fontSize: pt(6.9) }}
                  >
                    {item.detail}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </SectionCard>

      <div className="flex justify-center" style={{ marginTop: pt(16) }}>
        <Link
          href={upgradeHref}
          className="inline-flex items-center rounded-[6px] bg-blue font-bold !text-white shadow-sm transition hover:bg-blue-hover"
          style={{
            minHeight: pt(28),
            gap: pt(8),
            paddingInline: pt(18),
            fontSize: pt(10.5),
          }}
        >
          <ReportIcon name="lock-white" sizePt={13} />
          Unlock Full Report - {FULL_REPORT_PRICE}
        </Link>
      </div>

      {!isPreview ? (
        <>
          <h3
            className="font-bold text-navy"
            style={{ marginTop: pt(28), fontSize: pt(17.5) }}
          >
            MOT History & Vehicle Details
          </h3>

          <SectionCard title="MOT history">
            <div
              className="grid grid-cols-[1.15fr_0.7fr_0.9fr_1.6fr] border-b border-border bg-[#ecf0f5]"
              style={{ minHeight: pt(22) }}
            >
              {["DATE", "RESULT", "MILEAGE", "NOTES"].map((label) => (
                <div
                  key={label}
                  className="flex items-center border-r border-border px-3 last:border-r-0"
                  style={{ fontSize: pt(8) }}
                >
                  <span className="font-bold text-muted">{label}</span>
                </div>
              ))}
            </div>
            {motSlice.shown.length === 0 ? (
              <p
                className="px-3 py-3 text-muted"
                style={{ fontSize: pt(9) }}
              >
                MOT history is not available from the connected source.
              </p>
            ) : (
              motSlice.shown.map((test, index) => (
                <div
                  key={`${test.completedDate}-${test.motTestNumber ?? index}`}
                  className={`grid grid-cols-[1.15fr_0.7fr_0.9fr_1.6fr] ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                  style={{ minHeight: pt(24) }}
                >
                  <div
                    className="flex items-center border-r border-border px-3"
                    style={{ fontSize: pt(9.4) }}
                  >
                    {formatPdfDate(test.completedDate)}
                  </div>
                  <div
                    className={`flex items-center border-r border-border px-3 font-bold ${motResultColor(test.testResult)}`}
                    style={{ fontSize: pt(9.4) }}
                  >
                    {test.testResult}
                  </div>
                  <div
                    className="flex items-center border-r border-border px-3 font-bold text-navy"
                    style={{ fontSize: pt(9.4) }}
                  >
                    {test.odometerValue != null
                      ? `${test.odometerValue.toLocaleString("en-GB")} mi`
                      : "Not available"}
                  </div>
                  <div
                    className="flex items-center px-3 text-muted"
                    style={{ fontSize: pt(9.1) }}
                  >
                    {test.defects.length > 0
                      ? `${test.defects.length} advisory / defect item${test.defects.length === 1 ? "" : "s"}`
                      : "No advisories recorded"}
                  </div>
                </div>
              ))
            )}
            {motSlice.note ? (
              <p
                className="border-t border-border px-3 py-2 text-muted"
                style={{ fontSize: pt(7.5) }}
              >
                {motSlice.note}
              </p>
            ) : null}
          </SectionCard>

          <div
            className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2"
            style={{ marginTop: pt(12), gap: pt(12) }}
          >
            <SectionCard title="Mileage history" marginTopPt={0}>
              <div
                className="grid grid-cols-2 border-b border-border bg-[#ecf0f5]"
                style={{ minHeight: pt(22) }}
              >
                <div
                  className="flex items-center border-r border-border px-3 font-bold text-muted"
                  style={{ fontSize: pt(8) }}
                >
                  DATE
                </div>
                <div
                  className="flex items-center px-3 font-bold text-muted"
                  style={{ fontSize: pt(8) }}
                >
                  MILEAGE
                </div>
              </div>
              {mileageSlice.shown.length === 0 ? (
                <p className="px-3 py-3 text-muted" style={{ fontSize: pt(9.4) }}>
                  Mileage history is not available.
                </p>
              ) : (
                mileageSlice.shown.map((point, index) => (
                  <div
                    key={`${point.date}-${point.mileage}`}
                    className={`grid grid-cols-2 ${
                      index > 0 ? "border-t border-border" : ""
                    }`}
                    style={{ minHeight: pt(24) }}
                  >
                    <div
                      className="flex items-center border-r border-border px-3"
                      style={{ fontSize: pt(9.4) }}
                    >
                      {formatPdfDate(point.date)}
                    </div>
                    <div
                      className="flex items-center px-3 font-bold text-navy"
                      style={{ fontSize: pt(9.4) }}
                    >
                      {point.mileage.toLocaleString("en-GB")} mi
                    </div>
                  </div>
                ))
              )}
              {mileageSlice.note ? (
                <p
                  className="border-t border-border px-3 py-2 text-muted"
                  style={{ fontSize: pt(7.5) }}
                >
                  {mileageSlice.note}
                </p>
              ) : null}
            </SectionCard>

            <SectionCard
              title="Advisories / Notes"
              tone="amber"
              marginTopPt={0}
              headerExtra={<ReportIcon name="warning" sizePt={14} />}
            >
              {advisorySlice.shown.map((item, index) => (
                <div
                  key={`${item.type}-${item.text}-${index}`}
                  className={`flex items-start ${
                    index > 0 ? "border-t border-[#f0d9a0]/70" : ""
                  }`}
                  style={{
                    minHeight: pt(30),
                    gap: pt(8),
                    paddingInline: pt(12),
                    paddingBlock: pt(6),
                  }}
                >
                  <ReportIcon name="warning" sizePt={15} />
                  <div className="min-w-0">
                    <p
                      className="font-bold leading-tight text-navy"
                      style={{ fontSize: pt(8.4) }}
                    >
                      {item.type}
                    </p>
                    <p
                      className="leading-snug text-muted"
                      style={{ marginTop: pt(2), fontSize: pt(7.3) }}
                    >
                      {item.date
                        ? `${item.text} - ${formatPdfDate(item.date)}`
                        : item.text}
                    </p>
                  </div>
                </div>
              ))}
              {advisorySlice.note ? (
                <p
                  className="border-t border-[#f0d9a0]/70 px-3 py-2 text-muted"
                  style={{ fontSize: pt(7.2) }}
                >
                  {advisorySlice.note}
                </p>
              ) : null}
            </SectionCard>
          </div>

          <SectionCard title="Vehicle specification">
            <div className="grid grid-cols-2">
              {specifications.slice(0, FREE_SPEC_LIMIT).map(([label, value], index) => {
                const row = Math.floor(index / 2);
                const col = index % 2;
                return (
                  <div
                    key={label}
                    className={`flex items-center justify-between gap-3 ${
                      col === 0 ? "border-r border-border" : ""
                    } ${row > 0 ? "border-t border-border" : ""}`}
                    style={{
                      minHeight: pt(24),
                      paddingInline: pt(12),
                    }}
                  >
                    <span className="text-muted" style={{ fontSize: pt(8.4) }}>
                      {label}
                    </span>
                    <span
                      className="truncate font-bold text-navy"
                      style={{ fontSize: pt(8.8) }}
                    >
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <div className="flex justify-center" style={{ marginTop: pt(18) }}>
            <Link
              href={upgradeHref}
              className="inline-flex items-center rounded-[6px] bg-blue font-bold !text-white shadow-sm transition hover:bg-blue-hover"
              style={{
                minHeight: pt(28),
                gap: pt(8),
                paddingInline: pt(18),
                fontSize: pt(10.5),
              }}
            >
              <ReportIcon name="lock-white" sizePt={13} />
              Unlock Full Report - {FULL_REPORT_PRICE}
            </Link>
          </div>
        </>
      ) : null}

      <footer
        className="flex items-end justify-between gap-3 border-t border-border text-muted"
        style={{
          marginTop: pt(18),
          paddingTop: pt(10),
          fontSize: pt(6.5),
        }}
      >
        <div>
          <p
            className="font-extrabold leading-none text-navy"
            style={{ fontSize: pt(10) }}
          >
            Auto<span className="text-blue">Viewer</span>
          </p>
          <p style={{ marginTop: pt(4) }}>
            Vehicle history checks you can trust.
          </p>
        </div>
        <p className="hidden text-center sm:block">
          Summary report only. Confirm important details before buying.
        </p>
        {isPreview ? <p className="shrink-0">Page 1 of 2</p> : <span />}
      </footer>
    </article>
  );

  if (isPreview) {
    return (
      <div
        className="relative w-full overflow-hidden rounded-[12px] border border-border bg-white shadow-[0_12px_35px_rgba(1,32,70,0.12)]"
        style={{ aspectRatio: "595 / 606" }}
      >
        <div
          className="absolute inset-x-0 top-0 w-full [container-type:inline-size]"
          style={{ aspectRatio: "595 / 842" }}
        >
          {reportBody}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-b from-transparent from-0% to-[#F9FBFE] to-100% md:to-surface-soft"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center px-4 sm:bottom-5">
          <Link
            href="/example-report"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] bg-navy px-5 text-[15px] font-semibold !text-white shadow-sm transition hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 sm:min-h-[52px] sm:px-6 sm:text-[16px]"
          >
            See full free example report
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-[12px] border border-border bg-white shadow-[0_12px_35px_rgba(1,32,70,0.12)] [container-type:inline-size]">
      {reportBody}
    </div>
  );
}
