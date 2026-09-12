"use client";

import { useRouter } from "next/navigation";
import { RegistrationInput } from "@/components/vehicle/RegistrationInput";
import { analytics, type CheckSource } from "@/lib/analytics";
import { registrationToSlug } from "@/lib/vehicle/registration";

export function VehicleSearchForm({
  defaultValue = "",
  buttonLabel = "Check vehicle →",
  variant = "large",
  className,
  checkSource = "unknown",
}: {
  defaultValue?: string;
  buttonLabel?: string;
  variant?: "large" | "compact";
  className?: string;
  checkSource?: CheckSource;
}) {
  const router = useRouter();

  return (
    <RegistrationInput
      defaultValue={defaultValue}
      buttonLabel={buttonLabel}
      variant={variant}
      className={className}
      onSubmitValid={(normalized) => {
        analytics.vehicleCheckStarted(checkSource);
        router.push(`/vehicle/${registrationToSlug(normalized)}`);
      }}
    />
  );
}
