"use client";

import { createContext, useContext, useState } from "react";
import type { DvlaVehicleResponse } from "@/lib/api/dvla";

type DvlaLookupContextValue = {
  vehicle: DvlaVehicleResponse | null;
  setVehicle: (vehicle: DvlaVehicleResponse | null) => void;
};

const DvlaLookupContext = createContext<DvlaLookupContextValue | null>(null);

export function DvlaLookupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [vehicle, setVehicle] = useState<DvlaVehicleResponse | null>(null);

  return (
    <DvlaLookupContext.Provider value={{ vehicle, setVehicle }}>
      {children}
    </DvlaLookupContext.Provider>
  );
}

export function useDvlaLookup() {
  return useContext(DvlaLookupContext);
}
