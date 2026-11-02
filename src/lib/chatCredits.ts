import fs from 'fs';
import path from 'path';
import {
  CHAT_CREDIT_PLANS,
  FREE_MONTHLY_CREDITS,
  determineChatCreditCost,
  previewChatCreditAccess,
  type ChatCreditDecision,
  type ChatCreditPlan,
  type ChatCreditPlanId,
  type ChatHabitType,
} from '@/lib/chatCreditEngine';

export type { ChatCreditPlan, ChatCreditPlanId };
export { CHAT_CREDIT_PLANS, FREE_MONTHLY_CREDITS };

export type ChatCreditWallet = {
  visitorKey: string;
  /** Monthly free pool remaining (WonderBond: daily_credits_remaining → monthly). */
  freeRemaining: number;
  prepaid: number;
  lifetime: boolean;
  freeMonth: string;
  graceUsed: boolean;
  updatedAt: string;
  stripeCustomerId?: string;
  purchases: string[];
  /** @deprecated legacy field — migrated into freeRemaining */
  freeUsed?: number;
};

export type ChatCreditBalance = {
  remaining: number;
  freeRemaining: number;
  prepaid: number;
  lifetime: boolean;
  freeMonth: string;
  graceUsed: boolean;
};

type StoreFile = {
  wallets: Record<string, ChatCreditWallet>;
};

const STORE_FILE = process.env.ORIVE_CHAT_CREDITS_FILE
  ? path.resolve(process.env.ORIVE_CHAT_CREDITS_FILE)
  : path.resolve(process.cwd(), 'src/data/chatCredits.json');

let memory: StoreFile | null = null;

/** Clears in-memory cache so the next read reloads from disk (e.g. after local wallet edits). */
export function invalidateChatCreditsCache() {
  memory = null;
}

function monthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function emptyStore(): StoreFile {
  return { wallets: {} };
}

function load(): StoreFile {
  if (memory) return memory;
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8') || '{}');
      memory = {
        wallets:
          raw && typeof raw === 'object' && raw.wallets && typeof raw.wallets === 'object'
            ? raw.wallets
            : {},
      };
      return memory!;
    }
  } catch (err) {
    console.warn('[chatCredits] read failed:', err);
  }
  memory = emptyStore();
  return memory;
}

function save(store: StoreFile) {
  memory = store;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[chatCredits] write failed:', err);
  }
}

function normalizeWallet(raw: ChatCreditWallet, key: string, nowMonth: string): ChatCreditWallet {
  let freeRemaining = typeof raw.freeRemaining === 'number'
    ? raw.freeRemaining
    : Math.max(0, FREE_MONTHLY_CREDITS - (raw.freeUsed ?? 0));

  if (raw.freeMonth !== nowMonth) {
    freeRemaining = FREE_MONTHLY_CREDITS;
  }

  return {
    visitorKey: key,
    freeRemaining,
    prepaid: Math.max(0, raw.prepaid || 0),
    lifetime: Boolean(raw.lifetime),
    freeMonth: raw.freeMonth === nowMonth ? raw.freeMonth : nowMonth,
    graceUsed: Boolean(raw.graceUsed),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    stripeCustomerId: raw.stripeCustomerId,
    purchases: Array.isArray(raw.purchases) ? raw.purchases : [],
  };
}

function ensureWallet(visitorKey: string): ChatCreditWallet {
  const store = load();
  const key = visitorKey.slice(0, 80);
  const nowMonth = monthKey();
  const existing = store.wallets[key];
  if (existing) {
    const wallet = normalizeWallet(existing, key, nowMonth);
    store.wallets[key] = wallet;
    save(store);
    return wallet;
  }
  const wallet: ChatCreditWallet = {
    visitorKey: key,
    freeRemaining: FREE_MONTHLY_CREDITS,
    prepaid: 0,
    lifetime: false,
    freeMonth: nowMonth,
    graceUsed: false,
    updatedAt: new Date().toISOString(),
    purchases: [],
  };
  store.wallets[key] = wallet;
  save(store);
  return wallet;
}

function persistWallet(wallet: ChatCreditWallet) {
  wallet.updatedAt = new Date().toISOString();
  const store = load();
  store.wallets[wallet.visitorKey] = wallet;
  save(store);
}

