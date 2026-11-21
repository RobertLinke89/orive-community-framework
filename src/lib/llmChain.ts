/**
 * Free-tier LLM fallback chain for the SOFIA concierge.
 * Order: Gemini Flash -> xAI Grok -> Mistral -> Groq -> Cloudflare Workers AI.
 * A provider without its key (e.g. XAI_API_KEY not set yet) is skipped silently.
 * Note: xAI bills API calls per token (no free API tier as of 11/2026); it only runs once XAI_API_KEY is set.
 * (sofiaUpstream and the local catalog remain the fallbacks in route.ts.)
 * Logs provider, status and latency only — never keys or prompt content.
 */
import { extractGeminiText, fetchGeminiWithFailover, hasGeminiKey } from '@/lib/geminiPool';

export type LlmProviderName = 'gemini' | 'xai' | 'mistral' | 'groq' | 'cloudflare';

export type LlmResult = { ok: boolean; text?: string; status?: number; retryable?: boolean };

export interface LlmProvider {
  name: LlmProviderName;
  timeoutMs: number;
  available(): boolean;
  call(system: string, user: string, signal: AbortSignal): Promise<LlmResult>;
}

const TOTAL_BUDGET_MS = 15_000;
const COOLDOWN_MS = 60_000;
const MAX_TOKENS = 512;
const TEMPERATURE = 0.4;

const cooldownUntil = new Map<LlmProviderName, number>();

function isRetryable(status: number): boolean {
  return status === 0 || status === 408 || status === 429 || status >= 500 || status === 401 || status === 403 || status === 404;
}

async function openAiCompatible(
  url: string,
  apiKey: string,
  model: string,
  system: string,
  user: string,
  signal: AbortSignal,
): Promise<LlmResult> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
    signal,
  });
  if (!res.ok) {
    await res.text().catch(() => '');
    return { ok: false, status: res.status, retryable: isRetryable(res.status) };
  }
  const data = (await res.json().catch(() => null)) as
    | { choices?: Array<{ message?: { content?: string } }> }
    | null;
  const text = data?.choices?.[0]?.message?.content?.trim();
  return text ? { ok: true, text } : { ok: false, status: 502, retryable: true };
}

export const providers: LlmProvider[] = [
  {
    name: 'gemini',
    timeoutMs: 6000,
    available: () => hasGeminiKey(),
    async call(system, user, signal) {
      const result = await fetchGeminiWithFailover(
        {
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          generationConfig: { temperature: TEMPERATURE, maxOutputTokens: MAX_TOKENS },
        },
        { signal },
      );
      if (!result.ok) return { ok: false, status: result.status, retryable: true };
      const text = extractGeminiText(result.data);
      return text ? { ok: true, text } : { ok: false, status: 502, retryable: true };
    },
  },
  {
    name: 'xai',
    timeoutMs: 5000,
    available: () => Boolean(process.env.XAI_API_KEY?.trim()),
    call: (system, user, signal) =>
      openAiCompatible(
        'https://api.x.ai/v1/chat/completions',
        process.env.XAI_API_KEY!.trim(),
        process.env.XAI_MODEL || 'grok-4.20-0309-non-reasoning',
        system,
        user,
        signal,
      ),
  },
  {
    name: 'mistral',
    timeoutMs: 5000,
    available: () => Boolean(process.env.MISTRAL_API_KEY?.trim()),
    call: (system, user, signal) =>
      openAiCompatible(
        'https://api.mistral.ai/v1/chat/completions',
        process.env.MISTRAL_API_KEY!.trim(),
        process.env.MISTRAL_MODEL || 'mistral-small-latest',
        system,
        user,
        signal,
      ),
  },
  {
    name: 'groq',
    timeoutMs: 4000,
    available: () => Boolean(process.env.GROQ_API_KEY?.trim()),
    call: (system, user, signal) =>
      openAiCompatible(
        'https://api.groq.com/openai/v1/chat/completions',
        process.env.GROQ_API_KEY!.trim(),
        process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        system,
        user,
        signal,
      ),
  },
  {
    name: 'cloudflare',
    timeoutMs: 6000,
    available: () =>
      Boolean(process.env.CLOUDFLARE_ACCOUNT_ID?.trim() && process.env.CLOUDFLARE_AI_API_TOKEN?.trim()),
    async call(system, user, signal) {
      const account = process.env.CLOUDFLARE_ACCOUNT_ID!.trim();
      const model = process.env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct';
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CLOUDFLARE_AI_API_TOKEN!.trim()}`,
        },
        body: JSON.stringify({
          max_tokens: MAX_TOKENS,
          temperature: TEMPERATURE,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
        signal,
      });
      if (!res.ok) {
        await res.text().catch(() => '');
        return { ok: false, status: res.status, retryable: isRetryable(res.status) };
      }
      const data = (await res.json().catch(() => null)) as { result?: { response?: string } } | null;
      const text = data?.result?.response?.trim();
      return text ? { ok: true, text } : { ok: false, status: 502, retryable: true };
    },
  },
];

export async function runLlmChain(
  system: string,
  user: string,
  chain: LlmProvider[] = providers,
): Promise<{ text: string; provider: LlmProviderName } | null> {
  const started = Date.now();
  for (const provider of chain) {
    if (!provider.available()) continue;
    const until = cooldownUntil.get(provider.name) || 0;
    if (until > Date.now()) {
      console.info(`[LLM CHAIN] ${provider.name} skipped (cooldown)`);
      continue;
    }
    const remaining = TOTAL_BUDGET_MS - (Date.now() - started);
    if (remaining < 500) break;
    const timeout = Math.min(provider.timeoutMs, remaining);
    const t0 = Date.now();
    let status = 0;
    try {
      const result = await provider.call(system, user, AbortSignal.timeout(timeout));
      if (result.ok && result.text) {
        console.info(`[LLM CHAIN] ${provider.name} status=200 latency=${Date.now() - t0}ms`);
        return { text: result.text, provider: provider.name };
      }
      status = result.status ?? 0;
      if (!result.retryable) {
        console.warn(`[LLM CHAIN] ${provider.name} status=${status} latency=${Date.now() - t0}ms (non-retryable, next)`);
      }
    } catch (err) {
      status = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError') ? 408 : 0;
    }
    if (status === 429) cooldownUntil.set(provider.name, Date.now() + COOLDOWN_MS);
    console.warn(`[LLM CHAIN] ${provider.name} status=${status || 'network'} latency=${Date.now() - t0}ms -> next`);
  }
  return null;
}
