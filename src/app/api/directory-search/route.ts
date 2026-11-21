import { NextResponse } from "next/server";
import { searchDirectory } from "@/lib/directorySearch";
import { syncDirectorySearch } from "@/lib/directorySearchSync";

export const dynamic = "force-dynamic";

// Internal/eval endpoint only: allowed with the cron secret or for direct (non-proxied) calls on the server network.
function allowed(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return true;
  if (req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip")) return false;
  const chain = (req.headers.get("x-forwarded-for") || "").split(",").map((s) => s.trim().replace(/^::ffff:/, "")).filter(Boolean);
  return chain.every((ip) => /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$)/.test(ip));
}

export async function GET(req: Request) {
  if (!allowed(req)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const u = new URL(req.url);
  const q = (u.searchParams.get("q") || "").slice(0, 300);
  const res = await searchDirectory(q, { llm: u.searchParams.get("llm") !== "0", rerank: u.searchParams.get("rerank") !== "0" });
  return NextResponse.json(res);
}

export async function POST(req: Request) {
  if (!allowed(req)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const u = new URL(req.url);
  if (u.searchParams.get("action") !== "sync") return NextResponse.json({ error: "unknown action" }, { status: 400 });
  try { return NextResponse.json(await syncDirectorySearch()); }
  catch (e) { return NextResponse.json({ error: String((e as Error)?.message || e) }, { status: 500 }); }
}
