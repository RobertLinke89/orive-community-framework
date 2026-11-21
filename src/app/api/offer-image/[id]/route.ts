import { NextResponse } from "next/server";
import { offerImageUrl, snapWidth, thumbnail } from "@/lib/offerImageCache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Card thumbnail for one homepage feed offer: /api/offer-image/<offer id>?w=<px>&v=<version>
// Only ids from the checked offer-image index are served; WebP, cached on disk, long browser/CDN cache.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = String(params.id || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse(null, { status: 404 });
  const url = await offerImageUrl(id);
  if (!url) return new NextResponse(null, { status: 404 });
  const w = snapWidth(Math.max(1, Math.min(2000, Number(new URL(req.url).searchParams.get("w")) || 480)));
  const buf = await thumbnail(url, w);
  if (!buf) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "public, max-age=600" } });
  return new NextResponse(new Uint8Array(buf), {
    headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable", "Content-Length": String(buf.length) },
  });
}
