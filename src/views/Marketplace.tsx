"use client";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo, useRef, useEffect } from 'react';

import { TetrisCatalog } from '@/components/TetrisCatalog';
import { EMPTY_DISCOVERY, matchesDiscovery, type DiscoverySearch } from '@/components/DiscoverySearchBar';
import { HeroConciergeChat } from '@/components/HeroConciergeChat';
import { interleaveCatalog, isRetreat } from '@/lib/catalogLayout';
import { offeringSpan } from '@/lib/offeringSpan';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, SlidersHorizontal, X, MapPin, Tag, DollarSign, Star, ChevronDown, Check, RotateCcw, ArrowUpDown, Sparkles, Wind, Sun, Flower2, Radio, Brain, Waves, Smile, Compass, ChevronLeft, ChevronRight, ArrowRight, ArrowUpRight, Flame, Globe2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layout } from '@/components/Layout';
import { type FilterState } from '@/components/ProfilesFilter';
import { catalogOfferings } from '@/data/catalogOfferings';
import { type PublicOffering } from '@/hooks/usePublicOfferings';
import { useOriveInventory } from '@/hooks/useOriveInventory';
import { isRealOfferingImage } from '@/lib/imageUrl';
import { countries, specialties, priceRanges, ratingOptions } from '@/data/countries';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ZenBackgroundAnimation } from '@/components/ZenBackgroundAnimation';
import { useLanguage } from '@/hooks/useLanguage';

const quickCategories = [
  { id: 'all', label: 'Alle', icon: Sparkles },
  { id: 'Breathwork', label: 'Breathwork', icon: Wind },
  { id: 'Yoga', label: 'Yoga', icon: Sun },
  { id: 'Meditation', label: 'Meditation', icon: Flower2 },
  { id: 'Sound Healing', label: 'Sound Healing', icon: Radio },
  { id: 'Cold Therapy', label: 'Kältetherapie', icon: Waves },
  { id: 'Life Coaching', label: 'Coaching', icon: Brain },
  { id: 'BodyWork', label: 'Bodywork', icon: Waves },
  { id: 'Mindfulness', label: 'Mindfulness', icon: Smile },
  { id: 'Spiritual Growth', label: 'Spiritual', icon: Compass },
  { id: 'Somatic Therapy', label: 'Somatics', icon: Brain },
  { id: 'Cacao & Ceremony', label: 'Zeremonien', icon: Flame },
  { id: 'Retreats', label: 'Retreats', icon: Globe2 },
];

// Semantic keyword mapping to guarantee accurate category matching
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

/**
 * Checks if an item (facilitator, session, event) matches the selected category
 */
function matchesCategory(
  item: { title?: string; name?: string; tags?: string[]; description?: string | null; bio?: string; category?: string; [key: string]: any },
  selectedCategory: string
): boolean {
  if (!selectedCategory || selectedCategory === 'all') return true;
  const keywords = CATEGORY_KEYWORDS[selectedCategory] || [selectedCategory.toLowerCase()];
  const text = [
    item.title || item.name || '',
    item.description || item.bio || '',
    (item as any).category || '',
    ...(item.tags || [])
  ].join(' ').toLowerCase();

  return keywords.some(kw => text.includes(kw));
}

/**
 * Prunes expired past events from the overview (1-hour grace period for active events)
 */
function isPastOffering(offering: { title?: string; tags?: string[] | null; duration?: number | string | null; start_at?: string | null; end_at?: string | null; type?: string }): boolean {
  const end = offeringSpan(offering).end;
  if (!end) return false;
  return end.getTime() < (Date.now() - 3600 * 1000);
}

