import { isPubliclyVisible, PUBLIC_OR_FILTER } from "@/lib/claim/visibility";

/** Minimal PostgREST-ish fake: from().select().eq/is/not/in/or/limit/maybeSingle over in-memory rows. Records queries. */
export function fakeSupabase(tables: Record<string, any[]>) {
  const log: { table: string; filters: string[] }[] = [];
  const from = (table: string) => {
    const preds: ((r: any) => boolean)[] = [], filters: string[] = [];
    const q: any = {
      select() { return q; },
      eq(c: string, v: any) { filters.push(`eq:${c}`); preds.push((r) => r[c] === v); return q; },
      is(c: string, v: any) { filters.push(`is:${c}`); preds.push((r) => (r[c] ?? null) === v); return q; },
      not(c: string, _op: string, v: any) { filters.push(`not:${c}`); preds.push((r) => (r[c] ?? null) !== v); return q; },
      in(c: string, v: any[]) { filters.push(`in:${c}`); preds.push((r) => v.includes(r[c])); return q; },
      or(f: string) { if (f !== PUBLIC_OR_FILTER) throw new Error("unexpected or: " + f); filters.push("or:public"); preds.push((r) => isPubliclyVisible(r)); return q; },
      limit() { return q; },
      run() { log.push({ table, filters }); return (tables[table] || []).filter((r) => preds.every((p) => p(r))); },
      maybeSingle() { return Promise.resolve({ data: q.run()[0] ?? null, error: null }); },
      then(res: any, rej: any) { return Promise.resolve({ data: q.run(), error: null }).then(res, rej); },
    };
    return q;
  };
  return { client: { from, rpc: async () => ({ data: null, error: null }) } as any, log };
}
