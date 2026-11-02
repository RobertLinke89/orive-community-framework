import { COPY, type Locale, type OutreachKind } from "./copy";
import { normLang, pickLocale } from "./locale";
import { COMPACT, FEATURES, FEATURE_ICON, FEATURE_ORDER } from "./features";

/**
 * Outreach mails (activation, reminder 1-3, offline notice) as table-based HTML + plain text.
 * Pure rendering only – NOTHING is sent here. The explicit send step passes `headers` to Resend
 * (List-Unsubscribe -> one-click hide link, RFC 8058) and afterwards calls rpc mark_outreach_sent.
 * Day mode, system fonts (no web-font links), 600px max, mobile + dark-mode safe.
 * DESIGN SOURCE: the existing approved invite/test mail /workspace/orive-testmail/mail_v4.html + teaser_v4_src.html
 * (also used for orive-invites-3): wings logo centred in a rounded white card, faded ("ausgeblendetes") profile teaser
 * with cover, category chip, ringed avatar, offers and the line "Dein Profil wartet auf dich", pill CTA, footer box
 * with the Impressum line. Changes vs. v4: white page background instead of the photo, no Google-Fonts link,
 * CTA #0F766E (was #00CDAC), teaser built from HTML tables (no PNG), offer mini-cards with image.
 */
export const ORIVE_LOGO = "https://www.orive.co/orive-logo-wings.png";
export const IMPRESSUM = "Impressum: heybotti, Robert Linke, Rudolstadt, Germany";
export type MailOffer = { title: string; price: string | null; imageUrl: string; imageAlt: string; imageLabel?: string | null };
export type OutreachData = {
  vorname: string; name: string; kategorie: string; ort: string | null; avatarUrl?: string | null;
  offerCount: number; offers: MailOffer[];               // 2-3 shown; price only when real (null -> hidden)
  profilUrl: string; bestaetigenUrl: string; ausblendenUrl: string; loeschenUrl: string;
  logoUrl?: string | null; postalAddress?: string;     // default: Impressum line of the existing invite mails
  coverUrl?: string | null; accent?: string;           // category cover + accent for the teaser (like the profile page)
};
export const ORIVE_FROM = "Orive <hello@orive.co>";
export type RenderedMail = { from: string; locale: Locale; subject: string; preheader: string; html: string; text: string; headers: Record<string, string> };

