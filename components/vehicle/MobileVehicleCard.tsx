"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Cog,
  Download,
  Factory,
  FileText,
  Fuel,
  Gauge,
  Leaf,
  Plus,
  Receipt,
  Search,
  Settings2,
  Share2,
  ShieldCheck,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { shareVehicleReport } from "@/lib/reports/share";
import {
  buildVehicleCardData,
  VEHICLE_CARD_DISCLAIMER,
  type VehicleCardData,
  type VehicleCardStat,
  type VehicleCardStatKey,
} from "@/lib/vehicle/vehicle-card";
import { VehicleImageFallback } from "@/components/vehicle/VehicleImageFallback";
import type { VehicleRecord } from "@/types/vehicle";

const STAT_ICONS: Record<VehicleCardStatKey, LucideIcon> = {
  fuel: Fuel,
  engine: Cog,
  transmission: Settings2,
  power: Zap,
  mileage: Gauge,
  firstRegistered: CalendarDays,
  co2: Leaf,
  euro: ShieldCheck,
  mot: ClipboardCheck,
  tax: Receipt,
  year: Factory,
};

const STICKY_HEADER_OFFSET_PX = 72;

/** Breathing room kept above and below the detected vehicle, as a share of image height. */
const IMAGE_FRAME_PADDING = 0.035;
/** Widest frame allowed, so very low vehicles still get some height. */
const IMAGE_FRAME_MAX_ASPECT = 2;

type ImageFrame = { aspect: number; positionY: number };

/**
 * Finds the rows of a catalogue image that contain the vehicle (anything that is not
 * near-white or transparent). Returns null when pixels cannot be read, e.g. cross-origin.
 */
function measureImageContent(img: HTMLImageElement): { top: number; bottom: number } | null {
  if (!img.naturalWidth || !img.naturalHeight) return null;
  const width = 96;
  const height = Math.max(1, Math.round((width * img.naturalHeight) / img.naturalWidth));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(img, 0, 0, width, height);
  let data: Uint8ClampedArray;
  try {
    data = context.getImageData(0, 0, width, height).data;
  } catch {
    return null;
  }

  const rowHasContent = (y: number) => {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 16) continue;
      if (765 - (data[i] + data[i + 1] + data[i + 2]) > 36) return true;
    }
    return false;
  };

  let top = 0;
  while (top < height && !rowHasContent(top)) top += 1;
  if (top >= height) return null;
  let bottom = height - 1;
  while (bottom > top && !rowHasContent(bottom)) bottom -= 1;
  return { top: top / height, bottom: (bottom + 1) / height };
}

function frameForImage(img: HTMLImageElement): ImageFrame | null {
  const content = measureImageContent(img);
  if (!content) return null;
  const naturalAspect = img.naturalWidth / img.naturalHeight;
  let top = Math.max(0, content.top - IMAGE_FRAME_PADDING);
  let bottom = Math.min(1, content.bottom + IMAGE_FRAME_PADDING);
  const minVisible = naturalAspect / IMAGE_FRAME_MAX_ASPECT;
  if (bottom - top < minVisible) {
    const centre = (top + bottom) / 2;
    top = Math.max(0, Math.min(1 - minVisible, centre - minVisible / 2));
    bottom = top + minVisible;
  }
  const visible = bottom - top;
  if (visible >= 0.999) return { aspect: naturalAspect, positionY: 50 };
  return {
    aspect: naturalAspect / visible,
    positionY: Math.min(100, Math.max(0, (top / (1 - visible)) * 100)),
  };
}

/**
 * Mobile-only side tab that opens the Vehicle Card. Place it inside a positioned,
 * horizontally centred wrapper: the tab offsets itself to sit flush with the viewport's
 * right edge and is vertically centred on that wrapper.
 */
