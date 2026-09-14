import { CheckCircle2, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { MotResult, TaxStatusValue } from "@/types/vehicle";

export function MotResultBadge({ result }: { result: MotResult }) {
  if (result === "PASS") {
    return (
      <StatusBadge
        tone="success"
        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
        className="min-w-[4.75rem] justify-center"
      >
        PASS
      </StatusBadge>
    );
  }
  if (result === "FAIL") {
    return (
      <StatusBadge
        tone="danger"
        icon={<AlertTriangle className="h-3.5 w-3.5" />}
        className="min-w-[4.75rem] justify-center"
      >
        FAIL
      </StatusBadge>
    );
  }
  return (
    <StatusBadge className="min-w-[4.75rem] justify-center">UNKNOWN</StatusBadge>
  );
}

export function TaxStatusBadge({ status }: { status: TaxStatusValue }) {
  if (status === "Taxed") {
    return (
      <StatusBadge tone="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
        Taxed
      </StatusBadge>
    );
  }
  if (status === "SORN") {
    return (
      <StatusBadge tone="warning" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
        SORN
      </StatusBadge>
    );
  }
  if (status === "Untaxed") {
    return (
      <StatusBadge tone="danger" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
        Untaxed
      </StatusBadge>
    );
  }
  return <StatusBadge>Tax unknown</StatusBadge>;
}
