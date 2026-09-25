"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDvlaLookup } from "@/components/vehicle/DvlaLookupContext";
import { RegistrationInput } from "@/components/vehicle/RegistrationInput";
import { analytics, type CheckSource } from "@/lib/analytics";
import type { DvlaVehicleResponse } from "@/lib/api/dvla";
import { registrationToSlug } from "@/lib/vehicle/registration";

export function VehicleSearchForm({
  defaultValue = "",
  buttonLabel = "Check vehicle →",
  variant = "large",
  className,
  checkSource = "unknown",
  inlineDvlaLookup = false,
}: {
  defaultValue?: string;
  buttonLabel?: string;
  variant?: "large" | "compact";
  className?: string;
  checkSource?: CheckSource;
  inlineDvlaLookup?: boolean;
}) {
  const router = useRouter();
  const dvlaLookup = useDvlaLookup();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup(normalized: string) {
    analytics.vehicleCheckStarted(checkSource);

    if (!inlineDvlaLookup) {
      router.push(`/vehicle/${registrationToSlug(normalized)}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    dvlaLookup?.setVehicle(null);

    try {
      const response = await fetch("/api/vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber: normalized }),
      });
      const payload = (await response.json()) as DvlaVehicleResponse & {
        error?: string;
      };

      if (!response.ok || payload.error) {
        setError(
          payload.error
            ? payload.error
            : "Vehicle lookup failed. Please try again.",
        );
        return;
      }

      dvlaLookup?.setVehicle(payload);
    } catch {
      setError("Vehicle lookup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <RegistrationInput
      defaultValue={defaultValue}
      buttonLabel={buttonLabel}
      variant={variant}
      className={className}
      loading={isLoading}
      externalError={error}
      reserveErrorSpace
      onSubmitValid={handleLookup}
      onChange={() => {
        if (inlineDvlaLookup) {
          setError(null);
          dvlaLookup?.setVehicle(null);
        }
      }}
    />
  );
}
