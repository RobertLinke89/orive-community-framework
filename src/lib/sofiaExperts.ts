export type ExpertId = 'sofia' | 'atlas' | 'luna' | 'nova' | 'orion' | 'sage';

export type SofiaExpert = {
  id: ExpertId;
  name: string;
  mandateDe: string;
  mandateEn: string;
  orivePaths: { href: string; labelDe: string; labelEn: string }[];
};

export const SOFIA_EXPERTS: SofiaExpert[] = [
  {
    id: 'sofia',
    name: 'SOFIA',
    mandateDe: 'Orchestrierung — erste Anlaufstelle, delegiert an das Team, hält den Stand.',
    mandateEn: 'Orchestration — first desk, hands off to the team, keeps the board.',
    orivePaths: [
      { href: '/dezk/team', labelDe: 'Team', labelEn: 'Team' },
      { href: '/whatsapp-assistant', labelDe: 'Gäste-Concierge', labelEn: 'Guest concierge' },
      { href: '/dezk', labelDe: 'Dezk', labelEn: 'Dezk' },
    ],
  },
  {
    id: 'atlas',
    name: 'ATLAS',
    mandateDe: 'Technik — Claim, Inventory, Concierge-API, Integrationen die schon im Code sind.',
    mandateEn: 'Engineering — claim, inventory, concierge API, integrations already in the code.',
    orivePaths: [
      { href: '/dezk', labelDe: 'Claim / Slots', labelEn: 'Claim / slots' },
      { href: '/whatsapp-assistant', labelDe: 'Concierge', labelEn: 'Concierge' },
    ],
  },
  {
    id: 'luna',
    name: 'LUNA',
    mandateDe: 'Ops — Listen-Gesundheit, leere 1:1, echte Bilder, was nicht live darf.',
    mandateEn: 'Ops — listing health, empty 1:1, real photos, what must not go live.',
    orivePaths: [
      { href: '/categories/Breathwork', labelDe: 'Breathwork-Liste', labelEn: 'Breathwork list' },
      { href: '/categories/all?type=individual', labelDe: '1:1-Liste', labelEn: '1:1 list' },
    ],
  },
  {
    id: 'nova',
    name: 'NOVA',
    mandateDe: 'Marketing — SEO-Seiten, Concierge, Shop. Keine Ads ohne buchbare Slots.',
    mandateEn: 'Marketing — SEO pages, concierge, shop. No ads without bookable slots.',
    orivePaths: [
      { href: '/whatsapp-assistant', labelDe: 'Concierge', labelEn: 'Concierge' },
      { href: '/shop', labelDe: 'Shop', labelEn: 'Shop' },
      { href: '/blog', labelDe: 'Magazin', labelEn: 'Magazine' },
    ],
  },
  {
    id: 'orion',
    name: 'ORION',
    mandateDe: 'Strategie — Keil Berlin × Breathwork, Supply vor Demand, kein neuer Markt.',
    mandateEn: 'Strategy — Berlin × Breathwork wedge, supply before demand, no new market.',
    orivePaths: [
      { href: '/categories/Breathwork', labelDe: 'Berlin-Keil', labelEn: 'Berlin wedge' },
      { href: '/dezk', labelDe: 'Slots live setzen', labelEn: 'Publish slots' },
    ],
  },
  {
    id: 'sage',
    name: 'SAGE',
    mandateDe: 'Geld & Tools — Stripe, Shopify, Resend. Keine erfundene Gebühr.',
    mandateEn: 'Money & tools — Stripe, Shopify, Resend. No invented fee.',
    orivePaths: [
      { href: '/protection', labelDe: 'Buchung & Zahlung', labelEn: 'Booking & payment' },
      { href: '/shop', labelDe: 'Shopify', labelEn: 'Shopify' },
    ],
  },
];

export function normalizeExpertId(id: string | null | undefined): ExpertId {
  const key = String(id || 'sofia').toLowerCase().trim();
  return SOFIA_EXPERTS.some((expert) => expert.id === key) ? (key as ExpertId) : 'sofia';
}

export function getExpert(id: string | null | undefined): SofiaExpert {
  const normalized = normalizeExpertId(id);
  return SOFIA_EXPERTS.find((expert) => expert.id === normalized) || SOFIA_EXPERTS[0];
}

export function routeExpert(message: string): ExpertId {
  const text = String(message || '').toLowerCase();
  if (/standup|briefing|lage|übersicht|uebersicht|team status|orchest/.test(text)) return 'sofia';
  if (/atlas|workflow|integrat|api|bug|supabase|claim|crawler|inventory/.test(text)) return 'atlas';
  if (/luna|health|ops|monitoring|1:1|einzelsession|bild|mock|leer/.test(text)) return 'luna';
  if (/nova|marketing|seo|content|instagram|newsletter|ads|shop|kampagne/.test(text)) return 'nova';
  if (/orion|strateg|growth|wachstum|roi|pipeline|hockey|skal|berlin|keil/.test(text)) return 'orion';
  if (/sage|stripe|geld|invoice|rechnung|gebühr|gebuehr|payout|finanz|hr|shopify|resend/.test(text)) return 'sage';
  return 'sofia';
}
