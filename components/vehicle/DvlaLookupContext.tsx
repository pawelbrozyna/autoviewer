"use client";

import { Fragment, createContext, useContext, useEffect, useState } from "react";
import type { VehicleRecord } from "@/types/vehicle";

/** Dispatched on window when the user asks to return to a fresh home page. */
export const RESET_LOOKUP_EVENT = "autoviewer:reset-lookup";

type DvlaLookupContextValue = {
  vehicle: VehicleRecord | null;
  setVehicle: (vehicle: VehicleRecord | null) => void;
};

const DvlaLookupContext = createContext<DvlaLookupContextValue | null>(null);

export function DvlaLookupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    function reset() {
      setVehicle(null);
      setResetKey((key) => key + 1);
    }
    window.addEventListener(RESET_LOOKUP_EVENT, reset);
    return () => window.removeEventListener(RESET_LOOKUP_EVENT, reset);
  }, []);

  return (
    <DvlaLookupContext.Provider value={{ vehicle, setVehicle }}>
      <Fragment key={resetKey}>{children}</Fragment>
    </DvlaLookupContext.Provider>
  );
}

export function useDvlaLookup() {
  return useContext(DvlaLookupContext);
}

/** Renders children only while no inline lookup result is shown. */
export function HiddenWhenLookupResult({
  children,
}: {
  children: React.ReactNode;
}) {
  const lookup = useDvlaLookup();
  if (lookup?.vehicle) return null;
  return <>{children}</>;
}
