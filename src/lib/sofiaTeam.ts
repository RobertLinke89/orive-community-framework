import claimedMap from '@/data/claimedFacilitators.json';
import { catalogOfferings } from '@/data/catalogOfferings';
import { mockOfferingsSessions } from '@/data/offeringsData';
import { getExpert, routeExpert, SOFIA_EXPERTS, type ExpertId } from '@/lib/sofiaExperts';
import { listInventory } from '@/lib/oriveStore';

export type TeamSnapshot = {
  catalog: number;
  berlinBreathwork: number;
  oriveOfferings: number;
  oriveSlots: number;
  claimed: number;
  individualFallback: number;
  sofiaUpstream: boolean;
  stripe: boolean;
  resend: boolean;
  whatsapp: boolean;
};

export type TeamLink = { href: string; label: string };

export type TeamReply = {
  expert: ExpertId;
  name: string;
  mandate: string;
  reply: string;
  handoff: ExpertId | null;
  links: TeamLink[];
  snapshot: TeamSnapshot;
};

export async function teamSnapshot(): Promise<TeamSnapshot> {
  const inventory = await listInventory();
  return {
    catalog: catalogOfferings.length,
    berlinBreathwork: catalogOfferings.filter((item) => {
      const hay = `${item.title} ${item.location || ''} ${(item.tags || []).join(' ')}`;
      return /berlin/i.test(item.location || '') && /breath|atem/i.test(hay);
    }).length,
    oriveOfferings: inventory.length,
    oriveSlots: inventory.reduce((sum, item) => sum + item.slots.length, 0),
    claimed: Object.keys(claimedMap || {}).length,
    individualFallback: mockOfferingsSessions.length,
    sofiaUpstream: Boolean(process.env.SOFIA_SERVER_URL),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    resend: Boolean(process.env.RESEND_API_KEY),
    whatsapp: Boolean(process.env.NEXT_PUBLIC_SOFIA_WHATSAPP?.replace(/\D/g, '')),
  };
}

function linksOf(id: ExpertId, isDe: boolean): TeamLink[] {
  return getExpert(id).orivePaths.map((path) => ({
    href: path.href,
    label: isDe ? path.labelDe : path.labelEn,
  }));
}

function standup(snap: TeamSnapshot, isDe: boolean): string {
  if (isDe) {
    return [
      'Team ist aktiv. Stand jetzt:',
      `• Katalog ${snap.catalog} Partnertermine, davon ${snap.berlinBreathwork} Breathwork Berlin.`,
      `• ORIVE-Inventory ${snap.oriveOfferings} Angebote / ${snap.oriveSlots} Slots. Claims ${snap.claimed}.`,
      `• 1:1-Fallback ${snap.individualFallback} (authentische Sessions mit Foto).`,
      `• Stripe ${snap.stripe ? 'gesetzt' : 'fehlt'} · Resend ${snap.resend ? 'gesetzt' : 'fehlt'} · WhatsApp-Nummer ${snap.whatsapp ? 'gesetzt' : 'fehlt'} · Sofia-Server ${snap.sofiaUpstream ? 'verbunden' : 'offline, lokal'}.`,
      'Nächster Hebel: 10 Claims in Berlin, 20 echte Slots. Keine Ads bevor Slots buchbar sind.',
      'ATLAS=Technik · LUNA=Listen · NOVA=Kanäle · ORION=Priorität · SAGE=Zahlung.',
    ].join('\n');
  }
  return [
    'Team is on. Current board:',
    `• Catalog ${snap.catalog} partner dates, ${snap.berlinBreathwork} Breathwork Berlin.`,
    `• ORIVE inventory ${snap.oriveOfferings} offerings / ${snap.oriveSlots} slots. Claims ${snap.claimed}.`,
    `• 1:1 fallback ${snap.individualFallback} (authentic sessions with a photo).`,
    `• Stripe ${snap.stripe ? 'set' : 'missing'} · Resend ${snap.resend ? 'set' : 'missing'} · WhatsApp number ${snap.whatsapp ? 'set' : 'missing'} · Sofia server ${snap.sofiaUpstream ? 'connected' : 'offline, local'}.`,
    'Next lever: 10 Berlin claims, 20 real slots. No ads before slots are bookable.',
    'ATLAS=engineering · LUNA=listings · NOVA=channels · ORION=priority · SAGE=money.',
  ].join('\n');
}

