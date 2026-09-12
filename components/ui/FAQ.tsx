"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export function FAQ({
  items,
  className,
}: {
  items: Array<{ question: string; answer: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "divide-y divide-border rounded-[12px] border border-border bg-surface",
        className,
      )}
    >
      {items.map((item) => (
        <FAQItem key={item.question} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="px-4 py-3.5 md:px-5">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-[15px] font-semibold text-navy md:text-base">
          {question}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-transform",
            open && "rotate-45",
          )}
        >
          +
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        hidden={!open}
        className="support-copy pt-2.5"
      >
        {answer}
      </div>
    </div>
  );
}
