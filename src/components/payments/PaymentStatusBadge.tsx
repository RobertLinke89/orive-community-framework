import { Badge } from "@/components/ui/badge";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

function normalize(status?: string | null): PaymentStatus {
  if (status === "paid" || status === "refunded" || status === "unpaid") return status;
  return "unpaid";
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  const s = normalize(status);

  const variant = s === "paid" ? "default" : s === "refunded" ? "outline" : "secondary";
  const label = s === "paid" ? "Paid" : s === "refunded" ? "Refunded" : "Unpaid";

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
