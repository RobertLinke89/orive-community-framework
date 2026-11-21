"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowUp, PanelLeft, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { PublicNavbar } from "@/components/PublicNavbar";
import { getAnonClientHeaders, getAnonClientToken } from "@/lib/anonClientToken";
import { ChatCreditsAuthDialog } from "@/components/ChatCreditsAuthDialog";
import {
  ChatDiscoveryPanel,
  type DiscoveryOffering,
} from "@/components/ChatDiscoveryPanel";
import { FREE_MONTHLY_CREDITS } from "@/lib/chatCreditEngine";
import { DirectorySearchResults, type DirectoryPayload } from "@/components/DirectorySearchResults";
import { cn } from "@/lib/utils";

type ChatTurn = {
  id?: string;
  role: "user" | "assistant";
  text: string;
  offerings?: DiscoveryOffering[];
  directory?: DirectoryPayload | null;
  whatsapp?: string | null;
  topic?: string | null;
};

type CreditBalance = {
  remaining: number | null;
  freeRemaining: number;
  prepaid: number;
  lifetime: boolean;
};

type SessionSummary = {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
};

const CHIPS_DE = ["Ich fühle mich überfordert", "Abend-Ausklang begleiten", "Morgenritual vorschlagen", "Was braucht mein Körper?"];
const CHIPS_EN = ["I feel overwhelmed", "Guide my evening wind-down", "Suggest a morning ritual", "What does my body need?"];

const RITUAL_CARDS = [
  {
    id: "Breathwork",
    labelDe: "Breathwork",
    labelEn: "Breathwork",
    image: "/shop/hero-breathwork.jpg",
    span: "col-span-3 row-span-2 min-h-[200px] sm:min-h-[220px]",
  },
  {
    id: "Yoga",
    labelDe: "Yoga",
    labelEn: "Yoga",
    image: "/shop/hero-yoga.jpg",
    span: "col-span-3 row-span-2 min-h-[200px] sm:min-h-[220px]",
  },
  {
    id: "Meditation",
    labelDe: "Meditation",
    labelEn: "Meditation",
    image: "/shop/hero-meditation.jpg",
    span: "col-span-2 min-h-[120px]",
  },
  {
    id: "Sound Healing",
    labelDe: "Sound Healing",
    labelEn: "Sound Healing",
    image: "/shop/hero-sound.jpg",
    span: "col-span-2 min-h-[120px]",
  },
  {
    id: "Cold Therapy",
    labelDe: "Kältetherapie",
    labelEn: "Cold Therapy",
    image: "/blog/ice-bath-protocols.jpg",
    span: "col-span-2 min-h-[120px]",
  },
  {
    id: "Life Coaching",
    labelDe: "Coaching",
    labelEn: "Coaching",
    image: "/blog/blog-executive.jpg",
    span: "col-span-2 min-h-[120px]",
  },
  {
    id: "BodyWork",
    labelDe: "Bodywork",
    labelEn: "Bodywork",
    image: "/shop/hero-bodywork.jpg",
    span: "col-span-2 min-h-[120px]",
  },
  {
    id: "Mindfulness",
    labelDe: "Achtsamkeit",
    labelEn: "Mindfulness",
    image: "/blog/blog-forest-bathing.jpg",
    span: "col-span-2 min-h-[120px]",
  },
  {
    id: "Spiritual Growth",
    labelDe: "Spiritualität",
    labelEn: "Spiritual",
    image: "/blog/blog-shamanic-drum.jpg",
    span: "col-span-3 min-h-[130px]",
  },
  {
    id: "Somatic Therapy",
    labelDe: "Somatik",
    labelEn: "Somatics",
    image: "/blog/blog-somatic-movement.jpg",
    span: "col-span-3 min-h-[130px]",
  },
  {
    id: "Cacao & Ceremony",
    labelDe: "Zeremonien",
    labelEn: "Ceremony",
    image: "/facilitators/motif-cacao.jpg",
    span: "col-span-3 min-h-[130px]",
  },
  {
    id: "Retreats",
    labelDe: "Retreats",
    labelEn: "Retreats",
    image: "/facilitators/motif-format-retreat.jpg",
    span: "col-span-3 min-h-[130px]",
  },
] as const;

