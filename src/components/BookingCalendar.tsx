"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMinutes,
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { de, enGB } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import SlotFill from "@/components/SlotFill";

export type BookingEntry = {
  id: string;
  title: string;
  start: Date;
  durationMin: number;
  location?: string;
  spots?: number;
  booked?: number;
};

type CalendarView = "day" | "week" | "month" | "year";

const HOURS = Array.from({ length: 16 }, (_, index) => index + 7);
const WEEK_OPTS = { weekStartsOn: 1 as const };

function eventsOn(entries: BookingEntry[], day: Date) {
  return entries
    .filter((entry) => isSameDay(entry.start, day))
    .sort((a, b) => +a.start - +b.start);
}

function hourOf(entry: BookingEntry) {
  return entry.start.getHours();
}

export default function BookingCalendar({
  entries,
  isDe,
  onCreate,
  onOpen,
}: {
  entries: BookingEntry[];
  isDe: boolean;
  onCreate?: (day: Date, hour?: number) => void;
  onOpen?: (id: string) => void;
}) {
  const { copy } = useLanguage();
  const dfLocale = isDe ? de : enGB;
  const [view, setView] = useState<CalendarView>("day");
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pick = (id: string) => {
    setSelectedId(id);
    onOpen?.(id);
  };

  const selected = entries.find((entry) => entry.id === selectedId) || null;

  const views: { id: CalendarView; label: string }[] = [
    { id: "day", label: copy("Tag", "Day") },
    { id: "week", label: copy("Woche", "Week") },
    { id: "month", label: copy("Monat", "Month") },
    { id: "year", label: copy("Jahr", "Year") },
  ];

  const periodLabel = useMemo(() => {
    if (view === "day") {
      return format(cursor, isDe ? "EEEE, d. MMMM yyyy" : "EEEE d MMMM yyyy", { locale: dfLocale });
    }
    if (view === "week") {
      const start = startOfWeek(cursor, WEEK_OPTS);
      const end = endOfWeek(cursor, WEEK_OPTS);
      if (isDe && start.getMonth() === end.getMonth()) {
        return `${format(start, "d.")}–${format(end, "d. MMMM yyyy", { locale: dfLocale })}`;
      }
      return `${format(start, "d MMM", { locale: dfLocale })} – ${format(end, "d MMM yyyy", { locale: dfLocale })}`;
    }
    if (view === "month") return format(cursor, "MMMM yyyy", { locale: dfLocale });
    return format(cursor, "yyyy");
  }, [cursor, view, dfLocale, isDe]);

  const shift = (direction: -1 | 1) => {
    setCursor((current) => {
      if (view === "day") return addDays(current, direction);
      if (view === "week") return addWeeks(current, direction);
      if (view === "month") return addMonths(current, direction);
      return addYears(current, direction);
    });
  };

  const openDay = (day: Date) => {
    setCursor(day);
    setView("day");
  };

  const weekdayLabels = eachDayOfInterval({
    start: startOfWeek(new Date(), WEEK_OPTS),
    end: endOfWeek(new Date(), WEEK_OPTS),
  }).map((day) => format(day, "EEEEEE", { locale: dfLocale }));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center">
          <button type="button" onClick={() => shift(-1)} className="flex h-11 w-11 items-center justify-center text-slate-500" aria-label={copy("Zurück", "Previous")}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => shift(1)} className="flex h-11 w-11 items-center justify-center text-slate-500" aria-label={copy("Weiter", "Next")}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <h2 className="min-w-0 flex-1 text-base font-semibold capitalize sm:text-lg">{periodLabel}</h2>
        <button
          type="button"
          onClick={() => setCursor(new Date())}
          className="h-9 px-3 text-sm text-slate-500"
        >
          {copy("Heute", "Today")}
        </button>
      </div>

      <div className="mt-3 flex gap-5 border-b border-slate-200 dark:border-white/10">
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            aria-pressed={view === item.id}
            className={cn(
              "-mb-px border-b pb-2 text-sm",
              view === item.id
                ? "border-[#01223F] font-medium dark:border-white"
                : "border-transparent text-slate-400"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {view === "day" && (
          <DayView
            day={cursor}
            entries={eventsOn(entries, cursor)}
            isDe={isDe}
            dfLocale={dfLocale}
            selectedId={selectedId}
            onSelect={pick}
            onCreate={onCreate}
          />
        )}
        {view === "week" && (
          <WeekView
            cursor={cursor}
            entries={entries}
            weekdayLabels={weekdayLabels}
            dfLocale={dfLocale}
            selectedId={selectedId}
            onSelect={pick}
            onOpenDay={openDay}
            onCreate={onCreate}
          />
        )}
        {view === "month" && (
          <MonthView
            cursor={cursor}
            entries={entries}
            weekdayLabels={weekdayLabels}
            onOpenDay={openDay}
            onSelect={pick}
            selectedId={selectedId}
          />
        )}
        {view === "year" && (
          <YearView
            cursor={cursor}
            entries={entries}
            weekdayLabels={weekdayLabels}
            dfLocale={dfLocale}
            onOpenMonth={(month) => {
              setCursor(month);
              setView("month");
            }}
            onOpenDay={openDay}
          />
        )}
      </div>

      {selected && (
        <div className="mt-4 border border-slate-200 px-4 py-3 dark:border-white/10">
          <p className="font-medium">{selected.title}</p>
          <p className="mt-1 text-sm text-slate-500">
            {format(selected.start, "EEE, d. MMM, HH:mm", { locale: dfLocale })}
            {" – "}
            {format(addMinutes(selected.start, selected.durationMin || 60), "HH:mm")}
            {selected.location ? ` · ${selected.location}` : ""}
          </p>
          <SlotFill booked={selected.booked ?? 0} capacity={selected.spots} isDe={isDe} className="mt-3 max-w-[12rem]" />
        </div>
      )}
    </div>
  );
}

