"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Columns3,
  List,
  Pause,
  Play,
  Plus,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceColumnId = "ideas" | "ready" | "live" | "done";

export type WorkspaceTask = {
  id: string;
  title: string;
  note?: string;
  column: WorkspaceColumnId;
  link?: "calendar" | "offers" | "clients";
  minutes: number;
};

type Props = {
  isDe: boolean;
  onOpenCalendar: () => void;
  onOpenOffers: () => void;
  onOpenClients: () => void;
  relatedSessions?: { title: string; when: string }[];
};

const STORAGE_KEY = "orive.dezk.workspace.v1";

const COLUMNS: { id: WorkspaceColumnId; de: string; en: string }[] = [
  { id: "ideas", de: "Ideen", en: "Ideas" },
  { id: "ready", de: "Bereit", en: "Ready" },
  { id: "live", de: "Läuft", en: "Live" },
  { id: "done", de: "Erledigt", en: "Done" },
];

const DEFAULT_TASKS: WorkspaceTask[] = [
  {
    id: "t-prep",
    title: "Session-Raum vorbereiten",
    note: "Matten, Sound, Wasser — 30 Min vorher",
    column: "ready",
    link: "calendar",
    minutes: 25,
  },
  {
    id: "t-intake",
    title: "Intake der Suchenden lesen",
    note: "Offene Fragen vor dem Termin klären",
    column: "live",
    link: "clients",
    minutes: 40,
  },
  {
    id: "t-offer",
    title: "Neues Gruppenangebot skizzieren",
    note: "Titel, Dauer, Kapazität",
    column: "ideas",
    link: "offers",
    minutes: 0,
  },
  {
    id: "t-follow",
    title: "Follow-up nach Abendkreis",
    column: "done",
    link: "clients",
    minutes: 15,
  },
];

const DEFAULT_BOARDS: { id: string; title: string; subtitleDe: string; subtitleEn: string; updatedDe: string; updatedEn: string }[] = [
  {
    id: "b-map",
    title: "ORIVE Business Map",
    subtitleDe: "Whiteboard · Angebot & Reichweite",
    subtitleEn: "Whiteboard · offering & reach",
    updatedDe: "Heute",
    updatedEn: "Today",
  },
  {
    id: "b-value",
    title: "Value Stream",
    subtitleDe: "Whiteboard · Session-Ablauf",
    subtitleEn: "Whiteboard · session flow",
    updatedDe: "Gestern",
    updatedEn: "Yesterday",
  },
  {
    id: "b-mind",
    title: "Praxis-Mindmap",
    subtitleDe: "Board · Themen & Formate",
    subtitleEn: "Board · themes & formats",
    updatedDe: "Diese Woche",
    updatedEn: "This week",
  },
];

function uid() {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function loadTasks(): WorkspaceTask[] {
  if (typeof window === "undefined") return DEFAULT_TASKS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TASKS;
    const parsed = JSON.parse(raw) as WorkspaceTask[];
    if (!Array.isArray(parsed) || !parsed.length) return DEFAULT_TASKS;
    return parsed;
  } catch {
    return DEFAULT_TASKS;
  }
}