const ACC = "#0F766E", INK = "#0f172a", MUT = "#475569";
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const safeUrl = (u: string) => (/^https:\/\/[^\s"'<>]+$/i.test(u) ? u : "#");
const fill = (s: string, d: OutreachData) => s.replace(/\{vorname\}/g, d.vorname).replace(/\{kategorie\}/g, d.kategorie).replace(/\{n\}/g, String(d.offerCount)).replace(/\{name\}/g, d.name);
const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/** Faded profile teaser – port of teaser_v4_src.html to email-safe tables (opacity via washed-out colours + fade row). */
function previewCard(d: OutreachData, loc: Locale) {
  const c = COPY[loc].common, acc = d.accent || ACC;
  const av = d.avatarUrl
    ? `<img src="${esc(safeUrl(d.avatarUrl))}" width="56" height="56" alt="${esc(d.name)}" style="display:block;width:56px;height:56px;border-radius:28px">`
    : `<div style="width:56px;height:56px;border-radius:28px;background:#7fd8cc;color:#ffffff;font:700 18px/56px ${FONT};text-align:center">${esc(initials(d.name))}</div>`;
  const offers = d.offers.slice(0, 3).map((o) => `<td class="oc" width="33%" valign="top" style="padding:0 5px">
      <img src="${esc(safeUrl(o.imageUrl))}" width="150" alt="${esc(o.imageAlt)}" style="display:block;width:100%;height:auto;border-radius:8px;border:0;opacity:.6">
      ${o.imageLabel ? `<div style="font:10px/1.4 ${FONT};color:#94a3b8;margin-top:2px">${esc(c.example)}</div>` : ""}
      <div style="font:600 12px/1.35 ${FONT};color:#64748b;margin-top:3px">${esc(o.title)}</div>
      ${o.price ? `<div style="font:700 12px/1.4 ${FONT};color:${acc};opacity:.75">${esc(o.price)}</div>` : ""}</td>`).join("");
  const cover = d.coverUrl ? `background:#e2e8f0 url('${esc(safeUrl(d.coverUrl))}') center/cover no-repeat;` : `background:#e2e8f0;`;
  return `<a href="${esc(safeUrl(d.profilUrl))}" style="text-decoration:none;display:block" aria-label="${esc(c.previewAlt)}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;border:1px solid #eef2f6;background:#ffffff;overflow:hidden">
    <tr><td height="96" style="${cover}height:96px;border-radius:16px 16px 0 0;padding:12px;vertical-align:top;opacity:.55">
      <span style="display:inline-block;background:${acc};color:#ffffff;font:700 11px/1 ${FONT};padding:5px 10px;border-radius:999px">${esc(d.kategorie)}</span></td></tr>
    <tr><td style="padding:12px 18px 6px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td valign="middle" style="padding-right:12px"><div style="border:3px solid ${acc};border-radius:34px;padding:3px;opacity:.7">${av}</div></td>
      <td valign="middle"><div style="font:800 18px/1.3 ${FONT};color:#64748b">${esc(d.name)}</div>
        <div style="font:12px/1.4 ${FONT};color:#94a3b8">${esc([d.kategorie, d.ort].filter(Boolean).join(" · "))} · ${esc(fill(c.offers, d))}</div></td></tr></table></td></tr>
    ${offers ? `<tr><td style="padding:10px 13px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${offers}</tr></table></td></tr>` : ""}
    <tr><td align="center" style="padding:14px 18px 16px;background:#ffffff;background-image:linear-gradient(rgba(255,255,255,0),#ffffff 60%)">
      <span style="font:600 14px/1.4 ${FONT};color:${ACC}">&#10022; ${esc(c.waiting)}</span></td></tr>
  </table></a>`;
}

/** Benefits block: activation = full (5 items, icon + headline + one line), reminders = compact (3), offline = one line. */
function featuresHtml(kind: OutreachKind, d: OutreachData, loc: Locale) {
  const f = FEATURES[loc];
  if (kind === "offline") return `<p style="margin:0 0 18px;padding:12px 14px;background:#f0fdfa;border-radius:12px;font:600 14px/1.5 ${FONT};color:${ACC}">${esc(f.offline)}</p>`;
  const keys = kind === "activation" ? FEATURE_ORDER : COMPACT;
  const full = kind === "activation";
  const rows = keys.map((k) => {
    const [t, l] = f.items[k];
    return `<tr><td width="40" valign="top" style="padding:${full ? "8px" : "5px"} 10px 0 0"><div style="width:30px;height:30px;border-radius:15px;background:${ACC};color:#ffffff;font:700 15px/30px ${FONT};text-align:center" aria-hidden="true">${FEATURE_ICON[k]}</div></td>
      <td valign="top" style="padding:${full ? "8px" : "5px"} 0 0"><div style="font:700 15px/1.35 ${FONT};color:${INK}">${esc(t)}</div><div style="font:14px/1.45 ${FONT};color:${MUT}">${esc(fill(l, d))}</div></td></tr>`;
  }).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;background:#f0fdfa;border-radius:14px"><tr><td style="padding:${full ? "16px 18px 18px" : "12px 16px 14px"}">
    <div style="font:700 ${full ? "17px" : "15px"}/1.3 ${FONT};color:${ACC};margin:0 0 2px">${esc(f.title)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr></table>`;
}
function featuresText(kind: OutreachKind, d: OutreachData, loc: Locale): string[] {
  const f = FEATURES[loc];
  if (kind === "offline") return [f.offline, ""];
  return [f.title.toUpperCase(), ...(kind === "activation" ? FEATURE_ORDER : COMPACT).map((k) => `  + ${f.items[k][0]}: ${fill(f.items[k][1], d)}`), ""];
}

/** Locale is chosen per facilitator (website language -> country -> en), see locale.ts; stored as facilitator_outreach.locale. */
export function renderOutreachMailFor(kind: OutreachKind, d: OutreachData, f: { websiteLang?: string | null; country?: string | null; locale?: string | null }): RenderedMail {
  return renderOutreachMail(kind, d, normLang(f.locale) || pickLocale(f));
}
export function renderOutreachMail(kind: OutreachKind, d: OutreachData, loc: Locale = "de"): RenderedMail {
  if (!COPY[loc]) loc = "en";
  const withLang = (u: string) => (/[?&]lang=/.test(u) ? u : `${u}${u.includes("?") ? "&" : "?"}lang=${loc}`);
  d = { ...d, ausblendenUrl: withLang(d.ausblendenUrl), loeschenUrl: withLang(d.loeschenUrl) };
  const m = COPY[loc].mails[kind], c = COPY[loc].common;
  const subject = fill(m.subject, d), preheader = fill(m.preheader, d);
  const addr = d.postalAddress || process.env.ORIVE_POSTAL_ADDRESS || IMPRESSUM;
  const p = (s: string) => `<p style="margin:0 0 14px;font:16px/1.6 ${FONT};color:${INK}">${esc(fill(s, d))}</p>`;
  const link = (u: string, t: string) => `<a href="${esc(safeUrl(u))}" style="color:${MUT};text-decoration:underline">${esc(t)}</a>`;
  const secondary = [m.showHide ? link(d.ausblendenUrl, c.hide) : "", link(d.loeschenUrl, c.del)].filter(Boolean).join(" &nbsp;·&nbsp; ");
  const html = `<!doctype html><html lang="${loc}" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(subject)}</title>
<style>
:root{color-scheme:light;supported-color-schemes:light}
body{margin:0!important;padding:0!important;background:#ffffff}
@media (max-width:620px){.card{padding:24px 18px!important;border-radius:0!important;box-shadow:none!important}.outer{padding:0!important}.h1{font-size:22px!important}.oc{display:inline-block!important;width:31%!important;padding:0 1%!important}.btn{display:block!important}}
@media (prefers-color-scheme:dark){.keep-light,.keep-light td,.card{background:#ffffff!important;color:${INK}!important}}
[data-ogsc] .btn{background:${ACC}!important;color:#ffffff!important}
</style></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:${FONT};color:${INK}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="keep-light" bgcolor="#ffffff" style="background:#ffffff"><tr><td align="center" class="outer" style="padding:14px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td class="card" style="background:#ffffff;border-radius:18px;padding:34px;border:1px solid #eef2f6;box-shadow:0 4px 24px rgba(15,23,42,.08)">
  <div style="text-align:center;padding:0 0 22px"><img src="${esc(safeUrl(d.logoUrl || ORIVE_LOGO))}" alt="Orive" height="29" style="height:29px;display:inline-block;border:0"></div>
  <h1 class="h1" style="margin:0 0 16px;font:700 24px/1.3 ${FONT};color:${INK}">${esc(fill(m.headline, d))}</h1>
  ${p(c.hello)}${kind === "activation" ? p(m.paragraphs[0]) + featuresHtml(kind, d, loc) + m.paragraphs.slice(1).map(p).join("") : m.paragraphs.map(p).join("") + featuresHtml(kind, d, loc)}
  ${kind !== "offline" ? `<div style="margin:6px 0 4px">${previewCard(d, loc)}</div>` : ""}
  <p style="text-align:center;margin:26px 0"><a class="btn" href="${esc(safeUrl(d.bestaetigenUrl))}" style="display:inline-block;background:${ACC};color:#ffffff;text-decoration:none;font:700 15px/1.2 ${FONT};padding:14px 30px;border-radius:999px">${esc(m.cta)}</a></p>
  <p style="margin:0 0 4px;font:14px/1.6 ${FONT};color:${MUT};text-align:center">${esc(fill(m.secondaryIntro, d))}</p>
  <p style="margin:0 0 24px;font:14px/1.6 ${FONT};text-align:center">${secondary}</p>
  <p style="margin:0;font:15px/1.65 ${FONT};color:${INK};white-space:pre-line">${esc(m.signoff)}</p>
  <p style="margin:4px 0 0;font:13px/1.5 ${FONT};color:#64748B">Orive · <a href="https://orive.co" style="color:${ACC}">orive.co</a></p>
</td></tr>
<tr><td style="padding:16px 0 0"><div style="font:12px/1.55 ${FONT};color:#334155;padding:12px 14px;text-align:center;background:#f8fafc;border-radius:12px">
  ${esc(kind === "offline" ? c.footerReasonOffline : c.footerReason)}${m.showHide ? `<br><br>${link(d.ausblendenUrl, c.footerHide)}` : ""}<br>
  <a href="mailto:hello@orive.co" style="color:#64748B">hello@orive.co</a> · ${esc(addr)}
  <div style="margin-top:10px;font:600 10px/1.4 ${FONT};letter-spacing:.24em;color:#94a3b8">${esc(c.tagline)}</div></div></td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    fill(m.headline, d).toUpperCase(), "", fill(c.hello, d), "", ...(kind === "activation" ? [fill(m.paragraphs[0], d), "", ...featuresText(kind, d, loc), ...m.paragraphs.slice(1).flatMap((x) => [fill(x, d), ""])] : [...m.paragraphs.flatMap((x) => [fill(x, d), ""]), ...featuresText(kind, d, loc)]),
    ...(kind !== "offline" ? [`${c.yourProfile}: ${d.name} – ${[d.kategorie, d.ort].filter(Boolean).join(" · ")} – ${fill(c.offers, d)}`, d.profilUrl,
      ...d.offers.slice(0, 3).map((o) => `  • ${o.title}${o.price ? ` – ${o.price}` : ""}`), ""] : []),
    `${m.cta}: ${d.bestaetigenUrl}`, "", fill(m.secondaryIntro, d),
    ...(m.showHide ? [`${c.hide}: ${d.ausblendenUrl}`] : []), `${c.del}: ${d.loeschenUrl}`, "", m.signoff, "", "--",
    kind === "offline" ? c.footerReasonOffline : c.footerReason, ...(m.showHide ? [`${c.footerHide}: ${d.ausblendenUrl}`] : []), `hello@orive.co · ${addr}`, c.tagline,
  ].join("\n");

  // RFC 8058 one-click: mail clients POST to this URL -> must hit the hide endpoint, never delete.
  // RFC 8058 target is the API route (accepts the cross-origin one-click POST; hides only).
  const oneClick = d.ausblendenUrl.replace("/profil/ausblenden", "/api/profil/ausblenden");
  const headers = { "List-Unsubscribe": `<${oneClick}>, <mailto:hello@orive.co?subject=${encodeURIComponent(c.hide)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" };
  return { from: ORIVE_FROM, locale: loc, subject, preheader, html, text, headers };
}
export const OUTREACH_KINDS: OutreachKind[] = ["activation", "reminder1", "reminder2", "reminder3", "offline"];
