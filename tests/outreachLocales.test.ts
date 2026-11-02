import { describe, expect, it } from "vitest";
import { LOCALES, LOCALE_CODES } from "@/emails/locales";
import { FEATURES } from "@/emails/features";
import { htmlLang, localeForCountry, normLang, pickLocale } from "@/emails/locale";
import { OUTREACH_KINDS, renderOutreachMail, renderOutreachMailFor } from "@/emails/outreach";
import { SAMPLE } from "./support/outreachSample";

const flat = (o: unknown): string[] => (typeof o === "string" ? [o] : Array.isArray(o) ? o.flatMap(flat) : o && typeof o === "object" ? Object.values(o).flatMap(flat) : []);

describe("locale choice", () => {
  it("website language first, then country, then en", () => {
    expect(pickLocale({ websiteLang: "fr-CH", country: "Switzerland" })).toBe("fr");
    expect(pickLocale({ websiteLang: null, country: "Switzerland" })).toBe("de");
    expect(pickLocale({ websiteLang: "nb-NO" })).toBe("no");
    expect(pickLocale({ websiteLang: "ja", country: "Netherlands" })).toBe("nl");
    expect(pickLocale({ country: "Estonia" })).toBe("en");
    expect(pickLocale({})).toBe("en");
    expect(localeForCountry("CZ")).toBe("cs");
    expect(normLang("EN_gb")).toBe("en");
    expect(htmlLang('<!doctype html><html class="x" lang="pt-PT">')).toBe("pt-PT");
  });
  it("covers every A-tier country with >=50 facilitators", () => {
    for (const c of ["Netherlands", "France", "Germany", "Switzerland", "United Kingdom", "Austria", "Spain", "Italy", "Belgium", "Sweden", "Denmark", "Poland", "Ireland", "Finland", "Portugal", "Czechia", "Norway", "Hungary", "Greece", "Romania", "Slovakia", "Slovenia", "Croatia"])
      expect(localeForCountry(c)).not.toBeNull();
  });
  it("stored locale wins", () => {
    expect(renderOutreachMailFor("activation", SAMPLE, { locale: "it", country: "Germany" }).locale).toBe("it");
  });
});

describe("all locales complete", () => {
  const de = LOCALES.de;
  for (const l of LOCALE_CODES) it(`${l}: same shape as de, placeholders kept, renders all mails`, () => {
    const c = LOCALES[l] as typeof de;
    expect(Object.keys(c).sort()).toEqual(Object.keys(de).sort());
    expect(c.a.length).toBe(8);
    for (const k of ["r1", "r2", "r3", "off"] as const) expect(c[k].length).toBe(7);
    expect(flat(c).every((s) => s.trim().length > 0)).toBe(true);
    expect(c.hello).toContain("{vorname}");
    expect(c.a[3]).toContain("{n}");
    expect(flat(c).join(" ")).not.toMatch(/hallo@/);
    expect(Object.keys(FEATURES[l].items)).toHaveLength(5);
    for (const k of OUTREACH_KINDS) {
      const m = renderOutreachMail(k, SAMPLE, l);
      expect(m.html).toContain(`lang="${l}"`);
      expect(m.html).not.toMatch(/\{(vorname|kategorie|n)\}/);
      expect(m.text).not.toMatch(/\{(vorname|kategorie|n)\}/);
      expect(m.from).toBe("Orive <hello@orive.co>");
      expect(m.html).toContain(`lang=${l}`);
    }
  });
  it("features: full in activation, compact in reminders, one line offline", () => {
    const a = renderOutreachMail("activation", SAMPLE, "en"), r = renderOutreachMail("reminder2", SAMPLE, "en"), o = renderOutreachMail("offline", SAMPLE, "en");
    expect(a.html).toContain("You confirm every booking yourself.");
    expect(a.html).toContain("Get found");
    expect(r.html).toContain("Free profile");
    expect(r.html).not.toContain("Get found");
    expect(o.html).toContain(FEATURES.en.offline);
    expect(o.html).not.toContain("Free profile</div>");
    expect(a.html).toContain('height="29"');
  });
  it("List-Unsubscribe points to the API (one-click), hide only", () => {
    const m = renderOutreachMail("reminder1", SAMPLE, "nl");
    expect(m.headers["List-Unsubscribe"]).toMatch(/^<https:\/\/orive\.co\/api\/profil\/ausblenden\?token=OPT&lang=nl>/);
    expect(m.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });
});
