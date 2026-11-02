import { serverDb } from "@/lib/serverDb";

/** Admin check via the existing public.has_role(_user_id, _role) function / user_roles table. */
type Check = (userId: string) => Promise<boolean>;
let override: Check | null = null;
export function setAdminCheckForTests(c: Check | null) { override = c; }
export async function isAdmin(userId: string): Promise<boolean> {
  if (override) return override(userId);
  const db = serverDb();
  if (!db) return false;
  const { data, error } = await db.rpc("has_role", { _user_id: userId, _role: "admin" });
  return !error && data === true;
}
