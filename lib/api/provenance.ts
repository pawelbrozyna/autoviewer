import type {
  VehicleProvenance,
  VehicleProvenanceProvider,
} from "@/types/vehicle";

/**
 * Placeholder for future commercial vehicle-history providers
 * (finance, stolen, write-off, keeper/provenance, etc.).
 * Official DVLA/DVSA data does not include these fields.
 */
export class NullProvenanceProvider implements VehicleProvenanceProvider {
  async lookup(registration: string): Promise<VehicleProvenance | null> {
    void registration;
    return null;
  }
}

export function getProvenanceProvider(): VehicleProvenanceProvider {
  return new NullProvenanceProvider();
}