export default function DezkWorkspace({
  isDe,
  onOpenCalendar,
  onOpenOffers,
  onOpenClients,
  relatedSessions = [],
}: Props) {
  const [tasks, setTasks] = useState<WorkspaceTask[]>(DEFAULT_TASKS);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState("");
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [boardOpen, setBoardOpen] = useState<(typeof DEFAULT_BOARDS)[number] | null>(null);

  useEffect(() => {
    setTasks(loadTasks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      /* ignore */
    }
  }, [tasks, hydrated]);

  useEffect(() => {
    if (!trackingId) return;
    const tick = window.setInterval(() => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === trackingId ? { ...task, minutes: task.minutes + 1 } : task
        )
      );
    }, 60_000);
    return () => window.clearInterval(tick);
  }, [trackingId]);

  const copy = useCallback((de: string, en: string) => (isDe ? de : en), [isDe]);

  const byColumn = useMemo(() => {
    const map: Record<WorkspaceColumnId, WorkspaceTask[]> = {
      ideas: [],
      ready: [],
      live: [],
      done: [],
    };
    for (const task of tasks) map[task.column].push(task);
    return map;
  }, [tasks]);

  const tracked = tasks.find((task) => task.id === trackingId);
  const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);

  const addTask = () => {
    const title = draft.trim();
    if (!title) return;
    setTasks((prev) => [
      { id: uid(), title, column: "ideas", minutes: 0 },
      ...prev,
    ]);
    setDraft("");
  };

  const moveTask = (id: string, column: WorkspaceColumnId) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, column } : task)));
  };

  const removeTask = (id: string) => {
    if (trackingId === id) setTrackingId(null);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const openLink = (link?: WorkspaceTask["link"]) => {
    if (link === "calendar") onOpenCalendar();
    if (link === "offers") onOpenOffers();
    if (link === "clients") onOpenClients();
  };

  const formatMinutes = (value: number) => {
    const h = Math.floor(value / 60);
    const m = value % 60;
    if (h <= 0) return `${m} min`;
    return `${h}h ${String(m).padStart(2, "0")}m`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#017F80]">
            {copy("Workspace", "Workspace")}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            {copy("Boards, Tasks und Fokus — wie in ORIVE Desktop.", "Boards, tasks, and focus — as in ORIVE Desktop.")}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
            {copy(
              "Plane Vorbereitung, Intake und Follow-ups. Spring direkt in Kalender, Angebote oder Suchende.",
              "Plan prep, intake, and follow-ups. Jump straight into calendar, offerings, or seekers."
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenCalendar}
            className="inline-flex h-9 items-center gap-1.5 border border-slate-200 bg-white px-3 text-xs font-medium dark:border-white/15 dark:bg-white/[0.03]"
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            {copy("Termine", "Dates")}
          </button>
          <button
            type="button"
            onClick={onOpenOffers}
            className="inline-flex h-9 items-center gap-1.5 border border-slate-200 bg-white px-3 text-xs font-medium dark:border-white/15 dark:bg-white/[0.03]"
          >
            <List className="h-3.5 w-3.5" />
            {copy("Angebote", "Offerings")}
          </button>
          <button
            type="button"
            onClick={onOpenClients}
            className="inline-flex h-9 items-center gap-1.5 border border-slate-200 bg-white px-3 text-xs font-medium dark:border-white/15 dark:bg-white/[0.03]"
          >
            <Users className="h-3.5 w-3.5" />
            {copy("Suchende", "Seekers")}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {copy("Offen", "Open")}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {tasks.filter((task) => task.column !== "done").length}
          </p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {copy("Zeit erfasst", "Tracked")}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatMinutes(totalMinutes)}</p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {copy("Timer", "Timer")}
          </p>
          <p className="mt-1 truncate text-sm font-medium">
            {tracked
              ? tracked.title
              : copy("Kein Task aktiv", "No task running")}
          </p>
        </div>
      </div>

      {relatedSessions.length > 0 && (
        <div className="border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {copy("Verbunden mit Terminen", "Linked to dates")}
            </p>
            <button type="button" onClick={onOpenCalendar} className="text-xs font-medium text-[#017F80]">
              {copy("Kalender öffnen", "Open calendar")}
            </button>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-white/10">
            {relatedSessions.slice(0, 3).map((session) => (
              <li key={`${session.title}-${session.when}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0 truncate font-medium">{session.title}</span>
                <span className="shrink-0 text-slate-500">{session.when}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Columns3 className="h-4 w-4 text-[#017F80]" />
          <h3 className="text-sm font-semibold">{copy("Kanban", "Kanban")}</h3>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            addTask();
          }}
          className="mb-4 flex gap-2"
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={copy("Task hinzufügen…", "Add a task…")}
            className="h-11 flex-1 border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#01223F] dark:border-white/15 dark:bg-[#01223F] dark:focus:border-white"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-1.5 bg-[#01223F] px-4 text-sm text-white dark:bg-white dark:text-[#01223F]"
          >
            <Plus className="h-4 w-4" />
            {copy("Neu", "New")}
          </button>
        </form>

        <div className="grid gap-3 xl:grid-cols-4 md:grid-cols-2">
          {COLUMNS.map((column) => (
            <div
              key={column.id}
              className="min-h-[16rem] border border-slate-200 bg-[#fafbfc] dark:border-white/10 dark:bg-white/[0.02]"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5 dark:border-white/10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {isDe ? column.de : column.en}
                </p>
                <span className="text-xs tabular-nums text-slate-400">{byColumn[column.id].length}</span>
              </div>
              <ul className="space-y-2 p-2">
                {byColumn[column.id].map((task) => {
                  const running = trackingId === task.id;
                  return (
                    <li
                      key={task.id}
                      className={cn(
                        "border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#011424]",
                        running && "border-[#00CDAC]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug">{task.title}</p>
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          className="shrink-0 text-slate-300 hover:text-slate-600"
                          aria-label={copy("Entfernen", "Remove")}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {task.note && (
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">{task.note}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTrackingId(running ? null : task.id)}
                          className={cn(
                            "inline-flex h-7 items-center gap-1 px-2 text-[11px] font-medium",
                            running
                              ? "bg-[#00CDAC] text-white"
                              : "border border-slate-200 text-slate-600 dark:border-white/15"
                          )}
                        >
                          {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          {formatMinutes(task.minutes)}
                        </button>
                        {task.link && (
                          <button
                            type="button"
                            onClick={() => openLink(task.link)}
                            className="inline-flex h-7 items-center gap-1 text-[11px] font-medium text-[#017F80]"
                          >
                            {task.link === "calendar" && copy("Zum Kalender", "To calendar")}
                            {task.link === "offers" && copy("Zu Angeboten", "To offerings")}
                            {task.link === "clients" && copy("Zu Suchenden", "To seekers")}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {COLUMNS.filter((item) => item.id !== task.column).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => moveTask(task.id, item.id)}
                            className="h-6 px-1.5 text-[10px] uppercase tracking-wide text-slate-400 hover:text-[#01223F] dark:hover:text-white"
                          >
                            → {isDe ? item.de : item.en}
                          </button>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#017F80]" />
          <h3 className="text-sm font-semibold">{copy("Boards", "Boards")}</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {DEFAULT_BOARDS.map((board) => (
            <button
              key={board.id}
              type="button"
              onClick={() => setBoardOpen(board)}
              className="group border border-slate-200 bg-white p-4 text-left transition hover:border-[#01223F] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white"
            >
              <div className="mb-4 aspect-[16/10] border border-dashed border-slate-200 bg-[radial-gradient(circle_at_20%_30%,rgba(0,205,172,0.12),transparent_45%),linear-gradient(135deg,#f8fafc,#eef2f6)] dark:border-white/15 dark:bg-[radial-gradient(circle_at_20%_30%,rgba(0,205,172,0.18),transparent_45%),linear-gradient(135deg,#01223F,#011424)]">
                <div className="flex h-full items-center justify-center gap-2 p-4 opacity-70">
                  <span className="h-8 w-14 border border-slate-300/80 dark:border-white/20" />
                  <span className="h-10 w-8 border border-slate-300/80 dark:border-white/20" />
                  <span className="h-6 w-10 border border-slate-300/80 dark:border-white/20" />
                </div>
              </div>
              <p className="text-sm font-semibold">{board.title}</p>
              <p className="mt-1 text-xs text-slate-500">{isDe ? board.subtitleDe : board.subtitleEn}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                {isDe ? board.updatedDe : board.updatedEn}
              </p>
            </button>
          ))}
        </div>
      </section>

      {boardOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6"
          onClick={() => setBoardOpen(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={boardOpen.title}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[92dvh] w-full flex-col overflow-hidden bg-[#f4f6f8] dark:bg-[#011424] sm:max-w-3xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#017F80]">
                  {copy("Board", "Board")}
                </p>
                <h3 className="text-lg font-semibold">{boardOpen.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setBoardOpen(null)}
                className="flex h-10 w-10 items-center justify-center text-slate-500"
                aria-label={copy("Schließen", "Close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative min-h-[18rem] flex-1 bg-[linear-gradient(90deg,rgba(1,34,63,0.04)_1px,transparent_1px),linear-gradient(rgba(1,34,63,0.04)_1px,transparent_1px)] bg-[size:24px_24px] p-6 dark:bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)]">
              <div className="absolute left-[12%] top-[22%] h-28 w-44 border-2 border-[#01223F]/40 bg-white/80 dark:border-white/30 dark:bg-[#01223F]/60" />
              <div className="absolute left-[48%] top-[30%] h-36 w-24 border-2 border-[#00CDAC]/50 bg-white/70 dark:bg-[#01223F]/50" />
              <div className="absolute left-[72%] top-[18%] h-20 w-32 border-2 border-slate-400/50 bg-white/60 dark:bg-[#01223F]/40" />
              <svg className="absolute inset-0 h-full w-full" aria-hidden>
                <line x1="34%" y1="40%" x2="48%" y2="42%" stroke="#01223F" strokeOpacity="0.35" strokeWidth="2" />
                <line x1="58%" y1="48%" x2="72%" y2="28%" stroke="#00CDAC" strokeOpacity="0.55" strokeWidth="2" />
              </svg>
              <p className="absolute bottom-4 left-4 right-4 text-xs text-slate-500">
                {copy(
                  "Whiteboard-Fläche aus dem Desktop-Workspace — hier skizzierst du Ablauf, Raum und Angebot, bevor es in Kalender und Marktplatz geht.",
                  "Whiteboard surface from the desktop workspace — sketch flow, room, and offering before it lands in calendar and marketplace."
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-slate-200 px-4 py-3 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setBoardOpen(null);
                  onOpenOffers();
                }}
                className="inline-flex h-9 items-center gap-1.5 bg-[#01223F] px-3 text-sm text-white dark:bg-white dark:text-[#01223F]"
              >
                {copy("Als Angebot weiterführen", "Continue as offering")}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setBoardOpen(null);
                  onOpenCalendar();
                }}
                className="inline-flex h-9 items-center gap-1.5 border border-slate-200 px-3 text-sm dark:border-white/15"
              >
                {copy("Termin planen", "Plan a date")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
