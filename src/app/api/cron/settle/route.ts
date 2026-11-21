import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/reminder";
import { settleDueBookings } from "@/lib/settlement";

export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const results = await settleDueBookings();
  const reminders = await sendDueReminders();
  return NextResponse.json({
    settled: results.length,
    results,
    reminders: reminders.length,
    reminderResults: reminders,
    timestamp: new Date().toISOString(),
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
