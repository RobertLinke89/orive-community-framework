import { NextResponse } from "next/server";
import { topInCategory } from "@/lib/directoryBrowse";

export const dynamic = "force-dynamic";

// Public: top facilitators of one or more categories (category pages, homepage chips). Same card data as the search.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const cats = (u.searchParams.get("cat") || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4);
  const lang = u.searchParams.get("lang") === "en" ? "en" : "de";
  const limit = Math.min(Math.max(Number(u.searchParams.get("limit") || 8), 1), 12);
  const city = (u.searchParams.get("city") || "").slice(0, 80) || undefined;
  const r = await topInCategory(cats, lang, limit, city).catch(() => ({ cards: [], total: 0, place: null }));
  return NextResponse.json(r, { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } });
}