function expertReply(id: ExpertId, snap: TeamSnapshot, isDe: boolean): { reply: string; handoff: ExpertId | null } {
  switch (id) {
    case 'atlas':
      return {
        handoff: null,
        reply: isDe
          ? `Claim-API, Inventory-API und Concierge laufen in diesem Repo. Sofia-Upstream ist ${snap.sofiaUpstream ? 'an' : 'aus — Matching bleibt lokal'}. WhatsApp Cloud API ist nicht verdrahtet${snap.whatsapp ? ', wa.me-Nummer ist gesetzt' : ', keine Nummer in ENV'}. Nächster Bau: Kalender-Slot im Dezk, nicht ein neues CRM.`
          : `Claim API, inventory API and concierge run in this repo. Sofia upstream is ${snap.sofiaUpstream ? 'on' : 'off — matching stays local'}. WhatsApp Cloud API is not wired${snap.whatsapp ? ', wa.me number is set' : ', no number in ENV'}. Next build: calendar slots in the dezk, not a new CRM.`,
      };
    case 'luna':
      return {
        handoff: snap.oriveSlots === 0 ? 'orion' : null,
        reply: isDe
          ? `Listen: ${snap.catalog} Eventbrite-Termine mit Originalfoto. Breathwork Berlin ${snap.berlinBreathwork}. 1:1-Fallback ${snap.individualFallback}. ORIVE-Slots ${snap.oriveSlots}. Leere 1:1-Seite ist korrekt — Mocks sind raus. Risiko: Inventory ohne Foto und Eventbrite-Traffic ohne Capture.`
          : `Lists: ${snap.catalog} Eventbrite dates with original photos. Breathwork Berlin ${snap.berlinBreathwork}. 1:1 fallback ${snap.individualFallback}. ORIVE slots ${snap.oriveSlots}. Empty 1:1 page is correct — mocks are gone. Risk: inventory without a photo, and Eventbrite traffic without capture.`,
      };
    case 'nova':
      return {
        handoff: snap.oriveSlots < 10 ? 'orion' : null,
        reply: isDe
          ? `Kanäle die stehen: Kategorie-SEO, Event-URLs, Concierge unter /whatsapp-assistant, Shop. Pixel/Ads nicht anschließen, solange unter 10 ORIVE-Slots (${snap.oriveSlots} jetzt). WhatsApp-Handoff ${snap.whatsapp ? 'kann live' : 'wartet auf NEXT_PUBLIC_SOFIA_WHATSAPP'}.`
          : `Channels that exist: category SEO, event URLs, concierge at /whatsapp-assistant, shop. Do not connect pixels/ads while ORIVE slots are under 10 (now ${snap.oriveSlots}). WhatsApp handoff ${snap.whatsapp ? 'can go live' : 'waits on NEXT_PUBLIC_SOFIA_WHATSAPP'}.`,
      };
    case 'orion':
      return {
        handoff: snap.claimed < 10 ? 'atlas' : null,
        reply: isDe
          ? `0 skalierte Nachfrage, ${snap.claimed} Claims, ${snap.oriveSlots} eigene Slots, ${snap.berlinBreathwork} fremde Breathwork-Termine in Berlin. Keil bleibt Berlin × Breathwork. Kein zweites Land, keine neue Kategorie, bevor 10 Hosts 20 Slots halten.`
          : `No scaled demand, ${snap.claimed} claims, ${snap.oriveSlots} owned slots, ${snap.berlinBreathwork} external Breathwork dates in Berlin. Wedge stays Berlin × Breathwork. No second country, no new category, until 10 hosts hold 20 slots.`,
      };
    case 'sage':
      return {
        handoff: null,
        reply: isDe
          ? `Stripe-Keys ${snap.stripe ? 'liegen' : 'fehlen'}. Resend ${snap.resend ? 'liegt' : 'fehlt — Claim-Mails können spammlaufen'}. Shopify-Shop ist getrennt vom Booking. Keine ORIVE-Gebühr im UI erfinden. Stripe Connect erst, wenn ein Partnervertrag eine Take-Rate nennt.`
          : `Stripe keys ${snap.stripe ? 'are present' : 'are missing'}. Resend ${snap.resend ? 'is present' : 'is missing — claim mail can hit spam'}. Shopify is separate from booking. Do not invent an ORIVE fee in the UI. Stripe Connect only after a partner contract names a take rate.`,
      };
    default:
      return { handoff: null, reply: standup(snap, isDe) };
  }
}

export async function answerTeam(input: {
  message: string;
  expert?: string | null;
  language?: 'de' | 'en';
}): Promise<TeamReply> {
  const text = String(input.message || '').trim();
  const isDe = (input.language || (/[äöüß]|\b(ich|und|bitte|was|wie|stand)\b/i.test(text) ? 'de' : 'en')) === 'de';
  const forced = input.expert ? getExpert(input.expert).id : null;
  const expert = forced || routeExpert(text);
  const snap = await teamSnapshot();
  const briefing = /standup|briefing|lage|übersicht|uebersicht|team status|^$/.test(text.toLowerCase());
  const body = briefing && expert === 'sofia'
    ? { reply: standup(snap, isDe), handoff: null as ExpertId | null }
    : expertReply(expert, snap, isDe);
  const meta = getExpert(expert);

  return {
    expert,
    name: meta.name,
    mandate: isDe ? meta.mandateDe : meta.mandateEn,
    reply: body.reply,
    handoff: body.handoff,
    links: linksOf(expert, isDe),
    snapshot: snap,
  };
}

export async function teamRoster(isDe: boolean) {
  const snap = await teamSnapshot();
  return {
    active: true,
    snapshot: snap,
    experts: SOFIA_EXPERTS.map((expert) => ({
      id: expert.id,
      name: expert.name,
      mandate: isDe ? expert.mandateDe : expert.mandateEn,
      status: 'active' as const,
    })),
  };
}
