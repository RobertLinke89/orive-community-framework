/** Crawler quality model v1 (orive-quality/criteria.md): A ≥ 80, B 65–79, C 50–64, reject < 50. Internal / admin-only. */
export type QualityTier = "A" | "B" | "C" | "reject";
export function tierFor(score: number): QualityTier {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  return "reject";
}
