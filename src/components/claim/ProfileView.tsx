import type { ReactNode } from "react";
import { CATEGORIES } from "@/lib/claim/categories";
import type { ClaimableOffer, PublicProfile, MediaImage, GalleryImage, Product, ProfileExtras } from "@/lib/claim/types";
import { CATEGORY_TEMPLATES, TPL_ICONS } from "./templates/categoryTemplates";
import { EXTRA_TEMPLATES } from "./templates/extraTemplates";
import { T, type Lang } from "./i18n";
import "./templates/categoryTemplates.css";

/**
 * Full category profile, rendered from the approved category mockups (orive-mockups / orive-drafts)
 * unchanged. Only the facilitator's own data (name, location, bio, offers, links) is injected – always
 * HTML-escaped. Template HTML itself is static, generated from the repo (see scripts/gen-category-templates.py).
 */
export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export function formatPrice(o: Pick<ClaimableOffer, "price_amount" | "currency">, lang: Lang) {
  if (o.price_amount === null) return "–";
  if (o.price_amount === 0) return T[lang].free;
  return new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-GB", { style: "currency", currency: o.currency || "EUR", maximumFractionDigits: 0 }).format(o.price_amount);
}

export function hostLabel(u: string | null) {
  if (!u) return null;
  try { const x = new URL(u); return (x.hostname.replace(/^www\./, "") + (x.pathname.length > 1 ? x.pathname.replace(/\/$/, "") : "")).slice(0, 48); } catch { return null; }
}
const safeHref = (u: string | null) => (u && /^https?:\/\//i.test(u) ? u : null);
/** Images: only https URLs (signed Supabase Storage URLs) or same-origin paths; never data:/javascript:. */
export const safeImg = (u: string | null | undefined) => (u && (/^https:\/\/[^\s"'<>]+$/i.test(u) || /^\/(?!\/)[^\s"'<>]*$/.test(u)) ? u : null);

/** "url 400w, url 800w" – every URL must pass safeImg, otherwise the whole srcset is dropped. */
export function safeSrcset(s: string | null | undefined) {
  if (!s) return null;
  const parts = s.split(/,\s+/).map((x) => x.trim().split(/\s+/));
  return parts.length && parts.every((p) => p.length === 2 && safeImg(p[0]) && /^\d{2,4}w$/.test(p[1])) ? parts.map((p) => p.join(" ")).join(", ") : null;
}

function imgTag(im: MediaImage | null | undefined, cls: string, sizes: string, eager = false) {
  const src = safeImg(im?.url);
  if (!im || !src) return "";
  const dims = im.width && im.height ? ` width="${Number(im.width) | 0}" height="${Number(im.height) | 0}"` : "";
  const label = im.label ? `<span class="imglabel">${esc(im.label)}</span>` : "";
  const set = safeSrcset(im.srcset);
  return `<figure class="${cls}"><img src="${esc(src)}"${set ? ` srcset="${esc(set)}"` : ""} alt="${esc(im.alt)}"${dims} sizes="${sizes}" loading="${eager ? "eager" : "lazy"}" decoding="async">${label}</figure>`;
}

/** Hero + grid (max 5 visible, "+N" opens the lightbox). Returns "" when there are no usable images. */
export function galleryHtml(gallery: GalleryImage[] | undefined, lang: Lang) {
  const t = T[lang];
  const items = (gallery || []).filter((g) => safeImg(g.url) && g.alt?.trim()).sort((a, b) => a.position - b.position).slice(0, 12);
  if (!items.length) return "";
  const shown = items.slice(0, 5);
  const cells = shown.map((g, i) => {
    const more = i === shown.length - 1 && items.length > shown.length ? `<span class="more">+${items.length - shown.length}</span>` : "";
    return `<button type="button" class="gcell${i === 0 ? " hero" : ""}" data-lb="${i}" aria-label="${esc(g.alt)}">${imgTag(g, "gimg", i === 0 ? "(max-width:700px) 100vw, 640px" : "(max-width:700px) 50vw, 320px", i === 0)}${more}</button>`;
  }).join("");
  const data = esc(JSON.stringify(items.map((g) => ({ u: safeImg(g.url), a: g.alt, l: g.label || null }))));
  return `<section class="gallery n${Math.min(shown.length, 5)}" aria-label="${esc(t.gallery)}" data-gallery="${data}"><h2 class="sr">${esc(t.gallery)}</h2><div class="ggrid">${cells}</div>${items.length > 1 ? `<button type="button" class="gall" data-lb="0">${esc(t.showAll.replace("{n}", String(items.length)))}</button>` : ""}</section>`;
}

export function productsHtml(products: Product[] | undefined, lang: Lang) {
  const t = T[lang];
  if (!products?.length) return "";
  const cards = [...products].sort((a, b) => a.position - b.position).map((p) => {
    const href = safeHref(p.url);
    return `<div class="card prod${p.image && safeImg(p.image.url) ? " has-img" : ""}">${imgTag(p.image, "pimg", "(max-width:700px) 100vw, 300px")}<h3>${esc(p.title)}</h3>${p.description ? `<p class="muted">${esc(p.description)}</p>` : ""}<b class="price">${esc(formatPrice(p, lang))}</b>${href ? ` <a class="btn ghost" href="${esc(href)}" rel="nofollow noopener noreferrer" target="_blank">${esc(t.toProduct)}</a>` : ""}</div>`;
  }).join("");
  return `<h2>${esc(t.products)}</h2><div class="offers products" id="produkte">${cards}</div>`;
}

/** Something a visitor can actually book right now (live, confirmed offer with an offering). */
export const hasBookable = (offers: ClaimableOffer[], mode: "draft" | "live") => mode === "live" && offers.some((o) => !o.is_preset && !!o.offering_id);

export function offersHtml(offers: ClaimableOffer[], mode: "draft" | "live", lang: Lang, cls = "") {
  const t = T[lang];
  const cards = offers.map((o) => {
    const meta = [o.duration_minutes ? `${o.duration_minutes} ${t.min}` : "", t[o.format]].filter(Boolean).join(" · ");
    const badge = o.is_preset ? ` <small class="ex">${esc(t.example)}</small>` : "";
    // single booking CTA lives in the cover; bookable cards are just clickable (no extra visible button)
    const live = mode === "live" && !o.is_preset && !!o.offering_id;
    const book = "";
    const img = imgTag(o.image, "oimg", "(max-width:700px) 100vw, 320px");
    return `<div class="card${img ? " has-img" : ""}${live ? " bookable" : ""}" data-preset="${o.is_preset ? 1 : 0}"${live ? ` data-book="${esc(o.offering_id!)}" role="button" tabindex="0" aria-label="${esc(`${t.bookNow}: ${o.title}`)}"` : ""}>${img}<h3>${esc(o.title)}</h3><p class="muted">${esc(o.description || meta)}</p>${o.description ? `<p class="muted">${esc(meta)}</p>` : ""}<b class="price">${esc(formatPrice(o, lang))}${badge}</b>${book}</div>`;
  }).join("");
  if (!offers.length) return `<h2>${esc(t.offers)}</h2><div class="empty-offers card" id="angebote"><b>${esc(t.noOffers)}</b><p class="muted">${esc(t.noOffersHint)}</p></div>`;
  return `<h2>${esc(t.offers)}</h2><div class="offers ${esc(cls)}" id="angebote">${cards}</div>`;
}

export function linksHtml(p: PublicProfile) {
  const w = safeHref(p.website), ig = safeHref(p.instagram);
  if (!w && !ig) return "";
  return `<div class="links">${w ? `<a href="${esc(w)}" rel="nofollow noopener noreferrer" target="_blank">${TPL_ICONS.globe} ${esc(hostLabel(w))}</a>` : ""}${ig ? `<a href="${esc(ig)}" rel="nofollow noopener noreferrer" target="_blank">${TPL_ICONS.insta} ${esc(hostLabel(ig))}</a>` : ""}</div>`;
}

export function ctaHtml(text: string, mode: "draft" | "live", lang: Lang, bookable = true) {
  void text; void mode; void lang; void bookable;
  return ""; // merged into the single cover booking button (bookCtaHtml)
}

/**
 * Primary booking CTA (Orive teal): in the profile head (above the fold on desktop) and as a sticky bottom bar on
 * mobile. Only when something is bookable. One bookable offer -> opens its calendar directly; several -> jumps to offers.
 */
export function bookCtaHtml(offers: ClaimableOffer[], mode: "draft" | "live", lang: Lang) {
  if (!hasBookable(offers, mode)) return { head: "", bar: "" };
  const t = T[lang];
  const bookable = offers.filter((o) => !o.is_preset && o.offering_id);
  const prices = bookable.map((o) => o.price_amount).filter((p): p is number => typeof p === "number" && p > 0); // free intro calls must not produce "ab 0 €"
  const from = prices.length ? t.fromPrice.replace("{p}", formatPrice({ price_amount: Math.min(...prices), currency: bookable[0].currency }, lang)) : "";
  const attr = bookable.length === 1 ? `href="#angebote" data-book="${esc(bookable[0].offering_id!)}"` : `href="#angebote"`;
  const head = `<div class="book-cta"><a class="btn-book" ${attr} title="${esc(t.bookHint)}">${TPL_ICONS.cal}<span>${esc(t.bookNow)}</span>${from ? `<small class="from">${esc(from)}</small>` : ""}</a></div>`;
  return { head, bar: "" }; // one single CTA: overlaid top-right in the cover
}

/**
 * Avatar: real photo(s) of the facilitator. 1 image -> large round avatar; 2–3 -> stacked collage (main photo
 * centred, up to two smaller side views overlapping its lower edge). No usable photo -> initials.
 */
export function avatarHtml(av: ProfileExtras["avatar"], initials: string) {
  const items = (av || []).filter((a) => safeImg(a.url) && a.alt?.trim()).slice(0, 3);
  if (!items.length) return `<div class="avatar-stack n1"><div class="avatar ini">${esc(initials)}</div></div>`;
  const img = (a: { url: string; alt: string; position?: string }, cls: string) => {
    const pos = a.position && /^[0-9 %a-z.]{1,20}$/.test(a.position) ? ` style="object-position:${a.position}"` : "";
    return `<div class="${cls}"><img src="${esc(safeImg(a.url))}" alt="${esc(a.alt)}"${pos} loading="eager" decoding="async"></div>`;
  };
  const [main, ...rest] = items;
  return `<div class="avatar-stack n${items.length}">${rest.map((a, i) => img(a, `avatar sub s${i + 1}`)).join("")}${img(main, "avatar photo")}</div>`;
}

/**
 * Theme: DAY (white) is the default for everyone. Night mode (dark navy) only via the visitor's OS setting
 * (prefers-color-scheme: dark, theme "auto") or the night-mode toggle (theme "night"). The facilitator's old
 * `colourway` no longer decides the look.
 */
export type Theme = "auto" | "day" | "night";
export function renderProfileHtml(profile: PublicProfile, offers: ClaimableOffer[], mode: "draft" | "live", lang: Lang, extras: ProfileExtras = {}, theme: Theme = "auto"): string {
  const c = CATEGORIES[profile.category] ?? CATEGORIES.mindfulness;
  const tpl = CATEGORY_TEMPLATES[c.key] ?? EXTRA_TEMPLATES[c.key];
  const t = T[lang];
  const loc = [profile.city, profile.country].filter(Boolean).join(", ");
  const initials = profile.display_name.replace(/\(.*?\)/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const cover = profile.cover_key && /^[a-z0-9-]{1,40}$/.test(profile.cover_key) ? profile.cover_key : c.key;
  const coverImg = safeImg(extras.cover?.url);
  const coverUrl = coverImg ? `'${coverImg.replace(/['\\()]/g, encodeURIComponent)}'` : `/claim/covers/${cover}.jpg`;
  const banner = mode === "draft" ? `<div class="banner">${TPL_ICONS.shield} ${esc(t.draftBanner)}</div>` : "";
  const cta = bookCtaHtml(offers, mode, lang);
  const head = `${banner}<div class="cover" style="background-image:linear-gradient(180deg,#0002,#000a),url(${coverUrl})">${coverImg ? `<span class="cover-alt sr">${esc(extras.cover!.alt)}</span>` : ""}<span class="chip">${tpl.iconSvg} <span class="chip-t">${esc(tpl.label)}</span></span>${mode === "draft" ? `<button class="chg" type="button">${TPL_ICONS.camera} ${esc(t.changeCover)}</button>` : ""}${cta.head}</div>`
    + `<div class="wrap"><div class="head centered">${avatarHtml(extras.avatar, initials)}<div class="ident"><h1>${esc(profile.display_name)}</h1><p class="muted">${tpl.iconSvg} ${esc(tpl.label)}${loc ? ` · ${TPL_ICONS.pin} ${esc(loc)}` : ""}</p></div></div>`;
  const bio = profile.bio ? `<div class="bio card"><h3>${esc(t.about)}${mode === "draft" ? ` <small class="drf">${esc(t.editMe)}</small>` : ""}</h3><p>${esc(profile.bio)}</p></div>` : "";
  let body = tpl.body;
  // Breathwork: the "Breathe in/out" circle duplicates the free sample under the avatar -> drop it (breath only).
  if (c.key === "breath") body = body.replace(/<div class="bhero">[\s\S]*?<\/p><\/div>\n?/, "");
  if (!/<!--ORIVE:OFFERS:/.test(body)) body = body.replace("<!--ORIVE:LINKS-->", "<!--ORIVE:OFFERS:--><!--ORIVE:LINKS-->");
  body = body
    .replace(/<!--ORIVE:OFFERS:([a-z]*)-->/, (_, cls) => offersHtml(offers, mode, lang, cls) + productsHtml(extras.products, lang))
    .replace("<!--ORIVE:LINKS-->", linksHtml(profile))
    .replace(/<!--ORIVE:CTA:([^>]*?)-->/, (_, text) => ctaHtml(text, mode, lang, hasBookable(offers, mode)));
  return `<section class="orive-tpl variant white c-${c.key}" data-theme="${theme}" style="--acc:${c.accent};--acc2:${c.accent2}">${head}${galleryHtml(extras.gallery, lang)}${tpl.sample}${bio}${body}</div>${cta.bar}</section>`;
}

type Props = { profile: PublicProfile; offers: ClaimableOffer[]; mode: "draft" | "live"; lang: Lang; extras?: ProfileExtras; theme?: Theme; top?: ReactNode; children?: ReactNode };

export function ProfileView({ profile, offers, mode, lang, extras, theme = "auto", top, children }: Props) {
  return (
    <div className="oc-page" data-mode={mode}>
      {top}
      <div dangerouslySetInnerHTML={{ __html: renderProfileHtml(profile, offers, mode, lang, extras, theme) }} />
      {children}
    </div>
  );
}