export function MobileVehicleCard({ vehicle }: { vehicle: VehicleRecord }) {
  const [open, setOpen] = useState(false);
  const tabRef = useRef<HTMLButtonElement>(null);
  const card = useMemo(() => (open ? buildVehicleCardData(vehicle) : null), [open, vehicle]);

  const close = useCallback(() => {
    setOpen(false);
    tabRef.current?.focus({ preventScroll: true });
  }, []);

  function viewReport() {
    setOpen(false);
    requestAnimationFrame(() => {
      const report = tabRef.current?.parentElement;
      if (!report) return;
      const top = report.getBoundingClientRect().top + window.scrollY - STICKY_HEADER_OFFSET_PX;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  }

  return (
    <>
      <button
        ref={tabRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open vehicle card"
        className="absolute right-[calc(50%-50vw)] top-[calc(50%+28px)] z-40 -translate-y-1/2 flex h-[70px] w-[82px] items-center justify-center rounded-l-[18px] rounded-r-none border border-r-0 border-[#d3deec] bg-white shadow-[-8px_10px_24px_rgba(7,26,61,0.16)] transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue md:hidden"
      >
        <span className="relative -ml-1 flex items-center" aria-hidden>
          <Search className="h-9 w-9 text-blue" strokeWidth={2.5} />
          <Plus className="absolute -right-3 -top-1 h-[18px] w-[18px] text-blue" strokeWidth={3.2} />
        </span>
      </button>

      {open && card
        ? createPortal(
            <VehicleCardDialog
              vehicle={vehicle}
              card={card}
              onClose={close}
              onViewReport={viewReport}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function VehicleCardDialog({
  vehicle,
  card,
  onClose,
  onViewReport,
  onDownloadImage,
}: {
  vehicle: VehicleRecord;
  card: VehicleCardData;
  onClose: () => void;
  onViewReport: () => void;
  /** Wired once a 1080x1350 card image renderer exists; until then the button is disabled. */
  onDownloadImage?: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  async function share() {
    setShareStatus("");
    const outcome = await shareVehicleReport(vehicle);
    if (outcome === "copied") setShareStatus("Link copied");
    else if (outcome === "failed") setShareStatus("Unable to share");
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-navy/55 p-3 min-[375px]:p-4 md:hidden"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-card-title"
        className="relative flex max-h-[92vh] w-full max-w-[420px] flex-col overflow-y-auto overscroll-contain rounded-[24px] border-[1.5px] border-[#bfd2ec] bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.3),0_24px_60px_rgba(7,26,61,0.35)]"
      >
        <div className="flex shrink-0 items-center justify-between px-4 pt-2.5">
          <span className="relative block h-[21px] w-[100px]">
            <Image
              src="/autoviewer-mark-optimized.png"
              alt="AutoViewer"
              fill
              sizes="100px"
              quality={100}
              className="object-contain object-left"
            />
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close vehicle card"
            className="-mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dbe3ee] bg-white text-navy shadow-[0_2px_8px_rgba(7,26,61,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden />
          </button>
        </div>

        <VehicleCardImage src={card.imageSrc} alt={card.imageAlt} />

        <p className="px-5 text-center text-[11px] leading-snug text-muted">
          <span className="block">{VEHICLE_CARD_DISCLAIMER}</span>
          {card.colour ? (
            <span className="block">
              Registered colour: <span className="font-bold text-navy">{card.colour}</span>
            </span>
          ) : null}
        </p>

        <div className="px-4 pt-2">
          <h2
            id="vehicle-card-title"
            className="text-[22px] font-extrabold leading-[1.12] tracking-tight text-navy [overflow-wrap:anywhere] min-[375px]:text-[24px]"
          >
            {card.title}
          </h2>
          {card.variant ? (
            <p className="mt-0.5 text-[14px] font-medium leading-snug text-[#53627a] [overflow-wrap:anywhere]">
              {card.variant}
            </p>
          ) : null}
          {card.performanceLine ? (
            <p className="mt-0.5 text-[12px] font-semibold leading-snug tracking-[0.01em] text-blue">
              {card.performanceLine}
            </p>
          ) : null}
        </div>

        {card.stats.length > 0 ? (
          <dl
            aria-label="Vehicle facts"
            className="mx-3 mt-2.5 grid grid-cols-3 gap-1.5"
          >
            {card.stats.map((item) => (
              <StatTile key={item.key} item={item} />
            ))}
          </dl>
        ) : null}

        <div className="px-3 pb-3 pt-2.5">
          <button
            type="button"
            onClick={onViewReport}
            className="flex min-h-[52px] w-full items-center gap-3 rounded-[14px] bg-blue px-4 text-left text-white shadow-[0_8px_18px_rgba(23,105,224,0.3)] transition hover:bg-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
          >
            <FileText className="h-5 w-5 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-[15.5px] font-bold leading-tight">View full report</span>
              <span className="block truncate text-[11.5px] leading-tight text-white/80">
                MOT history, mileage, tax and more
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
          </button>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={share}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-[#cfdcee] bg-white px-3 text-[14px] font-semibold text-blue transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue"
            >
              <Share2 className="h-4 w-4" aria-hidden />
              Share
            </button>
            <button
              type="button"
              onClick={onDownloadImage}
              disabled={!onDownloadImage}
              title={onDownloadImage ? undefined : "Coming soon"}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-[#cfdcee] bg-white px-2 text-[14px] font-semibold text-blue transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue disabled:cursor-not-allowed disabled:border-[#e2e8f0] disabled:text-muted disabled:hover:bg-white"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              <span className="whitespace-nowrap">
                Download image
                {onDownloadImage ? null : <span className="sr-only"> (coming soon)</span>}
              </span>
            </button>
          </div>
          <p
            className={shareStatus ? "mt-2 text-center text-[12px] font-medium text-muted" : "sr-only"}
            role="status"
            aria-live="polite"
          >
            {shareStatus}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Tightly framed catalogue image: trims empty margin above and below, never the vehicle. */
function VehicleCardImage({ src, alt }: { src: string | null; alt: string }) {
  const [frame, setFrame] = useState<ImageFrame | null>(null);
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div className="relative mx-3 mt-2 aspect-[16/9] shrink-0">
        <VehicleImageFallback className="absolute inset-0" />
      </div>
    );
  }

  const style: CSSProperties = { aspectRatio: frame ? String(frame.aspect) : "4 / 3" };

  return (
    <div className="relative mx-[7%] mt-1 shrink-0 overflow-hidden" style={style}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 767px) 100vw, 420px"
        priority
        onLoad={(event) => {
          setFrame(frameForImage(event.currentTarget));
          setLoaded(true);
        }}
        className={`transition-opacity duration-150 ${frame ? "object-cover" : "object-contain"} ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={frame ? { objectPosition: `50% ${frame.positionY}%` } : undefined}
      />
    </div>
  );
}

function StatTile({ item }: { item: VehicleCardStat }) {
  const Icon = STAT_ICONS[item.key];
  const performance = item.key === "power";
  const motValid = item.key === "mot" && item.value === "Valid";
  return (
    <div className="relative flex min-h-[66px] min-w-0 flex-col justify-between gap-1 overflow-hidden rounded-[12px] border border-[#dde7f3] bg-[#f4f8fd] px-2 pb-1.5 pt-2 min-[375px]:min-h-[70px] min-[375px]:px-2.5 min-[414px]:min-h-[74px]">
      <span
        className={`absolute left-2 top-0 h-[2px] rounded-b-full min-[375px]:left-2.5 ${
          performance ? "w-6 bg-blue" : "w-4 bg-blue/35"
        }`}
        aria-hidden
      />
      {motValid ? (
        <span
          className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-[3px] ring-emerald-500/20"
          aria-hidden
        />
      ) : null}
      <Icon
        className={`h-[18px] w-[18px] shrink-0 text-blue min-[375px]:h-5 min-[375px]:w-5 ${
          performance ? "fill-blue/20" : ""
        }`}
        strokeWidth={performance ? 2.4 : 2}
        aria-hidden
      />
      <div className="min-w-0">
        <dt className="truncate text-[8.5px] font-semibold uppercase leading-tight tracking-[0.08em] text-muted min-[375px]:text-[9px]">
          {item.label}
        </dt>
        <dd
          title={item.value}
          className="line-clamp-2 text-[13px] font-extrabold leading-[1.15] tracking-tight text-navy [overflow-wrap:anywhere] min-[375px]:text-[14.5px]"
        >
          {item.value}
        </dd>
      </div>
    </div>
  );
}
