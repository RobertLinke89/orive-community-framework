import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold tracking-tight text-slate-900 dark:text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 backdrop-blur-sm transition-colors",
          "hover:border-[#00CDAC]/40 hover:bg-[#00CDAC]/10 hover:text-[#008975]",
          "dark:border-white/12 dark:bg-white/5 dark:text-white/70",
          "dark:hover:border-[#00CDAC]/35 dark:hover:bg-[#00CDAC]/15 dark:hover:text-[#00CDAC]",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell:
          "text-slate-400 dark:text-white/40 rounded-md w-9 font-medium text-[0.7rem] uppercase tracking-wide",
        row: "flex w-full mt-1.5",
        cell: cn(
          "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected].day-range-end)]:rounded-r-full",
          "[&:has([aria-selected].day-range-start)]:rounded-l-full",
          "[&:has([aria-selected].day-outside)]:bg-[#00CDAC]/10",
          "[&:has([aria-selected])]:bg-[#00CDAC]/12",
          "first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full",
        ),
        day: cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full p-0 text-sm font-medium",
          "text-slate-700 transition-colors hover:bg-[#00CDAC]/15 hover:text-[#008975]",
          "dark:text-white/80 dark:hover:bg-[#00CDAC]/20 dark:hover:text-[#00CDAC]",
          "aria-selected:opacity-100",
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#00CDAC] text-white hover:bg-[#02AAB0] hover:text-white focus:bg-[#00CDAC] focus:text-white dark:bg-[#00CDAC] dark:text-[#01223F] dark:hover:bg-[#02AAB0] dark:hover:text-white",
        day_today:
          "border border-[#00CDAC]/55 text-[#008975] dark:border-[#00CDAC]/50 dark:text-[#00CDAC]",
        day_outside:
          "day-outside text-slate-300 opacity-50 aria-selected:bg-[#00CDAC]/10 aria-selected:text-slate-400 dark:text-white/25",
        day_disabled: "text-slate-300 opacity-40 dark:text-white/20",
        day_range_middle:
          "aria-selected:bg-[#00CDAC]/15 aria-selected:text-[#008975] dark:aria-selected:bg-[#00CDAC]/18 dark:aria-selected:text-[#00CDAC] rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
