import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Internal admin list: directory inquiries, claim requests, removal requests. HTTP Basic auth (ORIVE_ADMIN_USER /
// ORIVE_ADMIN_PASSWORD in .env; without a password the page is closed). noindex + /admin/ is disallowed in robots.
// Actions only change status columns in the DB. NOTHING here sends mail or contacts anyone.
const H = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY" };
const INQ: Record<string, string> = { new: "neu", closed: "bearbeitet", forwarded: "weitergeleitet", spam: "Spam" };
const CLM: Record<string, string> = { new: "neu", closed: "bearbeitet", approved: "genehmigt (übernommen)", rejected: "abgelehnt" };
const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const when = (v: string) => { try { return new Date(v).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "short", timeStyle: "short" }); } catch { return v; } };

function same(a: string, b: string) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }
function authorized(req: Request) {
  const pw = process.env.ORIVE_ADMIN_PASSWORD || "";
  const user = process.env.ORIVE_ADMIN_USER || "orive";
  if (pw.length < 12) return false;
  const h = req.headers.get("authorization") || "";
  if (!h.startsWith("Basic ")) return false;
  const dec = Buffer.from(h.slice(6), "base64").toString("utf8");
  const i = dec.indexOf(":");
  if (i < 0) return false;
  return same(dec.slice(0, i), user) && same(dec.slice(i + 1), pw);
}
const deny = () => new NextResponse("Anmeldung erforderlich", { status: 401, headers: { ...H, "WWW-Authenticate": 'Basic realm="Orive intern", charset="UTF-8"' } });

function db() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return { url, key, h: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}
async function rows(table: string, select: string) {
  const { url, key, h } = db();
  if (!url || !key) return { ok: false as const, list: [] as any[] };
  const r = await fetch(`${url}/rest/v1/${table}?select=${select}&order=created_at.desc&limit=500`, { cache: "no-store", headers: h }).catch(() => null);
  if (!r || !r.ok) return { ok: false as const, list: [] as any[] };
  return { ok: true as const, list: (await r.json()) as any[] };
}

