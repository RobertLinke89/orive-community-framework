"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CalendarCheck,
  CircleDollarSign,
  Columns3,
  LayoutGrid,
  List,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Share2,
  Pencil,
  Store,
  Trash2,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import BookingCalendar, { type BookingEntry } from "@/components/BookingCalendar";
import DezkWorkspace from "@/components/DezkWorkspace";
import GuestIntake from "@/components/GuestIntake";
import SlotFill from "@/components/SlotFill";
import { demoFacilitator, demoForm, demoGuestBookings, demoMonthEuros, demoOffers, demoPayments } from "@/data/demoDesk";
import { MIN_OFFERING_DESCRIPTION_CHARS, offeringDescriptionLength } from "@/lib/offeringDescription";

type NavTab = "dashboard" | "offers" | "calendar" | "clients" | "earnings" | "workspace";

type DetailTab = "details" | "seekers" | "payment";

type Detail = {
  offering: Offer;
  tab: DetailTab;
  seekerName?: string;
};

type Offer = {
  id: string;
  title: string;
  description?: string;
  type?: string;
  price: string | number;
  duration?: number;
  location?: string;
  is_online?: boolean;
  image_url?: string;
  capacity?: number;
  start_at?: string;
  tags: string[];
  intakeName?: string;
  intakeQuestions?: string[];
  facilitator_id?: string;
  facilitator_name?: string;
  offeringId?: string;
  status: string;
  bookingsCount: number;
  seekers?: { name: string; avatar: string }[];
};

type GuestRow = {
  id: string;
  slotId?: string;
  sessionTitle: string;
  customerName: string;
  avatar?: string;
  customerEmail: string;
  startAt: string;
  location: string | null;
  status: string;
  paymentStatus?: string;
  intake: { questionId: string; prompt: string; answer: string }[];
  euros?: number;
};

type Actor = { id: string; email: string; name: string };

function SeekerFaces({
  people,
  size = "md",
  onPerson,
}: {
  people?: { name: string; avatar: string }[];
  size?: "sm" | "md" | "lg";
  onPerson?: (person: { name: string; avatar: string }) => void;
}) {
  if (!people?.length) return null;
  const shown = people.slice(0, size === "sm" ? 5 : 6);
  const extra = people.length - shown.length;
  const box = size === "lg" ? "h-9 w-9" : size === "sm" ? "h-6 w-6" : "h-7 w-7";
  return (
    <span className="inline-flex items-center">
      {shown.map((person, index) => (
        person.avatar ? (
          <img
            key={`${person.name}-${index}`}
            src={person.avatar}
            alt=""
            title={person.name}
            onClick={onPerson ? (event) => { event.stopPropagation(); onPerson(person); } : undefined}
            className={cn(
              "rounded-full object-cover border-2 border-[#f4f6f8] dark:border-[#011424]",
              box,
              onPerson && "cursor-pointer",
              index > 0 && (size === "sm" ? "-ml-1.5" : "-ml-2")
            )}
          />
        ) : (
          <span
            key={`${person.name}-${index}`}
            title={person.name}
            onClick={onPerson ? (event) => { event.stopPropagation(); onPerson(person); } : undefined}
            className={cn(
              "inline-flex items-center justify-center rounded-full border-2 border-[#f4f6f8] bg-slate-200 text-[10px] font-medium text-[#01223F] dark:border-[#011424] dark:bg-white/10 dark:text-white",
              box,
              onPerson && "cursor-pointer",
              index > 0 && (size === "sm" ? "-ml-1.5" : "-ml-2")
            )}
          >
            {person.name.slice(0, 1)}
          </span>
        )
      ))}
      {extra > 0 && <span className="ml-1.5 text-xs tabular-nums text-slate-500">+{extra}</span>}
    </span>
  );
}

const CATEGORIES = ["All", "Breathwork", "Yoga", "Meditation", "Sound Healing"];

const fieldClass =
  "w-full h-11 px-3 bg-white dark:bg-[#01223F] border border-slate-200 dark:border-white/15 text-sm text-[#01223F] dark:text-white placeholder:text-slate-400 outline-none focus:border-[#01223F] dark:focus:border-white";
const labelClass = "block mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500";

function seekerName(offering: Offer) {
  return offering.bookingsCount === 1 ? offering.seekers?.[0]?.name || "" : "";
}

