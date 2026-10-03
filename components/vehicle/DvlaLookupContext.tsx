"use client";

import { createContext, useContext, useState } from "react";
import type { VehicleRecord } from "@/types/vehicle";

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

  return (
    <DvlaLookupContext.Provider value={{ vehicle, setVehicle }}>
      {children}
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
