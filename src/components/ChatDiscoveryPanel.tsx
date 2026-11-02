"use client";

import Link from "next/link";
import { ExternalLink, Play, UserRound } from "lucide-react";
import { practiceVideosForTopic } from "@/data/practiceVideos";
import { useLanguage } from "@/hooks/useLanguage";
import type { MediaEmbed } from "@/lib/mediaEmbed";
import { cn } from "@/lib/utils";

export type DiscoveryOffering = {
  id: string;
  title: string;
  location: string | null;
  when: string;
  price: string | null;
  href: string;
  partner: boolean;
  image?: string | null;
  facilitatorName?: string | null;
  facilitatorAvatar?: string | null;
  facilitatorHref?: string | null;
  blurb?: string | null;
  video?: MediaEmbed | null;
};

type ChatDiscoveryPanelProps = {
  offerings: DiscoveryOffering[];
  topic?: string | null;
  className?: string;
};

function VideoFrame({ embed, title }: { embed: MediaEmbed; title?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
      <div className="relative aspect-video w-full">
        <iframe
          src={embed.url}
          title={title || embed.title || "Practice video"}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {title || embed.title ? (
        <p className="px-3 py-2 text-[11px] font-medium text-white/60">
          {title || embed.title}
        </p>
      ) : null}
    </div>
  );
}

export function ChatDiscoveryPanel({ offerings, topic, className }: ChatDiscoveryPanelProps) {
  const { copy } = useLanguage();
  const facilitators = Array.from(
    new Map(
      offerings
        .filter((item) => item.facilitatorName)
        .map((item) => [
          item.facilitatorHref || item.facilitatorName || item.id,
          {
            name: item.facilitatorName!,
            avatar: item.facilitatorAvatar || null,
            href: item.facilitatorHref || item.href,
          },
        ])
    ).values()
  );
  const facilitatorVideos = offerings
    .filter((item) => item.video)
    .map((item) => ({ embed: item.video!, title: item.title }));
  const inspiration = practiceVideosForTopic(topic).slice(0, 2);

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full flex-col border-l border-white/10 bg-[#02182B]/55 backdrop-blur-xl",
        className
      )}
    >
      <div className="shrink-0 border-b border-white/10 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
          {copy("Entdeckungen", "Discover")}
        </p>
        <h2 className="mt-1 text-sm font-semibold text-white">
          {copy("Facilitators, Angebote & Film", "Facilitators, offers & film")}
        </h2>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {facilitators.length > 0 ? (
          <section>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
              {copy("Profile", "Profiles")}
            </p>
            <ul className="space-y-2">
              {facilitators.map((person) => (
                <li key={person.href}>
                  <Link
                    href={person.href}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 transition hover:bg-white/[0.07]"
                  >
                    {person.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={person.avatar}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/50">
                        <UserRound className="h-4 w-4" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">
                        {person.name}
                      </span>
                      <span className="block text-[11px] text-white/40">
                        {copy("Facilitator ansehen", "View facilitator")}
                      </span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/30" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
            {copy("Angebote", "Offers")}
          </p>
          {offerings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-3 py-4 text-xs leading-relaxed text-white/40">
              {copy(
                "Sobald SOFIA passende Termine findet, erscheinen sie hier — mit Profil, Preis und Buchungslink.",
                "When SOFIA finds matching dates, they appear here — with profile, price and booking link."
              )}
            </p>
          ) : (
            <ul className="space-y-2.5">
              {offerings.map((hit) => (
                <li key={hit.id}>
                  <Link
                    href={hit.href}
                    className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    {hit.image ? (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={hit.image}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#02182B]/80 via-transparent to-transparent" />
                      </div>
                    ) : null}
                    <div className="space-y-1 px-3 py-2.5">
                      <p className="text-sm font-semibold leading-snug text-white">{hit.title}</p>
                      <p className="text-[11px] text-white/45">
                        {[hit.when, hit.location, hit.price].filter(Boolean).join(" · ")}
                        {hit.partner ? copy(" · Partner", " · Partner") : ""}
                      </p>
                      {hit.blurb ? (
                        <p className="text-[11px] leading-relaxed text-white/35">{hit.blurb}</p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
            <Play className="h-3 w-3" />
            {copy("Film & Praxis", "Film & practice")}
          </p>
          <div className="space-y-3">
            {facilitatorVideos.length > 0
              ? facilitatorVideos.map((item) => (
                  <VideoFrame key={item.embed.url} embed={item.embed} title={item.title} />
                ))
              : inspiration.map((embed) => (
                  <VideoFrame key={embed.url} embed={embed} title={embed.title} />
                ))}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-white/30">
            {facilitatorVideos.length > 0
              ? copy(
                  "Videos aus Facilitator-Angeboten (YouTube / Vimeo).",
                  "Videos from facilitator offerings (YouTube / Vimeo)."
                )
              : copy(
                  "Inspiration zum Thema — eigene Facilitator-Videos erscheinen automatisch, sobald sie hinterlegt sind.",
                  "Topic inspiration — facilitator videos appear automatically once they attach YouTube or Vimeo."
                )}
          </p>
        </section>
      </div>
    </aside>
  );
}
