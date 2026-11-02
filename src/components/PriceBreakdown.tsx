import { memo } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatMoneyWithSymbol } from "@/lib/pricing";

type Amount = {
  value: number;
  currencySymbol?: string | null;
  currencyCode?: string | null;
};

function formatAmount(amount: Amount) {
  if (amount.currencySymbol) return formatMoneyWithSymbol(amount.value, amount.currencySymbol);
  const code = amount.currencyCode?.trim();
  return code ? `${code} ${amount.value.toFixed(2)}` : amount.value.toFixed(2);
}

export const PriceBreakdown = memo(function PriceBreakdown(props: {
  className?: string;
  /** Total including tax, before Orive fee */
  totalInclTax: Amount;
  /** Optional tax line item */
  tax?: Amount;
  taxLabel?: string;
  /** Orive matching fee amount */
  oriveFee: Amount;
  oriveFeeLabel?: string;
  /** Final amount due (totalInclTax + oriveFee) */
  amountDue: Amount;
  amountDueLabel?: string;

  separatorClassName?: string;

  /** Styling hooks for consumers on dark backgrounds */
  mutedClassName?: string;
  valueClassName?: string;
  totalValueClassName?: string;
}) {
  const {
    className,
    totalInclTax,
    tax,
    taxLabel = "Tax",
    oriveFee,
    oriveFeeLabel = "Orive matching fee (5%)",
    amountDue,
    amountDueLabel = "Amount due",
    separatorClassName,
    mutedClassName = "text-muted-foreground",
    valueClassName = "font-medium text-foreground",
    totalValueClassName = "text-xl font-bold text-foreground",
  } = props;

  return (
    <div className={cn("space-y-3", className)}>
      {tax ? (
        <div className="flex justify-between text-sm">
          <span className={mutedClassName}>{taxLabel}</span>
          <span className={valueClassName}>{formatAmount(tax)}</span>
        </div>
      ) : null}

      <div className="flex justify-between text-sm">
        <span className={mutedClassName}>Total (incl. tax)</span>
        <span className={valueClassName}>{formatAmount(totalInclTax)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className={mutedClassName}>{oriveFeeLabel}</span>
        <span className={valueClassName}>{formatAmount(oriveFee)}</span>
      </div>

      <Separator className={cn("bg-border", separatorClassName)} />

      <div className="flex justify-between items-baseline">
        <span className={cn("text-base font-semibold", "text-foreground")}>{amountDueLabel}</span>
        <span className={totalValueClassName}>{formatAmount(amountDue)}</span>
      </div>
    </div>
  );
});
