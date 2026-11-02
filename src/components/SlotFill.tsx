import { cn } from "@/lib/utils";

export function slotFill(booked: number, capacity?: number | null) {
  const cap = Math.max(capacity ?? 0, 0);
  if (!cap) return null;
  const taken = Math.min(Math.max(booked, 0), cap);
  const open = cap - taken;
  const percent = Math.round((taken / cap) * 100);
  return { open, percent, cap, taken };
}

export default function SlotFill({
  booked,
  capacity,
  isDe,
  className,
}: {
  booked: number;
  capacity?: number | null;
  isDe: boolean;
  className?: string;
}) {
  const fill = slotFill(booked, capacity);
  if (!fill) return null;
  const openLabel = isDe ? `${fill.open} offen` : `${fill.open} open`;
  return (
    <span className={cn("block min-w-[6.5rem]", className)}>
      <span className="mb-1 flex items-baseline justify-between gap-3 text-xs tabular-nums text-slate-500">
        <span>{openLabel}</span>
        <span>{fill.percent}%</span>
      </span>
      <span className="block h-1 overflow-hidden bg-slate-200 dark:bg-white/10" aria-hidden>
        <span className="block h-full bg-[#017F80]" style={{ width: `${fill.percent}%` }} />
      </span>
    </span>
  );
}
