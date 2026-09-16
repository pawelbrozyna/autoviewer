"use client";

import { useEffect, useRef, useState } from "react";
import { Download, LoaderCircle, Mail, Share2, X } from "lucide-react";
import { downloadVehicleReportPdf } from "@/lib/reports/pdf";
import type { VehicleRecord } from "@/types/vehicle";

const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] border border-border bg-white px-3.5 text-[14px] font-semibold text-navy transition hover:border-navy/30 hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export function ExampleReportActions({
  vehicle,
  ownersLabel,
}: {
  vehicle: VehicleRecord;
  ownersLabel?: string | null;
}) {
  const [downloading, setDownloading] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [emailError, setEmailError] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);
  const emailTriggerRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!emailOpen) return;
    emailInputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setEmailOpen(false);
        emailTriggerRef.current?.focus();
        return;
      }

      if (event.key === "Tab" && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
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
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [emailOpen]);

  async function downloadPdf() {
    setDownloading(true);
    try {
      await downloadVehicleReportPdf(vehicle, { ownersLabel });
    } finally {
      setDownloading(false);
    }
  }

  async function shareReport() {
    const url = `${window.location.origin}/example-report`;
    setShareStatus("");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "AutoViewer Example Report",
          text: "Explore a complete AutoViewer demonstration vehicle report.",
          url,
        });
        setShareStatus("Report shared");
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus("Link copied");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        setShareStatus("Link copied");
      } catch {
        setShareStatus("Unable to share");
      }
    }
  }

  async function emailReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailStatus("loading");
    setEmailError("");

    try {
      const response = await fetch("/api/reports/example/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || payload.success !== true) {
        setEmailStatus("error");
        setEmailError(payload.error || "Failed to send report.");
        return;
      }

      setEmailStatus("success");
    } catch {
      setEmailStatus("error");
      setEmailError("Failed to send report.");
    }
  }

  function closeModal() {
    setEmailOpen(false);
    emailTriggerRef.current?.focus();
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        <button
          type="button"
          className={buttonClass}
          onClick={downloadPdf}
          disabled={downloading}
        >
          {downloading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          {downloading ? "Generating PDF..." : "Download PDF"}
        </button>
        <button
          ref={emailTriggerRef}
          type="button"
          className={buttonClass}
          onClick={() => {
            setEmailStatus("idle");
            setEmailError("");
            setEmailOpen(true);
          }}
        >
          <Mail className="h-4 w-4" aria-hidden />
          Email report
        </button>
        <button type="button" className={buttonClass} onClick={shareReport}>
          <Share2 className="h-4 w-4" aria-hidden />
          Share
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {downloading ? "Generating PDF" : shareStatus}
      </p>

      {emailOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/45 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-report-title"
            className="w-full max-w-md rounded-[12px] border border-border bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="email-report-title"
                className="text-[20px] font-bold text-navy"
              >
                Email this report
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-soft hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue"
                aria-label="Close email report dialog"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {emailStatus === "success" ? (
              <div className="mt-4" role="status" aria-live="polite">
                <p className="font-semibold text-success">Report email sent.</p>
                <button
                  type="button"
                  className={`${buttonClass} mt-4`}
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            ) : (
              <form className="mt-4" onSubmit={emailReport}>
                <label
                  htmlFor="report-email"
                  className="block text-[13px] font-semibold text-navy"
                >
                  Email address
                </label>
                <input
                  ref={emailInputRef}
                  id="report-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (emailStatus === "error") setEmailStatus("idle");
                  }}
                  className="mt-1.5 w-full rounded-[9px] border border-border px-3.5 py-2.5 text-[15px] text-navy outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                />
                {emailStatus === "error" ? (
                  <p
                    className="mt-2 text-[13px] font-medium text-danger"
                    role="alert"
                    aria-live="polite"
                  >
                    {emailError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="relative mt-4 inline-flex min-h-[49px] items-center justify-center gap-2 rounded-[10px] bg-navy px-4.5 text-[17.5px] font-semibold !text-white transition-all duration-150 hover:bg-navy-soft hover:shadow-md hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={emailStatus === "loading"}
                >
                  {emailStatus === "loading" ? (
                    <LoaderCircle
                      className="h-4 w-4 animate-spin"
                      aria-hidden
                    />
                  ) : (
                    <Mail className="h-4 w-4" aria-hidden />
                  )}
                  {emailStatus === "loading" ? "Sending..." : "Send report"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
