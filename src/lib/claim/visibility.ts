/**
 * Single definition of "publicly visible" for facilitator profiles AND their crawled offers.
 *   hidden_at IS NULL                                   (one-click opt-out wins over everything)
 *   AND ( published_at IS NOT NULL                      (Robert approved the release batch; activation mail sent at the same time)
 *         OR (status = 'live' AND terms_consented_at IS NOT NULL) )   (facilitator claimed + consented himself)
 * Drafts that are neither approved nor claimed are never public.
 */
export type VisibilityFields = { status?: string | null; terms_consented_at?: string | null; published_at?: string | null; hidden_at?: string | null };
export function isPubliclyVisible(p: VisibilityFields): boolean {
  if (p.hidden_at) return false;
  return !!p.published_at || (p.status === "live" && !!p.terms_consented_at);
}
/** PostgREST .or() filter equivalent (combine with .is("hidden_at", null)). */
export const PUBLIC_OR_FILTER = "published_at.not.is.null,and(status.eq.live,terms_consented_at.not.is.null)";
