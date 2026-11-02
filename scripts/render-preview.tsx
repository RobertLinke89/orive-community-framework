// Local static preview with seed data (no DB, no Next server): renders the real components to HTML.
import fs from "fs";
import path from "path";
import { renderToStaticMarkup } from "react-dom/server";
import { ProfileView } from "../src/components/claim/ProfileView";
import { GoLiveBar, QualityBadge } from "../src/components/claim/GoLiveBar";
import { Celebration } from "../src/components/claim/Celebration";
import { presetOffers, type CategoryKey } from "../src/lib/claim/categories";
import { T, type Lang } from "../src/components/claim/i18n";

const out = process.argv[2] || "/tmp/preview";
fs.mkdirSync(out, { recursive: true });
const covers = "file://" + path.resolve("public/claim/covers") + "/";
const css = ["src/components/claim/templates/categoryTemplates.css", "src/components/claim/claim.css"].map((f) => fs.readFileSync(f, "utf8")).join("\n");
const offers = (k: CategoryKey, preset: boolean) => presetOffers(k).map((o, i) => ({ id: `o${i}`, position: i, title: o.title, description: o.description,
  duration_minutes: o.durationMinutes, format: o.format, price_amount: o.priceAmount, currency: "EUR", is_preset: preset, offering_id: preset ? null : `of${i}` }));
const prof = (k: CategoryKey, name: string, city: string, country: string, website: string | null, colourway: "dark" | "white", bio: string | null): any =>
  ({ id: "p", slug: "x", display_name: name, category: k, categories: [], city, country, website, instagram: null, colourway, cover_key: null, status: "draft", profile_id: null, bio });
const page = (body: string) => `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><style>body{margin:0}${css}</style></head><body>${body.replaceAll("/claim/covers/", covers)}</body></html>`;
// Static stand-in for the client-only sign-in panel (same markup/classes as ClaimActivate).
const activate = (t: any) => `<div class="oc-activate" id="activate"><div class="oc-auth"><button class="oc-btn big">${t.google}</button><button class="oc-btn big dark">${t.apple}</button><form class="oc-mail"><input placeholder="${t.email}"><button class="oc-btn ghost">${t.sendLink}</button></form></div></div>`;
const optout = (t: any) => `<p class="oc-optout"><small class="oc-muted">${t.whyHere}</small><br><button class="oc-link-btn">${t.optOut}</button></p>`;
const w = (f: string, html: string) => fs.writeFileSync(`${out}/${f}.html`, page(html));

const shot = (file: string, p: any, lang: Lang, live: boolean, opts: { open?: boolean; badge?: [number, string] } = {}) => {
  const t = T[lang];
  const top = <GoLiveBar lang={lang} live={live} open={!!opts.open} onToggle={() => {}}
    badge={opts.badge ? <QualityBadge score={opts.badge[0]} tier={opts.badge[1]} lang={lang} /> : undefined}>
    <div dangerouslySetInnerHTML={{ __html: activate(t) }} /></GoLiveBar>;
  w(file, renderToStaticMarkup(<ProfileView profile={{ ...p, status: live ? "live" : "draft" }} offers={offers(p.category, !live)} mode={live ? "live" : "draft"} lang={lang} top={top}>
    {!live && <div dangerouslySetInnerHTML={{ __html: optout(t) }} />}</ProfileView>));
};
const breath = prof("breath", "Own Your Breath (Janine Lohse)", "Berlin", "Germany", "https://www.ownyourbreath.de", "dark", "Atemarbeit und Breathwork-Sessions in Berlin und online.");
const yoga = prof("yoga", "Sofia Reyes", "Bristol", "United Kingdom", "https://example.org", "white", "Vinyasa and yin classes, retreats in Somerset.");
shot("golive-before-dark", breath, "de", false);
shot("golive-after-dark", breath, "de", true);
shot("golive-before-light", yoga, "en", false);
shot("golive-after-light", yoga, "en", true);
shot("golive-toggle-open-dark", breath, "de", false, { open: true });
shot("admin-quality-badge-light", yoga, "de", false, { badge: [83, "A"] });
for (const k of ["breath", "ice", "spiritual"] as const)
  w(`celebration-${k}`, renderToStaticMarkup(<Celebration category={k} shareUrl="https://orive.co/f/own-your-breath" lang="de" />));
w("claim-expired", `<div class="oc oc-dark" style="--acc:#00CDAC"><div class="oc-msg"><h1>${T.de.expired}</h1></div></div>`);
console.log("ok");
