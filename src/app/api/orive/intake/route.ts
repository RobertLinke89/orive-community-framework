import { NextResponse } from "next/server";
import { getInventoryItem, questionsForOffering } from "@/lib/oriveStore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const offeringId = url.searchParams.get("offeringId") || "";
  const isDe = url.searchParams.get("lang") === "de";
  const item = offeringId ? await getInventoryItem(offeringId) : null;
  if (!item) return NextResponse.json({ questions: [] });
  return NextResponse.json({ questions: await questionsForOffering(item.offering, isDe) });
}