function asTagList(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag)).filter(Boolean);
  if (typeof tags === 'string') {
    return tags.split(/[,|/]/).map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

function withDisplayType(item: PublicOffering): PublicOffering {
  const tags = asTagList(item.tags);
  const normalized: PublicOffering = {
    ...item,
    title: item.title || 'Untitled offering',
    tags,
    price: item.price == null ? null : String(item.price),
  };
  if (normalized.type === 'individual') return normalized;
  const text = `${normalized.title} ${tags.join(' ')}`.toLowerCase();
  if (/retreat|weekend|immersion|festival|party/.test(text)) {
    return normalized.type === 'event' ? normalized : { ...normalized, type: 'event' };
  }
  if (/circle|class|weekly|community|workshop|masterclass/.test(text) || (normalized.capacity && normalized.capacity <= 16)) {
    return normalized.type === 'group' ? normalized : { ...normalized, type: 'group' };
  }
  return normalized;
}

const extractPrice = (priceStr: string | null | undefined): number => {
  if (!priceStr) return 0;
  const s = String(priceStr);
  const match = s.match(/€\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// Helper function to extract country from location
const extractCountry = (location: string): string => {
  const parts = location.split(',');
  return parts.length > 1 ? parts[parts.length - 1].trim() : location;
};

function AncestorLineage({
  side,
  present,
  elder,
  ancestor,
  presentAlt,
}: {
  side: 'left' | 'right';
  present: string;
  elder: string;
  ancestor: string;
  presentAlt: string;
}) {
  const isLeft = side === 'left';
  const figures = isLeft
    ? [
        { src: ancestor, alt: '', height: 'h-[58%] sm:h-[62%] lg:h-[65%]', tone: 'opacity-55 sm:opacity-65 dark:opacity-35 sm:dark:opacity-45', z: 'z-0', overlap: '-mr-8 sm:-mr-10 lg:-mr-12 xl:-mr-14' },
        { src: elder, alt: '', height: 'h-[68%] sm:h-[72%] lg:h-[76%]', tone: 'opacity-70 sm:opacity-80 dark:opacity-45 sm:dark:opacity-55', z: 'z-[1]', overlap: '-mr-10 sm:-mr-12 lg:-mr-14 xl:-mr-16' },
        { src: present, alt: presentAlt, height: 'h-full', tone: 'opacity-90 dark:opacity-75', z: 'z-[2]', overlap: '' },
      ]
    : [
        { src: present, alt: presentAlt, height: 'h-full', tone: 'opacity-90 dark:opacity-75', z: 'z-[2]', overlap: '-mr-10 sm:-mr-12 lg:-mr-14 xl:-mr-16' },
        { src: elder, alt: '', height: 'h-[74%] sm:h-[80%] lg:h-[86%]', tone: 'opacity-70 sm:opacity-80 dark:opacity-45 sm:dark:opacity-55', z: 'z-[1]', overlap: '-mr-8 sm:-mr-10 lg:-mr-12 xl:-mr-14' },
        { src: ancestor, alt: '', height: 'h-[58%] sm:h-[64%] lg:h-[68%]', tone: 'opacity-55 sm:opacity-65 dark:opacity-35 sm:dark:opacity-45', z: 'z-0', overlap: '' },
      ];

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-0 hidden w-max select-none sm:block",
        // Lift so chests sit behind the search field, not hanging fully below it.
        "-top-10 sm:-top-14 md:-top-16 lg:-top-[4.75rem] xl:-top-[5.25rem]",
        isLeft
          ? "right-[calc(100%-4rem)] md:right-[calc(100%-5rem)] lg:right-[calc(100%-6rem)] xl:right-[calc(100%-7rem)]"
          : "left-[calc(100%-4rem)] md:left-[calc(100%-5rem)] lg:left-[calc(100%-6rem)] xl:left-[calc(100%-7rem)]"
      )}
      aria-hidden
    >
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -14 : 14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.05, ease: "easeOut" }}
        className="relative isolate flex h-[150px] w-max items-end sm:h-[180px] md:h-[210px] lg:h-[240px] xl:h-[260px]"
      >
        {figures.map((figure) => (
          <img
            key={figure.src}
            src={figure.src}
            alt={figure.alt}
            className={cn(
              "relative max-w-none shrink-0 object-contain object-bottom drop-shadow-sm [mask-image:linear-gradient(to_bottom,black_86%,transparent)] dark:[mask-image:linear-gradient(to_bottom,black_80%,transparent)]",
              figure.height,
              figure.tone,
              figure.z,
              figure.overlap
            )}
          />
        ))}
      </motion.div>
    </div>
  );
}

