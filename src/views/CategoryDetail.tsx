"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { OfferingCard } from '@/components/OfferingCard';
import { DetailBreadcrumb } from '@/components/DetailBreadcrumb';
import { DiscoverySearchBar, EMPTY_DISCOVERY, matchesDiscovery, type DiscoverySearch } from '@/components/DiscoverySearchBar';
import { usePublicOfferings, type PublicOffering } from '@/hooks/usePublicOfferings';
import { useOriveInventory } from '@/hooks/useOriveInventory';
import { isListableOfferingImage } from '@/lib/imageUrl';
import { getAllSessions, type Session } from '@/data/sessionsData';
import {
  Brain,
  Flame,
  Flower2,
  Globe2,
  Radio,
  Smile,
  Sparkles,
  Sun,
  Waves,
  Wind,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { matchesMarketplaceTab } from '@/lib/catalogLayout';
import { cn } from '@/lib/utils';

export const ALL_CATEGORIES = [
  { id: 'all', labelDe: 'Alle', labelEn: 'All', descDe: 'Sessions, Events und Retreats.', descEn: 'Sessions, events and retreats.', icon: Sparkles },
  { id: 'Breathwork', labelDe: 'Breathwork', labelEn: 'Breathwork', descDe: 'Atemarbeit, Pranayama, Holotropic und Wim Hof.', descEn: 'Breathwork, pranayama, holotropic and Wim Hof.', icon: Wind },
  { id: 'Yoga', labelDe: 'Yoga & Somatik', labelEn: 'Yoga & Somatics', descDe: 'Vinyasa, Yin, Kundalini, Nidra und Flow.', descEn: 'Vinyasa, Yin, Kundalini, Nidra and flow.', icon: Sun },
  { id: 'Meditation', labelDe: 'Meditation', labelEn: 'Meditation', descDe: 'Achtsamkeit, Zen, Vipassana und Stille.', descEn: 'Mindfulness, Zen, Vipassana and silence.', icon: Flower2 },
  { id: 'Sound Healing', labelDe: 'Sound Healing', labelEn: 'Sound Healing', descDe: 'Klangschalen, Gong Baths und Frequenzen.', descEn: 'Singing bowls, gong baths and frequencies.', icon: Radio },
  { id: 'Cold Therapy', labelDe: 'Kältetherapie', labelEn: 'Cold', descDe: 'Eisbaden, Kälteexposition und Kryo.', descEn: 'Ice baths, cold exposure and cryo.', icon: Waves },
  { id: 'Life Coaching', labelDe: 'Coaching', labelEn: 'Coaching', descDe: 'Mentoring, Mindset, Leadership.', descEn: 'Mentoring, mindset, leadership.', icon: Brain },
  { id: 'BodyWork', labelDe: 'Bodywork', labelEn: 'Bodywork', descDe: 'Körpertherapie, Massage, Faszie und Reiki.', descEn: 'Bodywork, massage, fascia and Reiki.', icon: Waves },
  { id: 'Mindfulness', labelDe: 'Achtsamkeit', labelEn: 'Mindfulness', descDe: 'MBSR, Stressabbau und Waldbaden.', descEn: 'MBSR, stress reduction and forest bathing.', icon: Smile },
  { id: 'Spiritual Growth', labelDe: 'Spiritualität', labelEn: 'Spiritual', descDe: 'Zeremonien, Energiearbeit und Chakren.', descEn: 'Ceremony, energy work and chakras.', icon: Sparkles },
  { id: 'Somatic Therapy', labelDe: 'Somatik', labelEn: 'Somatics', descDe: 'Nervensystem, Polyvagal und TRE.', descEn: 'Nervous system, polyvagal and TRE.', icon: Brain },
  { id: 'Cacao & Ceremony', labelDe: 'Zeremonien', labelEn: 'Ceremony', descDe: 'Zeremonieller Kakao und Singkreise.', descEn: 'Ceremonial cacao and singing circles.', icon: Flame },
  { id: 'Retreats', labelDe: 'Retreats', labelEn: 'Retreats', descDe: 'Mehrtägige Auszeiten.', descEn: 'Multi-day retreats.', icon: Globe2 },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Breathwork': ['breathwork', 'atemarbeit', 'pranayama', 'wim hof', 'holotropic', 'conscious breathing', 'breath', 'atem'],
  'Yoga': ['yoga', 'vinyasa', 'yin yoga', 'kundalini', 'ashtanga', 'hatha', 'flow', 'nidra', 'asana'],
  'Meditation': ['meditation', 'zen', 'vipassana', 'stille', 'mindfulness meditation', 'zazen', 'kriya'],
  'Sound Healing': ['sound healing', 'sound bath', 'sound', 'klangschale', 'gong', 'frequency', 'crystal bowl', 'singing bowl', 'klang'],
  'Cold Therapy': ['cold', 'ice', 'eisbad', 'kälte', 'cryo', 'wim hof', 'ice bath'],
  'Life Coaching': ['life coaching', 'coaching', 'coach', 'mentoring', 'mindset', 'leadership', 'career', 'executive'],
  'BodyWork': ['bodywork', 'körperarbeit', 'massage', 'reiki', 'somatic', 'fascia', 'craniosacral', 'tre', 'shiatsu', 'polyvagal'],
  'Mindfulness': ['mindfulness', 'achtsamkeit', 'mbsr', 'stress reduction', 'präsenz', 'inner peace', 'shinrin', 'forest bathing'],
  'Spiritual Growth': ['spiritual growth', 'spiritual', 'spirituality', 'shamanic', 'energy healing', 'chakra', 'ceremony', 'cacao', 'fire ceremony', 'shadow work', 'kundalini activation'],
  'Somatic Therapy': ['somatic', 'nervensystem', 'nervous system', 'tre', 'polyvagal', 'trauma', 'somatic experiencing'],
  'Cacao & Ceremony': ['cacao', 'kakao', 'ceremony', 'singing circle', 'zeremonie', 'singkreis'],
  'Retreats': ['retreat', 'auszeit', 'weekend', 'mallorca', 'ibiza', 'algarve', 'alpen', 'toscana', 'toskana'],
};

function matchesCategoryFilter(offering: PublicOffering, categoryId: string): boolean {
  if (!categoryId || categoryId === 'all') return true;
  const keywords = CATEGORY_KEYWORDS[categoryId] || [categoryId.toLowerCase()];
  const searchText = [
    offering.title || '',
    offering.description || '',
    offering.location || '',
    ...(offering.tags || [])
  ].join(' ').toLowerCase();
  return keywords.some(kw => searchText.includes(kw.toLowerCase()));
}

function sessionToPublicOffering(session: Session): PublicOffering {
  return {
    id: session.id,
    title: session.title,
    description: session.description,
    type: 'individual',
    price: session.hourlyRate,
    duration: 60,
    location: session.location,
    is_online: /online/i.test(session.location),
    image_url: session.image,
    capacity: 1,
    start_at: null,
    tags: session.tags,
    facilitator_id: session.facilitatorId,
    facilitator_name: session.facilitatorName,
    rating: session.rating,
    reviewCount: session.reviewCount,
    source_url: session.source_url,
    source_platform: session.source_platform,
    fulfillment: session.source_url ? 'external' : 'orive',
  };
}

const EUROPE_SESSION_OFFERINGS: PublicOffering[] = getAllSessions().map(sessionToPublicOffering);

export default function CategoryDetailView() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCategory = params?.category as string;
  const decodedCategory = rawCategory ? decodeURIComponent(rawCategory) : 'all';
  const typeFromUrl = searchParams?.get('type');
  const listingTab = typeFromUrl === 'individual' ? 'sessions' : typeFromUrl === 'event' ? 'events' : 'all';

  const { language, copy } = useLanguage();
  const isDe = language === 'de';

  const { offerings: remoteOfferings, loading: remoteLoading } = usePublicOfferings({
    limit: 1200,
    type: typeFromUrl === 'individual' ? 'individual' : undefined,
  });
  const { offerings: oriveOfferings, loading: oriveLoading } = useOriveInventory();

  const [selectedCat, setSelectedCat] = useState<string>(
    decodedCategory === 'all' || !decodedCategory ? 'all' : decodedCategory
  );
  const [discovery, setDiscovery] = useState<DiscoverySearch>(EMPTY_DISCOVERY);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Footer / deep links to `all` always start on Alle with an empty search.
    if (decodedCategory === 'all' || !decodedCategory) {
      setSelectedCat('all');
      setDiscovery(EMPTY_DISCOVERY);
      return;
    }
    setSelectedCat(decodedCategory);
  }, [decodedCategory, typeFromUrl]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCat(catId);
    const typeQuery = typeFromUrl === 'individual' || typeFromUrl === 'event' ? `?type=${typeFromUrl}` : '';
    router.push(`/categories/${encodeURIComponent(catId)}${typeQuery}`, { scroll: false });
  };

  const offerings = useMemo(() => {
    const seen = new Set<string>();
    const out: PublicOffering[] = [];
    const push = (item: PublicOffering, requireListableImage: boolean) => {
      if (!item?.id || seen.has(item.id)) return;
      if (requireListableImage && !isListableOfferingImage(item.image_url)) return;
      seen.add(item.id);
      out.push(item);
    };

    if (listingTab === 'sessions') {
      for (const item of oriveOfferings) {
        if (item.type === 'individual') push(item, false);
      }
      for (const item of EUROPE_SESSION_OFFERINGS) push(item, false);
      for (const item of remoteOfferings) {
        if (item.type === 'individual') push(item, true);
      }
      return out;
    }

    for (const item of oriveOfferings) push(item, false);
    for (const item of remoteOfferings) push(item, true);
    return out;
  }, [listingTab, oriveOfferings, remoteOfferings]);

  const loading = remoteLoading || oriveLoading;

  const filteredOfferings = useMemo(() => {
    return offerings.filter(
      (item) =>
        matchesCategoryFilter(item, selectedCat) &&
        matchesMarketplaceTab(item, listingTab) &&
        matchesDiscovery(item, discovery)
    );
  }, [offerings, selectedCat, listingTab, discovery]);

  const activeCategoryMeta = ALL_CATEGORIES.find(c => c.id === selectedCat) || ALL_CATEGORIES[0];
  const categoryLabel = isDe ? activeCategoryMeta.labelDe : activeCategoryMeta.labelEn;

  const pageTitle =
    listingTab === 'sessions'
      ? (copy('1:1 Einzelsessions', '1:1 sessions'))
      : listingTab === 'events'
        ? (copy('Events, Workshops & Retreats', 'Events, workshops & retreats'))
        : selectedCat === 'all'
          ? (copy('Alle Angebote', 'All offerings'))
          : categoryLabel;

  const pageDesc =
    listingTab === 'sessions'
      ? (copy('Private Sessions europaweit. Partnerlistings sind nicht über ORIVE verkauft.', 'Private sessions across Europe. Partner listings are not sold by ORIVE.'))
      : listingTab === 'events'
        ? (copy('Gruppen, Workshops und Retreats. Partnerlistings sind nicht über ORIVE verkauft.', 'Groups, workshops and retreats. Partner listings are not sold by ORIVE.'))
        : `${isDe ? activeCategoryMeta.descDe : activeCategoryMeta.descEn} ${
            copy('Partnerlistings sind nicht über ORIVE verkauft.', 'Partner listings are not sold by ORIVE.')
          }`;

  const countLabel = loading
    ? ''
    : copy(`${filteredOfferings.length} Angebote`, `${filteredOfferings.length} offerings`);

  const clearFilters = () => {
    setDiscovery(EMPTY_DISCOVERY);
    setSelectedCat('all');
    const typeQuery = typeFromUrl === 'individual' || typeFromUrl === 'event' ? `?type=${typeFromUrl}` : '';
    router.push(`/categories/all${typeQuery}`, { scroll: false });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-24">
        <div className="mx-auto max-w-[1600px] px-4 pt-3 sm:px-6 lg:px-10 xl:px-16">
          <DetailBreadcrumb
            quiet
            items={[
              { label: copy('Marktplatz', 'Marketplace'), href: '/' },
              { label: pageTitle },
            ]}
          />

          <div className="mt-6 mb-5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {pageTitle}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-white/50">
              {pageDesc}
            </p>
          </div>

          <div className="mb-3 flex w-full items-center gap-3">
            <div
              ref={scrollRef}
              className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {ALL_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = selectedCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={cn(
                      "group flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                      active
                        ? "border-transparent bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white/55 dark:hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", active ? "text-[#00CDAC]" : "text-slate-400 dark:text-white/35")} />
                    <span>{isDe ? cat.labelDe : cat.labelEn}</span>
                  </button>
                );
              })}
            </div>
            {countLabel ? (
              <p className="shrink-0 text-right text-xs tabular-nums text-slate-400 dark:text-white/40">
                {countLabel}
              </p>
            ) : null}
          </div>

          <div className="mb-8 w-full">
            <DiscoverySearchBar
              compact
              value={discovery}
              onChange={setDiscovery}
              isDe={isDe}
            />
            {(discovery.location || discovery.date || discovery.dateTo || discovery.query || selectedCat !== 'all') ? (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  {copy('Filter zurücksetzen', 'Clear filters')}
                </button>
              </div>
            ) : null}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="aspect-[20/19] rounded-2xl bg-slate-200 dark:bg-white/10" />
                  <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
                  <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-white/10" />
                </div>
              ))}
            </div>
          ) : filteredOfferings.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredOfferings.map((item) => (
                <OfferingCard
                  key={item.id}
                  offering={item}
                  realImageOnly={isListableOfferingImage(item.image_url)}
                />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md py-20 text-center">
              <p className="text-sm text-slate-500 dark:text-white/50">
                {copy('Keine Angebote zu diesen Angaben.', 'No offerings for this search.')}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-xs text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                {copy('Filter zurücksetzen', 'Clear filters')}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