export function resolveChatCreditPlan(raw: string | null | undefined): ChatCreditPlan | null {
  const key = String(raw || '').toLowerCase().trim();
  if (key === 'flex' || key === '100') return CHAT_CREDIT_PLANS.flex;
  if (key === 'power' || key === '300') return CHAT_CREDIT_PLANS.power;
  if (key === 'lifetime' || key === 'earlybird' || key === 'plus' || key === 'pro' || key === 'max') {
    return CHAT_CREDIT_PLANS.lifetime;
  }
  return null;
}

export function getChatCreditBalance(visitorKey: string): ChatCreditBalance {
  const wallet = ensureWallet(visitorKey);
  if (wallet.lifetime) {
    return {
      remaining: Number.POSITIVE_INFINITY,
      freeRemaining: wallet.freeRemaining,
      prepaid: wallet.prepaid,
      lifetime: true,
      freeMonth: wallet.freeMonth,
      graceUsed: wallet.graceUsed,
    };
  }
  return {
    remaining: wallet.freeRemaining + wallet.prepaid,
    freeRemaining: wallet.freeRemaining,
    prepaid: wallet.prepaid,
    lifetime: false,
    freeMonth: wallet.freeMonth,
    graceUsed: wallet.graceUsed,
  };
}

export function evaluateChatCreditAccess(
  visitorKey: string,
  userText: string,
): {
  balance: ChatCreditBalance;
  priced: { habitType: ChatHabitType; creditCost: number };
  decision: ChatCreditDecision;
} {
  const balance = getChatCreditBalance(visitorKey);
  const priced = determineChatCreditCost(userText);
  const decision = previewChatCreditAccess({
    lifetime: balance.lifetime,
    remaining: Number.isFinite(balance.remaining) ? balance.remaining : 999999,
    graceUsed: balance.graceUsed,
    creditCost: priced.creditCost,
    habitType: priced.habitType,
  });
  return { balance, priced, decision };
}

/**
 * Consume credits after a successful model reply (WonderBond order).
 * Grace replies mark graceUsed and charge 0.
 */
export function consumeChatCredits(
  visitorKey: string,
  amount: number,
  options: { isGrace?: boolean } = {},
): { ok: true; balance: ChatCreditBalance; usedGrace: boolean } | { ok: false; balance: ChatCreditBalance } {
  const wallet = ensureWallet(visitorKey);

  if (options.isGrace) {
    wallet.graceUsed = true;
    persistWallet(wallet);
    return { ok: true, balance: getChatCreditBalance(visitorKey), usedGrace: true };
  }

  if (wallet.lifetime || amount <= 0) {
    return { ok: true, balance: getChatCreditBalance(visitorKey), usedGrace: false };
  }

  const balance = getChatCreditBalance(visitorKey);
  if (balance.remaining < amount) {
    return { ok: false, balance };
  }

  let left = amount;
  const fromFree = Math.min(wallet.freeRemaining, left);
  wallet.freeRemaining -= fromFree;
  left -= fromFree;
  if (left > 0) {
    wallet.prepaid = Math.max(0, wallet.prepaid - left);
  }
  persistWallet(wallet);
  return { ok: true, balance: getChatCreditBalance(visitorKey), usedGrace: false };
}

/** @deprecated Prefer evaluate + consume after reply. Kept for callers that still spend upfront. */
export function spendChatCredit(
  visitorKey: string,
  amount = 1,
): { ok: true; balance: ChatCreditBalance } | { ok: false; balance: ChatCreditBalance } {
  const result = consumeChatCredits(visitorKey, amount);
  if (!result.ok) return { ok: false, balance: result.balance };
  return { ok: true, balance: result.balance };
}

export function grantChatCredits(input: {
  visitorKey: string;
  plan: ChatCreditPlan;
  stripeSessionId: string;
  stripeCustomerId?: string;
}): ChatCreditBalance {
  const wallet = ensureWallet(input.visitorKey);
  if (wallet.purchases.includes(input.stripeSessionId)) {
    return getChatCreditBalance(input.visitorKey);
  }
  if (input.plan.isLifetime) {
    wallet.lifetime = true;
  } else {
    wallet.prepaid += input.plan.credits;
  }
  if (input.stripeCustomerId) wallet.stripeCustomerId = input.stripeCustomerId;
  wallet.purchases.push(input.stripeSessionId);
  wallet.graceUsed = false;
  persistWallet(wallet);
  return getChatCreditBalance(input.visitorKey);
}

export function normalizeVisitorKey(raw: string | null | undefined): string | null {
  const key = String(raw || '').trim();
  if (key.length < 16 || key.length > 80) return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) return null;
  return key;
}
