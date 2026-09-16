import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VehicleFullReport } from "@/components/vehicle/VehicleFullReport";
import { Container } from "@/components/ui/Container";
import { ErrorState } from "@/components/ui/EmptyState";
import { getMockVehicle } from "@/lib/api/mock";
import { lookupVehicle } from "@/lib/api/vehicle-service";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  formatRegistrationDisplay,
  isValidRegistrationFormat,
  normalizeRegistration,
} from "@/lib/vehicle/registration";

type PageProps = {
  params: Promise<{ registration: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { registration } = await params;
  const normalized = normalizeRegistration(registration);
  const display = formatRegistrationDisplay(normalized);
  return buildPageMetadata({
    title: `Vehicle check for ${display}`,
    description: `Vehicle history overview for ${display} including MOT, tax, mileage and available recall information.`,
    path: `/vehicle/${normalized}`,
    noIndex: true,
  });
}

export default async function VehicleResultPage({ params }: PageProps) {
  const { registration } = await params;
  const normalized = normalizeRegistration(registration);

  if (!isValidRegistrationFormat(normalized)) {
    return (
      <Container className="section-y">
        <ErrorState
          title="Enter a valid UK registration number."
          description="Registrations should be 2-8 letters and numbers after removing spaces."
        />
      </Container>
    );
  }

  const requestedResult = await lookupVehicle(normalized);
  const result =
    requestedResult.ok &&
    requestedResult.data.summary.registration === "CD34EFG"
      ? { ok: true as const, data: getMockVehicle("AV19SWF")! }
      : requestedResult;

  if (!result.ok) {
    return (
      <Container className="space-y-2.5 pb-8 pt-2 md:space-y-5 md:py-10 lg:py-9">
        <BackLink />
        <ErrorState title={result.error.message} />
      </Container>
    );
  }

  const vehicle = result.data;
  const { summary } = vehicle;

  return (
    <div className="bg-[#F9FBFE] pb-3 md:bg-surface-soft md:pb-14">
      <Container className="pb-4 pt-2 md:py-9">
        <BackLink />

        <div className="mt-2 md:mt-5">
          <VehicleFullReport
            vehicle={vehicle}
            ownersLabel={summary.isDemo ? "2" : null}
            mobileLargerImage
          />
        </div>
      </Container>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/check-a-vehicle"
      className="inline-flex items-center gap-2 text-[14px] font-semibold text-navy hover:text-blue md:text-[13px]"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to search
    </Link>
  );
}

