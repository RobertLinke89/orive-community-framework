"use client";
import { useEffect, useState } from "react";
type Lang = "de" | "en";

const KEY = "orive_theme"; // "day" | "night" | absent (= follow OS)
/** Night-mode toggle for the profile pages. Day is the default; the choice is remembered on this device. */
export function ThemeToggle({ lang }: { lang: Lang }) {
  const [night, setNight] = useState(false);
  const apply = (t: "auto" | "day" | "night") => document.querySelectorAll<HTMLElement>(".orive-tpl.variant").forEach((el) => (el.dataset.theme = t));
  useEffect(() => {
    const saved = localStorage.getItem(KEY) as "day" | "night" | null;
    const osNight = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    if (saved) apply(saved);
    setNight(saved ? saved === "night" : !!osNight);
  }, []);
  const toggle = () => { const n = !night; setNight(n); const t = n ? "night" : "day"; localStorage.setItem(KEY, t); apply(t); };
  return (
    <button type="button" className="oc-theme-toggle" aria-pressed={night} onClick={toggle}>
      {night ? (lang === "de" ? "☀ Tagmodus" : "☀ Day mode") : (lang === "de" ? "☾ Nachtmodus" : "☾ Night mode")}
    </button>
  );
}
