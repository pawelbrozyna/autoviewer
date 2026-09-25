"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegistrationInput } from "@/components/vehicle/RegistrationInput";
import { analytics } from "@/lib/analytics";
import {
  isValidRegistrationFormat,
  normalizeRegistration,
  registrationToSlug,
} from "@/lib/vehicle/registration";

export function CompareSearchForm({
  defaultLeft = "AB12 CDE",
  defaultRight = "CD34 EFG",
}: {
  defaultLeft?: string;
  defaultRight?: string;
}) {
  const router = useRouter();
  const [left, setLeft] = useState(normalizeRegistration(defaultLeft));
  const [right, setRight] = useState(normalizeRegistration(defaultRight));
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!isValidRegistrationFormat(left) || !isValidRegistrationFormat(right)) {
      setError("Enter two valid UK registration numbers.");
      return;
    }
    if (left === right) {
      setError("Enter two different registrations to compare.");
      return;
    }
    setError(null);
    analytics.compareStarted();
    router.push(
      `/compare-cars?left=${registrationToSlug(left)}&right=${registrationToSlug(right)}`,
    );
  }

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-2 lg:w-fit lg:flex-row lg:items-start">
        <RegistrationInput
          defaultValue={defaultLeft}
          showButton={false}
          variant="compact"
          onChange={(normalized) => {
            setLeft(normalized);
            setError(null);
          }}
          onSubmitValid={submit}
        />
        <RegistrationInput
          defaultValue={defaultRight}
          showButton={false}
          variant="compact"
          onChange={(normalized) => {
            setRight(normalized);
            setError(null);
          }}
          onSubmitValid={submit}
        />
        <button
          type="button"
          onClick={submit}
          className="inline-flex h-[55px] w-full shrink-0 items-center justify-center rounded-[13px] bg-navy px-5 text-[16.5px] font-semibold text-white transition-all duration-150 hover:bg-navy-soft hover:shadow-md hover:brightness-110 active:scale-[0.98] lg:h-[49px] lg:w-auto lg:rounded-[10px] lg:px-4.5 lg:text-[17.5px]"
        >
          Compare cars →
        </button>
      </div>
      <p
        role="alert"
        aria-live="polite"
        className={`mt-1.5 h-[1.25rem] overflow-hidden text-[14px] leading-none text-danger md:text-[15px] md:leading-none ${error ? "" : "invisible"}`}
      >
        {error || "placeholder"}
      </p>
    </div>
  );
}
