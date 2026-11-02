const ROW_ID = "main";

type StoreBody = {
  offerings: unknown[];
  slots: unknown[];
  bookings: unknown[];
  intakeForms: unknown[];
};

export function remoteStoreConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url.startsWith("https://") || !key || key.startsWith("your-") || key.length < 20) return false;
  return true;
}

function endpoint() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return {
    url,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  };
}

export async function pullStore(): Promise<{ version: number; body: StoreBody } | null> {
  const { url, headers } = endpoint();
  const res = await fetch(`${url}/rest/v1/orive_store?id=eq.${ROW_ID}&select=version,body`, {
    headers,
    cache: "no-store",
  });
  if (res.status === 404 || res.status === 406) {
    throw new Error("orive_store table is missing. Apply supabase/migrations/20260928120000_orive_store.sql.");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Booking store read failed (${res.status}): ${text.slice(0, 180)}`);
  }
  const rows = (await res.json()) as { version?: number; body?: StoreBody }[];
  const row = rows[0];
  if (!row) return null;
  return { version: Number(row.version) || 0, body: (row.body || { offerings: [], slots: [], bookings: [], intakeForms: [] }) as StoreBody };
}

export async function pushStore(version: number, body: StoreBody): Promise<"ok" | "conflict"> {
  const { url, headers } = endpoint();
  if (version <= 0) {
    const res = await fetch(`${url}/rest/v1/orive_store`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify({ id: ROW_ID, version: 1, body, updated_at: new Date().toISOString() }),
    });
    if (res.status === 409) return "conflict";
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Booking store create failed (${res.status}): ${text.slice(0, 180)}`);
    }
    return "ok";
  }

  const res = await fetch(`${url}/rest/v1/orive_store?id=eq.${ROW_ID}&version=eq.${version}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({ version: version + 1, body, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Booking store write failed (${res.status}): ${text.slice(0, 180)}`);
  }
  const rows = (await res.json()) as unknown[];
  return rows.length ? "ok" : "conflict";
}
