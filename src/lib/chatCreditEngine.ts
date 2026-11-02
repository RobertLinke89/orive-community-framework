/**
 * ORIVE chat credit rules — ported from WonderBond messenger CreditTokenManager.
 *
 * Model:
 *   - Lifetime → unlimited
 *   - 13 free credits reset each calendar month (UTC)
 *   - Prepaid Flex/Power never expire and stack
 *   - Free credits are used first, then prepaid
 *   - Quick thanks = 0; standard = 1; long = 2; deep-dive = 3
 *   - One emergency grace reply when both pools are empty
 */

export const FREE_MONTHLY_CREDITS = 13;
export const PRICING_PATH = '/chat';

export type ChatCreditPlanId = 'flex' | 'power' | 'lifetime';

export type ChatCreditPlan = {
  id: ChatCreditPlanId;
  nameDe: string;
  nameEn: string;
  priceLabel: string;
  amountCents: number;
  credits: number;
  isLifetime: boolean;
};

/**
 * Prepaid packs (no subscription). Anchored against ~$20/mo AI Pro tiers
 * (Claude / Perplexity / ChatGPT) and credit-pool tools like Lovable (~$25/mo),
 * with ORIVE’s differentiator: buy once, credits never expire, 13 free / month.
 */
export const CHAT_CREDIT_PLANS: Record<ChatCreditPlanId, ChatCreditPlan> = {
  flex: {
    id: 'flex',
    nameDe: 'Spark (120 Credits)',
    nameEn: 'Spark (120 Credits)',
    priceLabel: '€14',
    amountCents: 1400,
    credits: 120,
    isLifetime: false,
  },
  power: {
    id: 'power',
    nameDe: 'Flow (400 Credits)',
    nameEn: 'Flow (400 Credits)',
    priceLabel: '€39',
    amountCents: 3900,
    credits: 400,
    isLifetime: false,
  },
  lifetime: {
    id: 'lifetime',
    nameDe: 'Lifetime Pass',
    nameEn: 'Lifetime Pass',
    priceLabel: '€449',
    amountCents: 44900,
    credits: 0,
    isLifetime: true,
  },
};

export type ChatHabitType =
  | 'quick_reply'
  | 'standard'
  | 'long_query'
  | 'deep_dive';

export type ChatCreditDecision = {
  habitType: ChatHabitType;
  creditCost: number;
  canProceed: boolean;
  isGrace: boolean;
  reason?: 'credits_exhausted' | 'deep_dive_insufficient';
};

export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 3.8));
}

export function determineChatCreditCost(userText: string): {
  habitType: ChatHabitType;
  creditCost: number;
} {
  const lower = userText.toLowerCase().trim();
  const tokens = estimateTokens(userText);

  const isQuickThanks =
    /^(danke|vielen dank|super danke|danke dir|hat geklappt|perfekt|danke schön|top|thanks|thank you|merci|gracias|grazie|obrigad[oa]|dankjewel)[\s.!?:)🙏❤️]*$/i
      .test(lower);
  if (isQuickThanks && tokens < 250) {
    return { habitType: 'quick_reply', creditCost: 0 };
  }

  const isDeepDive =
    /wochenplan|itinerary|retreat plan|kompletter ablauf|7-tage|sieben tage|week plan|weekly plan|full programme|volles programm|vergleich aller|compare all/i
      .test(lower) || tokens > 3000;
  if (isDeepDive) {
    return { habitType: 'deep_dive', creditCost: 3 };
  }

  if (tokens > 1500 || userText.length > 600) {
    return { habitType: 'long_query', creditCost: 2 };
  }

  return { habitType: 'standard', creditCost: 1 };
}

export function previewChatCreditAccess(input: {
  lifetime: boolean;
  remaining: number;
  graceUsed: boolean;
  creditCost: number;
  habitType: ChatHabitType;
}): ChatCreditDecision {
  const { lifetime, remaining, graceUsed, creditCost, habitType } = input;

  if (creditCost <= 0 || habitType === 'quick_reply') {
    return { habitType, creditCost: 0, canProceed: true, isGrace: false };
  }

  if (lifetime) {
    return { habitType, creditCost, canProceed: true, isGrace: false };
  }

  if (remaining >= creditCost) {
    return { habitType, creditCost, canProceed: true, isGrace: false };
  }

  if (habitType === 'deep_dive') {
    return {
      habitType,
      creditCost,
      canProceed: false,
      isGrace: false,
      reason: 'deep_dive_insufficient',
    };
  }

  if (!graceUsed) {
    return { habitType, creditCost, canProceed: true, isGrace: true };
  }

  return {
    habitType,
    creditCost,
    canProceed: false,
    isGrace: false,
    reason: 'credits_exhausted',
  };
}

export function creditExhaustedMessage(
  language: 'de' | 'en',
  habitType: ChatHabitType,
): string {
  if (habitType === 'deep_dive') {
    return language === 'en'
      ? `I can build that deeper plan — it costs 3 credits.\n\nTop up once, no subscription:\n→ ${PRICING_PATH}`
      : `Diesen tieferen Plan erstelle ich gern — er kostet 3 Credits.\n\nEinmalig aufladen, ohne Abo:\n→ ${PRICING_PATH}`;
  }
  return language === 'en'
    ? `Your 13 monthly free credits and prepaid balance are used up.\n\nSpark 120 · Flow 400 · Lifetime unlimited — no subscription.\n\nYour 13 free credits refresh on the 1st of next month.`
    : `Deine 13 monatlichen Gratis-Credits und dein Prepaid-Guthaben sind aufgebraucht.\n\nSpark 120 · Flow 400 · Lifetime unbegrenzt — ohne Abo.\n\nAm 1. des nächsten Monats erhältst du wieder 13 kostenlose Credits.`;
}

export function attachLowBalanceNudge(
  reply: string,
  remaining: number,
  lifetime: boolean,
  usedGrace: boolean,
  language: 'de' | 'en',
): string {
  if (lifetime) return reply;
  if (usedGrace || remaining <= 0) {
    return language === 'en'
      ? `${reply}\n\n──────────────────────────────\nYour monthly credits are used up. Top up once — no subscription.`
      : `${reply}\n\n──────────────────────────────\nDeine monatlichen Credits sind aufgebraucht. Einmalig aufladen — ohne Abo.`;
  }
  if (remaining <= 2) {
    return language === 'en'
      ? `${reply}\n\n_Still ${remaining} credit(s) left. Top up without a subscription in chat._`
      : `${reply}\n\n_Noch ${remaining} Credit(s). Aufladen ohne Abo im Chat._`;
  }
  return reply;
}
