import { NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cronAuth";
import { purgeStalePendingBookings } from "@/lib/oriveStore";
import { sendDueReminders } from "@/lib/reminder";
import { logError } from "@/lib/safeLog";
import { settleDueBookings } from "@/lib/settlement";
import { expireSessionHolds, settleDueSessionBookings } from "@/lib/sessionPayments";

export const dynamic = "force-dynamic";

async function handle(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Cron is not configured." }, { status: 503 });
  }
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const safe = async <T,>(tag: string, fn: () => Promise<T>, fallback: T) => {
    try {
      return await fn();
    } catch (error) {
      logError(`cron.${tag}`, error);
      return fallback;
    }
  };
  const expiredHolds = await safe("expire", () => expireSessionHolds(), 0);
  const purgedPending = await safe("purge", () => purgeStalePendingBookings(), 0);
  const sessionResults = await safe("session-settle", () => settleDueSessionBookings(), [] as unknown[]);
  const results = await safe("settle", () => settleDueBookings(), [] as unknown[]);
  const reminders = await safe("reminders", () => sendDueReminders(), [] as unknown[]);
  return NextResponse.json({
    settled: results.length,
    sessionSettled: sessionResults.length,
    expiredHolds,
    purgedPending,
    reminders: reminders.length,
    timestamp: new Date().toISOString(),
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