function DayView({
  day,
  entries,
  isDe,
  dfLocale,
  selectedId,
  onSelect,
  onCreate,
}: {
  day: Date;
  entries: BookingEntry[];
  isDe: boolean;
  dfLocale: typeof de;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate?: (day: Date, hour?: number) => void;
}) {
  const { copy } = useLanguage();
  const early = entries.filter((entry) => hourOf(entry) < HOURS[0]);
  const late = entries.filter((entry) => hourOf(entry) > HOURS[HOURS.length - 1]);

  return (
    <div className="border border-slate-200 dark:border-white/10">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-white/10">
        <p className="text-sm text-slate-500">{format(day, "EEEE", { locale: dfLocale })}</p>
        {onCreate && (
          <button type="button" onClick={() => onCreate(day)} className="text-sm text-[#017F80]">
            {copy("Termin anlegen", "Add a date")}
          </button>
        )}
      </div>
      {early.length > 0 && <HourEvents label={copy("Früher", "Earlier")} entries={early} selectedId={selectedId} onSelect={onSelect} />}
      {HOURS.map((hour) => {
        const inHour = entries.filter((entry) => hourOf(entry) === hour);
        return (
          <div key={hour} className="grid grid-cols-[3.25rem_1fr] border-b border-slate-100 last:border-0 dark:border-white/5">
            <div className="px-2 py-2 text-[11px] tabular-nums text-slate-400">{String(hour).padStart(2, "0")}:00</div>
            <div
              onClick={() => onCreate?.(day, hour)}
              className="min-h-12 cursor-pointer border-l border-slate-100 px-2 py-1 text-left dark:border-white/5"
            >
              <div className="space-y-1">
                {inHour.map((entry) => (
                  <EventChip key={entry.id} entry={entry} selected={entry.id === selectedId} onSelect={onSelect} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
      {late.length > 0 && <HourEvents label={copy("Später", "Later")} entries={late} selectedId={selectedId} onSelect={onSelect} />}
    </div>
  );
}

function WeekView({
  cursor,
  entries,
  weekdayLabels,
  dfLocale,
  selectedId,
  onSelect,
  onOpenDay,
  onCreate,
}: {
  cursor: Date;
  entries: BookingEntry[];
  weekdayLabels: string[];
  dfLocale: typeof de;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenDay: (day: Date) => void;
  onCreate?: (day: Date, hour?: number) => void;
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(cursor, WEEK_OPTS),
    end: endOfWeek(cursor, WEEK_OPTS),
  });

  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-white/10">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[3.25rem_repeat(7,1fr)] border-b border-slate-200 dark:border-white/10">
          <div />
          {days.map((day, index) => (
            <button key={day.toISOString()} type="button" onClick={() => onOpenDay(day)} className="px-1 py-2 text-center">
              <span className="block text-[11px] uppercase tracking-[0.08em] text-slate-400">{weekdayLabels[index]}</span>
              <span className={cn(
                "mx-auto mt-1 flex h-7 w-7 items-center justify-center text-sm",
                isToday(day) && "bg-[#01223F] text-white dark:bg-white dark:text-[#01223F]"
              )}>
                {format(day, "d", { locale: dfLocale })}
              </span>
            </button>
          ))}
        </div>
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-[3.25rem_repeat(7,1fr)] border-b border-slate-100 last:border-0 dark:border-white/5">
            <div className="px-2 py-2 text-[11px] tabular-nums text-slate-400">{String(hour).padStart(2, "0")}</div>
            {days.map((day) => {
              const inHour = eventsOn(entries, day).filter((entry) => hourOf(entry) === hour);
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => onCreate?.(day, hour)}
                  className={cn(
                    "min-h-11 cursor-pointer border-l border-slate-100 px-1 py-1 text-left dark:border-white/5",
                    isToday(day) && "bg-slate-50 dark:bg-white/[0.03]"
                  )}
                >
                  {inHour.map((entry) => (
                    <EventChip key={entry.id} entry={entry} selected={entry.id === selectedId} onSelect={onSelect} compact />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthView({
  cursor,
  entries,
  weekdayLabels,
  onOpenDay,
  onSelect,
  selectedId,
}: {
  cursor: Date;
  entries: BookingEntry[];
  weekdayLabels: string[];
  onOpenDay: (day: Date) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  const monthStart = startOfMonth(cursor);
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, WEEK_OPTS),
    end: endOfWeek(endOfMonth(cursor), WEEK_OPTS),
  });

  return (
    <div className="border border-slate-200 dark:border-white/10">
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-white/10">
        {weekdayLabels.map((label) => (
          <div key={label} className="px-1 py-2 text-center text-[11px] uppercase tracking-[0.08em] text-slate-400">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = eventsOn(entries, day);
          const inMonth = isSameMonth(day, cursor);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-16 border-b border-r border-slate-100 p-1 dark:border-white/5 sm:min-h-24",
                !inMonth && "bg-slate-50/80 dark:bg-white/[0.02]"
              )}
            >
              <button
                type="button"
                onClick={() => onOpenDay(day)}
                className={cn(
                  "flex h-6 w-6 items-center justify-center text-xs",
                  isToday(day) && "bg-[#01223F] text-white dark:bg-white dark:text-[#01223F]",
                  !inMonth && !isToday(day) && "text-slate-300 dark:text-white/25"
                )}
              >
                {format(day, "d")}
              </button>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 2).map((entry) => (
                  <EventChip key={entry.id} entry={entry} selected={entry.id === selectedId} onSelect={onSelect} compact />
                ))}
                {dayEvents.length > 2 && (
                  <p className="px-1 text-[10px] text-slate-400">+{dayEvents.length - 2}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function YearView({
  cursor,
  entries,
  weekdayLabels,
  dfLocale,
  onOpenMonth,
  onOpenDay,
}: {
  cursor: Date;
  entries: BookingEntry[];
  weekdayLabels: string[];
  dfLocale: typeof de;
  onOpenMonth: (month: Date) => void;
  onOpenDay: (day: Date) => void;
}) {
  const year = cursor.getFullYear();
  const months = Array.from({ length: 12 }, (_, index) => new Date(year, index, 1));

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {months.map((month) => {
        const days = eachDayOfInterval({
          start: startOfWeek(startOfMonth(month), WEEK_OPTS),
          end: endOfWeek(endOfMonth(month), WEEK_OPTS),
        });
        return (
          <section key={month.toISOString()}>
            <button type="button" onClick={() => onOpenMonth(month)} className="text-sm font-medium capitalize">
              {format(month, "MMMM", { locale: dfLocale })}
            </button>
            <div className="mt-2 grid grid-cols-7">
              {weekdayLabels.map((label) => (
                <div key={label} className="pb-1 text-center text-[9px] uppercase text-slate-400">{label}</div>
              ))}
              {days.map((day) => {
                const count = eventsOn(entries, day).length;
                const inMonth = isSameMonth(day, month);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => onOpenDay(day)}
                    className="flex h-7 items-center justify-center"
                    aria-label={format(day, "d. MMMM", { locale: dfLocale })}
                  >
                    <span className={cn(
                      "flex h-6 w-6 items-center justify-center text-[11px]",
                      !inMonth && "text-transparent",
                      inMonth && count > 0 && "bg-[#01223F] text-white dark:bg-white dark:text-[#01223F]",
                      inMonth && count === 0 && isToday(day) && "ring-1 ring-[#01223F] dark:ring-white"
                    )}>
                      {inMonth ? format(day, "d") : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function HourEvents({
  label,
  entries,
  selectedId,
  onSelect,
}: {
  label: string;
  entries: BookingEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="border-b border-slate-100 px-3 py-2 dark:border-white/5">
      <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <div className="space-y-1">
        {entries.map((entry) => (
          <EventChip key={entry.id} entry={entry} selected={entry.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function EventChip({
  entry,
  selected,
  onSelect,
  compact,
}: {
  entry: BookingEntry;
  selected: boolean;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect(entry.id);
      }}
      className={cn(
        "block w-full px-1.5 py-0.5 text-left text-[11px]",
        selected
          ? "bg-[#017F80] text-white"
          : "bg-[#01223F] text-white dark:bg-white dark:text-[#01223F]"
      )}
    >
      <span className="block truncate">{compact ? entry.title : `${format(entry.start, "HH:mm")} ${entry.title}`}</span>
      {entry.spots ? (
        <span className={cn("mt-0.5 block h-0.5 overflow-hidden", selected ? "bg-white/30" : "bg-white/25 dark:bg-[#01223F]/15")}>
          <span
            className={cn("block h-full", selected ? "bg-white" : "bg-white dark:bg-[#017F80]")}
            style={{ width: `${Math.round((Math.min(entry.booked ?? 0, entry.spots) / entry.spots) * 100)}%` }}
          />
        </span>
      ) : null}
    </button>
  );
}