export async function GET(req: Request) {
  if (!authorized(req)) return deny();
  const u = new URL(req.url);
  const [inq, clm] = await Promise.all([
    rows("directory_inquiries", "id,created_at,profile_slug,offer_title,name,email,message,preferred_date,lang,status"),
    rows("directory_claim_requests", "id,created_at,profile_slug,name,email,role,proof_url,message,status,reviewed_at"),
  ]);
  let removals: any[] = [];
  try { removals = JSON.parse(await fs.readFile(path.join(process.cwd(), ".directory-data", "removals.json"), "utf8")); } catch { removals = []; }
  removals = Array.isArray(removals) ? removals.slice().reverse().slice(0, 300) : [];

  const btn = (type: string, id: string, status: string, label: string, cur: string) =>
    cur === status ? "" : `<form method="post" style="display:inline"><input type="hidden" name="type" value="${type}"><input type="hidden" name="id" value="${esc(id)}"><input type="hidden" name="status" value="${status}"><button>${label}</button></form>`;
  const inqRows = inq.list.map((r) => `<tr class="s-${esc(r.status)}"><td>${esc(when(r.created_at))}</td><td><a href="/${esc(r.profile_slug)}" target="_blank">${esc(r.profile_slug)}</a><br><small>${esc(r.offer_title)}</small></td><td>${esc(r.name)}<br><a href="mailto:${esc(r.email)}">${esc(r.email)}</a>${r.preferred_date ? `<br><small>Wunschtermin ${esc(r.preferred_date)}</small>` : ""}</td><td class="msg">${esc(r.message)}</td><td><b>${esc(INQ[r.status] || r.status)}</b><br>${btn("inq", r.id, "closed", "bearbeitet", r.status)}${btn("inq", r.id, "forwarded", "weitergeleitet", r.status)}${btn("inq", r.id, "new", "neu", r.status)}${btn("inq", r.id, "spam", "Spam", r.status)}</td></tr>`).join("");
  const clmRows = clm.list.map((r) => `<tr class="s-${esc(r.status)}"><td>${esc(when(r.created_at))}</td><td><a href="/${esc(r.profile_slug)}" target="_blank">${esc(r.profile_slug)}</a></td><td>${esc(r.name)}<br><a href="mailto:${esc(r.email)}">${esc(r.email)}</a><br><small>${esc(r.role)}</small></td><td class="msg"><a href="${esc(r.proof_url)}" target="_blank" rel="noopener noreferrer nofollow">${esc(r.proof_url)}</a>${r.message ? `<br>${esc(r.message)}` : ""}</td><td><b>${esc(CLM[r.status] || r.status)}</b>${r.reviewed_at ? `<br><small>${esc(when(r.reviewed_at))}</small>` : ""}<br>${btn("clm", r.id, "approved", "genehmigen", r.status)}${btn("clm", r.id, "rejected", "ablehnen", r.status)}${btn("clm", r.id, "closed", "bearbeitet", r.status)}${btn("clm", r.id, "new", "neu", r.status)}</td></tr>`).join("");
  const remRows = removals.map((r) => `<tr><td>${esc(when(r.at))}</td><td>${esc(r.slug)}</td><td class="msg">${esc(r.reason || "–")}</td><td>${esc(r.status === "hidden" ? "ausgeblendet" : r.status)}</td></tr>`).join("");
  const count = (l: any[]) => l.filter((r) => r.status === "new").length;
  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Orive intern – Anfragen</title>
<style>body{font-family:Inter,system-ui,sans-serif;color:#01223F;margin:0;padding:28px;background:#f6f8f9}h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:32px 0 10px}p.note{color:#5b6b7a;font-size:13px;margin:0 0 8px}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2e8f0;font-size:13px}th,td{padding:8px 10px;border-bottom:1px solid #eef2f5;text-align:left;vertical-align:top}th{background:#f1f5f7;font-weight:600}
td.msg{max-width:420px;white-space:pre-wrap}tr.s-new td:first-child{border-left:3px solid #017F80}button{font:inherit;font-size:12px;margin:4px 4px 0 0;padding:3px 8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;cursor:pointer}button:hover{border-color:#017F80}
.ok{background:#e6f6f4;border:1px solid #9fd9d1;padding:8px 12px;border-radius:8px;font-size:13px;margin:10px 0}.err{background:#fdecea;border:1px solid #f5b7b1;padding:8px 12px;border-radius:8px;font-size:13px;margin:10px 0}.empty{color:#94a3b8;padding:14px}</style></head><body>
<h1>Orive intern – Anfragen & Übernahmen</h1>
<p class="note">Nur für Robert. Statusänderungen ändern nur die Datenbank – es wird keine E-Mail verschickt und niemand benachrichtigt. Einträge werden 12 Monate nach Eingang automatisch gelöscht.</p>
${u.searchParams.get("ok") ? `<div class="ok">Status gespeichert.</div>` : ""}${u.searchParams.get("err") ? `<div class="err">Status konnte nicht gespeichert werden.</div>` : ""}
<h2>Anfragen (${inq.list.length}, neu: ${count(inq.list)})</h2>${inq.ok ? "" : `<div class="err">Anfragen konnten nicht geladen werden.</div>`}
<table><tr><th>Eingang</th><th>Profil / Angebot</th><th>Von</th><th>Nachricht</th><th>Status</th></tr>${inqRows || `<tr><td colspan="5" class="empty">Keine Anfragen.</td></tr>`}</table>
<h2>Profil-Übernahmen (${clm.list.length}, neu: ${count(clm.list)})</h2>${clm.ok ? "" : `<div class="err">Übernahmen konnten nicht geladen werden.</div>`}
<p class="note">„genehmigen“ markiert die Anfrage nur als übernommen. Am Profil und beim Anbieter passiert dadurch automatisch nichts.</p>
<table><tr><th>Eingang</th><th>Profil</th><th>Von</th><th>Nachweis / Nachricht</th><th>Status</th></tr>${clmRows || `<tr><td colspan="5" class="empty">Keine Übernahme-Anfragen.</td></tr>`}</table>
<h2>Profil-Entfernungen (${removals.length})</h2><p class="note">Profile werden beim Antrag sofort ausgeblendet.</p>
<table><tr><th>Eingang</th><th>Slug</th><th>Grund</th><th>Status</th></tr>${remRows || `<tr><td colspan="4" class="empty">Keine Entfernungen.</td></tr>`}</table>
</body></html>`;
  return new NextResponse(html, { status: 200, headers: { ...H, "Content-Type": "text/html; charset=utf-8" } });
}

export async function POST(req: Request) {
  if (!authorized(req)) return deny();
  const base = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || base.host;
  const proto = req.headers.get("x-forwarded-proto") || base.protocol.replace(":", "");
  const origin = req.headers.get("origin");
  if (origin && origin !== "null") { try { if (new URL(origin).host !== host) return new NextResponse("Forbidden", { status: 403, headers: H }); } catch { return new NextResponse("Forbidden", { status: 403, headers: H }); } }
  const back = (q: string) => NextResponse.redirect(`${proto}://${host}/admin/anfragen?${q}`, { status: 303, headers: H });
  const fd = await req.formData().catch(() => null);
  const type = String(fd?.get("type") || ""), id = String(fd?.get("id") || ""), status = String(fd?.get("status") || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return back("err=1");
  const table = type === "inq" ? "directory_inquiries" : type === "clm" ? "directory_claim_requests" : "";
  const allowed = type === "inq" ? INQ : CLM;
  if (!table || !(status in allowed)) return back("err=1");
  const body: Record<string, string> = { status };
  if (type === "clm") body.reviewed_at = new Date().toISOString();
  const { url, key, h } = db();
  if (!url || !key) return back("err=1");
  const r = await fetch(`${url}/rest/v1/${table}?id=eq.${id}`, { method: "PATCH", cache: "no-store", headers: { ...h, Prefer: "return=minimal" }, body: JSON.stringify(body) }).catch(() => null);
  return back(r && r.ok ? "ok=1" : "err=1");
}
