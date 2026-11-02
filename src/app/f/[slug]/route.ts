import { NextResponse } from "next/server";
import { canonicalPathFor } from "@/lib/claim/service";

export const dynamic = "force-dynamic";

/** Legacy share links /f/{slug} -> 301 to /{category}/{slug}. Drafts, unknown or ambiguous slugs -> 404. */
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const to = await canonicalPathFor(params.slug).catch(() => null);
  if (!to) return new NextResponse("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  return NextResponse.redirect(new URL(to, req.url), 301);
}
