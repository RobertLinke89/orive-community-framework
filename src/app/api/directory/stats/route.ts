import { NextResponse } from "next/server";
import { directoryCount } from "@/lib/directoryBrowse";

export const dynamic = "force-dynamic";

// Public: live number of visible directory profiles (for the hero CTA). No personal data.
export async function GET() {
  const total = await directoryCount().catch(() => 0);
  return NextResponse.json({ total }, { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } });
}