function clock(value: string | undefined, locale: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatWhen(value: string | undefined, locale: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toInputDate(day: Date) {
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const date = String(day.getDate()).padStart(2, "0");
  return `${day.getFullYear()}-${month}-${date}`;
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3 border-t border-slate-200 py-3 text-sm first:border-t-0 dark:border-white/10">
      <dt className="text-slate-500">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function money(price: string | number) {
  if (typeof price === "number") return `${price} €`;
  if (!price) return "—";
  return String(price).includes("€") || String(price).includes("$") ? String(price) : `${price} €`;
}

export default function FacilitatorDezk() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preview = searchParams?.get("preview") === "1";
  const { language, copy } = useLanguage();
  const isDe = language === "de";
  const locale = copy("de-DE", "en-GB");

  const tabParam = searchParams?.get("tab");
  const initialTab: NavTab =
    tabParam === "workspace" ||
    tabParam === "offers" ||
    tabParam === "calendar" ||
    tabParam === "clients" ||
    tabParam === "earnings" ||
    tabParam === "dashboard"
      ? tabParam
      : "dashboard";
  const [activeTab, setActiveTab] = useState<NavTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (
      tabParam === "workspace" ||
      tabParam === "offers" ||
      tabParam === "calendar" ||
      tabParam === "clients" ||
      tabParam === "earnings" ||
      tabParam === "dashboard"
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOfferTitle, setNewOfferTitle] = useState("");
  const [newOfferDescription, setNewOfferDescription] = useState("");
  const [newOfferCategory, setNewOfferCategory] = useState("Breathwork");
  const [newOfferPrice, setNewOfferPrice] = useState("95");
  const [newOfferLocation, setNewOfferLocation] = useState("");
  const [newOfferEmail, setNewOfferEmail] = useState("");
  const [newOfferHost, setNewOfferHost] = useState("");
  const [newOfferDate, setNewOfferDate] = useState("");
  const [newOfferTime, setNewOfferTime] = useState("18:00");
  const [newOfferSpots, setNewOfferSpots] = useState("8");
  const [newOfferWeeks, setNewOfferWeeks] = useState("1");
  const [intakeChoice, setIntakeChoice] = useState("orive-health");
  const [intakeTemplates, setIntakeTemplates] = useState<{ id: string; name: string; questions: { prompt: string }[] }[]>([]);
  const [intakeForms, setIntakeForms] = useState<{ id: string; name: string; questions: { prompt: string }[] }[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [mode, setMode] = useState<"loading" | "preview" | "live">("loading");
  const [actor, setActor] = useState<Actor | null>(null);
  const [token, setToken] = useState("");
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [cancelling, setCancelling] = useState(false);
  const guestBookings: GuestRow[] = mode === "preview" ? demoGuestBookings(isDe) : guests;
  const guestForms = useMemo(() => (mode === "preview" ? [demoForm(isDe)] : []), [mode, isDe]);
  const demoPay = useMemo(() => demoPayments(isDe), [isDe]);
  const payments = mode === "preview"
    ? demoPay
    : guests
        .filter((guest) => guest.paymentStatus && guest.paymentStatus !== "unpaid")
        .map((guest) => ({
          id: guest.id,
          at: guest.startAt,
          title: guest.sessionTitle,
          guests: 1,
          euros: guest.euros || 0,
          status: guest.paymentStatus || "open",
        }));

  const applyDesk = (body: { actor?: Actor; offers?: Offer[]; guests?: GuestRow[]; profile?: { payoutsEnabled?: boolean } }) => {
    if (body.actor) setActor(body.actor);
    setOffers(body.offers || []);
    setGuests(body.guests || []);
    setPayoutsEnabled(Boolean(body.profile?.payoutsEnabled));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (preview) {
        setMode("preview");
        setOffers(demoOffers(isDe));
        setGuests([]);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const access = data.session?.access_token || "";
      if (!access) {
        router.replace("/auth?mode=facilitator&returnUrl=/dezk/start");
        return;
      }
      const res = await fetch("/api/facilitator/desk", { headers: { Authorization: `Bearer ${access}` } });
      if (!res.ok) {
        router.replace("/auth?mode=facilitator&returnUrl=/dezk/start");
        return;
      }
      const body = await res.json();
      if (cancelled) return;
      if (!body.profile?.onboardingComplete) {
        router.replace("/dezk/start");
        return;
      }
      setToken(access);
      applyDesk(body);
      setMode("live");
    })().catch(() => {
      if (!cancelled) router.replace("/auth?mode=facilitator&returnUrl=/dezk/start");
    });
    return () => {
      cancelled = true;
    };
  }, [preview, isDe, router]);

  useEffect(() => {
    if (!isAddModalOpen) return;
    setIntakeChoice("orive-health");
    let cancelled = false;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    fetch(`/api/facilitator/intake?lang=${language === "de" ? "de" : "en"}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setIntakeTemplates(Array.isArray(data.templates) ? data.templates : []);
        const saved = Array.isArray(data.forms) ? data.forms : [];
        if (mode === "preview") {
          const own = demoForm(isDe);
          setIntakeForms([own, ...saved.filter((form: { id: string }) => form.id !== own.id)]);
        } else {
          setIntakeForms(saved);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAddModalOpen, isDe, token, mode]);

  useEffect(() => {
    if (!detail) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetail(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail]);

  const t = {
    today: copy("Heute", "Today"),
    offerings: copy("Angebote", "Offerings"),
    dates: copy("Termine", "Dates"),
    guests: copy("Suchende", "Seekers"),
    payments: copy("Zahlungen", "Payments"),
    workspace: copy("Workspace", "Workspace"),
    new: copy("Neu", "New"),
    search: copy("Suchen", "Search"),
    signOut: copy("Abmelden", "Sign out"),
    marketplace: copy("Marktplatz", "Marketplace"),
    team: "Team",
    emptyToday: copy("Kein Termin auf dem Kalender.", "No date on the calendar."),
    emptyOffers: copy("Noch kein Angebot.", "No offering yet."),
    emptyPay: copy("Die Karte wird bei der Buchung gespeichert. Nach der Session geht dein Satz an dich, 1 € Concierge an ORIVE. Bis 24 Stunden vorher ist die Stornierung kostenfrei.", "The card is saved at booking. After the session your rate comes to you, and €1 concierge to ORIVE. Cancellation is free until 24 hours before."),
    add: copy("Angebot anlegen", "New offering"),
    next: copy("Nächster Termin", "Next date"),
    countOfferings: copy("Angebote", "Offerings"),
    countDates: copy("Termine", "Dates"),
    chat: copy("Chat", "Chat"),
  };

  const deskNav = [
    { id: "dashboard" as const, label: t.today, icon: LayoutGrid },
    { id: "workspace" as const, label: t.workspace, icon: Columns3 },
    { id: "offers" as const, label: t.offerings, icon: List },
    { id: "calendar" as const, label: t.dates, icon: CalendarCheck },
    { id: "clients" as const, label: t.guests, icon: Users },
    { id: "earnings" as const, label: t.payments, icon: CircleDollarSign },
  ];

  const filteredOffers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return offers.filter((o) => {
      const matchesSearch =
        !q ||
        o.title.toLowerCase().includes(q) ||
        (o.facilitator_name || "").toLowerCase().includes(q) ||
        (o.location || "").toLowerCase().includes(q);
      const matchesCat =
        selectedCategory === "All" ||
        (o.tags || []).includes(selectedCategory) ||
        o.type === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [offers, searchQuery, selectedCategory]);

  const dated = useMemo(() => {
    return [...offers]
      .filter((o) => o.start_at)
      .sort((a, b) => +new Date(a.start_at || 0) - +new Date(b.start_at || 0));
  }, [offers]);

  const todayKey = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
  const dayKey = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };
  const todaySessions = dated.filter((offering) => dayKey(offering.start_at) === todayKey);
  const upcoming = dated
    .filter((offering) => dayKey(offering.start_at) !== todayKey && +new Date(offering.start_at || 0) >= Date.now())
    .slice(0, 8);
  const nextUp = todaySessions.find((offering) => offering.start_at && +new Date(offering.start_at) >= Date.now()) || upcoming[0];
  const seekersToday = todaySessions.reduce((sum, offering) => sum + offering.bookingsCount, 0);
  const comingGroups = upcoming.reduce<{ key: string; label: string; items: Offer[] }[]>((groups, offering) => {
    const key = dayKey(offering.start_at);
    const label = offering.start_at
      ? new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(new Date(offering.start_at))
      : "";
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(offering);
    else groups.push({ key, label, items: [offering] });
    return groups;
  }, []);

  const matchOffering = (title?: string, when?: string) =>
    offers.find((item) => item.title === title && (!when || !item.start_at || Math.abs(+new Date(item.start_at) - +new Date(when)) < 60_000));

  const openOffering = (offering: Offer) => setDetail({ offering, tab: "details" });

  const openPerson = (person: { name: string; avatar: string }, offering?: Offer) => {
    const guest = guestBookings.find((item) => item.customerName === person.name);
    const matched = offering || matchOffering(guest?.sessionTitle, guest?.startAt);
    if (!matched) return;
    setDetail({ offering: matched, tab: "seekers", seekerName: person.name });
  };

  const openPayment = (row: { title: string; at: string }) => {
    const offering = matchOffering(row.title, row.at);
    if (offering) setDetail({ offering, tab: "payment" });
  };

  const bookings: BookingEntry[] = dated.flatMap((offering) => {
    if (!offering.start_at) return [];
    const start = new Date(offering.start_at);
    if (Number.isNaN(start.getTime())) return [];
    return [{
      id: offering.id,
      title: offering.title,
      start,
      durationMin: Number(offering.duration) || 60,
      location: offering.location,
      spots: offering.capacity,
      booked: offering.bookingsCount,
    }];
  });

  const openComposer = (day?: Date, hour?: number) => {
    if (day) {
      setNewOfferDate(toInputDate(day));
      if (hour != null) setNewOfferTime(`${String(hour).padStart(2, "0")}:00`);
    }
    setIsAddModalOpen(true);
  };

  const handleToggleSelectAll = () => {
    if (selectedOfferIds.length === filteredOffers.length) setSelectedOfferIds([]);
    else setSelectedOfferIds(filteredOffers.map((o) => o.id));
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedOfferIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDeleteOffer = (id: string, title: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
    toast.success(copy(`„${title}“ gelöscht.`, `“${title}” removed.`));
  };

  const handleShareOffer = (offering: Offer) => {
    const url = `https://orive.co/experience/${offering.offeringId || offering.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success(copy("Link kopiert.", "Link copied."));
    } else {
      toast.info(url);
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const host = (actor?.name || newOfferHost).trim();
    const email = (actor?.email || newOfferEmail).trim();
    if (!newOfferTitle.trim() || !email || !host || !newOfferDate || !newOfferTime) return;
    if (offeringDescriptionLength(newOfferDescription) < MIN_OFFERING_DESCRIPTION_CHARS) {
      toast.error(
        copy(`Beschreibung braucht mindestens ${MIN_OFFERING_DESCRIPTION_CHARS} Zeichen.`, `Description needs at least ${MIN_OFFERING_DESCRIPTION_CHARS} characters.`),
      );
      return;
    }
    if (mode === "live" && !token) return;

    const facilitatorId = actor?.id || `fac-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const startAt = new Date(`${newOfferDate}T${newOfferTime}:00`);
    setPublishing(true);
    try {
      if (mode !== "live") {
        const claimRes = await fetch("/api/facilitator/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ facilitatorId, name: host, email }),
        });
        const claimData = await claimRes.json();
        if (!claimRes.ok) {
          toast.error(claimData?.error || "Claim failed.");
          return;
        }
      }

      const publishRes = await fetch("/api/orive/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          facilitatorId,
          facilitatorName: host,
          facilitatorEmail: email,
          title: newOfferTitle.trim(),
          description: newOfferDescription.trim(),
          category: newOfferCategory,
          location: newOfferLocation.trim(),
          priceEuros: Number(newOfferPrice),
          spots: Number(newOfferSpots),
          repeatWeeks: Number(newOfferWeeks) || 1,
          startAt: startAt.toISOString(),
          duration: 60,
          lang: language === "de" ? "de" : "en",
          intakeFormId: intakeChoice === "none" ? null : intakeChoice,
        }),
      });
      const published = await publishRes.json();
      if (!publishRes.ok) {
        toast.error(published?.error || "Publish failed.");
        return;
      }

      if (mode === "live" && token) {
        const deskRes = await fetch("/api/facilitator/desk", { headers: { Authorization: `Bearer ${token}` } });
        if (deskRes.ok) applyDesk(await deskRes.json());
      } else {
        const offering = published.offering;
        setOffers((prev) => [
          {
            id: offering.id,
            offeringId: offering.id,
            title: offering.title,
            description: offering.description,
            type: offering.type,
            price: offering.price,
            duration: offering.duration,
            location: offering.location,
            is_online: offering.is_online,
            image_url: offering.image_url,
            capacity: offering.capacity,
            start_at: offering.start_at,
            tags: offering.tags || [],
            facilitator_id: offering.facilitator_id,
            facilitator_name: offering.facilitator_name,
            status: "Active",
            bookingsCount: 0,
          },
          ...prev,
        ]);
      }
      setIsAddModalOpen(false);
      setNewOfferTitle("");
      setNewOfferDescription("");
      toast.success(copy("Angebot ist live.", "Offering is live."));
    } catch {
      toast.error(copy("Veröffentlichen fehlgeschlagen.", "Publish failed."));
    } finally {
      setPublishing(false);
    }
  };

  const cancelAsHost = async (bookingId: string) => {
    if (!token || !actor) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/booking/${bookingId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ by: "facilitator" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || (copy("Storno fehlgeschlagen.", "Cancel failed.")));
        return;
      }
      const deskRes = await fetch("/api/facilitator/desk", { headers: { Authorization: `Bearer ${token}` } });
      if (deskRes.ok) applyDesk(await deskRes.json());
      setDetail(null);
      toast.success(data.charged
        ? (copy("Fenster zu. Die Karte wird belastet.", "Window closed. The card is charged."))
        : (copy("Termin abgesagt. Nichts wird belastet.", "Date cancelled. Nothing is charged.")));
    } catch {
      toast.error(copy("Storno fehlgeschlagen.", "Cancel failed."));
    } finally {
      setCancelling(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    toast.success(copy("Abgemeldet.", "Signed out."));
    router.push("/auth");
  };

  const sheetPayment = detail
    ? payments.find((row) => row.title === detail.offering.title && detail.offering.start_at && Math.abs(+new Date(row.at) - +new Date(detail.offering.start_at)) < 60_000)
    : undefined;
  const sheetPeople = detail?.offering.seekers || [];
  const sheetSeeker = sheetPeople.find((person) => person.name === detail?.seekerName);
  const guestOnOffer = (name: string) =>
    detail
      ? guestBookings.find((item) => {
          if (item.customerName !== name) return false;
          if ("slotId" in item && item.slotId) return item.slotId === detail.offering.id;
          return item.sessionTitle === detail.offering.title &&
            (!item.startAt || !detail.offering.start_at || Math.abs(+new Date(item.startAt) - +new Date(detail.offering.start_at)) < 60_000);
        })
      : undefined;
  const sheetGuest = sheetSeeker ? guestOnOffer(sheetSeeker.name) : undefined;
  const unitPrice = Number(detail?.offering.price);
  const sessionOver = detail?.offering.start_at
    ? new Date(detail.offering.start_at).getTime() + (detail.offering.duration || 60) * 60_000 <= Date.now()
    : false;
  const sheetPayers = sheetPeople
    .map((person) => {
      const guest = guestOnOffer(person.name);
      const status: "paid" | "open" | "reserved" = !sessionOver
        ? "reserved"
        : guest
          ? guest.status === "paid" ? "paid" : "open"
          : sheetPayment?.status === "paid" ? "paid" : "open";
      return { ...person, status, euros: Number.isFinite(unitPrice) ? unitPrice : 0 };
    })
    .sort((a, b) => {
      const rank = { open: 0, reserved: 1, paid: 2 };
      return rank[a.status] - rank[b.status] || a.name.localeCompare(b.name);
    });

  const monthEuros = mode === "preview"
    ? demoMonthEuros()
    : guests
        .filter((guest) => guest.paymentStatus === "paid")
        .filter((guest) => {
          const at = new Date(guest.startAt);
          const now = new Date();
          return at.getFullYear() === now.getFullYear() && at.getMonth() === now.getMonth();
        })
        .reduce((sum, guest) => sum + (guest.euros || 0), 0);

  if (mode === "loading") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#f4f6f8] text-sm text-slate-500 dark:bg-[#011424]">
        ORIVE
      </div>
    );
  }

  const title = deskNav.find((item) => item.id === activeTab)?.label || t.today;
  const todayLabel = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="min-h-[100dvh] bg-[#f4f6f8] text-[#01223F] dark:bg-[#011424] dark:text-white md:flex">
      <aside className="hidden md:flex md:w-16 md:shrink-0 md:flex-col md:items-center md:border-r md:border-slate-200 md:dark:border-white/10 md:min-h-[100dvh] md:sticky md:top-0 md:py-4">
        <Link href="/chat" aria-label="ORIVE" className="flex h-10 w-10 items-center justify-center">
          <img src="/orive-mark.jpg" alt="" className="h-9 w-9 rounded-[10px]" />
        </Link>
        <nav className="mt-6 flex flex-col items-center gap-1">
          <Link
            href="/chat"
            title={t.chat}
            aria-label={t.chat}
            className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00CDAC] text-white shadow-[0_8px_20px_-8px_rgba(0,205,172,0.7)]"
          >
            <MessageSquare className="h-5 w-5" strokeWidth={2} />
          </Link>
          {deskNav.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 w-10 items-center justify-center",
                  active ? "text-[#01223F] dark:text-white" : "text-slate-400 hover:text-[#01223F] dark:hover:text-white"
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.5} />
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-1 pb-2 text-slate-400">
          <Link href="/marketplace" title={t.marketplace} aria-label={t.marketplace} className="flex h-10 w-10 items-center justify-center hover:text-[#01223F] dark:hover:text-white">
            <Store className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Link>
          <Link href="/dezk/team" title={t.team} aria-label={t.team} className="flex h-10 w-10 items-center justify-center hover:text-[#01223F] dark:hover:text-white">
            <UsersRound className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Link>
          <button type="button" onClick={handleLogout} title={t.signOut} aria-label={t.signOut} className="flex h-10 w-10 items-center justify-center hover:text-[#01223F] dark:hover:text-white">
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between gap-3 border-b border-slate-200 bg-[#f4f6f8]/95 px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur dark:border-white/10 dark:bg-[#011424]/95">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#017F80]">{demoFacilitator.name}</p>
            <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
          </div>
          <button
            type="button"
            onClick={() => openComposer()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 bg-[#01223F] px-3 text-sm text-white dark:bg-white dark:text-[#01223F]"
          >
            <Plus className="h-4 w-4" />
            {t.new}
          </button>
        </header>

        <main className={cn("mx-auto w-full flex-1 px-4 py-6", activeTab === "offers" || activeTab === "workspace" ? "max-w-none" : activeTab === "calendar" ? "max-w-6xl" : activeTab === "dashboard" ? "max-w-5xl" : "max-w-3xl")}>
          {activeTab === "workspace" && (
            <DezkWorkspace
              isDe={isDe}
              onOpenCalendar={() => setActiveTab("calendar")}
              onOpenOffers={() => setActiveTab("offers")}
              onOpenClients={() => setActiveTab("clients")}
              relatedSessions={[...todaySessions, ...upcoming].slice(0, 3).map((offering) => ({
                title: offering.title,
                when: formatWhen(offering.start_at, locale),
              }))}
            />
          )}
          {activeTab === "dashboard" && (
            <div className="space-y-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">{todayLabel}</p>
                  {todaySessions.length > 0 && (
                    <p className="mt-1 text-sm">
                      {copy(`${todaySessions.length} ${todaySessions.length === 1 ? "Termin" : "Termine"} · ${seekersToday} Suchende`, `${todaySessions.length} ${todaySessions.length === 1 ? "session" : "sessions"} · ${seekersToday} seekers`)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("workspace")}
                  className="inline-flex h-9 items-center gap-1.5 border border-slate-200 bg-white px-3 text-xs font-medium dark:border-white/15 dark:bg-white/[0.03]"
                >
                  <Columns3 className="h-3.5 w-3.5" />
                  {copy("Workspace öffnen", "Open Workspace")}
                </button>
              </div>

              {todaySessions.length === 0 && !nextUp ? (
                <div className="border border-dashed border-slate-300 px-4 py-8 dark:border-white/15">
                  <p className="text-sm text-slate-500">{t.emptyToday}</p>
                  <button type="button" onClick={() => openComposer()} className="mt-4 text-sm font-medium text-[#017F80]">
                    {t.add}
                  </button>
                </div>
              ) : (
                <div className="grid items-start gap-8 lg:grid-cols-2">
                  {nextUp && (
                    <button
                      type="button"
                      onClick={() => openOffering(nextUp)}
                      className="border border-slate-200 bg-white px-5 py-5 text-left dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#017F80]">{copy("Als Nächstes", "Next")}</p>
                      <p className="mt-3 text-5xl font-semibold tabular-nums tracking-tight">{clock(nextUp.start_at, locale)}</p>
                      <p className="mt-3 text-lg font-medium">{nextUp.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{nextUp.location}</p>
                      <div className="mt-6 flex items-end justify-between gap-4">
                        <span>
                          <SeekerFaces people={nextUp.seekers} size="lg" onPerson={(person) => openPerson(person, nextUp)} />
                          {seekerName(nextUp) ? <span className="mt-2 block text-sm text-slate-500">{seekerName(nextUp)}</span> : null}
                        </span>
                        <SlotFill booked={nextUp.bookingsCount} capacity={nextUp.capacity} isDe={isDe} className="w-36 shrink-0" />
                      </div>
                    </button>
                  )}

                  {todaySessions.length > 0 && (
                    <section>
                      <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{copy("Heute", "Today")}</h2>
                      <ul className="mt-4">
                        {todaySessions.map((offering) => {
                          const past = offering.start_at ? +new Date(offering.start_at) < Date.now() : false;
                          const current = offering.id === nextUp?.id;
                          return (
                            <li key={offering.id} className="border-t border-slate-200 first:border-t-0 dark:border-white/10">
                              <button type="button" onClick={() => openOffering(offering)} className="grid w-full grid-cols-[4.25rem_1fr] items-center gap-3 py-3 text-left">
                                <span className={cn("text-sm tabular-nums", current ? "font-medium text-[#017F80]" : past ? "text-slate-400" : "text-slate-500")}>
                                  {clock(offering.start_at, locale)}
                                </span>
                                <span className="flex items-center justify-between gap-3">
                                  <span>
                                    <span className={cn("block font-medium", past && "text-slate-400")}>{offering.title}</span>
                                    {seekerName(offering) ? <span className="mt-0.5 block text-sm text-slate-500">{seekerName(offering)}</span> : null}
                                    <SlotFill booked={offering.bookingsCount} capacity={offering.capacity} isDe={isDe} className="mt-2 max-w-[9rem]" />
                                  </span>
                                  <SeekerFaces people={offering.seekers} size="sm" onPerson={(person) => openPerson(person, offering)} />
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )}
                </div>
              )}

              {comingGroups.length > 0 && (
                <section>
                  <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{copy("Die nächsten Tage", "The next days")}</h2>
                  <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {comingGroups.map((group) => {
                      const seekers = group.items.reduce((sum, offering) => sum + offering.bookingsCount, 0);
                      const wide = group.items.length > 1 || seekers >= 6;
                      return (
                        <article
                          key={group.key}
                          className={cn(
                            "border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]",
                            wide ? "col-span-2" : "col-span-1"
                          )}
                        >
                          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{group.label}</p>
                          <div className={cn("mt-4", wide && group.items.length > 1 && "grid gap-4 sm:grid-cols-2")}>
                            {group.items.map((offering) => (
                              <button key={offering.id} type="button" onClick={() => openOffering(offering)} className="block w-full text-left">
                                <p className="text-2xl font-semibold tabular-nums tracking-tight">{clock(offering.start_at, locale)}</p>
                                <p className="mt-1 font-medium">{offering.title}</p>
                                {seekerName(offering) ? <p className="mt-1 text-sm text-slate-500">{seekerName(offering)}</p> : null}
                                <SlotFill booked={offering.bookingsCount} capacity={offering.capacity} isDe={isDe} className="mt-3 max-w-[10rem]" />
                                <div className="mt-3">
                                  <SeekerFaces people={offering.seekers} size={wide ? "md" : "sm"} onPerson={(person) => openPerson(person, offering)} />
                                </div>
                              </button>
                            ))}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === "offers" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 border border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-white/[0.03]">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.search}
                  className="h-11 w-full bg-transparent text-sm outline-none"
                />
              </div>
              <div className="flex gap-4 overflow-x-auto text-sm">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "shrink-0 border-b pb-1",
                      selectedCategory === cat ? "border-[#01223F] font-medium dark:border-white" : "border-transparent text-slate-400"
                    )}
                  >
                    {cat === "All" ? (copy("Alle", "All")) : cat}
                  </button>
                ))}
              </div>
              {filteredOffers.length === 0 ? (
                <p className="border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500 dark:border-white/15">{t.emptyOffers}</p>
              ) : (
                <>
                  <ul className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10 md:hidden">
                    {filteredOffers.map((offering) => (
                      <li key={offering.id} className="py-4">
                        <button type="button" onClick={() => openOffering(offering)} className="flex w-full items-start gap-3 text-left">
                          {offering.image_url ? (
                            <img src={offering.image_url} alt="" className="h-14 w-14 shrink-0 object-cover" />
                          ) : null}
                          <div className="min-w-0">
                        <p className="font-medium">{offering.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {[formatWhen(offering.start_at, locale), offering.location || "Online", money(offering.price)].filter(Boolean).join(" · ")}
                        </p>
                        <SlotFill booked={offering.bookingsCount} capacity={offering.capacity} isDe={isDe} className="mt-3 max-w-[10rem]" />
                        <div className="mt-3">
                          <SeekerFaces people={offering.seekers} onPerson={(person) => openPerson(person, offering)} />
                        </div>
                          </div>
                        </button>
                        <div className="mt-3 flex gap-4 text-sm text-slate-500">
                          <button type="button" onClick={() => handleShareOffer(offering)}>{copy("Link", "Link")}</button>
                          <button type="button" onClick={() => toast.info(copy(`Bearbeiten: ${offering.title}`, `Edit: ${offering.title}`))}>{copy("Bearbeiten", "Edit")}</button>
                          <button type="button" onClick={() => handleDeleteOffer(offering.id, offering.title)} className="text-red-700 dark:text-red-300">{copy("Löschen", "Delete")}</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="hidden overflow-x-auto border border-slate-200 dark:border-white/10 md:block">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-200 text-[11px] uppercase tracking-[0.12em] text-slate-500 dark:border-white/10">
                        <tr>
                          <th className="w-10 px-3 py-3">
                            <input
                              type="checkbox"
                              checked={selectedOfferIds.length === filteredOffers.length && filteredOffers.length > 0}
                              onChange={handleToggleSelectAll}
                              aria-label={copy("Alle auswählen", "Select all")}
                            />
                          </th>
                          <th className="px-3 py-3 font-medium">{copy("Angebot", "Offering")}</th>
                          <th className="px-3 py-3 font-medium">{copy("Termin", "Date")}</th>
                          <th className="px-3 py-3 font-medium">{copy("Ort", "Place")}</th>
                          <th className="px-3 py-3 font-medium">{copy("Preis", "Price")}</th>
                          <th className="px-3 py-3 font-medium">{copy("Suchende", "Seekers")}</th>
                          <th className="px-3 py-3 text-right font-medium" />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOffers.map((offering) => (
                          <tr key={offering.id} onClick={() => openOffering(offering)} className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/[0.03]">
                            <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedOfferIds.includes(offering.id)}
                                onChange={() => handleToggleSelectOne(offering.id)}
                                aria-label={offering.title}
                              />
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-start gap-3">
                                {offering.image_url ? (
                                  <img src={offering.image_url} alt="" className="h-12 w-16 shrink-0 object-cover" />
                                ) : null}
                                <div className="min-w-0">
                                  <p className="font-medium">{offering.title}</p>
                                  <p className="text-xs text-slate-500">{offering.tags?.[0] || offering.type}</p>
                                  <SlotFill booked={offering.bookingsCount} capacity={offering.capacity} isDe={isDe} className="mt-2 max-w-[9rem]" />
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-slate-500">{formatWhen(offering.start_at, locale)}</td>
                            <td className="px-3 py-3 text-slate-500">{offering.location || "Online"}</td>
                            <td className="px-3 py-3 tabular-nums">{money(offering.price)}</td>
                            <td className="px-3 py-3"><SeekerFaces people={offering.seekers} onPerson={(person) => openPerson(person, offering)} /></td>
                            <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                              <div className="flex justify-end gap-1 text-slate-500">
                                <button type="button" onClick={() => handleShareOffer(offering)} className="flex h-9 w-9 items-center justify-center" aria-label={copy("Link teilen", "Share link")}>
                                  <Share2 className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => toast.info(copy(`Bearbeiten: ${offering.title}`, `Edit: ${offering.title}`))} className="flex h-9 w-9 items-center justify-center" aria-label={copy("Bearbeiten", "Edit")}>
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button type="button" onClick={() => handleDeleteOffer(offering.id, offering.title)} className="flex h-9 w-9 items-center justify-center text-red-700 dark:text-red-300" aria-label={copy("Löschen", "Delete")}>
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "calendar" && (
            <BookingCalendar
              entries={bookings}
              isDe={isDe}
              onCreate={openComposer}
              onOpen={(id) => {
                const offering = offers.find((item) => item.id === id);
                if (offering) openOffering(offering);
              }}
            />
          )}

          {activeTab === "clients" && (
            <GuestIntake
              isDe={isDe}
              token={token}
              seedBookings={guestBookings}
              seedForms={guestForms}
              onOpenBooking={(booking) => {
                const offering = matchOffering(booking.sessionTitle, booking.startAt);
                if (offering) setDetail({ offering, tab: "seekers", seekerName: booking.customerName });
              }}
            />
          )}

          {activeTab === "earnings" && (
            <div className="space-y-6">
              <div className="border border-slate-200 px-4 py-4 dark:border-white/10">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{copy("Auszahlung", "Payout")}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {copy("Einmal bei Stripe einrichten. Danach geht der Satz nach der Session auf dein Konto. Die 1 € bleiben bei ORIVE.", "Set up once with Stripe. After that, your rate reaches your account after the session. The €1 stays with ORIVE.")}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch("/api/facilitator/connect", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      body: JSON.stringify(actor
                        ? { facilitatorId: actor.id, email: actor.email }
                        : { facilitatorId: demoFacilitator.id, email: demoFacilitator.email }),
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                      return;
                    }
                    toast.info(data.error || (copy("Stripe ist für Auszahlungen noch nicht verbunden.", "Stripe is not connected for payouts yet.")));
                  }}
                  className="mt-3 text-sm font-medium text-[#017F80]"
                >
                  {copy("Auszahlung einrichten", "Set up payout")}
                </button>
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums">
                  {new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(monthEuros)}
                </p>
                {mode === "live" ? (
                  <p className="mt-2 text-sm text-slate-500">
                    {payoutsEnabled
                      ? (copy("Auszahlung bei Stripe ist bereit.", "Stripe payouts are ready."))
                      : (copy("Auszahlung bei Stripe ist noch nicht fertig.", "Stripe payouts are not ready yet."))}
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  {new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date())}
                </p>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">{t.emptyPay}</p>
              </div>
              <ul className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
                {payments.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => openPayment(row)}
                      className="flex w-full items-baseline justify-between gap-4 py-3 text-left"
                    >
                      <span>
                        <span className="block font-medium">{row.title}</span>
                        <span className="mt-1 block text-sm text-slate-500">
                          {[
                            formatWhen(row.at, locale),
                            row.guests === 1 ? (copy("1 Suchende", "1 seeker")) : (copy(`${row.guests} Suchende`, `${row.guests} seekers`)),
                            row.status === "paid"
                              ? (copy("Belastet", "Charged"))
                              : row.status === "failed"
                                ? (copy("Fehlgeschlagen", "Failed"))
                                : row.status === "waived"
                                  ? (copy("Storniert", "Cancelled"))
                                  : row.status === "card_saved" || row.status === "simulated"
                                    ? (copy("Karte hinterlegt", "Card saved"))
                                    : +new Date(row.at) > Date.now()
                                      ? (copy("Nach dem Termin", "After the session"))
                                      : (copy("Offen", "Open")),
                          ].join(" · ")}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm tabular-nums">{money(row.euros)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-slate-400 md:hidden">
            <Link href="/marketplace" className="hover:text-[#01223F] dark:hover:text-white">{t.marketplace}</Link>
            <Link href="/dezk/team" className="hover:text-[#01223F] dark:hover:text-white">{t.team}</Link>
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1 hover:text-[#01223F] dark:hover:text-white">
              <LogOut className="h-3.5 w-3.5" />
              {t.signOut}
            </button>
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-[#f4f6f8]/95 backdrop-blur dark:border-white/10 dark:bg-[#011424]/95 md:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="flex overflow-x-auto">
          <Link
            href="/chat"
            className="flex h-16 w-[4.5rem] shrink-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold text-[#00CDAC]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00CDAC] text-white">
              <MessageSquare className="h-4 w-4" strokeWidth={2} />
            </span>
            {t.chat}
          </Link>
          {deskNav.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex h-16 w-[4.5rem] shrink-0 flex-col items-center justify-center gap-1 text-[10px]",
                  active ? "font-medium text-[#01223F] dark:text-white" : "text-slate-400"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
                <span className="truncate px-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={() => setDetail(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={detail.offering.title}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[92dvh] w-full flex-col overflow-hidden bg-[#f4f6f8] text-[#01223F] dark:bg-[#011424] dark:text-white sm:max-w-lg"
          >
            <div className="flex items-center justify-end px-3 pt-2">
              <button type="button" onClick={() => setDetail(null)} className="flex h-10 w-10 items-center justify-center text-slate-500" aria-label={copy("Schließen", "Close")}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {detail.offering.image_url ? (
              <img src={detail.offering.image_url} alt="" className="mx-5 h-36 w-[calc(100%-2.5rem)] object-cover" />
            ) : null}
            <div className="px-5 pt-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{detail.offering.tags?.[0] || detail.offering.type}</p>
              <h2 className="mt-1 text-2xl font-semibold">{detail.offering.title}</h2>
              <div role="tablist" className="mt-4 flex gap-5 border-b border-slate-200 text-sm dark:border-white/10">
                {([
                  ["details", copy("Angebot", "Offering")],
                  ["seekers", copy("Suchende", "Seekers")],
                  ["payment", copy("Zahlung", "Payment")],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={detail.tab === id}
                    onClick={() => setDetail({ ...detail, tab: id })}
                    className={cn("-mb-px border-b pb-2", detail.tab === id ? "border-[#01223F] font-medium dark:border-white" : "border-transparent text-slate-400")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 sm:pb-6">
              {detail.tab === "details" && (
                <div>
                  {detail.offering.description ? (
                    <p className="text-sm leading-relaxed">{detail.offering.description}</p>
                  ) : null}
                  <dl className={detail.offering.description ? "mt-2" : undefined}>
                    <Fact label={copy("Termin", "Date")}>{formatWhen(detail.offering.start_at, locale)}</Fact>
                    <Fact label={copy("Dauer", "Duration")}>{detail.offering.duration ? `${detail.offering.duration} min` : "—"}</Fact>
                    <Fact label={copy("Ort", "Place")}>{detail.offering.location || "Online"}</Fact>
                    <Fact label={copy("Form", "Format")}>{detail.offering.is_online || detail.offering.location === "Online" ? "Online" : (copy("Vor Ort", "In person"))}</Fact>
                    <Fact label={copy("Preis", "Price")}>{money(detail.offering.price)}</Fact>
                    <Fact label={copy("Plätze", "Places")}>
                      <span className="mb-2 block tabular-nums">
                        {detail.offering.bookingsCount} / {detail.offering.capacity ?? "—"}
                      </span>
                      <SlotFill booked={detail.offering.bookingsCount} capacity={detail.offering.capacity} isDe={isDe} className="max-w-[12rem]" />
                    </Fact>
                    <Fact label="Facilitator">{detail.offering.facilitator_name || demoFacilitator.name}</Fact>
                    <Fact label="Status">{detail.offering.status === "Active" ? (copy("Aktiv", "Active")) : detail.offering.status}</Fact>
                  </dl>
                  <h3 className="mt-8 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{copy("Intake-Formular", "Intake form")}</h3>
                  {detail.offering.intakeQuestions?.length ? (
                    <div className="mt-3">
                      {detail.offering.intakeName ? <p className="text-sm font-medium">{detail.offering.intakeName}</p> : null}
                      <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-600 dark:text-slate-300">
                        {detail.offering.intakeQuestions.map((prompt) => (
                          <li key={prompt}>{prompt}</li>
                        ))}
                      </ol>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">{copy("Kein Formular an diesem Angebot.", "No form on this offering.")}</p>
                  )}
                </div>
              )}
              {detail.tab === "seekers" && (
                <div>
                  {sheetSeeker ? (
                    <div>
                      <button type="button" onClick={() => setDetail({ ...detail, seekerName: undefined })} className="text-sm text-slate-500">
                        {copy("Alle Suchenden", "All seekers")}
                      </button>
                      <div className="mt-4 flex items-center gap-4">
                        <img src={sheetGuest?.avatar || sheetSeeker.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
                        <div>
                          <p className="text-xl font-semibold">{sheetSeeker.name}</p>
                          {sheetGuest?.customerEmail ? <p className="mt-1 text-sm text-slate-500">{sheetGuest.customerEmail}</p> : null}
                          {sheetGuest?.paymentStatus || sheetGuest?.status ? (
                            <p className="mt-1 text-sm text-slate-500">
                              {sheetGuest.paymentStatus === "paid" || sheetGuest.status === "paid"
                                ? (copy("Belastet", "Charged"))
                                : sheetGuest.paymentStatus === "failed"
                                  ? (copy("Fehlgeschlagen", "Failed"))
                                  : sheetGuest.paymentStatus === "waived" || sheetGuest.status === "cancelled"
                                    ? (copy("Storniert", "Cancelled"))
                                    : sheetGuest.paymentStatus === "card_saved" || sheetGuest.paymentStatus === "simulated"
                                      ? (copy("Karte hinterlegt", "Card saved"))
                                      : (copy("Offen", "Open"))}
                            </p>
                          ) : null}
                          {mode === "live" && sheetGuest && (sheetGuest.paymentStatus === "card_saved" || sheetGuest.paymentStatus === "simulated") ? (
                            <button
                              type="button"
                              disabled={cancelling}
                              onClick={() => cancelAsHost(sheetGuest.id)}
                              className="mt-4 text-sm font-medium text-red-700 disabled:opacity-60 dark:text-red-300"
                            >
                              {cancelling
                                ? (copy("Sagt ab…", "Cancelling…"))
                                : (copy("Termin absagen", "Cancel this date"))}
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <h3 className="mt-8 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">Intake</h3>
                      {!sheetGuest || sheetGuest.intake.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">{copy("Keine Angaben.", "No answers.")}</p>
                      ) : (
                        <dl className="mt-3 space-y-4">
                          {sheetGuest.intake.map((item) => (
                            <div key={item.questionId}>
                              <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-400">{item.prompt}</dt>
                              <dd className="mt-1 whitespace-pre-wrap text-sm">{item.answer}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  ) : sheetPeople.length === 0 ? (
                    <p className="text-sm text-slate-500">{copy("Noch niemand.", "No one yet.")}</p>
                  ) : (
                    <ul className="divide-y divide-slate-200 dark:divide-white/10">
                      {sheetPeople.map((person) => (
                        <li key={person.name}>
                          <button type="button" onClick={() => setDetail({ ...detail, seekerName: person.name })} className="flex w-full items-center gap-3 py-3 text-left">
                            <img src={person.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                            <span className="text-sm font-medium">{person.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {detail.tab === "payment" && (
                <div>
                  {sheetPayers.length === 0 ? (
                    <p className="text-sm text-slate-500">{copy("Für diesen Termin liegt noch keine Zahlung vor.", "No payment for this date yet.")}</p>
                  ) : (
                    <div>
                      {(() => {
                        const paid = sheetPayers.filter((person) => person.status === "paid");
                        const open = sheetPayers.filter((person) => person.status === "open");
                        const reserved = sheetPayers.filter((person) => person.status === "reserved");
                        const paidSum = paid.reduce((sum, person) => sum + person.euros, 0);
                        const openSum = open.reduce((sum, person) => sum + person.euros, 0);
                        const reservedSum = reserved.reduce((sum, person) => sum + person.euros, 0);
                        const waiting = reserved.length === sheetPayers.length;
                        const allPaid = paid.length === sheetPayers.length;
                        const headline = waiting ? reservedSum : allPaid ? paidSum : openSum;
                        const kicker = waiting
                          ? (copy("Nach dem Termin", "After the session"))
                          : allPaid
                            ? (copy("Bezahlt", "Paid"))
                            : (copy("Offen", "Open"));
                        const mix = [
                          paid.length ? (copy(`${paid.length} bezahlt`, `${paid.length} paid`)) : "",
                          open.length ? (copy(`${open.length} offen`, `${open.length} open`)) : "",
                          reserved.length && !waiting ? (copy(`${reserved.length} reserviert`, `${reserved.length} reserved`)) : "",
                          waiting ? (copy("Karten gespeichert", "Cards saved")) : "",
                        ].filter(Boolean).join(" · ");
                        return (
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{kicker}</p>
                            <p className="mt-2 text-3xl font-semibold tabular-nums">{money(headline)}</p>
                            <p className="mt-3 text-sm text-slate-500">
                              {[formatWhen(detail.offering.start_at, locale), mix].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                        );
                      })()}
                      <ul className="mt-6 border-t border-slate-200 dark:border-white/10">
                        {sheetPayers.map((person) => (
                          <li key={person.name} className="flex items-center gap-3 border-b border-slate-200 py-3 dark:border-white/10">
                            <img src={person.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{person.name}</span>
                              {person.euros > 0 ? <span className="mt-0.5 block text-sm tabular-nums text-slate-500">{money(person.euros)}</span> : null}
                            </span>
                            <span className={cn("text-sm", person.status === "paid" ? "text-[#017F80]" : "text-slate-500")}>
                              {person.status === "paid" ? (copy("Bezahlt", "Paid")) : person.status === "reserved" ? (copy("Reserviert", "Reserved")) : (copy("Offen", "Open"))}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6">
          <div className="max-h-[92dvh] w-full overflow-y-auto bg-[#f4f6f8] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 text-[#01223F] dark:bg-[#011424] dark:text-white sm:max-w-md sm:pb-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t.add}</h2>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex h-10 w-10 items-center justify-center text-slate-500" aria-label={copy("Schließen", "Close")}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddOffer} className="space-y-4">
              <p className="text-sm text-slate-500">
                {copy("Wird als Termin auf ORIVE veröffentlicht. Partner-Listings bleiben beim Partner.", "Publishes as a date on ORIVE. Partner listings stay with the partner.")}
              </p>
              <label className="block">
                <span className={labelClass}>{copy("Titel", "Title")}</span>
                <input value={newOfferTitle} onChange={(e) => setNewOfferTitle(e.target.value)} required placeholder={copy("Breathwork, 60 min", "Breathwork, 60 min")} className={fieldClass} />
              </label>
              <label className="block">
                <span className={labelClass}>
                  {copy("Beschreibung (Seeker-Outcome)", "Description (seeker outcome)")}
                </span>
                <textarea
                  value={newOfferDescription}
                  onChange={(e) => setNewOfferDescription(e.target.value)}
                  required
                  rows={8}
                  minLength={MIN_OFFERING_DESCRIPTION_CHARS}
                  placeholder={
                    copy("Marketing-Sprache: für wen ist es, was erlebt die Person, welchen spürbaren Outcome nimmt sie mit — mindestens 1000 Zeichen.", "Marketing speech: who it is for, what they experience, what tangible outcome they leave with — at least 1000 characters.")
                  }
                  className="w-full min-h-[10rem] px-3 py-2 bg-white border border-slate-200 text-sm text-[#01223F] placeholder:text-slate-400 outline-none focus:border-[#01223F] dark:bg-[#011424] dark:border-white/15 dark:text-white"
                />
                <span
                  className={cn(
                    "mt-1 block text-xs",
                    offeringDescriptionLength(newOfferDescription) >= MIN_OFFERING_DESCRIPTION_CHARS
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-amber-700 dark:text-amber-300",
                  )}
                >
                  {offeringDescriptionLength(newOfferDescription)} / {MIN_OFFERING_DESCRIPTION_CHARS}
                  {copy(" Zeichen", " characters")}
                </span>
              </label>
              {actor ? (
                <p className="text-sm text-slate-500">{actor.name} · {actor.email}</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={labelClass}>{copy("Name", "Name")}</span>
                    <input value={newOfferHost} onChange={(e) => setNewOfferHost(e.target.value)} required className={fieldClass} />
                  </label>
                  <label className="block">
                    <span className={labelClass}>{copy("E-Mail", "Email")}</span>
                    <input type="email" value={newOfferEmail} onChange={(e) => setNewOfferEmail(e.target.value)} required className={fieldClass} />
                  </label>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelClass}>{copy("Kategorie", "Category")}</span>
                  <select value={newOfferCategory} onChange={(e) => setNewOfferCategory(e.target.value)} className={fieldClass}>
                    {["Breathwork", "Yoga", "Meditation", "Sound Healing", "Cold Exposure"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>{copy("Preis (€)", "Price (€)")}</span>
                  <input type="number" value={newOfferPrice} onChange={(e) => setNewOfferPrice(e.target.value)} required className={fieldClass} />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className={labelClass}>{copy("Datum", "Date")}</span>
                  <input type="date" value={newOfferDate} onChange={(e) => setNewOfferDate(e.target.value)} required className={fieldClass} />
                </label>
                <label className="block">
                  <span className={labelClass}>{copy("Zeit", "Time")}</span>
                  <input type="time" value={newOfferTime} onChange={(e) => setNewOfferTime(e.target.value)} required className={fieldClass} />
                </label>
                <label className="block">
                  <span className={labelClass}>{copy("Plätze", "Spots")}</span>
                  <input type="number" min={1} value={newOfferSpots} onChange={(e) => setNewOfferSpots(e.target.value)} required className={fieldClass} />
                </label>
              </div>
              <label className="block">
                <span className={labelClass}>{copy("Ort", "Place")}</span>
                <input value={newOfferLocation} onChange={(e) => setNewOfferLocation(e.target.value)} required placeholder={copy("Berlin oder Online", "Berlin or online")} className={fieldClass} />
              </label>
              <label className="block">
                <span className={labelClass}>{copy("Wiederholung", "Repeat")}</span>
                <select value={newOfferWeeks} onChange={(e) => setNewOfferWeeks(e.target.value)} className={fieldClass}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((weeks) => (
                    <option key={weeks} value={weeks}>
                      {weeks === 1
                        ? (copy("Einmal", "Once"))
                        : (copy(`${weeks} Wochen, gleiche Uhrzeit`, `${weeks} weeks, same time`))}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="space-y-2 border border-slate-200 p-3 dark:border-white/10">
                <legend className={labelClass}>{copy("Intake-Formular", "Intake form")}</legend>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="intake" checked={intakeChoice === "none"} onChange={() => setIntakeChoice("none")} />
                  {copy("Keins", "None")}
                </label>
                <p className="pt-2 text-[11px] uppercase tracking-[0.14em] text-slate-400">ORIVE</p>
                {intakeTemplates.map((form) => (
                  <div key={form.id}>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="intake" checked={intakeChoice === form.id} onChange={() => setIntakeChoice(form.id)} />
                      {form.name}
                    </label>
                    <ul className="ml-6 mt-1 space-y-0.5 text-sm text-slate-500">
                      {form.questions.map((question, index) => (
                        <li key={`${form.id}-${index}`}>{question.prompt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <p className="pt-3 text-[11px] uppercase tracking-[0.14em] text-slate-400">{copy("Vom Facilitator", "From the facilitator")}</p>
                {intakeForms.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    {copy("Noch keines gespeichert. Unter Gäste anlegen.", "None saved yet. Create one under Guests.")}
                  </p>
                ) : intakeForms.map((form) => (
                  <div key={form.id}>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="intake" checked={intakeChoice === form.id} onChange={() => setIntakeChoice(form.id)} />
                      {form.name}
                    </label>
                    <ul className="ml-6 mt-1 space-y-0.5 text-sm text-slate-500">
                      {form.questions.map((question, index) => (
                        <li key={`${form.id}-${index}`}>{question.prompt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </fieldset>
              <button
                type="submit"
                disabled={
                  publishing
                  || offeringDescriptionLength(newOfferDescription) < MIN_OFFERING_DESCRIPTION_CHARS
                }
                className="h-11 w-full bg-[#01223F] text-sm text-white disabled:opacity-60 dark:bg-white dark:text-[#01223F]"
              >
                {publishing ? (copy("Veröffentlicht…", "Publishing…")) : (copy("Veröffentlichen", "Publish"))}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
