import { NextResponse } from "next/server";
import { offerFeedPage, parseFeedCats } from "@/lib/offerFeed";

export const dynamic = "force-dynamic";

// Public, paginated offer feed for the homepage infinite scroll: ?seed=<int>&offset=<int>&per=<1..48>&lang=de|en&cat=<directory cats>
// Same seed -> same order, so offsets never repeat an offer within one visit. Responses are cacheable per URL.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const lang = u.searchParams.get("lang") === "en" ? "en" : "de";
  const r = await offerFeedPage({
    seed: Number(u.searchParams.get("seed") || 1),
    offset: Number(u.searchParams.get("offset") || 0),
    per: Number(u.searchParams.get("per") || 24),
    lang,
    cats: parseFeedCats(u.searchParams.get("cat")),
  }).catch(() => ({ items: [], total: 0, nextOffset: null }));
  return NextResponse.json(r, { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } });
}
