"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { useLanguage } from "@/hooks/useLanguage";
import type { ExpertId } from "@/lib/sofiaExperts";

type RosterExpert = {
  id: ExpertId;
  name: string;
  mandate: string;
  status: "active";
};

type TeamLink = { href: string; label: string };

type Turn = {
  role: "user" | "assistant";
  expert?: string;
  text: string;
  links?: TeamLink[];
  handoff?: ExpertId | null;
};

export default function SofiaTeamDesk() {
  const { language, copy } = useLanguage();
  const isDe = language === "de";
  const [experts, setExperts] = useState<RosterExpert[]>([]);
  const [active, setActive] = useState<ExpertId>("sofia");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);

  useEffect(() => {
    fetch(`/api/sofia/team?lang=${language === "de" ? "de" : "en"}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.experts) return;
        setExperts(data.experts);
        setTurns([
          {
            role: "assistant",
            expert: "SOFIA",
            text: copy("Team ist aktiv. Frag SOFIA nach dem Stand, oder sprich ATLAS, LUNA, NOVA, ORION, SAGE direkt an.", "Team is on. Ask SOFIA for the board, or speak to ATLAS, LUNA, NOVA, ORION, SAGE directly."),
          },
        ]);
      })
      .catch(() => {});
  }, [isDe]);

  async function ask(message: string, expert = active) {
    if (!message || pending) return;
    setTurns((prev) => [...prev, { role: "user", text: message }]);
    setPending(true);
    try {
      const res = await fetch("/api/sofia/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, expert, language: language === "de" ? "de" : "en" }),
      });
      const data = await res.json();
      setActive(data.expert || expert);
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          expert: data.name,
          text: data.reply,
          links: data.links,
          handoff: data.handoff,
        },
      ]);
    } catch {
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          expert: "SOFIA",
          text: copy("Team gerade nicht erreichbar.", "Team is unavailable right now."),
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    setInput("");
    void ask(message);
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-[#011627]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {copy("Internes Team", "Internal team")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {copy("SOFIA und das Team", "SOFIA and the team")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-white/50">
            {copy("Sechs Agenten, aktiv auf dem echten ORIVE-Stand. Keine erfundenen Tools, keine stummen Demos.", "Six agents, live on the real ORIVE board. No invented tools, no silent demos.")}
          </p>

          <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((expert) => (
              <button
                key={expert.id}
                type="button"
                onClick={() => setActive(expert.id)}
                className={`rounded-xl border px-4 py-3 text-left ${
                  active === expert.id
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                    : "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-[#01223F] dark:text-white/80"
                }`}
              >
                <span className="flex items-center justify-between text-sm font-semibold">
                  {expert.name}
                  <span className="text-[10px] font-medium uppercase tracking-wider opacity-60">
                    {copy("Aktiv", "Active")}
                  </span>
                </span>
                <span className="mt-1 block text-xs opacity-70">{expert.mandate}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex gap-2">
            <button
              type="button"
              onClick={() => void ask(copy("Standup", "Standup"), "sofia")}
              className="h-9 rounded-full border border-slate-200 px-4 text-xs font-semibold text-slate-700 dark:border-white/15 dark:text-white/70"
            >
              {copy("Standup", "Stand-up")}
            </button>
            <Link href="/dezk" className="h-9 rounded-full px-4 text-xs leading-9 text-slate-400 hover:text-slate-800 dark:hover:text-white">
              Dezk
            </Link>
          </div>

          <div className="mt-8 space-y-4">
            {turns.map((turn, index) => (
              <div key={`${turn.role}-${index}`} className={turn.role === "user" ? "flex justify-end" : "block"}>
                <div
                  className={
                    turn.role === "user"
                      ? "max-w-[80%] rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white dark:bg-white dark:text-slate-900"
                      : "max-w-[95%] text-sm leading-6 text-slate-700 dark:text-white/80"
                  }
                >
                  {turn.expert && turn.role === "assistant" ? (
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {turn.expert}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-line">{turn.text}</p>
                  {turn.links?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {turn.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-slate-400 dark:border-white/15 dark:text-white/60"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  {turn.handoff ? (
                    <button
                      type="button"
                      onClick={() => void ask(copy("Übernimm das.", "Take this."), turn.handoff!)}
                      className="mt-3 text-xs font-semibold text-[#00CDAC]"
                    >
                      {copy(`Weiter an ${turn.handoff.toUpperCase()}`, `Hand to ${turn.handoff.toUpperCase()}`)}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
            {pending ? <p className="text-xs text-slate-400">{copy("Team arbeitet …", "Team working…")}</p> : null}
          </div>

          <form onSubmit={onSubmit} className="mt-10 flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={copy(`Nachricht an ${active.toUpperCase()}`, `Message ${active.toUpperCase()}`)}
              className="h-11 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-white/10 dark:bg-[#01223F] dark:text-white"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="h-11 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-slate-900"
            >
              {copy("Senden", "Send")}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
