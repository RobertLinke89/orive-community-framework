// Display-only clean-up for crawled names/titles (slugs and stored data stay unchanged).
// Repairs double-encoded UTF-8 ("fÃ¼r" -> "für", "â€“" -> "–", also when only parts are broken),
// stray Windows-1252 control characters ("L\x92Atelier" -> "L’Atelier", "\x96" -> "–")
// and trims stray quotes/whitespace.
const CP1252 = "€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008DŽ\u008F\u0090‘’“”•–—˜™š›œ\u009DžŸ"; // bytes 0x80..0x9F
const TO_BYTE = new Map<string, number>();
for (let i = 0; i < 32; i++) TO_BYTE.set(CP1252[i]!, 0x80 + i);
const CONT = "[\\u0080-\\u00BF€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]";
const SEQ = new RegExp(`[\\u00C2-\\u00DF]${CONT}|[\\u00E0-\\u00EF]${CONT}{2}|[\\u00F0-\\u00F4]${CONT}{3}`, "g");

function decodeSeq(m: string): string {
  const bytes: number[] = [];
  for (const ch of m) {
    const c = ch.charCodeAt(0);
    const b = c <= 0xff ? c : TO_BYTE.get(ch);
    if (b == null) return m;
    bytes.push(b);
  }
  try {
    const d = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
    return d && !d.includes("\uFFFD") ? d : m;
  } catch { return m; }
}

export function fixText(s: string | null | undefined): string {
  let t = String(s ?? "");
  if (/[\u00C2-\u00F4]/.test(t)) t = t.replace(SEQ, decodeSeq);
  if (/[\u0080-\u009F]/.test(t)) t = t.replace(/[\u0080-\u009F]/g, (ch) => { const r = CP1252[ch.charCodeAt(0) - 0x80]!; return r.charCodeAt(0) < 0xa0 ? "" : r; });
  return t.replace(/^[\s"'“”„«»]+|[\s"'“”„«»]+$/g, "").replace(/\s{2,}/g, " ") || String(s ?? "");
}
