/** Outreach copy, derived from locales.ts (one dictionary per locale). Placeholders: {vorname} {kategorie} {n} */
import { LOCALES, type Locale, type LocaleCopy } from "./locales";
export type { Locale } from "./locales";
export type OutreachKind = "activation" | "reminder1" | "reminder2" | "reminder3" | "offline";
export type MailCopy = { subject: string; preheader: string; headline: string; paragraphs: string[]; cta: string; secondaryIntro: string; showHide: boolean; signoff: string };
export type Common = { hello: string; hide: string; del: string; offers: string; example: string; footerReason: string; footerReasonOffline: string; footerHide: string;
  tagline: string; previewAlt: string; waiting: string; yourProfile: string };

function build(l: LocaleCopy): { common: Common; mails: Record<OutreachKind, MailCopy> } {
  const seven = (t: string[], showHide: boolean): MailCopy => ({ subject: t[0], preheader: t[1], headline: t[2], paragraphs: [t[3], t[4]], cta: t[5], secondaryIntro: t[6], showHide, signoff: `${l.regular}\n${l.from}` });
  return {
    common: { hello: l.hello, hide: l.hide, del: l.del, offers: l.offers, example: l.example, footerReason: l.reason, footerReasonOffline: l.reasonOffline,
      footerHide: l.footerHide, tagline: "YOUR JOURNEY MATTERS.", previewAlt: l.previewAlt, waiting: l.waiting, yourProfile: l.yourProfile },
    mails: {
      activation: { subject: l.a[0], preheader: l.a[1], headline: l.a[2], paragraphs: [l.a[3], l.a[4], l.a[5]], cta: l.a[6], secondaryIntro: l.a[7], showHide: true, signoff: `${l.warm}\n${l.from}` },
      reminder1: seven(l.r1, true), reminder2: seven(l.r2, true), reminder3: seven(l.r3, true), offline: seven(l.off, false),
    },
  };
}
export const COPY = Object.fromEntries(Object.entries(LOCALES).map(([k, v]) => [k, build(v as LocaleCopy)])) as Record<Locale, ReturnType<typeof build>>;
