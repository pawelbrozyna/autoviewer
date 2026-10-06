"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeftRight,
  BookOpen,
  Calculator,
  ChevronRight,
  ClipboardCheck,
  Gauge,
  LogIn,
  Menu,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Container } from "@/components/ui/Container";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

const authEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";

const mobileNavIcons: Record<(typeof navLinks)[number]["href"], LucideIcon> = {
  "/check-a-vehicle": Search,
  "/mot-history": ClipboardCheck,
  "/mileage-check": Gauge,
  "/compare-cars": ArrowLeftRight,
  "/running-costs": Calculator,
  "/guides": BookOpen,
};

function MobileMenuLink({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3.5 py-3.5 text-base font-semibold text-[#012046] transition-colors hover:bg-surface-soft focus-visible:bg-surface-soft focus-visible:outline-none"
      onClick={onNavigate}
    >
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#EEF3FA] text-navy">
        <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
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

      const focusable = [
        menuButtonRef.current,
        ...drawerRef.current.querySelectorAll<HTMLElement>("a[href]"),
      ].filter((el): el is HTMLElement => Boolean(el));
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
      drawerRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
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
          tabIndex={-1}
          aria-label="Close menu"
          className={cn(
            "fixed inset-x-0 bottom-0 top-[59px] z-[100] bg-[rgba(0,20,50,0.28)] transition-opacity duration-200 ease-out md:top-[69px]",
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
            "fixed right-3 top-[66px] z-[110] w-[min(273px,calc(100vw-24px))] origin-top-right transition duration-200 ease-out md:right-6 md:top-[76px]",
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
          )}
        >
          <nav
            className="max-h-[calc(100dvh-80px)] overflow-y-auto"
            aria-label="Mobile"
          >
            <div className="divide-y divide-[#E6EBF2] overflow-hidden rounded-[12px] border border-border bg-white shadow-[0_8px_24px_rgba(7,26,61,0.14)]">
              {navLinks.map((link) => (
                <MobileMenuLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={mobileNavIcons[link.href]}
                  onNavigate={closeMenu}
                />
              ))}
              {authEnabled ? (
                <MobileMenuLink
                  href="/sign-in"
                  label="Sign in"
                  icon={LogIn}
                  onNavigate={closeMenu}
                />
              ) : null}
            </div>
          </nav>
        </div>
      </div>,
      document.body,
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <Container className="flex h-[58px] items-center justify-between gap-4 md:h-[68px] lg:h-[62px] lg:gap-3">
        <BrandLogo size="header" />

        <nav
          className="hidden items-center gap-1 lg:flex xl:gap-1"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-base font-semibold text-navy/85 transition-colors hover:bg-[#EEF2F7] hover:text-navy lg:px-2.5 lg:py-1 lg:text-[16px]"
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
            {open ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </Container>

      {mobileDrawer}
    </header>
  );
}
