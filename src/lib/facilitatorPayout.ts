import fs from "fs";
import path from "path";

const CLAIMED_FILE = path.resolve(process.cwd(), "src/data/claimedFacilitators.json");

type ClaimedRecord = {
  facilitatorId?: string;
  name?: string;
  email?: string;
  city?: string;
  practice?: string;
  onboardingComplete?: boolean;
  stripeAccountId?: string;
  [key: string]: unknown;
};

export function facilitatorIdForEmail(email: string) {
  const slug = email.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `fac-${slug || "host"}`.slice(0, 64);
}

export function profileByEmail(email: string) {
  const needle = email.trim().toLowerCase();
  if (!needle) return null;
  return Object.values(readClaimed()).find((record) => String(record.email || "").toLowerCase() === needle) || null;
}

export function upsertProfile(input: {
  facilitatorId: string;
  email: string;
  name?: string;
  city?: string;
  practice?: string;
  onboardingComplete?: boolean;
}) {
  const list = readClaimed();
  const current = list[input.facilitatorId] || { facilitatorId: input.facilitatorId };
  list[input.facilitatorId] = {
    ...current,
    facilitatorId: input.facilitatorId,
    email: input.email || current.email,
    name: input.name || current.name,
    city: input.city ?? current.city,
    practice: input.practice ?? current.practice,
    onboardingComplete: input.onboardingComplete ?? current.onboardingComplete ?? false,
  };
  writeClaimed(list);
  return list[input.facilitatorId];
}

function readClaimed(): Record<string, ClaimedRecord> {
  try {
    if (!fs.existsSync(CLAIMED_FILE)) return {};
    const data = JSON.parse(fs.readFileSync(CLAIMED_FILE, "utf-8") || "{}");
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function writeClaimed(list: Record<string, ClaimedRecord>) {
  fs.writeFileSync(CLAIMED_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export function claimedFacilitator(facilitatorId: string) {
  return readClaimed()[facilitatorId] || null;
}

export function findStripeAccount(facilitatorId?: string, email?: string) {
  const list = readClaimed();
  if (facilitatorId && list[facilitatorId]?.stripeAccountId) return list[facilitatorId].stripeAccountId || null;
  const needle = String(email || "").trim().toLowerCase();
  if (!needle) return null;
  const match = Object.values(list).find((record) => String(record.email || "").toLowerCase() === needle);
  return match?.stripeAccountId || null;
}

export function saveStripeAccount(facilitatorId: string, stripeAccountId: string, email?: string, name?: string) {
  const list = readClaimed();
  const current = list[facilitatorId] || { facilitatorId };
  list[facilitatorId] = {
    ...current,
    facilitatorId,
    stripeAccountId,
    email: email || current.email,
    name: name || current.name,
  };
  writeClaimed(list);
}
