import { createClient } from "@supabase/supabase-js";
import { facilitatorIdForEmail } from "@/lib/facilitatorPayout";

export type FacilitatorActor = {
  id: string;
  email: string;
  name: string;
  userId: string;
};

export async function facilitatorFromRequest(req: Request): Promise<FacilitatorActor | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !anon) return null;
  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  const email = data.user?.email?.trim().toLowerCase();
  if (error || !email) return null;
  const meta = (data.user?.user_metadata || {}) as { full_name?: string; name?: string };
  const name = String(meta.full_name || meta.name || email);
  return {
    id: facilitatorIdForEmail(email),
    email,
    name,
    userId: data.user!.id,
  };
}
