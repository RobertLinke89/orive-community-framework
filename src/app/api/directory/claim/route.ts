import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getDirectoryProfile } from "@/lib/directorySample";
import { notifyInternal } from "@/lib/internalNotify";

export const dynamic = "force-dynamic";

// POST from /directory/claim/[slug]. Stores a PENDING claim request in public.directory_claim_requests (service key,
// RLS on, no anon access). No verification mail and no other mail to the claimer; one internal notification to
// robert.linke@me.com only. Approval is manual in /admin/anfragen and only changes the row status.
const hits = new Map<string, number[]>();
function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) { hits.set(key, recent); return true; }
  recent.push(now); hits.set(key, recent);
  if (hits.size > 50000) for (const [k, v] of hits) if (!v.some((t) => now - t < 86400_000)) hits.delete(k);
  return false;
}
const EMAIL = /^[^\s@<>()",;:]{1,64}@[^\s@<>()",;:]{1,190}\.[a-z]{2,24}$/i;
const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max);
const ROLES = ["Inhaber/in", "Team / Mitarbeiter/in", "Agentur / Vertretung", "Andere"];

function normUrl(v: string): string | null {
  let s = v.trim();
  if (!s) return null;
  if (/^@[\w.]{1,30}$/.test(s)) s = "https://www.instagram.com/" + s.slice(1);
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try { const u = new URL(s); if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return null; return u.toString().slice(0, 500); } catch { return null; }
}

export async function POST(req: Request) {
  const base = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || base.host;
  const proto = req.headers.get("x-forwarded-proto") || base.protocol.replace(":", "");
  const fd = await req.formData().catch(() => null);
  const slug = String(fd?.get("slug") || "").toLowerCase();
  const p = await getDirectoryProfile(slug);
  if (!p) return new NextResponse("Not found", { status: 404 });
  const back = (q: string) => NextResponse.redirect(`${proto}://${host}/directory/claim/${p.slug}?${q}`, 303);

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  if (limited("ip:" + ip, 5, 10 * 60_000) || limited("ipd:" + ip, 20, 86400_000) || limited("p:" + p.slug, 10, 86400_000)) return back("rate=1");

  const ts = Number(fd?.get("ts") || 0);
  if (fd?.get("website_url") || !ts || Date.now() - ts < 3000) return back("done=1"); // honeypot / too fast: pretend success, store nothing

  const name = clean(fd?.get("name"), 120), email = clean(fd?.get("email"), 254).toLowerCase();
  const roleRaw = clean(fd?.get("role"), 60);
  const role = ROLES.includes(roleRaw) ? roleRaw : "Andere";
  const proof = normUrl(clean(fd?.get("proof_url"), 500));
  const message = clean(fd?.get("message"), 2000) || null;
  if (fd?.get("consent") !== "1" || !name || !EMAIL.test(email) || !proof) return back("err=1");

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return back("err=1");
  const salt = process.env.CRON_SECRET || key || "orive";
  const row = {
    facilitator_id: p.id ? String(p.id).slice(0, 80) : null, profile_slug: p.slug, name, email, role, proof_url: proof, message,
    consent: true, consent_version: "directory-claim-v1-2026-11-10", lang: p.lang,
    ip_hash: createHash("sha256").update(salt + "|" + ip).digest("hex").slice(0, 32), user_agent: clean(req.headers.get("user-agent"), 300) || null,
  };
  try {
    const r = await fetch(`${url}/rest/v1/directory_claim_requests`, { method: "POST", cache: "no-store", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(row) });
    if (!r.ok) { console.error("[directory-claim] insert failed", r.status); return back("err=1"); }
  } catch { console.error("[directory-claim] insert error"); return back("err=1"); }
  await notifyInternal({
    kind: "Profil-Übernahme", title: p.name, host, replyTo: email, link: `https://orive.co/${p.slug}`,
    rows: [["Facilitator", p.name], ["Slug", p.slug], ["Ort", p.city || null], ["Name", name], ["E-Mail", email], ["Rolle", role], ["Nachweis", proof],
      ["Nachricht", message], ["Status", "offen – Freigabe nur manuell in /admin/anfragen"], ["Eingang", new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }) + " (Europe/Berlin)"]],
  });
  return back("done=1");
}