export function MarketplaceContent({
  initialSearchQuery = "",
  showCatalog = true,
  landingHero = false,
}: {
  initialSearchQuery?: string;
  /** Category chips + Tetris grid — marketplace only, not the landing hero. */
  showCatalog?: boolean;
  /** Home journey composition (figures + concierge). Can sit above the catalog. */
  landingHero?: boolean;
}) {
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const isDe = language === 'de';
  const tabFromUrl = searchParams?.get('tab');
  const countryFromUrl = searchParams?.get('country');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [discovery, setDiscovery] = useState<DiscoverySearch>({
    ...EMPTY_DISCOVERY,
    query: initialSearchQuery,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('recent');
  useEffect(() => {
    if (tabFromUrl === 'sessions') {
      navigate.replace('/categories/all?type=individual');
      return;
    }
    if (tabFromUrl === 'events') {
      navigate.replace('/categories/all?type=event');
    }
  }, [tabFromUrl, navigate]);
  const [showOnlyCrawled, setShowOnlyCrawled] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [specialtyOpen, setSpecialtyOpen] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const scrollCategories = (direction: 'left' | 'right') => {
    categoryScrollRef.current?.scrollBy({
      left: direction === 'left' ? -350 : 350,
      behavior: 'smooth',
    });
  };


  const [filters, setFilters] = useState<FilterState>({
    countries: countryFromUrl ? [countryFromUrl] : [],
    specialties: [],
    priceRange: {
      min: 0,
      max: Infinity
    },
    minRating: 0,
    verifiedOnly: false
  });

  useEffect(() => {
    if (!countryFromUrl) return;
    setFilters((prev) => {
      if (prev.countries.length === 1 && prev.countries[0] === countryFromUrl) return prev;
      return { ...prev, countries: [countryFromUrl] };
    });
    setCountryOpen(true);
  }, [countryFromUrl]);

  const syncCountryToUrl = (nextCountries: string[]) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (nextCountries.length === 1) {
      params.set("country", nextCountries[0]);
    } else {
      params.delete("country");
    }
    const qs = params.toString();
    navigate.replace(qs ? `/marketplace?${qs}` : "/marketplace", { scroll: false });
  };

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    return countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
  }, [countrySearch]);

  const toggleCountry = (name: string) => {
    const next = filters.countries.includes(name) ? filters.countries.filter(c => c !== name) : [...filters.countries, name];
    setFilters({ ...filters, countries: next });
    syncCountryToUrl(next);
  };
  const toggleSpecialty = (s: string) => {
    const next = filters.specialties.includes(s) ? filters.specialties.filter(x => x !== s) : [...filters.specialties, s];
    setFilters({ ...filters, specialties: next });
  };
  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (selectedCategory !== 'all') c++;
    if (filters.countries.length > 0) c++;
    if (filters.specialties.length > 0) c++;
    if (filters.priceRange.max < Infinity || filters.priceRange.min > 0) c++;
    if (filters.minRating > 0) c++;
    if (filters.verifiedOnly) c++;
    return c;
  }, [filters, selectedCategory]);
  const clearAllFilters = () => {
    setFilters({ countries: [], specialties: [], priceRange: { min: 0, max: Infinity }, minRating: 0, verifiedOnly: false });
    setSearchQuery('');
    setDiscovery(EMPTY_DISCOVERY);
    setSelectedCategory('all');
    syncCountryToUrl([]);
  };

  const { offerings: oriveOfferings } = useOriveInventory();

  const catalogPool = useMemo(() => {
    const seen = new Set<string>();
    const merged = catalogOfferings
      .map(withDisplayType)
      .filter(item => {
      if (!item?.id || seen.has(item.id)) return false;
      if (!isRealOfferingImage(item.image_url)) return false;
      seen.add(item.id);
      return true;
    });

    let result = merged.filter((item) => matchesDiscovery(item, discovery));
    if (filters.countries.length > 0) {
      result = result.filter(s => {
        const country = extractCountry(s.location || '');
        return filters.countries.some(c => country.toLowerCase().includes(c.toLowerCase()));
      });
    }
    if (filters.priceRange.min > 0 || filters.priceRange.max < Infinity) {
      result = result.filter(s => {
        const price = extractPrice(s.price || '');
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }
    if (filters.minRating > 0) {
      result = result.filter(s => typeof s.rating === 'number' && s.rating >= filters.minRating);
    }
    return result;
  }, [discovery, filters]);

  const categorizedOfferings = useMemo(() => {
    const cats = quickCategories.filter(c =>
      selectedCategory === 'all' ? c.id !== 'all' : c.id === selectedCategory
    );
    const groups = cats.map(cat => {
      const matched = catalogPool.filter(item => matchesCategory(item, cat.id));
      const upcoming = matched.filter(item => !isPastOffering(item) || isRetreat(item));
      const pool = upcoming.length >= 4 ? upcoming : matched;
      return {
        id: cat.id,
        label: cat.label,
        icon: cat.icon,
        offerings: interleaveCatalog(pool, selectedCategory === 'all' ? 8 : 24),
      };
    }).filter((group) =>
      group.offerings.length > 0 || (!discovery.query && !discovery.location && !discovery.date && !discovery.dateTo)
    );

    const bookable = oriveOfferings.filter((item) => {
      if (selectedCategory !== 'all' && !matchesCategory(item, selectedCategory)) return false;
      return matchesDiscovery(item, discovery);
    });
    if (bookable.length > 0) {
      return [{ id: 'orive', label: 'Auf ORIVE buchen', icon: Sparkles, offerings: bookable }, ...groups];
    }
    return groups;
  }, [catalogPool, discovery, selectedCategory, oriveOfferings]);

  const isLandingHero = landingHero || !showCatalog;
  const europeCities = isDe
    ? ["Berlin", "Amsterdam", "Lissabon", "Wien", "Barcelona", "Zürich", "Paris", "Kopenhagen"]
    : ["Berlin", "Amsterdam", "Lisbon", "Vienna", "Barcelona", "Zurich", "Paris", "Copenhagen"];

  function applyCityFilter(city: string) {
    const location = city === "Lissabon" ? "Lisbon" : city === "Wien" ? "Vienna" : city === "Zürich" ? "Zurich" : city === "Kopenhagen" ? "Copenhagen" : city;
    setDiscovery((prev) => ({ ...prev, location }));
    setSelectedCategory("all");
    document.getElementById("marketplace-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-background text-left">
      {isLandingHero ? (
        /* ── Landing hero: SOFIA journey ── */
        <div className="relative overflow-hidden border-b border-slate-200/90 bg-gradient-to-b from-[#EBF7F5] via-[#F3FAF8] to-[#F8FAFC] px-4 pb-8 pt-6 transition-colors duration-300 dark:border-white/10 dark:from-[#02182E] dark:via-[#01223F] dark:to-[#011B33] sm:pb-9 sm:pt-8 lg:pb-10 lg:pt-9">
          <ZenBackgroundAnimation />
          <div className="relative z-10 mx-auto w-full max-w-[1600px]">
            <div className="relative mb-4 text-center sm:mb-5">
              <h1 className="relative mb-2 text-3xl font-bold leading-[1.1] tracking-tighter text-slate-900 dark:text-white sm:text-4xl md:text-[2.75rem] lg:text-5xl">
                Your{" "}
                <span className="bg-gradient-to-r from-[#00CDAC] to-[#02AAB0] bg-clip-text text-transparent">
                  Journey
                </span>{" "}
                Matters.
              </h1>
              <p className="mx-auto max-w-2xl px-4 text-sm font-normal leading-relaxed text-slate-500 dark:text-white/45">
                {isDe ? (
                  <>
                    <span className="block">Dein 24/7 Holistic-Wellbeing-Buddy und KI-Assistent.</span>
                    <span className="block">Immer da für Stress, Schlaf, Rituale und was du gerade brauchst.</span>
                  </>
                ) : (
                  <>
                    <span className="block">Your 24/7 holistic wellbeing buddy and AI assistant.</span>
                    <span className="block">Always here for stress, sleep, rituals, and whatever you need right now.</span>
                  </>
                )}
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-[72rem] xl:max-w-[80rem]">
              <div className="relative mx-auto w-full max-w-3xl sm:min-h-[140px] md:min-h-[160px] lg:min-h-[175px]">
                <AncestorLineage
                  side="left"
                  present="/hero-woman.webp"
                  elder="/hero-woman-elder.webp?v=5"
                  ancestor="/hero-woman-ancestor.webp?v=5"
                  presentAlt="Meditating woman with hands on heart"
                />
                <AncestorLineage
                  side="right"
                  present="/hero-man.webp"
                  elder="/hero-man-elder.webp?v=5"
                  ancestor="/hero-man-ancestor.webp?v=5"
                  presentAlt="Meditating man with hands on heart"
                />
                <div className="relative z-10">
                  <HeroConciergeChat />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Marketplace hero: Europe-wide discovery ── */
        <div className="relative overflow-hidden border-b border-slate-200/90 bg-[#F8FAFC] dark:border-white/10 dark:bg-[#011B33]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.32] dark:opacity-100"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(0,205,172,0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 15% 80%, rgba(2,170,176,0.1), transparent 50%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 top-8 hidden h-[320px] w-[320px] rounded-full border border-[#00CDAC]/15 sm:block lg:h-[420px] lg:w-[420px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 top-20 hidden h-[240px] w-[240px] rounded-full border border-[#00CDAC]/10 sm:block lg:h-[320px] lg:w-[320px]"
          />

          <div className="relative z-10 mx-auto max-w-[1180px] px-5 pb-10 pt-24 sm:px-8 sm:pb-12 sm:pt-28">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#017F80] dark:text-[#00CDAC]">
              <Globe2 className="h-3.5 w-3.5" />
              {isDe ? "ORIVE Marktplatz · Europa" : "ORIVE Marketplace · Europe"}
            </p>
            <h1 className="mt-4 max-w-[18ch] text-3xl font-semibold tracking-[-0.035em] leading-[1.08] text-[#01223F] dark:text-white sm:text-4xl lg:text-[2.75rem]">
              {isDe ? (
                <>
                  Rituale, Sessions & Retreats{" "}
                  <span className="text-[#00CDAC]">quer durch Europa.</span>
                </>
              ) : (
                <>
                  Rituals, sessions & retreats{" "}
                  <span className="text-[#00CDAC]">across Europe.</span>
                </>
              )}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-white/55 sm:text-[15px]">
              {isDe
                ? "Finde Breathwork in Berlin, Yoga in Lissabon, Sound Baths in Amsterdam — und buche dort, wo ORIVE den Platz verkauft."
                : "Find breathwork in Berlin, yoga in Lisbon, sound baths in Amsterdam — and book where ORIVE takes the seat."}
            </p>

            <form
              className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3 py-2 shadow-sm dark:border-white/10 dark:bg-[#02182B]"
              onSubmit={(event) => {
                event.preventDefault();
                const value = searchQuery.trim();
                setDiscovery((prev) => ({ ...prev, query: value, location: "" }));
                document.getElementById("marketplace-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <Search className="ml-1 h-4 w-4 shrink-0 text-slate-400 dark:text-white/35" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={
                  isDe
                    ? "Stadt, Praxis oder Facilitator…"
                    : "City, practice or facilitator…"
                }
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/35"
              />
              <button
                type="submit"
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#01223F] px-4 text-xs font-semibold text-white transition hover:bg-[#017F80] dark:bg-[#00CDAC] dark:text-[#01223F] dark:hover:bg-[#02AAB0]"
              >
                {isDe ? "Suchen" : "Search"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {europeCities.map((city) => {
                const active =
                  discovery.location &&
                  (discovery.location === city ||
                    (city === "Lissabon" && discovery.location === "Lisbon") ||
                    (city === "Wien" && discovery.location === "Vienna") ||
                    (city === "Zürich" && discovery.location === "Zurich") ||
                    (city === "Kopenhagen" && discovery.location === "Copenhagen"));
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => applyCityFilter(city)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                      active
                        ? "border-[#00CDAC]/50 bg-[#00CDAC]/10 text-[#008975] dark:text-[#00CDAC]"
                        : "border-slate-200/80 bg-white/80 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:text-white"
                    )}
                  >
                    <MapPin className="h-3 w-3 opacity-60" />
                    {city}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showCatalog ? (
        <div id="marketplace-results" className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 pt-6 pb-12">
          <div className="flex items-center justify-between gap-2.5 mb-6 pb-4 border-b border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={() => scrollCategories('left')}
              aria-label="Scroll left"
              className="hidden sm:flex w-7 h-7 rounded-full border border-slate-200 dark:border-white/10 items-center justify-center text-slate-500 hover:text-slate-900 dark:text-white/60 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 shrink-0 transition-all focus:outline-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div
              ref={categoryScrollRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x py-1 flex-1 min-w-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {quickCategories.map(cat => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "group flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border shrink-0",
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs"
                        : "bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/80 hover:border-slate-300 dark:bg-white/5 dark:text-white/60 dark:border-white/5 dark:hover:bg-white/10 dark:hover:text-white shadow-2xs"
                    )}
                  >
                    <Icon className={cn(
                      "w-3.5 h-3.5 transition-colors",
                      isActive ? "text-[#00CDAC] dark:text-[#008975]" : "text-slate-400 group-hover:text-slate-700 dark:text-white/40 dark:group-hover:text-white"
                    )} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
              <Link
                href={`/categories/${selectedCategory === 'all' ? 'all' : selectedCategory}`}
                className="group flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border bg-[#00CDAC]/10 hover:bg-[#00CDAC]/20 text-[#008975] dark:text-[#00CDAC] border-[#00CDAC]/30 shadow-2xs shrink-0"
              >
                <span>See all</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => scrollCategories('right')}
              aria-label="Scroll right"
              className="hidden sm:flex w-7 h-7 rounded-full border border-slate-200 dark:border-white/10 items-center justify-center text-slate-500 hover:text-slate-900 dark:text-white/60 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 shrink-0 transition-all focus:outline-none"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <TetrisCatalog groups={categorizedOfferings} />
        </div>
      ) : null}
    </div>
  );
}

export default function Profiles() {
  return (
    <Layout>
      <MarketplaceContent />
    </Layout>
  );
}