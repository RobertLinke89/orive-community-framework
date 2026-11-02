import { describe, expect, it } from "vitest";
import { OUTREACH_KINDS, renderOutreachMail } from "@/emails/outreach";
import { COPY } from "@/emails/copy";
import { SAMPLE } from "./support/outreachSample";

describe("outreach mails", () => {
  for (const k of OUTREACH_KINDS) it(`${k}: html + text, links, no web fonts`, () => {
    const m = renderOutreachMail(k, SAMPLE);
    expect(m.subject.length).toBeGreaterThan(5);
    expect(m.html).toContain('href="https://orive.co/claim/TOKEN"');
    expect(m.html).toContain("background:#0F766E;color:#ffffff");
    expect(m.html).not.toMatch(/fonts\.googleapis|@import/);
    expect(m.html).toContain("max-width:600px");
    expect(m.html).toContain("YOUR JOURNEY MATTERS.");
    expect(m.html).toContain(SAMPLE.loeschenUrl.replace("&", "&amp;"));
    expect(m.text).toContain(SAMPLE.bestaetigenUrl);
    expect(m.text).toContain(SAMPLE.loeschenUrl);
    if (k !== "offline") { expect(m.html).toContain(SAMPLE.ausblendenUrl); expect(m.text).toContain(SAMPLE.ausblendenUrl); }
    for (const img of m.html.match(/<img [^>]*>/g) || []) expect(img).toMatch(/alt="[^"]+"/);
    expect(m.headers["List-Unsubscribe"]).toContain("/api/profil/ausblenden?token=OPT");
    expect(m.headers["List-Unsubscribe"]).not.toContain("confirm");
  });
  it("price only when real; copy fixes in activation", () => {
    const m = renderOutreachMail("activation", SAMPLE);
    expect(m.html).toContain("25 €");
    expect(m.text).toContain("• 1:1 Breath Journey\n");
    expect(m.text).not.toMatch(/einmalig/);
    expect(m.text).toContain("eigenen Weg");
    expect(Object.keys(COPY).length).toBeGreaterThanOrEqual(16);
  });
  it("escapes data", () => {
    const m = renderOutreachMail("reminder1", { ...SAMPLE, name: "<b>x</b>", profilUrl: "javascript:alert(1)" });
    expect(m.html).not.toContain("<b>x</b>");
    expect(m.html).not.toContain("javascript:");
  });
});
