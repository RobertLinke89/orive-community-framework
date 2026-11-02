"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import NotFound from "./NotFound";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { getAnonClientHeaders, isOpsDebugEnabled } from "@/lib/anonClientToken";
import { getOpsTelemetryFromInvoke } from "@/lib/opsTelemetry";
import { fallbackBlogArticles, BlogArticleItem } from "@/data/blogArticles";
import { useLanguage } from "@/hooks/useLanguage";

const FIELD_LABELS: Record<string, { en: string; de: string }> = {
  breathwork: { en: "Breathwork", de: "Atemarbeit" },
  icebath: { en: "Cold exposure", de: "Kälteexposition" },
  movement: { en: "Movement", de: "Bewegung" },
  meditation: { en: "Meditation", de: "Meditation" },
  holistic: { en: "Holistic health", de: "Ganzheitliche Gesundheit" },
  coaching: { en: "Coaching", de: "Coaching" },
  workout: { en: "Training", de: "Training" },
};

function fieldLabel(category: string, language: string) {
  const lang = language === "de" ? "de" : "en";
  return FIELD_LABELS[category]?.[lang] ?? category;
}

function blocksOf(content: string): { kind: "h2" | "p"; text: string }[] {
  return content
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .map((text) =>
      text.startsWith("## ")
        ? { kind: "h2", text: text.slice(3).trim() }
        : { kind: "p", text }
    );
}

