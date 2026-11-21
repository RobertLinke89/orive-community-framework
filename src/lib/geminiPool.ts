/**
 * Multi-key Gemini pool — ported from WonderBond gemini-pool.ts for Node/Next.
 */

let rrIndex = 0;

export function getGeminiApiKeys(): string[] {
  const keys: string[] = [];

  const listVar = process.env.GEMINI_API_KEYS || '';
  if (listVar.trim()) {
    listVar.split(/[\n,]+/).forEach((k) => {
      const clean = k.trim();
      if (clean && !keys.includes(clean)) keys.push(clean);
    });
  }

  const defaultKey = process.env.GEMINI_API_KEY || '';
  if (defaultKey.trim() && !keys.includes(defaultKey.trim())) {
    keys.push(defaultKey.trim());
  }

  for (let i = 1; i <= 10; i++) {
    const numbered = process.env[`GEMINI_API_KEY_${i}`] || '';
    if (numbered.trim() && !keys.includes(numbered.trim())) {
      keys.push(numbered.trim());
    }
  }

  return keys;
}

export function hasGeminiKey(): boolean {
  return getGeminiApiKeys().length > 0;
}

export type GeminiCallOptions = {
  model?: string;
  apiVersion?: string;
  action?: string;
  signal?: AbortSignal;
};

export async function fetchGeminiWithFailover(
  payload: Record<string, unknown>,
  options: GeminiCallOptions = {},
): Promise<{ ok: boolean; status: number; data?: unknown; errorText?: string }> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    return { ok: false, status: 500, errorText: 'No Gemini API keys configured' };
  }

  const model = options.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const apiVersion = options.apiVersion || 'v1beta';
  const action = options.action || 'generateContent';

  const startIndex = rrIndex % keys.length;
  rrIndex = (rrIndex + 1) % keys.length;

  let lastErrorText = '';
  let lastStatus = 500;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const keyIndex = (startIndex + attempt) % keys.length;
    const currentKey = keys[keyIndex];
    // Never log key material: identify keys by slot only.
    const keyLabel = `key#${keyIndex + 1}/${keys.length}`;

    try {
      const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:${action}?key=${currentKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: options.signal ?? AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        return { ok: true, status: 200, data };
      }

      lastStatus = res.status;
      lastErrorText = await res.text();

      if (res.status === 429 || res.status === 403 || res.status === 503) {
        console.warn(`[GEMINI POOL] ${keyLabel} status ${res.status} — failover`);
        continue;
      }

      console.error(`[GEMINI POOL] ${keyLabel} failed: status ${res.status}`);
      return { ok: false, status: res.status, errorText: lastErrorText };
    } catch (err) {
      lastErrorText = err instanceof Error ? err.message : 'Network error';
      console.error(`[GEMINI POOL] ${keyLabel} network error`);
    }
  }

  return { ok: false, status: lastStatus, errorText: lastErrorText };
}

export function extractGeminiText(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const candidates = (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
    .candidates;
  const text = candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
  return text || null;
}
