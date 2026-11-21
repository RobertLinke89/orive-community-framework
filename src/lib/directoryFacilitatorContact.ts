const EMAIL_RE = /^[^\s@<>()",;:]{1,64}@[^\s@<>()",;:]{1,190}\.[a-z]{2,24}$/i;
const BAD = /^(no[-_]?reply|donotreply|do[-_]?not[-_]?reply|noreply)@/i;

export function isUsableFacilitatorEmail(email: string | null | undefined): boolean {
  const v = String(email || "").trim().toLowerCase();
  if (!v || !EMAIL_RE.test(v) || BAD.test(v)) return false;
  return true;
}

export async function fetchFacilitatorContactEmail(facilitatorId: string): Promise<string | null> {
  const id = String(facilitatorId || "").trim();
  if (!id) return null;
  const base = (process.env.CRAWLER_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(
    /\/$/,
    ""
  );
  const key = process.env.CRAWLER_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!base || !key) return null;
  const url = `${base}/rest/v1/facilitators?select=email&id=eq.${encodeURIComponent(id)}&limit=1`;
  const r = await fetch(url, {
    cache: "no-store",
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!r.ok) {
    console.warn("[directory-contact] fetch failed", r.status);
    return null;
  }
  const rows = (await r.json()) as Array<{ email?: string | null }>;
  const email = rows[0]?.email ?? null;
  return isUsableFacilitatorEmail(email) ? String(email).trim().toLowerCase() : null;
}
