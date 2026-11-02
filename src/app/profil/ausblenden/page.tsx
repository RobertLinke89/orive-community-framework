import type { Metadata } from "next";
import { headers } from "next/headers";
import { LOCALES, type Locale } from "@/emails/locales";
import { normLang } from "@/emails/locale";
import "@/components/offers/offers.css";

/**
 * One-click opt-out: /profil/ausblenden?token=…&lang=xx (link in activation mail, reminders, takedown notice).
 * GET never changes data (mail scanners prefetch links); the single button below hides profile + offers immediately.
 * Afterwards: optional full deletion (second click + confirmation). Language: ?lang (set by the mail) -> Accept-Language -> en.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orive", robots: { index: false, follow: false }, referrer: "no-referrer" };

type P = { searchParams?: { token?: string; status?: string; lang?: string } };
export default function OptOutPage({ searchParams }: P) {
  let accept = "";
  try { accept = headers().get("accept-language") || ""; } catch { /* outside a request (static render) */ }
  const lang: Locale = normLang(searchParams?.lang) || normLang(accept) || "en";
  const t = LOCALES[lang].page;
  const token = (searchParams?.token || "").slice(0, 64);
  const st = searchParams?.status;
  const Btn = ({ action, label, confirm = false, ghost = false }: { action: string; label: string; confirm?: boolean; ghost?: boolean }) => (
    <form method="post" action="/api/profil/ausblenden" style={{ display: "inline" }}>
      <input type="hidden" name="token" value={token} /><input type="hidden" name="action" value={action} /><input type="hidden" name="lang" value={lang} />
      {confirm ? <input type="hidden" name="confirm" value="1" /> : null}
      <button className={ghost ? "oghost" : "obook"} type="submit" style={{ border: ghost ? undefined : 0, cursor: "pointer", font: "inherit" }}>{label}</button>
    </form>
  );
  return (
    <main className="orive-offers page" lang={lang}><div className="owrap" style={{ maxWidth: 620 }}>
      <h1>{t.title}</h1>
      {st === "hidden" ? (<>
        <p>{t.hidden}</p><p>{t.deleteAsk}</p>
        <div className="dact"><Btn action="delete" label={t.deleteBtn} ghost /></div>
      </>) : st === "confirm" ? (<>
        <p>{t.confirm}</p>
        <div className="dact"><Btn action="delete" label={t.confirmBtn} confirm /></div>
      </>) : st === "deleted" ? (
        <p>{t.deleted}</p>
      ) : st === "invalid" || !token ? (
        <p>{t.invalid}</p>
      ) : (<>
        <p>{t.intro}</p>
        <div className="dact"><Btn action="hide" label={t.hideBtn} /></div>
      </>)}
    </div></main>
  );
}
