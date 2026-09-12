"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Container } from "@/components/ui/Container";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

const authEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 20);
    const menuButton = menuButtonRef.current;

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      menuButton?.focus();
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  const mobileDrawer =
    mounted &&
    createPortal(
      <div className="lg:hidden">
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close menu"
          className={cn(
            "fixed inset-0 z-[100] bg-[rgba(0,20,50,0.28)] transition-opacity duration-300 ease-out",
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
          onClick={closeMenu}
        />

        <div
          ref={drawerRef}
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          inert={!open ? true : undefined}
          className={cn(
            "fixed top-0 right-0 z-[110] flex max-h-[100dvh] w-[72vw] max-w-[300px] flex-col bg-white shadow-[-8px_0_24px_rgba(7,26,61,0.12)] transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full pointer-events-none",
          )}
        >
          <div className="flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-border px-4">
            <BrandLogo size="default" onNavigate={closeMenu} />
            <button
              ref={closeButtonRef}
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-navy"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <nav
            className="flex flex-col gap-0.5 overflow-y-auto px-4 pb-4 pt-2"
            aria-label="Mobile"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-base font-semibold text-[#012046] hover:bg-surface-soft focus-visible:bg-surface-soft"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
            {authEnabled ? (
              <Link
                href="/sign-in"
                className="rounded-md px-3 py-2.5 text-base font-semibold text-[#012046] hover:bg-surface-soft focus-visible:bg-surface-soft"
                onClick={closeMenu}
              >
                Sign in
              </Link>
            ) : null}
          </nav>
        </div>
      </div>,
      document.body,
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <Container className="flex h-[68px] items-center justify-between gap-4 lg:h-[62px] lg:gap-3">
        <BrandLogo size="header" />

        <nav
          className="hidden items-center gap-1 lg:flex xl:gap-1"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-base font-semibold text-navy/85 transition-colors hover:bg-[#EEF2F7] hover:text-navy lg:px-2.5 lg:py-1 lg:text-[15px]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {authEnabled ? (
            <Link
              href="/sign-in"
              className="hidden rounded-md border border-border px-3.5 py-1.5 text-base font-semibold text-navy hover:bg-surface-soft sm:inline-flex"
            >
              Sign in
            </Link>
          ) : null}

          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-navy lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-haspopup="dialog"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </Container>

      {mobileDrawer}
    </header>
  );
}
