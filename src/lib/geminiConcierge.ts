import type { ConciergeHit } from '@/lib/sofiaConcierge';
import { extractGeminiText, fetchGeminiWithFailover, hasGeminiKey } from '@/lib/geminiPool';

export async function geminiConciergeReply(input: {
  message: string;
  language: 'de' | 'en';
  offerings: ConciergeHit[];
}): Promise<string | null> {
  if (!hasGeminiKey()) return null;

  const catalog = input.offerings.slice(0, 6).map((hit, index) => (
    `${index + 1}. ${hit.title} — ${[hit.when, hit.location, hit.price].filter(Boolean).join(' · ')}${hit.partner ? ' (partner listing)' : ' (ORIVE seat)'}`
  )).join('\n');

  const system = input.language === 'de'
    ? `Du bist SOFIA, Concierge auf ORIVE für Breathwork, Yoga, Meditation, Sound und Retreats in Europa.
Antworte kurz, klar und freundlich auf Deutsch.
Nutze nur die Angebote aus dem Katalog unten. Erfinde keine Termine.
Wenn Partner-Listings dabei sind, sage dass Buchung beim Veranstalter liegt.
Kein Notfalldienst. Keine medizinischen Diagnosen.`
    : `You are SOFIA, the ORIVE concierge for breathwork, yoga, meditation, sound and retreats in Europe.
Reply briefly, clearly and warmly in English.
Only use the offerings in the catalog below. Do not invent dates.
If partner listings appear, say booking stays with the host.
Not an emergency service. No medical diagnoses.`;

  const userPrompt = `${system}

User message:
${input.message}

Catalog:
${catalog || '(no matching listings)'}

Write the reply text only.`;

  const result = await fetchGeminiWithFailover({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 512,
    },
  });

  if (!result.ok) return null;
  return extractGeminiText(result.data);
}
