import { NextResponse } from "next/server";
import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { profileByEmail, upsertProfile } from "@/lib/facilitatorPayout";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const actor = await facilitatorFromRequest(req);
  if (!actor) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const profile = profileByEmail(actor.email);
  return NextResponse.json({
    id: actor.id,
    email: actor.email,
    name: profile?.name || actor.name,
    city: profile?.city || "",
    practice: profile?.practice || "",
    onboardingComplete: Boolean(profile?.onboardingComplete),
    stripeConnected: Boolean(profile?.stripeAccountId),
  });
}

export async function PUT(req: Request) {
  const actor = await facilitatorFromRequest(req);
  if (!actor) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || actor.name).trim().slice(0, 80);
  const city = String(body.city || "").trim().slice(0, 80);
  const practice = String(body.practice || "").trim().slice(0, 80);
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  const saved = upsertProfile({
    facilitatorId: actor.id,
    email: actor.email,
    name,
    city,
    practice,
    onboardingComplete: body.onboardingComplete === true ? true : undefined,
  });
  return NextResponse.json({
    id: actor.id,
    email: actor.email,
    name: saved.name,
    city: saved.city || "",
    practice: saved.practice || "",
    onboardingComplete: Boolean(saved.onboardingComplete),
  });
}