function wordCount(content: string) {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

const BlogArticle = () => {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] || "";
  const { language, copy } = useLanguage();
  const isDe = language === "de";
  const [article, setArticle] = useState<BlogArticleItem | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<BlogArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [opsRemaining, setOpsRemaining] = useState<number | null>(null);
  const [opsRetryAfterSeconds, setOpsRetryAfterSeconds] = useState<number | null>(null);
  const [opsPolicy, setOpsPolicy] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!id) {
        setArticle(null);
        setRelatedArticles([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const resp = await supabase.functions.invoke("get-public-blog-article", {
        headers: { ...getAnonClientHeaders() },
        body: { id },
      });

      const telemetry = getOpsTelemetryFromInvoke(resp, {
        action: "public_blog_get",
        bodyRemaining: resp?.data?.rateLimit?.remaining,
      } as any);
      setOpsRemaining(telemetry.remaining);
      setOpsRetryAfterSeconds(telemetry.retryAfterSeconds);
      setOpsPolicy(telemetry.policy);

      let a: BlogArticleItem | undefined;

      if (resp.error || !resp.data?.article) {
        const fbMatch = fallbackBlogArticles.find((fb) => fb.id === id);
        if (fbMatch) {
          a = fbMatch;
          setArticle(fbMatch);
        } else {
          setArticle(null);
          setRelatedArticles([]);
          setLoading(false);
          return;
        }
      } else {
        a = resp.data.article as BlogArticleItem;
        setArticle(a);
      }

      if (a) {
        const rel = await supabase.functions.invoke("get-public-blog-articles", {
          headers: { ...getAnonClientHeaders() },
          body: { category: a.category, excludeId: a.id, limit: 3 },
        });
        getOpsTelemetryFromInvoke(rel, {
          action: "public_blog_list_related",
          bodyRemaining: rel?.data?.rateLimit?.remaining,
        } as any);

        if (!alive) return;

        const fetchedRelated = (rel.data?.articles ?? []) as BlogArticleItem[];
        const localRelated = fallbackBlogArticles.filter(
          (fb) => fb.category === a!.category && fb.id !== a!.id
        );

        const combinedRelated = [...fetchedRelated];
        for (const fb of localRelated) {
          if (!combinedRelated.some((cr) => cr.id === fb.id)) {
            combinedRelated.push(fb);
          }
        }

        setRelatedArticles(combinedRelated.slice(0, 3));
      }

      setLoading(false);
    }

    void load();
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!article) return;
    const onScroll = () => {
      const el = document.getElementById("article-body");
      if (!el) return;
      const start = el.offsetTop;
      const end = start + el.offsetHeight - window.innerHeight * 0.45;
      const next = (window.scrollY - start) / Math.max(end - start, 1);
      setProgress(Math.min(1, Math.max(0, next)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [article]);

  if (!loading && !article) {
    return <NotFound />;
  }

  const ui = {
    back: copy("Zum Journal", "Back to the journal"),
    kicker: "ORIVE Journal",
    abstract: copy("Zusammenfassung", "Abstract"),
    figure: copy("Abb. 1", "Fig. 1"),
    author: copy("Autor", "Author"),
    published: copy("Erschienen", "Published"),
    field: copy("Fachgebiet", "Field"),
    reading: copy("Lesezeit", "Reading"),
    words: copy("Wörter", "Words"),
    cite: copy("Zitierweise", "How to cite"),
    correspondence: copy("Korrespondenz", "Correspondence"),
    desk: copy("ORIVE Redaktion", "ORIVE Editorial"),
    further: copy("Weiterführende Beiträge", "Further reading"),
  };

  return (
    <Layout>
      <div className="fixed top-16 left-0 right-0 z-40 h-[2px] bg-slate-200/80 dark:bg-white/10">
        <div
          className="h-full bg-[#017F80] dark:bg-[#00CDAC] origin-left"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {loading || !article ? (
        <div className="max-w-[760px] mx-auto px-5 sm:px-8 pt-12 pb-20">
          <div className="h-3 w-28 rounded bg-muted animate-pulse" />
          <div className="mt-10 h-3 w-40 rounded bg-muted animate-pulse" />
          <div className="mt-6 h-12 w-4/5 rounded bg-muted animate-pulse" />
          <div className="mt-8 h-16 w-full rounded bg-muted animate-pulse" />
          <div className="mt-8 aspect-[16/9] rounded bg-muted animate-pulse" />
          <div className="mt-8 h-28 w-full rounded bg-muted animate-pulse" />
        </div>
      ) : (
        <article className="bg-background text-foreground">
          <div className="max-w-[760px] mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-20">
            <Link
              href="/blog"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 hover:text-[#01223F] dark:hover:text-white"
            >
              {ui.back}
            </Link>

            {isOpsDebugEnabled() &&
              (opsRemaining !== null || opsRetryAfterSeconds !== null || opsPolicy !== null) && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Ops: remaining {opsRemaining ?? "—"}
                  {opsRetryAfterSeconds !== null ? ` · retry-after ${opsRetryAfterSeconds}s` : ""}
                  {opsPolicy ? ` · ${opsPolicy}` : ""}
                </p>
              )}

            <header className="mt-8 sm:mt-10 border-t border-slate-200/80 dark:border-white/10 pt-8">
              <div className="flex items-baseline justify-between gap-4">
                <p className="shrink-0 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">
                  {ui.kicker}
                </p>
                <p className="text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {fieldLabel(article.category, language)}
                </p>
              </div>

              <h1 className="mt-5 text-[2rem] sm:text-[2.65rem] font-semibold tracking-[-0.03em] leading-[1.12] text-[#01223F] dark:text-white">
                {article.title}
              </h1>

              <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/10">
                <MetaCell label={ui.author} value={article.author} />
                <MetaCell
                  label={ui.published}
                  value={new Date(article.date).toLocaleDateString(copy("de-DE", "en-GB"), {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                />
                <MetaCell label={ui.reading} value={article.readTime} />
                <MetaCell
                  label={ui.words}
                  value={wordCount(article.content).toLocaleString(copy("de-DE", "en-GB"))}
                />
              </dl>
            </header>

            <figure className="mt-10">
              <img
                src={article.image}
                alt={article.title}
                className="w-full aspect-[16/9] object-cover bg-slate-100 dark:bg-white/5"
              />
              <figcaption className="mt-3 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-[#01223F] dark:text-white">{ui.figure}.</span>{" "}
                {article.title}
              </figcaption>
            </figure>

            <section
              aria-label={ui.abstract}
              className="mt-10 border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03] px-6 py-6 sm:px-8 sm:py-7"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">
                {ui.abstract}
              </p>
              <p className="mt-3 font-serif text-[17px] leading-[1.7] text-[#01223F] dark:text-slate-100">
                {article.excerpt}
              </p>
            </section>

            <div id="article-body" className="mt-12 space-y-6">
              {blocksOf(article.content).map((block, index) =>
                block.kind === "h2" ? (
                  <h2
                    key={index}
                    className="pt-6 font-sans text-[1.35rem] font-semibold tracking-[-0.02em] leading-snug text-[#01223F] dark:text-white"
                  >
                    {block.text}
                  </h2>
                ) : (
                  <p
                    key={index}
                    className="font-serif text-[1.075rem] leading-[1.85] text-slate-700 dark:text-slate-300"
                  >
                    {block.text}
                  </p>
                )
              )}
            </div>

            <p className="mt-12 border-t border-slate-200/80 dark:border-white/10 pt-5 text-[13px] leading-relaxed text-slate-500">
              <span className="font-semibold uppercase tracking-[0.16em] text-[11px] text-[#01223F] dark:text-white">
                {ui.cite}
              </span>
              <span className="mt-2 block font-serif text-[15px] text-slate-600 dark:text-slate-300">
                {article.author} ({new Date(article.date).getFullYear()}). {article.title}. ORIVE Journal.
              </span>
            </p>

            <aside className="mt-8 grid grid-cols-1 sm:grid-cols-[9.5rem_1fr] gap-2 sm:gap-6 border-t border-slate-200/80 dark:border-white/10 pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {ui.correspondence}
              </p>
              <div>
                <p className="font-semibold text-[#01223F] dark:text-white">{article.author}</p>
                <p className="mt-1 text-sm text-slate-500">{ui.desk}</p>
              </div>
            </aside>

            {relatedArticles.length > 0 && (
              <section className="mt-16 border-t border-slate-200/80 dark:border-white/10 pt-8">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">
                  {ui.further}
                </h2>
                <ol className="mt-5 divide-y divide-slate-200/80 dark:divide-white/10 border-y border-slate-200/80 dark:border-white/10">
                  {relatedArticles.map((related, index) => (
                    <li key={related.id}>
                      <Link
                        href={`/blog/${related.id}`}
                        className="group grid grid-cols-[2.5rem_1fr] sm:grid-cols-[2.5rem_7.5rem_1fr] gap-4 items-center py-4"
                      >
                        <span className="text-[12px] font-semibold tabular-nums text-slate-400">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <img
                          src={related.image}
                          alt=""
                          className="hidden sm:block h-14 w-full object-cover bg-slate-100"
                        />
                        <span className="min-w-0">
                          <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {fieldLabel(related.category, language)}
                            <span className="mx-2">·</span>
                            {related.readTime}
                          </span>
                          <span className="mt-1 block font-semibold leading-snug text-[#01223F] dark:text-white group-hover:text-[#017F80] dark:group-hover:text-[#00CDAC]">
                            {related.title}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </article>
      )}
    </Layout>
  );
};

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background px-4 py-3.5">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium leading-snug text-[#01223F] dark:text-white">
        {value}
      </dd>
    </div>
  );
}

export default BlogArticle;
