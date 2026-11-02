import { afterEach, describe, expect, it } from "vitest";
import { computeOutreachDue, deleteByOptOutToken, hashOptOut, hideByOptOutToken, newOptOutToken, setPublicationRepoForTests, type Outreach } from "@/lib/claim/publication";

const D = 864e5, d0 = +new Date("2026-11-01T09:00:00Z");
const iso = (day: number) => new Date(d0 + day * D).toISOString();
const row = (p: Partial<Outreach> = {}): Outreach => ({ claimable_profile_id: "x", published_at: iso(0), activation_sent_at: iso(0), reminder1_sent_at: null, reminder2_sent_at: null, reminder3_sent_at: null, responded_at: null, response_type: null, unpublished_at: null, unpublish_reason: null, ...p });
const at = (day: number) => d0 + day * D;

describe("outreach lifecycle", () => {
  it("reminders at day 7/14/21, unpublish by day 28", () => {
    expect(computeOutreachDue([row()], at(6.9))).toEqual([]);
    expect(computeOutreachDue([row()], at(7))[0]).toMatchObject({ kind: "reminder", n: 1 });
    expect(computeOutreachDue([row({ reminder1_sent_at: iso(7) })], at(14))[0]).toMatchObject({ kind: "reminder", n: 2 });
    expect(computeOutreachDue([row({ reminder1_sent_at: iso(7), reminder2_sent_at: iso(14) })], at(21))[0]).toMatchObject({ kind: "reminder", n: 3 });
    const r3 = row({ reminder1_sent_at: iso(7), reminder2_sent_at: iso(14), reminder3_sent_at: iso(21) });
    expect(computeOutreachDue([r3], at(27.9))).toEqual([]);
    expect(computeOutreachDue([r3], at(28))[0]).toMatchObject({ kind: "unpublish", reason: "no_response_after_reminder3" });
  });
  it("no mails after a response, unpublish, or without activation mail", () => {
    for (const p of [{ responded_at: iso(3), response_type: "confirmed" as const }, { responded_at: iso(3), response_type: "opt_out" as const }, { unpublished_at: iso(3) }, { activation_sent_at: null }])
      expect(computeOutreachDue([row(p)], at(40))).toEqual([]);
  });
  it("late cron does not bunch reminders and never skips one", () => {
    expect(computeOutreachDue([row()], at(30)).map((a) => a.kind === "reminder" && a.n)).toEqual([1]);
    const late = row({ reminder1_sent_at: iso(12) });
    expect(computeOutreachDue([late], at(14))).toEqual([]);         // needs 7 days after reminder 1
    expect(computeOutreachDue([late], at(19))[0]).toMatchObject({ n: 2 });
  });
});

describe("one-click opt-out", () => {
  afterEach(() => setPublicationRepoForTests(null));
  it("hides by token hash only; malformed/unknown tokens are neutral", async () => {
    const { token, hash } = newOptOutToken();
    const calls: string[] = [];
    setPublicationRepoForTests({
      async hideByTokenHash(h) { calls.push("hide:" + h); return h === hash ? { name: "Anna", sourceId: null, email: null } : null; },
      async peekByTokenHash(h) { return h === hash ? { name: "Anna", sourceId: "s", email: "a@b.c", hidden: true } : null; },
      async deleteByTokenHash(h, keys) { calls.push(`del:${keys.length}`); return h === hash; },
    });
    expect(await hideByOptOutToken(token)).toEqual({ ok: true, name: "Anna" });
    expect(calls[0]).toBe("hide:" + hashOptOut(token));
    expect(await hideByOptOutToken("short")).toEqual({ ok: false });
    expect(await hideByOptOutToken(newOptOutToken().token)).toEqual({ ok: false });
    expect(await deleteByOptOutToken(token)).toBe(true);
    expect(calls).toContain("del:2");                                 // source + email suppression keys
  });
});

describe("RFC 8058 one-click endpoint", () => {
  afterEach(() => setPublicationRepoForTests(null));
  it("cross-origin one-click POST hides via URL token; never deletes; form posts still need same origin", async () => {
    const { POST } = await import("@/app/api/profil/ausblenden/route");
    const { token, hash } = newOptOutToken();
    const calls: string[] = [];
    setPublicationRepoForTests({
      async hideByTokenHash(h) { calls.push("hide"); return h === hash ? { name: "A", sourceId: null, email: null } : null; },
      async peekByTokenHash() { calls.push("peek"); return null; },
      async deleteByTokenHash() { calls.push("delete"); return true; },
    });
    const oneClick = await POST(new Request(`https://orive.test/api/profil/ausblenden?token=${token}&action=delete&confirm=1`, {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", origin: "https://mail.google.com" }, body: "List-Unsubscribe=One-Click" }));
    expect(oneClick.status).toBe(200);
    expect(calls).toEqual(["hide"]);
    const forged = await POST(new Request("https://orive.test/api/profil/ausblenden", {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", origin: "https://evil.example" }, body: `token=${token}&action=delete&confirm=1` }));
    expect(forged.status).toBe(403);
    expect(calls).toEqual(["hide"]);
  });
});
