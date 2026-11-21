"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DirectoryCardGrid, type DirectoryCard } from "@/components/DirectorySearchResults";

// Marketplace / category ids -> directory categories (crawler taxonomy).
const MAP: Record<string, string[]> = {
  Breathwork: ["Breathwork"], Yoga: ["Yoga"], Meditation: ["Meditation"], "Sound Healing": ["Sound Healing"],
  "Cold Therapy": ["Ice Bathing"], "Ice Bathing": ["Ice Bathing"], "Life Coaching": ["Life Coaching", "Personal Coaching"],
  "Personal Coaching": ["Personal Coaching", "Life Coaching"], BodyWork: ["BodyWork"], "Somatic Therapy": ["BodyWork"],
  Mindfulness: ["Mindfulness"], "Spiritual Growth": ["Spiritual Growth"], "Cacao & Ceremony": ["Spiritual Growth"],
  "Sauna & Heat": ["Sauna & Heat"], Kambo: ["Kambo"],
};

export function directoryCatsFor(categoryId: string): string[] | null {
  if (!categoryId || categoryId === "all") return [];
  return MAP[categoryId] || null;
}

type Data = { cards: DirectoryCard[]; total: number; place: string | null };

export function CategoryFacilitators({ categoryId, label, de, city, limit = 6, className = "" }: { categoryId: string; label?: string; de: boolean; city?: string; limit?: number; className?: string }) {
  const cats = directoryCatsFor(categoryId);
  const [data, setData] = useState<Data | null>(null);
  const key = `${(cats || []).join(",")}|${city || ""}|${de ? "de" : "en"}|${limit}`;

  useEffect(() => {
    if (cats === null) return;
    let alive = true;
    const p = new URLSearchParams({ cat: cats.join(","), lang: de ? "de" : "en", limit: String(limit) });
    if (city) p.set("city", city);
    fetch(`/api/directory/browse?${p}`).then((r) => (r.ok ? r.json() : null)).then((j) => { if (alive && j) setData(j); }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (cats === null || !data || !data.cards.length) return null;
  const href = `/facilitators?${new URLSearchParams({ ...(cats.length ? { cat: cats[0] } : {}), ...(city ? { city } : {}) })}`.replace(/\?$/, "");
  const title = cats.length
    ? (de ? `Facilitators in dieser Kategorie${label ? `: ${label}` : ""}` : `Facilitators in this category${label ? `: ${label}` : ""}`)
    : (de ? "Facilitators entdecken" : "Discover facilitators");
  const n = data.total.toLocaleString(de ? "de-DE" : "en-GB");
  return (
    <section className={`w-full ${className}`} data-category-facilitators={cats.join(",") || "all"}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white sm:text-xl">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-white/50">
            {data.place
              ? (de ? `${n} in und um ${data.place}` : `${n} in and around ${data.place}`)
              : (de ? `${n} Facilitators in Europa` : `${n} facilitators in Europe`)}
          </p>
        </div>
        <Link href={href} className="group inline-flex items-center gap-1.5 rounded-full border border-[#00CDAC]/30 bg-[#00CDAC]/10 px-4 py-2 text-xs font-bold text-[#008975] hover:bg-[#00CDAC]/20 dark:text-[#00CDAC]">
          {de ? `Alle ${n} ansehen` : `See all ${n}`}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <DirectoryCardGrid cards={data.cards} de={de} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" />
    </section>
  );
}
