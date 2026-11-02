"use client";

import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Clock,
  CreditCard,
  Languages,
  MapPin,
  Sparkles,
  Tent,
  Ticket,
  User,
  Users,
  Video,
} from "lucide-react";
import type { FulfillmentMode } from "@/lib/fulfillment";
import { partnerLabel } from "@/lib/fulfillment";
import { useLanguage } from "@/hooks/useLanguage";

export type OfferingFactPillsProps = {
  isDe?: boolean;
  title?: string;
  type?: string | null;
  location?: string | null;
  isOnline?: boolean;
  duration?: string | null;
  groupSize?: string | null;
  capacity?: number | null;
  language?: string | null;
  category?: string | null;
  tags?: string[] | null;
  fulfillment?: FulfillmentMode;
  partner?: string | null;
};

type FactPill = {
  id: string;
  icon: LucideIcon;
  label: string;
};

type CopyFn = (de: string, en: string) => string;

function inferOnline(location?: string | null, isOnline?: boolean) {
  if (isOnline) return true;
  return /online|virtual|zoom|remote|worldwide/i.test(String(location || ""));
}

function formatKind(title: string, tags: string[], type: string | null | undefined, copy: CopyFn) {
  const hay = `${title} ${tags.join(" ")}`.toLowerCase();
  if (/retreat|auszeit|immersion|tages[- ]?retreat/.test(hay)) {
    return { id: "retreat", icon: Tent, label: "Retreat" };
  }
  if (type === "individual") {
    return { id: "oneone", icon: User, label: copy("1:1 Session", "1:1 session") };
  }
  if (type === "group") {
    return { id: "group", icon: Users, label: copy("Gruppe", "Group") };
  }
  return { id: "event", icon: Calendar, label: "Event" };
}

function localizeGroup(raw: string, isDe: boolean) {
  if (!isDe) return raw;
  return raw
    .replace(/^Up to /i, "Bis ")
    .replace(/participants/gi, "Teilnehmende")
    .replace(/people/gi, "Personen");
}

export function buildOfferingFacts(props: OfferingFactPillsProps, copy: CopyFn = (de, en) => (props.isDe ? de : en)): FactPill[] {
  const isDe = Boolean(props.isDe);
  const title = String(props.title || "");
  const tags = (props.tags || []).map((tag) => String(tag).trim()).filter(Boolean);
  const online = inferOnline(props.location, props.isOnline);
  const pills: FactPill[] = [];

  pills.push(formatKind(title, tags, props.type, copy));

  if (online) {
    pills.push({ id: "online", icon: Video, label: "Online" });
  } else if (String(props.location || "").trim()) {
    pills.push({ id: "inplace", icon: MapPin, label: copy("Vor Ort", "In person") });
  }

  const duration = String(props.duration || "").trim();
  if (duration) {
    pills.push({ id: "duration", icon: Clock, label: duration });
  }

  const group = String(props.groupSize || "").trim();
  if (group) {
    pills.push({ id: "size", icon: Users, label: localizeGroup(group, isDe) });
  } else if (typeof props.capacity === "number" && props.capacity > 0 && props.type !== "individual") {
    pills.push({
      id: "size",
      icon: Users,
      label: copy(`Bis ${props.capacity} Plätze`, `Up to ${props.capacity} spots`),
    });
  }

  const language = String(props.language || "").trim();
  if (language) {
    pills.push({ id: "lang", icon: Languages, label: language });
  }

  const category = String(props.category || "").trim();
  if (category && !pills.some((pill) => pill.label.toLowerCase() === category.toLowerCase())) {
    pills.push({ id: "category", icon: Sparkles, label: category });
  }

  for (const tag of tags) {
    if (pills.length >= 8) break;
    if (pills.some((pill) => pill.label.toLowerCase() === tag.toLowerCase())) continue;
    pills.push({ id: `tag-${tag}`, icon: Sparkles, label: tag });
  }

  if (props.fulfillment === "orive") {
    pills.push({ id: "pay", icon: CreditCard, label: "Stripe" });
  } else if (props.fulfillment === "external") {
    pills.push({ id: "pay", icon: Ticket, label: partnerLabel(props.partner) });
  }

  return pills.slice(0, 10);
}

export function OfferingFactPills(props: OfferingFactPillsProps) {
  const { copy } = useLanguage();
  const pills = buildOfferingFacts(props, copy);
  if (pills.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2.5" aria-label={copy("Auf einen Blick", "At a glance")}>
      {pills.map((pill) => {
        const Icon = pill.icon;
        return (
          <li
            key={pill.id}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-800 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          >
            <Icon className="h-4 w-4 shrink-0 text-slate-800" strokeWidth={1.6} />
            {pill.label}
          </li>
        );
      })}
    </ul>
  );
}
