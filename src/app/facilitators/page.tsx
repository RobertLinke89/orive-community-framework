import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Footer } from "@/components/Footer";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { DirectoryTileGrid } from "@/components/directory/DirectoryTile";
import { browse, facets, catLabel } from "@/lib/directoryBrowse";

export const dynamic = "force-dynamic";

// Listing stays noindex until profile indexing is switched on (ORIVE_DIRECTORY_INDEXABLE=1); not in the sitemap.
export async function generateMetadata(): Promise<Metadata> {
  const index = process.env.ORIVE_DIRECTORY_INDEXABLE === "1";
  return {
    title: "Facilitators entdecken | ORIVE",
    description:
      "Breathwork, Yoga, Eisbaden, Sound Healing, Coaching und mehr – Facilitators in ganz Europa.",
    robots: { index, follow: index },
  };
}

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";

function pickLang(sp: SP): "de" | "en" {
  const l = one(sp.lang);
  if (l === "de" || l === "en") return l;
  const al = (headers().get("accept-language") || "de").toLowerCase();
  return al.startsWith("de") || /(^|,)\s*de/.test(al.split(";")[0])
    ? "de"
    : al.startsWith("en")
      ? "en"
      : "de";
}

export default async function FacilitatorsPage({ searchParams }: { searchParams: SP }) {
  const lang = pickLang(searchParams);
  const de = lang === "de";
  const f = {
    q: one(searchParams.q),
    cat: one(searchParams.cat),
    city: one(searchParams.city),
    radius: Number(one(searchParams.radius) || 25),
    cc: one(searchParams.cc),
    offers: one(searchParams.offers) === "1",
    page: Number(one(searchParams.page) || 1),
  };
  const [res, fx] = await Promise.all([browse({ ...f, lang }), facets()]);
  const qs = (patch: Record<string, string | number | null>) => {
    const p = new URLSearchParams();
    const base: Record<string, string> = {
      q: f.q,
      cat: f.cat,
      city: f.city,
      radius: f.city ? String(f.radius) : "",
      cc: f.cc,
      offers: f.offers ? "1" : "",
      lang: one(searchParams.lang),
    };
    for (const [k, v] of Object.entries({ ...base, ...patch })) {
      if (v !== null && v !== "" && v !== undefined) p.set(k, String(v));
    }
    const s = p.toString();
    return s ? `/facilitators?${s}` : "/facilitators";
  };
  const active = Boolean(f.q || f.cat || f.city || f.cc || f.offers);
  let regionName = (c: { code: string; name: string }) => c.name;
  try {
    const dn = new Intl.DisplayNames([lang], { type: "region" });
    regionName = (c) => dn.of(c.code === "UK" ? "GB" : c.code) || c.name;
  } catch {
    /* keep English names */
  }
  const fmt = (n: number) => n.toLocaleString(de ? "de-DE" : "en-GB");
  const nFilters = [f.city, f.cc, f.offers].filter(Boolean).length;
  const keepHidden = (
    <>
      {one(searchParams.lang) ? <input type="hidden" name="lang" value={one(searchParams.lang)} /> : null}
      {f.cat ? <input type="hidden" name="cat" value={f.cat} /> : null}
    </>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8FAFC] dark:bg-[#011B33]">
      <PublicNavbar />
      <main className="w-full flex-1 pt-16">
        <section className="relative isolate overflow-hidden border-b border-slate-200/70 dark:border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/facilitators/facilitators-directory-hero.jpg"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[center_35%]"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(1,18,36,0.88) 0%, rgba(1,34,63,0.80) 40%, rgba(1,27,51,0.92) 100%)",
            }}
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-black/30" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,205,172,0.12),transparent_55%)]"
            aria-hidden
          />

          <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-14">
            <nav className="text-xs text-white/80" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white">
                ORIVE
              </Link>{" "}
              <span aria-hidden>/</span> <span>Facilitators</span>
            </nav>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <h1 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.025em] text-white sm:text-5xl">
                Facilitators
              </h1>
              <p className="pb-1 text-sm text-white/80" aria-live="polite">
                <b className="font-semibold text-white">{fmt(res.total)}</b>{" "}
                {de ? "Treffer" : res.total === 1 ? "result" : "results"}
                {res.place ? (
                  <>
                    {" "}
                    {de ? "in und um" : "in and around"}{" "}
                    <b className="font-semibold text-white">{res.place.name}</b>
                    {f.radius ? ` (${f.radius} km)` : ""}
                  </>
                ) : null}
              </p>
            </div>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/90">
              {de
                ? `${fmt(fx.total)} Facilitators in ganz Europa – Breathwork, Yoga, Eisbaden, Sound Healing, Coaching und mehr.`
                : `${fmt(fx.total)} facilitators across Europe – breathwork, yoga, ice bathing, sound healing, coaching and more.`}
            </p>

            <form method="get" action="/facilitators" className="mt-6 sm:mt-8" role="search">
              {keepHidden}
              <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-1.5 pl-4 backdrop-blur-md transition focus-within:border-[#00CDAC] focus-within:ring-4 focus-within:ring-[#00CDAC]/15">
                <Search className="h-5 w-5 shrink-0 text-white/50" aria-hidden />
                <label htmlFor="f-q" className="sr-only">
                  {de ? "Suche" : "Search"}
                </label>
                <input
                  id="f-q"
                  name="q"
                  defaultValue={f.q}
                  maxLength={200}
                  enterKeyHint="search"
                  className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-white/45 focus:outline-none"
                  placeholder={de ? "Name, Ort oder Angebot" : "Name, place or offer"}
                />
                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center rounded-xl bg-[#00CDAC] px-4 text-sm font-bold text-white transition hover:bg-[#02AAB0] sm:px-6"
                >
                  {de ? "Suchen" : "Search"}
                </button>
              </div>

              <details className="group mt-3" open={nFilters > 0}>
                <summary className="inline-flex cursor-pointer select-none list-none items-center gap-1.5 text-[13px] font-medium text-white/85 hover:text-white [&::-webkit-details-marker]:hidden">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden />
                  {de ? "Weitere Filter" : "More filters"}
                  {nFilters ? ` (${nFilters})` : ""}
                  <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" aria-hidden />
                </summary>
                <div className="mt-3 grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md sm:grid-cols-2 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <label
                      htmlFor="f-city"
                      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45"
                    >
                      {de ? "Stadt" : "City"}
                    </label>
                    <input
                      id="f-city"
                      name="city"
                      defaultValue={f.city}
                      maxLength={80}
                      className="h-10 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/35 focus:border-[#00CDAC] focus:outline-none"
                      placeholder={de ? "z. B. Berlin" : "e.g. Berlin"}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label
                      htmlFor="f-radius"
                      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45"
                    >
                      {de ? "Umkreis" : "Radius"}
                    </label>
                    <select
                      id="f-radius"
                      name="radius"
                      defaultValue={String(f.radius)}
                      className="h-10 w-full rounded-xl border border-white/15 bg-[#01223F] px-3 text-sm text-white focus:border-[#00CDAC] focus:outline-none"
                    >
                      <option value="0">{de ? "Nur Stadt" : "City only"}</option>
                      {[10, 25, 50, 100].map((r) => (
                        <option key={r} value={r}>{`${r} km`}</option>
                      ))}
                    </select>
                  </div>
                  <div className="lg:col-span-3">
                    <label
                      htmlFor="f-cc"
                      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45"
                    >
                      {de ? "Land" : "Country"}
                    </label>
                    <select
                      id="f-cc"
                      name="cc"
                      defaultValue={f.cc}
                      className="h-10 w-full rounded-xl border border-white/15 bg-[#01223F] px-3 text-sm text-white focus:border-[#00CDAC] focus:outline-none"
                    >
                      <option value="">{de ? "Alle Länder" : "All countries"}</option>
                      {fx.countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {regionName(c)} ({fmt(c.n)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end gap-3 lg:col-span-3">
                    <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white/80">
                      <input
                        type="checkbox"
                        name="offers"
                        value="1"
                        defaultChecked={f.offers}
                        className="rounded border-white/30 accent-[#00CDAC]"
                      />
                      {de ? "Mit Angeboten" : "With offers"}
                    </label>
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-[#01223F] hover:bg-[#00CDAC] hover:text-white"
                    >
                      {de ? "Anwenden" : "Apply"}
                    </button>
                  </div>
                </div>
              </details>
            </form>

            <div
              className="mt-6 -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="navigation"
              aria-label={de ? "Kategorien" : "Categories"}
            >
              <div className="inline-flex min-w-full items-center gap-1 border-b border-white/15 pb-px sm:gap-0">
                <Link
                  href={qs({ cat: null, page: null })}
                  aria-current={!f.cat ? "page" : undefined}
                  className={
                    !f.cat
                      ? "relative shrink-0 px-3 py-2.5 text-[12px] font-medium tracking-[0.02em] text-white after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[#00CDAC] sm:px-3.5 sm:text-[13px]"
                      : "relative shrink-0 px-3 py-2.5 text-[12px] font-medium tracking-[0.02em] text-white/70 transition-colors hover:text-white sm:px-3.5 sm:text-[13px]"
                  }
                >
                  {de ? "Alle" : "All"}
                </Link>
                {fx.categories.map((c) => {
                  const on = f.cat === c.id;
                  return (
                    <Link
                      key={c.id}
                      href={qs({ cat: on ? null : c.id, page: null })}
                      aria-current={on ? "page" : undefined}
                      className={
                        on
                          ? "relative shrink-0 px-3 py-2.5 text-[12px] font-medium tracking-[0.02em] text-white after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[#00CDAC] sm:px-3.5 sm:text-[13px]"
                          : "relative shrink-0 px-3 py-2.5 text-[12px] font-medium tracking-[0.02em] text-white/70 transition-colors hover:text-white sm:px-3.5 sm:text-[13px]"
                      }
                    >
                      {catLabel(c.id, lang)}
                    </Link>
                  );
                })}
              </div>
            </div>

            {active ? (
              <p className="mt-4 text-xs">
                <Link
                  href={one(searchParams.lang) ? `/facilitators?lang=${one(searchParams.lang)}` : "/facilitators"}
                  className="font-medium text-white/55 underline-offset-2 hover:text-white hover:underline"
                >
                  {de ? "Alle Filter zurücksetzen" : "Clear all filters"}
                </Link>
              </p>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10" id="ergebnisse">
          {res.unknownCity ? (
            <p className="mb-4 text-xs text-amber-700 dark:text-amber-300">
              {de
                ? `„${f.city}“ kennen wir noch nicht als Ort – es wird nur nach dem Namen gefiltert.`
                : `We don't know “${f.city}” as a place yet – filtering by name only.`}
            </p>
          ) : null}
          {res.mode === "search" && res.searchText ? (
            <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-white/65">
              {res.searchText}
            </p>
          ) : null}

          {res.cards.length ? (
            <DirectoryTileGrid
              cards={res.cards}
              de={de}
              className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 lg:gap-5"
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-white/10 dark:bg-white/[.03]">
              <p className="text-sm text-slate-600 dark:text-white/60">
                {de ? "Keine Facilitators zu diesen Filtern." : "No facilitators match these filters."}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {de
                  ? "Tipp: Umkreis vergrößern, eine größere Stadt wählen oder eine verwandte Kategorie probieren."
                  : "Tip: widen the radius, pick a larger city or try a related category."}
              </p>
              {active ? (
                <Link
                  href="/facilitators"
                  className="mt-4 inline-block text-xs font-semibold text-[#00CDAC] hover:underline"
                >
                  {de ? "Alle Facilitators anzeigen" : "Show all facilitators"}
                </Link>
              ) : null}
            </div>
          )}

          {res.pages > 1 ? (
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-xs text-slate-500 dark:text-white/50">
                {de ? "Seite" : "Page"}{" "}
                <b className="font-semibold text-[#01223F] dark:text-white">{res.page}</b>{" "}
                {de ? "von" : "of"} {fmt(res.pages)}
              </p>
              <nav className="flex flex-wrap items-center justify-center gap-1.5 text-sm" aria-label={de ? "Seiten" : "Pages"}>
                {res.page > 1 ? (
                  <Link
                    rel="prev"
                    href={qs({ page: res.page - 1 })}
                    className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-4 text-slate-700 hover:border-[#00CDAC] dark:border-white/15 dark:bg-transparent dark:text-white/80"
                  >
                    {de ? "← Zurück" : "← Previous"}
                  </Link>
                ) : null}
                {Array.from(new Set([1, res.page - 1, res.page, res.page + 1, res.pages]))
                  .filter((n) => n >= 1 && n <= res.pages)
                  .sort((a, b) => a - b)
                  .map((n, i, arr) => (
                    <span key={n} className="flex items-center gap-1.5">
                      {i > 0 && n - arr[i - 1] > 1 ? <span className="px-1 text-slate-400">…</span> : null}
                      {n === res.page ? (
                        <span
                          aria-current="page"
                          className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-[#00CDAC] px-3 font-semibold text-white"
                        >
                          {n}
                        </span>
                      ) : (
                        <Link
                          href={qs({ page: n })}
                          className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full px-3 text-slate-600 hover:bg-[#00CDAC]/10 hover:text-[#017F80] dark:text-white/70 dark:hover:bg-white/10"
                        >
                          {n}
                        </Link>
                      )}
                    </span>
                  ))}
                {res.page < res.pages ? (
                  <Link
                    rel="next"
                    href={qs({ page: res.page + 1 })}
                    className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-4 text-slate-700 hover:border-[#00CDAC] dark:border-white/15 dark:bg-transparent dark:text-white/80"
                  >
                    {de ? "Weiter →" : "Next →"}
                  </Link>
                ) : null}
              </nav>
              <p className="hidden text-xs text-slate-500 dark:text-white/50 sm:block">
                {res.per} {de ? "pro Seite" : "per page"}
              </p>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
