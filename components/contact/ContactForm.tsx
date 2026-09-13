"use client";

import { useState } from "react";
import { CONTACT_MESSAGE_MAX, CONTACT_MESSAGE_MIN } from "@/lib/contact";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

const FALLBACK_ERROR = "Something went wrong. Please try again.";

function asTrimmedString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateContactFields(input: {
  name: string;
  email: string;
  message: string;
}): string | null {
  if (!input.message || input.message.length < CONTACT_MESSAGE_MIN) {
    return "Message must be at least 5 characters.";
  }
  if (input.message.length > CONTACT_MESSAGE_MAX) {
    return "Message must be at most 1000 characters.";
  }
  if (input.email && !isValidEmail(input.email)) {
    return "Please provide a valid email address.";
  }
  if (input.name.length > 120) {
    return "Name is too long.";
  }
  return null;
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = asTrimmedString(formData.get("name"));
    const email = asTrimmedString(formData.get("email"));
    const message = asTrimmedString(formData.get("message"));
    const company = asTrimmedString(formData.get("company"));

    const clientError = validateContactFields({ name, email, message });
    if (clientError) {
      setStatus("error");
      setErrorMessage(clientError);
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          company,
        }),
      });

      let payload: { success?: boolean; error?: string } = {};
      try {
        payload = (await response.json()) as {
          success?: boolean;
          error?: string;
        };
      } catch {
        payload = {};
      }

      if (!response.ok || payload.success !== true) {
        setStatus("error");
        setErrorMessage(
          typeof payload.error === "string" && payload.error.trim()
            ? payload.error.trim()
            : FALLBACK_ERROR,
        );
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage(FALLBACK_ERROR);
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-[12px] border border-success/25 bg-success-bg px-4 py-4"
      >
        <p className="text-[15px] font-semibold text-success md:text-[16px]">
          Message sent successfully.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {/* Honeypot: leave empty; bots often fill it */}
      <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="company">Company</label>
        <input
          id="company"
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-[13px] font-semibold text-navy">
          Name <span className="font-medium text-muted">(optional)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          maxLength={120}
          autoComplete="name"
          className="w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-[15px] text-navy outline-none transition focus:border-blue"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-navy">
          Email <span className="font-medium text-muted">(optional)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-[15px] text-navy outline-none transition focus:border-blue"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-[13px] font-semibold text-navy">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={CONTACT_MESSAGE_MIN}
          maxLength={CONTACT_MESSAGE_MAX}
          rows={5}
          className="w-full resize-y rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-[15px] text-navy outline-none transition focus:border-blue"
          placeholder="How can we help?"
        />
        <p className="mt-1.5 text-[12px] text-muted">
          {CONTACT_MESSAGE_MIN}-{CONTACT_MESSAGE_MAX} characters
        </p>
      </div>

      {status === "error" ? (
        <p role="alert" className="text-[14px] font-medium text-danger md:text-[15px]">
          {errorMessage ?? FALLBACK_ERROR}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "inline-flex min-h-[48px] w-full items-center justify-center rounded-[10px] bg-navy px-5 text-[16px] font-semibold text-white transition-all duration-150",
          "hover:bg-navy-soft hover:shadow-md hover:brightness-110 active:scale-[0.99]",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none disabled:hover:brightness-100",
          "sm:w-auto sm:min-w-[180px]",
        )}
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
