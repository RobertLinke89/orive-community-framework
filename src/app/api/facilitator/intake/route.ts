import { NextResponse } from "next/server";
import { facilitatorFromRequest } from "@/lib/facilitatorAuth";
import { intakeTemplates, sanitizeQuestions } from "@/lib/intake";
import { deleteIntakeForm, listIntakeForms, upsertIntakeForm } from "@/lib/oriveStore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const isDe = new URL(req.url).searchParams.get("lang") === "de";
  const actor = await facilitatorFromRequest(req);
  return NextResponse.json({
    forms: actor ? await listIntakeForms(actor.email) : [],
    templates: intakeTemplates(isDe),
  });
}

export async function PUT(req: Request) {
  const actor = await facilitatorFromRequest(req);
  if (!actor) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const questions = sanitizeQuestions(body?.questions);
  if (!name) {
    return NextResponse.json({ error: "Name the form." }, { status: 400 });
  }
  if (!questions.length) {
    return NextResponse.json({ error: "Add at least one question." }, { status: 400 });
  }
  const form = await upsertIntakeForm({
    id: typeof body?.id === "string" ? body.id : undefined,
    name,
    questions,
    facilitatorEmail: actor.email,
  });
  return NextResponse.json({ form });
}

export async function DELETE(req: Request) {
  const actor = await facilitatorFromRequest(req);
  if (!actor) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "");
  if (!id) return NextResponse.json({ error: "Missing form." }, { status: 400 });
  await deleteIntakeForm(id, actor.email);
  return NextResponse.json({ ok: true });
}