function newSessionId() {
  return crypto.randomUUID();
}

export default function OriveChat() {
  const { language, copy } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const isDe = language === "de";
  const chips = isDe ? CHIPS_DE : CHIPS_EN;
  const router = useRouter();
  const params = useParams<{ sessionId?: string }>();
  const routeSessionId = typeof params?.sessionId === "string" ? params.sessionId : null;
  const showSidebar = !authLoading && isAuthenticated;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!showSidebar) setSidebarOpen(false);
  }, [showSidebar]);

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [checkoutPending, setCheckoutPending] = useState<string | null>(null);
  const [needsCredits, setNeedsCredits] = useState(false);
  const [creditsDialogOpen, setCreditsDialogOpen] = useState(false);
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [bootstrappedQuery, setBootstrappedQuery] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef(false);

  useEffect(() => {
    if (needsCredits) setCreditsDialogOpen(true);
  }, [needsCredits]);

  const refreshBalance = useCallback(async () => {
    getAnonClientToken();
    try {
      const res = await fetch("/api/chat/credits", { headers: getAnonClientHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setBalance({
        remaining: data.remaining,
        freeRemaining: data.freeRemaining,
        prepaid: data.prepaid,
        lifetime: Boolean(data.lifetime),
      });
      if (data.lifetime || (typeof data.remaining === "number" && data.remaining > 0)) {
        setNeedsCredits(false);
        setCreditsDialogOpen(false);
      } else if (typeof data.remaining === "number" && data.remaining <= 0 && !data.lifetime) {
        setNeedsCredits(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    getAnonClientToken();
    try {
      const res = await fetch("/api/chat/sessions", { headers: getAnonClientHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setSessions(Array.isArray(data.sessions) ? data.sessions : []);
    } catch {
      // ignore
    }
  }, []);

  const loadSession = useCallback(async (id: string) => {
    getAnonClientToken();
    try {
      const res = await fetch(`/api/chat/sessions/${encodeURIComponent(id)}`, {
        headers: getAnonClientHeaders(),
      });
      if (res.status === 404) {
        setSessionId(id);
        setTurns([]);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      setSessionId(id);
      setTurns(
        Array.isArray(data.session?.messages)
          ? data.session.messages.map((item: ChatTurn & { id: string }) => ({
              id: item.id,
              role: item.role,
              text: item.text,
              offerings: item.offerings,
              directory: item.directory || null,
              whatsapp: item.whatsapp,
            }))
          : []
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void refreshBalance();
    void refreshSessions();
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      setSidebarOpen(true);
    }
  }, [refreshBalance, refreshSessions]);

  useEffect(() => {
    if (routeSessionId) {
      void loadSession(routeSessionId);
      return;
    }
    setSessionId(null);
    setTurns([]);
  }, [routeSessionId, loadSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, pending]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = new URLSearchParams(window.location.search);
    const credits = search.get("credits");
    const stripeSession = search.get("session_id");
    if (credits === "ok" && stripeSession) {
      void (async () => {
        try {
          await fetch("/api/chat/credits/confirm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAnonClientHeaders(),
            },
            body: JSON.stringify({
              sessionId: stripeSession,
              visitorKey: getAnonClientToken(),
            }),
          });
          await refreshBalance();
          setNeedsCredits(false);
          setTurns((prev) => [
            ...prev,
            {
              role: "assistant",
              text: copy(
                "Credits sind freigeschaltet. Frag weiter nach Stadt und Praxis.",
                "Credits are unlocked. Keep asking with a city and practice."
              ),
            },
          ]);
        } finally {
          const url = new URL(window.location.href);
          url.searchParams.delete("credits");
          url.searchParams.delete("session_id");
          window.history.replaceState({}, "", url.pathname + url.search);
        }
      })();
    }
  }, [copy, refreshBalance]);

  async function ensureSession(): Promise<string> {
    if (sessionId) return sessionId;
    const id = newSessionId();
    await fetch("/api/chat/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAnonClientHeaders(),
      },
      body: JSON.stringify({
        id,
        visitorKey: getAnonClientToken(),
        title: isDe ? "Neuer Chat" : "New chat",
      }),
    });
    setSessionId(id);
    return id;
  }

  async function persistTurn(id: string, next: ChatTurn[]) {
    await fetch(`/api/chat/sessions/${encodeURIComponent(id)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAnonClientHeaders(),
      },
      body: JSON.stringify({
        visitorKey: getAnonClientToken(),
        messages: next.map((item) => ({
          role: item.role,
          text: item.text,
          offerings: item.offerings,
          directory: item.directory || undefined,
          whatsapp: item.whatsapp,
        })),
      }),
    });
    void refreshSessions();
  }

  async function buyPlan(plan: "flex" | "power" | "lifetime") {
    setCheckoutPending(plan);
    try {
      const res = await fetch("/api/chat/credits/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAnonClientHeaders(),
        },
        body: JSON.stringify({
          plan,
          visitorKey: getAnonClientToken(),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.simulated && data.balance) {
        setBalance({
          remaining: data.balance.remaining,
          freeRemaining: data.balance.freeRemaining,
          prepaid: data.balance.prepaid,
          lifetime: Boolean(data.balance.lifetime),
        });
        setNeedsCredits(false);
      }
    } finally {
      setCheckoutPending(null);
    }
  }

  async function sendMessage(raw: string) {
    const message = raw.trim();
    if (!message || pending || pendingRef.current) return;
    if (needsCredits) {
      setCreditsDialogOpen(true);
      return;
    }
    getAnonClientToken();
    setInput("");
    setPending(true);
    pendingRef.current = true;
    const userTurn: ChatTurn = { role: "user", text: message };
    setTurns((prev) => [...prev, userTurn]);

    try {
      const id = await ensureSession();
      const res = await fetch("/api/sofia/concierge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAnonClientHeaders(),
        },
        body: JSON.stringify({
          message,
          language: isDe ? "de" : "en",
          visitorKey: getAnonClientToken(),
        }),
      });
      const data = await res.json();
      if (data.balance) {
        setBalance({
          remaining: data.balance.remaining,
          freeRemaining: data.balance.freeRemaining,
          prepaid: data.balance.prepaid,
          lifetime: Boolean(data.balance.lifetime),
        });
      }

      let assistant: ChatTurn;
      if (res.status === 402 || data.needsCredits) {
        setNeedsCredits(true);
        setCreditsDialogOpen(true);
        assistant = {
          role: "assistant",
          text:
            data.reply ||
            copy(
              "Deine Gratis-Credits sind aufgebraucht. Lade Prepaid nach, um weiterzusuchen.",
              "Your free credits are used up. Top up prepaid credits to keep searching."
            ),
        };
      } else {
        assistant = {
          role: "assistant",
          text: data.reply || copy("Keine Antwort.", "No reply."),
          offerings: data.directory ? [] : Array.isArray(data.offerings) ? data.offerings : [],
          directory: data.directory || null,
          whatsapp: data.whatsapp || null,
        };
      }
      setTurns((prev) => [...prev, assistant]);
      await persistTurn(id, [userTurn, assistant]);
      if (!routeSessionId) {
        router.replace(`/chat/${id}`);
      }
    } catch {
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          text: copy("Concierge gerade nicht erreichbar.", "Concierge is unavailable right now."),
        },
      ]);
    } finally {
      setPending(false);
      pendingRef.current = false;
    }
  }

  useEffect(() => {
    if (bootstrappedQuery || routeSessionId) return;
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q")?.trim();
    if (!q) return;
    setBootstrappedQuery(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.history.replaceState({}, "", url.pathname + url.search);
    void sendMessage(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for hero handoff
  }, [bootstrappedQuery, routeSessionId]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function startNewChat() {
    setSessionId(null);
    setTurns([]);
    setNeedsCredits(false);
    setSidebarOpen(false);
    router.push("/chat");
  }

  async function removeSession(id: string) {
    await fetch(`/api/chat/sessions/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAnonClientHeaders(),
    });
    await refreshSessions();
    if (sessionId === id) startNewChat();
  }

  const balanceLabel = balance?.lifetime
    ? copy("Unbegrenzt", "Unlimited")
    : typeof balance?.remaining === "number"
      ? copy(`${balance.remaining} Credits`, `${balance.remaining} credits`)
      : copy("5 gratis / Monat", "5 free / month");

  const empty = turns.length === 0;

  return (
    <div className="dark fixed inset-0 z-50 flex text-white">
      {/* Horizon glow — behind a translucent dark-blue wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "url(/chat-horizon-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 45%",
          filter: "saturate(0.9) brightness(0.85)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ backgroundColor: "rgba(1, 22, 39, 0.82)" }}
      />

      {/* Sidebar — only for signed-in users */}
      {showSidebar ? (
        <>
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col transition-transform md:static",
              sidebarOpen ? "translate-x-0" : "-translate-x-full md:hidden"
            )}
            style={{ backgroundColor: "rgba(2, 24, 43, 0.72)" }}
          >
            <div className="flex items-center justify-between gap-2 px-3 py-3">
              <Link href="/" className="min-w-0 shrink-0" aria-label="ORIVE">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/orive-logo-wings.png" alt="ORIVE" className="h-[15px] w-auto" />
              </Link>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 hover:bg-white/70 dark:hover:bg-white/10 md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label={copy("Schließen", "Close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3">
              <button
                type="button"
                onClick={startNewChat}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-sm font-semibold hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
                {copy("Neuer Chat", "New chat")}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-3">
              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {copy("Unterhaltungen", "Conversations")}
              </p>
              {sessions.length === 0 ? (
                <p className="px-2 text-xs text-slate-400">
                  {copy("Noch keine Chats.", "No chats yet.")}
                </p>
              ) : (
                <ul className="space-y-1">
                  {sessions.map((item) => (
                    <li key={item.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => {
                          setSidebarOpen(false);
                          router.push(`/chat/${item.id}`);
                        }}
                        className={cn(
                          "w-full rounded-xl px-3 py-2.5 text-left text-sm transition",
                          sessionId === item.id
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "hover:bg-slate-100 dark:hover:bg-white/10"
                        )}
                      >
                        <span className="block truncate font-medium">{item.title}</span>
                        {item.preview ? (
                          <span
                            className={cn(
                              "mt-0.5 block truncate text-[11px]",
                              sessionId === item.id
                                ? "text-white/70 dark:text-slate-500"
                                : "text-slate-400"
                            )}
                          >
                            {item.preview}
                          </span>
                        ) : null}
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeSession(item.id)}
                        className="absolute right-2 top-2 hidden rounded-md p-1 text-slate-400 hover:text-red-500 group-hover:block"
                        aria-label={copy("Löschen", "Delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2 p-3 text-xs text-slate-500 dark:text-white/45">
              <button
                type="button"
                onClick={() => setCreditsDialogOpen(true)}
                className="w-full rounded-xl bg-white/70 px-3 py-2.5 text-left transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
              >
                <p className="font-medium text-slate-700 dark:text-white/80">{balanceLabel}</p>
                <p className="mt-0.5 text-[11px] text-slate-400 dark:text-white/40">
                  {needsCredits
                    ? copy("Anmelden & Credits laden", "Sign in & top up credits")
                    : copy("Kein Abo · Google oder Apple", "No subscription · Google or Apple")}
                </p>
              </button>
              <Link
                href="/dezk"
                className="block w-full rounded-xl px-3 py-2 text-left text-[11px] font-medium text-white/45 transition hover:bg-white/5 hover:text-white/70"
              >
                {copy("Weiter zu dezk →", "Continue to dezk →")}
              </Link>
            </div>
          </aside>

          {sidebarOpen ? (
            <button
              type="button"
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
              aria-label={copy("Schließen", "Close")}
              onClick={() => setSidebarOpen(false)}
            />
          ) : null}
        </>
      ) : null}

      {/* Main */}
      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
        {showSidebar ? (
          <header className="relative flex h-14 shrink-0 items-center px-3 sm:px-5">
            <div className="z-10 flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg p-2 text-white/70 hover:bg-white/10"
                onClick={() => setSidebarOpen((open) => !open)}
                aria-label={copy("Seitenleiste", "Sidebar")}
              >
                <PanelLeft className="h-5 w-5" />
              </button>
            </div>
            <Link
              href="/"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              aria-label="ORIVE"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/orive-logo-wings.png" alt="ORIVE" className="h-3.5 w-auto sm:h-4" />
            </Link>
            <div className="z-10 ml-auto flex items-center gap-1">
              <Link
                href="/dezk"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                dezk
              </Link>
              <Link
                href="/marketplace"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Community
              </Link>
            </div>
          </header>
        ) : (
          <PublicNavbar tone="dark" fixed={false} />
        )}

        <div
          className={cn(
            "min-h-0 flex-1 px-3 sm:px-6",
            empty ? "overflow-y-auto" : "overflow-y-auto py-6"
          )}
        >
          <div className="mx-auto flex min-h-full max-w-2xl flex-col">
            {empty ? (
              <>
                {/* Primary: chat composer */}
                <div className="flex flex-1 flex-col justify-center pb-6 pt-8 sm:pt-14">
                  <p className="mb-5 text-center text-sm text-white/55">
                    {copy(
                      "Dein 24/7 Holistic-Wellbeing-Buddy.",
                      "Your 24/7 holistic wellbeing buddy."
                    )}
                  </p>
                  <form
                    onSubmit={onSubmit}
                    className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-white/15 focus-within:ring-[#00CDAC]/50"
                  >
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder={copy(
                        "z. B. Ich kann nicht schlafen — was hilft heute Nacht?",
                        "e.g. I can't sleep — what helps tonight?"
                      )}
                      disabled={pending}
                      className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-white/35 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={pending || !input.trim()}
                      aria-label={copy("Senden", "Send")}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00CDAC] to-[#02AAB0] text-white disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </form>
                  <div className="mt-3 flex flex-nowrap justify-center gap-1.5 overflow-x-auto no-scrollbar px-1">
                    {chips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        disabled={pending}
                        onClick={() => void sendMessage(chip)}
                        className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white/60 transition hover:border-white/20 hover:text-white disabled:opacity-40"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary: ritual discovery below chat */}
                <div className="pb-8">
                  <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                    {copy("Oder entdecken", "Or explore")}
                  </p>
                  <div className="orive-chat-credits flex flex-col gap-2.5">
                    {[0, 1].map((copyIndex) => (
                      <div
                        key={copyIndex}
                        className="grid w-full auto-rows-fr grid-cols-6 gap-2 sm:gap-2.5"
                        aria-hidden={copyIndex === 1 ? true : undefined}
                      >
                        {RITUAL_CARDS.map((card) => {
                          const label = isDe ? card.labelDe : card.labelEn;
                          return (
                            <button
                              key={`${copyIndex}-${card.id}`}
                              type="button"
                              tabIndex={copyIndex === 1 ? -1 : undefined}
                              disabled={pending}
                              onClick={() => void sendMessage(label)}
                              className={cn(
                                "group relative overflow-hidden rounded-2xl text-left disabled:opacity-40",
                                card.span
                              )}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={card.image}
                                alt={copyIndex === 0 ? label : ""}
                                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                              <div
                                aria-hidden
                                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                              />
                              <span className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 text-[11px] font-semibold tracking-wide text-white sm:px-3 sm:pb-3 sm:text-xs">
                                {label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-center">
                    <Link
                      href="/datenschutz"
                      className="text-[9px] tracking-wide text-white/30 transition hover:text-white/50"
                    >
                      {copy("Datenschutz", "Data privacy")}
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4 pb-4">
                {turns.map((turn, index) => (
                  <div
                    key={turn.id || `${turn.role}-${index}`}
                    className={turn.role === "user" ? "flex justify-end" : "block"}
                  >
                    <div
                      className={cn(
                        "text-sm leading-relaxed",
                        turn.role === "user"
                          ? "max-w-[85%] rounded-2xl bg-slate-900 px-4 py-3 text-white dark:bg-white dark:text-slate-900"
                          : "max-w-[95%] text-slate-700 dark:text-white/80"
                      )}
                    >
                      <p className="whitespace-pre-line">{turn.text}</p>
                      {turn.directory ? <DirectorySearchResults data={turn.directory} de={isDe} /> : null}
                      {turn.offerings?.length ? (
                        <ul className="mt-3 space-y-2">
                          {turn.offerings.map((hit) => (
                            <li key={hit.id}>
                              <Link
                                href={hit.href}
                                className="block rounded-xl bg-slate-50/90 px-3 py-2.5 transition hover:bg-slate-100/90 dark:bg-white/5 dark:hover:bg-white/10"
                              >
                                <span className="block font-medium text-slate-900 dark:text-white">
                                  {hit.title}
                                </span>
                                <span className="mt-0.5 block text-xs text-slate-500 dark:text-white/45">
                                  {[hit.when, hit.location, hit.price].filter(Boolean).join(" · ")}
                                  {hit.partner ? copy(" · Partner", " · Partner") : ""}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {turn.whatsapp ? (
                        <a
                          href={turn.whatsapp}
                          className="mt-2 inline-block text-xs font-semibold text-[#00CDAC]"
                        >
                          {copy("Weiter auf WhatsApp", "Continue on WhatsApp")}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
                {pending ? (
                  <p className="text-xs text-slate-400">{copy("Suche …", "Searching…")}</p>
                ) : null}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        {!empty ? (
          <div className="shrink-0 bg-transparent px-3 py-4 sm:px-6">
            <div className="mx-auto max-w-2xl">
              <form
                onSubmit={onSubmit}
                className="flex items-center gap-2 rounded-2xl bg-slate-50/90 px-3 py-2 shadow-none ring-0 focus-within:bg-slate-100/90 dark:bg-white/5 dark:focus-within:bg-white/10"
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={copy(
                    "z. B. Ich kann nicht schlafen — was hilft heute Nacht?",
                    "e.g. I can't sleep — what helps tonight?"
                  )}
                  disabled={pending}
                  className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-slate-400 disabled:opacity-50 dark:placeholder:text-white/35"
                />
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  aria-label={copy("Senden", "Send")}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00CDAC] to-[#02AAB0] text-white disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </form>
              <div className="mt-3 flex flex-nowrap justify-center gap-1.5 overflow-x-auto no-scrollbar px-1">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    disabled={pending}
                    onClick={() => void sendMessage(chip)}
                    className="shrink-0 rounded-full bg-slate-100/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <ChatCreditsAuthDialog
        open={creditsDialogOpen}
        onOpenChange={setCreditsDialogOpen}
        checkoutPending={checkoutPending}
        onBuyPlan={(plan) => void buyPlan(plan)}
      />
    </div>
  );
}
