import { FullReportUpsellCard } from "@/components/reports/FullReportUpsellCard";
import { Container } from "@/components/ui/Container";
import { CheckoutStatusNoticeFromUrl } from "@/components/vehicle/CheckoutCancelledNotice";

export function FullReportUpsell() {
  return (
    <section className="bg-[#F9FBFE] pt-5 md:bg-surface-soft md:pt-6">
      <Container>
        <CheckoutStatusNoticeFromUrl />
        <FullReportUpsellCard registration={null} genericSource="home" />
      </Container>
    </section>
  );
}
