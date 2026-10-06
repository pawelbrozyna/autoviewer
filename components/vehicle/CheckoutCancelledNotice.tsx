"use client";

import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";

const CANCELLED_MESSAGE = "Checkout cancelled. No payment was taken.";
const ERROR_MESSAGE = "We could not start checkout. No payment was taken.";

export function CheckoutCancelledNotice({
  message = CANCELLED_MESSAGE,
}: {
  message?: string;
}) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }

  return (
    <div
      role="status"
      className="mb-4 flex items-center gap-2.5 rounded-[10px] border border-[#D6E4F7] bg-[#F1F6FD] py-2.5 pl-3.5 pr-2 text-[14px] text-navy md:mb-5"
    >
      <Info className="h-4 w-4 shrink-0 text-blue" aria-hidden />
      <p className="min-w-0 flex-1 font-medium">{message}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notice"
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-muted transition hover:bg-white hover:text-navy"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

/** For static pages: reads `?checkout=` in the browser so the page stays static. */
export function CheckoutStatusNoticeFromUrl() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setStatus(new URL(window.location.href).searchParams.get("checkout"));
  }, []);

  if (status === "cancelled") return <CheckoutCancelledNotice />;
  if (status === "error") return <CheckoutCancelledNotice message={ERROR_MESSAGE} />;
  return null;
}
