export type OfferingSpanInput = {
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  duration?: number | string | null;
  start_at?: string | null;
  end_at?: string | null;
};

export type OfferingSpan = {
  start: Date | null;
  end: Date | null;
  days: number | null;
  multiDay: boolean;
};

const DAY_MS = 86400000;

function parseDay(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function addDays(day: Date, amount: number) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + amount);
}

function textOf(item: OfferingSpanInput) {
  const tags = Array.isArray(item.tags) ? item.tags.join(' ') : '';
  return `${item.title || ''} ${item.description || ''} ${tags}`;
}

export function inferSpanDays(item: OfferingSpanInput): number | null {
  const start = parseDay(item.start_at);
  const end = parseDay(item.end_at);
  if (start && end && end.getTime() >= start.getTime()) {
    return Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
  }

  const mins =
    typeof item.duration === 'number'
      ? item.duration
      : parseInt(String(item.duration || '').replace(/[^0-9]/g, ''), 10);
  if (Number.isFinite(mins) && mins >= 1440) {
    return Math.max(1, Math.round(mins / 1440));
  }

  const text = textOf(item);
  if (/tages[- ]?retreat|tagesretreat|mini[- ]?retreat/i.test(text) && !/\d+\s*[-–]?\s*(days|tage|tägig)/i.test(text)) {
    return 1;
  }

  const numbered = text.match(/(\d{1,2})\s*[-–]?\s*(?:day|days|tage|tägig|tägige)\b/i);
  if (numbered) {
    const days = Number.parseInt(numbered[1], 10);
    if (days >= 1 && days <= 21) return days;
  }

  if (/\bwochenende\b|\bweekend\b/i.test(text)) return 2;
  return null;
}

export function offeringSpan(item: OfferingSpanInput): OfferingSpan {
  const start = parseDay(item.start_at);
  const days = inferSpanDays(item);
  const end = start && days ? addDays(start, days - 1) : parseDay(item.end_at) || start;
  return {
    start,
    end,
    days: days ?? (start ? 1 : null),
    multiDay: Boolean(days && days >= 2),
  };
}

export function formatOfferingWhen(span: OfferingSpan, locale = 'de-DE'): string {
  if (!span.start) return '';
  const monthDay = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  if (!span.multiDay || !span.end) return monthDay.format(span.start);
  if (span.start.getMonth() === span.end.getMonth() && span.start.getFullYear() === span.end.getFullYear()) {
    return `${span.start.getDate()}.–${monthDay.format(span.end)}`;
  }
  return `${monthDay.format(span.start)} – ${monthDay.format(span.end)}`;
}

export function formatOfferingLength(span: OfferingSpan, isDe: boolean): string {
  if (!span.days) return '';
  if (span.days === 1) return isDe ? '1 Tag' : '1 day';
  return isDe ? `${span.days} Tage` : `${span.days} days`;
}

export function formatOfferingWhenLine(span: OfferingSpan, isDe: boolean): string {
  const when = formatOfferingWhen(span, isDe ? 'de-DE' : 'en-GB');
  if (!when) return '';
  if (!span.multiDay) return when;
  return `${when} · ${formatOfferingLength(span, isDe)}`;
}

export function spanOverlapsSearch(span: OfferingSpan, dateFrom?: string, dateTo?: string): boolean {
  if (!dateFrom && !dateTo) return true;
  if (!span.start) return false;
  const from = parseDay(dateFrom) || parseDay(dateTo);
  const to = parseDay(dateTo) || parseDay(dateFrom);
  if (!from || !to) return true;
  const start = from.getTime() <= to.getTime() ? from : to;
  const end = from.getTime() <= to.getTime() ? to : from;
  const offeringEnd = span.end || span.start;
  return span.start.getTime() <= end.getTime() && offeringEnd.getTime() >= start.getTime();
}
