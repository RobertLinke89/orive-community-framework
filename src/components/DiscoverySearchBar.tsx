"use client";

import { useMemo, useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { de as deLocale, enUS } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, MapPin, Search, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { offeringSpan, spanOverlapsSearch } from "@/lib/offeringSpan";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

export type DiscoverySearch = {
  location: string;
  date: string;
  dateTo: string;
  query: string;
};

export const EMPTY_DISCOVERY: DiscoverySearch = { location: '', date: '', dateTo: '', query: '' };

export function matchesDiscovery(
  item: {
    title?: string | null;
    description?: string | null;
    location?: string | null;
    tags?: string[] | null;
    facilitator_name?: string | null;
    start_at?: string | null;
    end_at?: string | null;
    duration?: number | string | null;
  },
  search: DiscoverySearch
) {
  if (search.location.trim()) {
    const loc = (item.location || '').toLowerCase();
    if (!loc.includes(search.location.trim().toLowerCase())) return false;
  }
  if (search.date || search.dateTo) {
    if (!spanOverlapsSearch(offeringSpan(item), search.date, search.dateTo)) return false;
  }
  if (search.query.trim()) {
    const q = search.query.trim().toLowerCase();
    const text = [
      item.title,
      item.description,
      item.facilitator_name,
      item.location,
      ...(item.tags || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!text.includes(q)) return false;
  }
  return true;
}

const SUGGESTED_CITIES = [
  'Berlin',
  'Hamburg',
  'München',
  'Frankfurt',
  'Köln',
  'Leipzig',
  'Amsterdam',
  'Wien',
  'Zürich',
  'London',
];

function toIsoDay(date: Date | undefined): string {
  if (!date || !isValid(date)) return '';
  return format(date, 'yyyy-MM-dd');
}

function fromIsoDay(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

type DiscoverySearchBarProps = {
  value: DiscoverySearch;
  onChange: (next: DiscoverySearch) => void;
  onSubmit?: () => void;
  isDe?: boolean;
  cities?: string[];
  compact?: boolean;
};

export function DiscoverySearchBar({
  value,
  onChange,
  onSubmit,
  isDe = false,
  cities = SUGGESTED_CITIES,
  compact = false,
}: DiscoverySearchBarProps) {
  const { copy, language } = useLanguage();
  const listId = compact ? 'orive-discovery-cities-compact' : 'orive-discovery-cities';
  const [open, setOpen] = useState(false);
  const locale = language === 'de' || isDe ? deLocale : enUS;
  const dateShort = language === 'de' || isDe ? 'd. MMM' : 'MMM d';
  const dateLong = language === 'de' || isDe ? 'd. MMM yyyy' : 'MMM d, yyyy';

  const range = useMemo<DateRange | undefined>(() => {
    const from = fromIsoDay(value.date);
    const to = fromIsoDay(value.dateTo);
    if (!from && !to) return undefined;
    return { from, to };
  }, [value.date, value.dateTo]);

  const rangeLabel = useMemo(() => {
    if (value.date && value.dateTo) {
      const from = fromIsoDay(value.date);
      const to = fromIsoDay(value.dateTo);
      if (from && to) {
        return `${format(from, dateShort, { locale })} – ${format(to, dateShort, { locale })}`;
      }
    }
    if (value.date) {
      const from = fromIsoDay(value.date);
      if (from) return `${copy('Ab', 'From')} ${format(from, dateLong, { locale })}`;
    }
    if (value.dateTo) {
      const to = fromIsoDay(value.dateTo);
      if (to) return `${copy('Bis', 'To')} ${format(to, dateLong, { locale })}`;
    }
    return '';
  }, [value.date, value.dateTo, locale, dateShort, dateLong, copy]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className={cn("w-full", compact ? "max-w-none" : "max-w-4xl mx-auto px-2")}
    >
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-stretch bg-white dark:bg-[#02182B] overflow-hidden transition-colors",
          compact
            ? "rounded-lg border border-slate-200 dark:border-white/12"
            : "rounded-2xl sm:rounded-full border-2 border-slate-200 dark:border-white/15 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.12)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)] focus-within:border-[#00CDAC]"
        )}
      >
        <label className={cn("flex-1 min-w-0 flex items-center gap-3 cursor-text", compact ? "px-3.5 py-2.5" : "px-4 sm:px-5 py-3")}>
          <MapPin className="w-4 h-4 text-[#00CDAC] shrink-0" />
          <span className="min-w-0 flex-1">
            {compact ? (
              <span className="sr-only">{copy('Ort', 'Location')}</span>
            ) : (
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {copy('Wo', 'Where')}
              </span>
            )}
            <input
              type="text"
              list={listId}
              value={value.location}
              onChange={(event) => onChange({ ...value, location: event.target.value })}
              placeholder={copy('Berlin, Amsterdam…', 'Berlin, Amsterdam…')}
              className="w-full bg-transparent border-0 p-0 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/35 focus:outline-none focus:ring-0"
            />
          </span>
          {value.location ? (
            <button
              type="button"
              onClick={() => onChange({ ...value, location: '' })}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              aria-label={copy('Ort leeren', 'Clear location')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </label>

        <div className="hidden sm:block w-px bg-slate-200 dark:bg-white/10 my-3" />
        <div className="sm:hidden h-px bg-slate-200 dark:bg-white/10 mx-4" />

        <div className={cn("flex-[1.15] min-w-0 flex items-center gap-3", compact ? "px-3.5 py-2.5" : "px-4 sm:px-5 py-3")}>
          <CalendarIcon className="w-4 h-4 text-[#00CDAC] shrink-0" />
          <div className="min-w-0 flex-1">
            {compact ? null : (
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {copy('Wann', 'When')}
              </span>
            )}
            <div className="flex items-center gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "min-w-0 flex-1 text-left text-sm font-medium focus:outline-none",
                      rangeLabel ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-white/35"
                    )}
                  >
                    {rangeLabel || (copy('Von — Bis', 'From — To'))}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={10}
                  className="w-auto border-slate-200/80 bg-white p-0 shadow-xl dark:border-white/12 dark:bg-[#011B33] rounded-2xl overflow-hidden"
                >
                  <Calendar
                    mode="range"
                    numberOfMonths={1}
                    selected={range}
                    onSelect={(next) => {
                      onChange({
                        ...value,
                        date: toIsoDay(next?.from),
                        dateTo: toIsoDay(next?.to),
                      });
                      if (next?.from && next?.to) setOpen(false);
                    }}
                    defaultMonth={range?.from || new Date()}
                    locale={locale}
                    className="p-3"
                  />
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2.5 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        onChange({ ...value, date: '', dateTo: '' });
                        setOpen(false);
                      }}
                      className="text-xs font-medium text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    >
                      {copy('Leeren', 'Clear')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const today = toIsoDay(new Date());
                        onChange({ ...value, date: today, dateTo: today });
                        setOpen(false);
                      }}
                      className="text-xs font-semibold text-[#008975] hover:text-[#00CDAC] dark:text-[#00CDAC]"
                    >
                      {copy('Heute', 'Today')}
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
              {value.date || value.dateTo ? (
                <button
                  type="button"
                  onClick={() => onChange({ ...value, date: '', dateTo: '' })}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  aria-label={copy('Zeitraum leeren', 'Clear dates')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="hidden sm:block w-px bg-slate-200 dark:bg-white/10 my-3" />
        <div className="sm:hidden h-px bg-slate-200 dark:bg-white/10 mx-4" />

        <label className={cn("flex-[1.2] min-w-0 flex items-center gap-3 cursor-text", compact ? "px-3.5 py-2.5" : "px-4 sm:px-5 py-3")}>
          <Search className="w-4 h-4 text-[#00CDAC] shrink-0" />
          <span className="min-w-0 flex-1">
            {compact ? (
              <span className="sr-only">{copy('Thema', 'Topic')}</span>
            ) : (
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {copy('Was', 'What')}
              </span>
            )}
            <input
              type="search"
              value={value.query}
              onChange={(event) => onChange({ ...value, query: event.target.value })}
              placeholder={copy('Breathwork, Retreat…', 'Breathwork, retreat…')}
              className="w-full bg-transparent border-0 p-0 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/35 focus:outline-none focus:ring-0"
            />
          </span>
          {value.query ? (
            <button
              type="button"
              onClick={() => onChange({ ...value, query: '' })}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              aria-label={copy('Suche leeren', 'Clear search')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </label>

        <button
          type="submit"
          className={cn(
            "shrink-0 text-sm font-semibold text-white transition-colors bg-[#00CDAC] hover:bg-[#02AAB0]",
            compact
              ? "self-stretch px-5 py-2.5 sm:rounded-none"
              : "h-12 sm:m-1.5 sm:h-auto sm:self-stretch px-6 rounded-none sm:rounded-full"
          )}
        >
          {copy('Suchen', 'Search')}
        </button>
      </div>
      <datalist id={listId}>
        {cities.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>
    </form>
  );
}
