"use client";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useMemo, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Search, SlidersHorizontal, X, Star, MapPin, Clock, TrendingUp, ArrowUpDown, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";

import { supabase } from "@/integrations/supabase/client";
import { getAnonClientHeaders } from "@/lib/anonClientToken";
import { LQIPImage } from "@/components/LQIPImage";

// Database offering type
interface DatabaseOffering {
  id: string;
  facilitator_id: string;
  type: string;
  title: string;
  description: string | null;
  price: string | null;
  duration: number | null;
  location: string | null;
  status: string | null;
  image_url: string | null;
  created_at: string | null;
  facilitator?: {
    full_name: string;
    avatar_url: string | null;
  };
}

// Transformed session type for display
interface DisplaySession {
  id: string;
  title: string;
  facilitatorName: string;
  facilitatorId: string;
  facilitatorAvatar?: string | null;
  facilitatorUsername?: string | null;
  description: string;
  rating: number;
  reviewCount: number;
  sales: number;
  views: number;
  image: string;
  hourlyRate: string;
  location: string;
  tags: string[];
  duration: number;
  type: 'individual' | 'group' | 'event';
  startAt?: string | null;
  endAt?: string | null;
  timezone?: string | null;
  capacity?: number | null;
  isSoldOut?: boolean;
}

  type SortOption =
    | 'relevance'
    | 'rating'
    | 'price-low'
    | 'price-high'
    | 'reviews'
    | 'popularity'
    | 'event-soonest'
    | 'event-latest';

interface SessionSearchProps {
  externalQuery?: string;
  onQueryChange?: (query: string) => void;
}

export function SessionSearch({ externalQuery, onQueryChange }: SessionSearchProps) {
  const navigate = useRouter();
  const urlSearchParams = useSearchParams();
  const pathname = usePathname();
  const didInitFromUrl = useRef(false);

  const [internalQuery, setInternalQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<Array<'individual' | 'group' | 'event'>>([]);
  const [upcomingOnlyEvents, setUpcomingOnlyEvents] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sessions, setSessions] = useState<DisplaySession[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sessions from database
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const resp: any = await supabase.functions.invoke("get-public-offerings", {
          headers: { ...getAnonClientHeaders() },
          body: { page: 1, pageSize: 500 },
        });

        const offerings = resp?.data?.offerings ?? [];
        const error = resp?.error;
        if (error) throw error;

        // Transform database offerings to display format
        const transformedSessions: DisplaySession[] = (offerings || []).map((offering: any) => {
          // Extract tags from title/description
          const tags = extractTags(offering.title, offering.description || '');
          
          return {
            id: offering.id,
            title: offering.title,
            facilitatorName: offering.facilitator?.full_name || 'Facilitator',
            facilitatorId: offering.facilitator_id,
            facilitatorAvatar: offering.facilitator?.avatar_url || null,
            facilitatorUsername: offering.facilitator?.username || null,
            description: offering.description || '',
            rating: 4.5 + Math.random() * 0.5, // Simulated rating
            reviewCount: Math.floor(Math.random() * 50) + 5,
            sales: Math.floor(Math.random() * 100) + 10,
            views: Math.floor(Math.random() * 500) + 50,
            image: offering.image_url || '/sessions/breathwork-hero.jpg',
            hourlyRate: offering.price || '€75',
            location: offering.location || 'Online',
            tags,
            duration: offering.duration || 60,
            type: (offering.type as 'individual' | 'group' | 'event') || 'individual',
            startAt: (offering as any).start_at ?? null,
            endAt: (offering as any).end_at ?? null,
            timezone: (offering as any).timezone ?? null,
            capacity: (offering as any).capacity ?? null,
            isSoldOut: false, // Will be updated after fetching remaining spots
          };
        });

        // Fetch remaining spots for events with capacity
        const eventsWithCapacity = transformedSessions.filter(
          s => s.type === 'event' && s.capacity != null && s.capacity > 0
        );
        
        if (eventsWithCapacity.length > 0) {
          const spotsPromises = eventsWithCapacity.map(async (session) => {
            try {
              const { data, error } = await supabase
                .rpc('get_offering_remaining_spots', { p_offering_id: session.id });
              if (!error && data != null) {
                return { id: session.id, remainingSpots: data };
              }
              return { id: session.id, remainingSpots: session.capacity };
            } catch {
              return { id: session.id, remainingSpots: session.capacity };
            }
          });
          
          const spotsResults = await Promise.all(spotsPromises);
          const spotsMap = new Map(spotsResults.map(r => [r.id, r.remainingSpots]));
          
          // Update sessions with sold out status
          transformedSessions.forEach(session => {
            if (spotsMap.has(session.id)) {
              session.isSoldOut = spotsMap.get(session.id) === 0;
            }
          });
        }

        setSessions(transformedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Extract tags from title and description
  const extractTags = (title: string, description: string): string[] => {
    const keywords = [
      'Breathwork', 'Meditation', 'Yoga', 'Cold Exposure', 'Sound Healing',
      'Coaching', 'Therapy', 'Energy', 'Wellness', 'Stress Relief',
      'Trauma', 'Leadership', 'Pranayama', 'Ice Bath', 'Wim Hof',
      'Sleep', 'Anxiety', 'Performance', 'Corporate', 'Nature',
      'Dance', 'Movement', 'Somatic', 'Healing', 'Retreat'
    ];
    const text = `${title} ${description}`.toLowerCase();
    return keywords.filter(keyword => text.includes(keyword.toLowerCase())).slice(0, 3);
  };

  // Get unique locations for filter
  const allLocations = useMemo(() => {
    return [...new Set(sessions.map(s => s.location.split(',')[0]?.trim() || s.location))].sort();
  }, [sessions]);

  // Get unique tags for filter
  const allTags = useMemo(() => {
    return [...new Set(sessions.flatMap(s => s.tags))].sort();
  }, [sessions]);

  // Use external query if provided, otherwise use internal
  const searchQuery = externalQuery !== undefined ? externalQuery : internalQuery;
  const setSearchQuery = (value: string) => {
    if (onQueryChange) {
      onQueryChange(value);
    } else {
      setInternalQuery(value);
    }
  };

  // --- URL sync (query params) ---
  // q: search query
  // type: comma-separated list (individual,group,event)
  // tag: comma-separated list
  // loc: comma-separated list
  // sort: sort option
  // pmin/pmax: price range
  // r: min rating
  // upcoming: 1
  useEffect(() => {
    if (didInitFromUrl.current) return;

    const q = urlSearchParams.get('q') || '';
    const typeRaw = urlSearchParams.get('type') || '';
    const tagRaw = urlSearchParams.get('tag') || '';
    const locRaw = urlSearchParams.get('loc') || '';
    const sortRaw = (urlSearchParams.get('sort') || '') as SortOption;
    const pminRaw = urlSearchParams.get('pmin');
    const pmaxRaw = urlSearchParams.get('pmax');
    const rRaw = urlSearchParams.get('r');
    const upcomingRaw = urlSearchParams.get('upcoming');

    const parsedTypes = typeRaw
      .split(',')
      .map((s) => s.trim())
      .filter((t): t is 'individual' | 'group' | 'event' => t === 'individual' || t === 'group' || t === 'event');

    const parsedTags = tagRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedLocs = locRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const pmin = pminRaw ? Number(pminRaw) : null;
    const pmax = pmaxRaw ? Number(pmaxRaw) : null;
    const r = rRaw ? Number(rRaw) : null;
    const upcoming = upcomingRaw === '1' || upcomingRaw === 'true';

    if (q) setSearchQuery(q);
    if (parsedTypes.length) setSelectedTypes(parsedTypes);
    if (parsedTags.length) setSelectedTags(parsedTags);
    if (parsedLocs.length) setSelectedLocations(parsedLocs);
    const allowedSort: SortOption[] = [
      'relevance',
      'rating',
      'price-low',
      'price-high',
      'reviews',
      'popularity',
      'event-soonest',
      'event-latest',
    ];
    if (sortRaw && allowedSort.includes(sortRaw)) setSortBy(sortRaw);
    if (pmin !== null || pmax !== null) {
      setPriceRange([
        Number.isFinite(pmin as number) ? (pmin as number) : 0,
        Number.isFinite(pmax as number) ? (pmax as number) : 500,
      ]);
    }
    if (r !== null && Number.isFinite(r)) setMinRating(r);
    if (upcoming) setUpcomingOnlyEvents(true);

    didInitFromUrl.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!didInitFromUrl.current) return;

    const next = new URLSearchParams(urlSearchParams?.toString());

    const writeOrDelete = (key: string, value: string | null) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    };

    writeOrDelete('q', searchQuery.trim() ? searchQuery.trim() : null);
    writeOrDelete('type', selectedTypes.length ? selectedTypes.join(',') : null);
    writeOrDelete('tag', selectedTags.length ? selectedTags.join(',') : null);
    writeOrDelete('loc', selectedLocations.length ? selectedLocations.join(',') : null);
    writeOrDelete('sort', sortBy !== 'relevance' ? sortBy : null);

    const [pmin, pmax] = priceRange;
    writeOrDelete('pmin', pmin !== 0 ? String(pmin) : null);
    writeOrDelete('pmax', pmax !== 500 ? String(pmax) : null);
    writeOrDelete('r', minRating > 0 ? String(minRating) : null);
    writeOrDelete('upcoming', upcomingOnlyEvents ? '1' : null);

    const nextStr = next.toString();
    if (nextStr !== (urlSearchParams?.toString() || '')) {
      navigate.replace(`${pathname}${nextStr ? `?${nextStr}` : ''}`);
    }
  }, [
    didInitFromUrl,
    urlSearchParams,
    navigate,
    pathname,
    searchQuery,
    selectedTypes,
    selectedTags,
    selectedLocations,
    sortBy,
    priceRange,
    minRating,
    upcomingOnlyEvents,
  ]);

  // Parse price from string like "€95 /hr"
  const parsePrice = (priceStr: string): number => {
    const match = priceStr.match(/€(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    const nowTs = Date.now();

    let result = sessions.filter(session => {
      // Search query
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        session.title.toLowerCase().includes(searchLower) ||
        session.facilitatorName.toLowerCase().includes(searchLower) ||
        session.description.toLowerCase().includes(searchLower) ||
        session.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        session.location.toLowerCase().includes(searchLower);

      // Tags filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => session.tags.includes(tag));

      // Location filter
      const sessionCountry = session.location.split(',')[1]?.trim() || session.location;
      const matchesLocation = selectedLocations.length === 0 || 
        selectedLocations.includes(sessionCountry);

      // Price filter
      const price = parsePrice(session.hourlyRate);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      // Rating filter
      const matchesRating = session.rating >= minRating;

      // Type filter
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(session.type);

      // Upcoming-only toggle (events only)
      const matchesUpcomingOnly = !upcomingOnlyEvents
        ? true
        : session.type !== 'event'
          ? true
          : (() => {
              if (!session.startAt) return true;
              const ts = new Date(session.startAt).getTime();
              if (Number.isNaN(ts)) return true;
              return ts >= nowTs;
            })();

      return (
        matchesSearch &&
        matchesTags &&
        matchesLocation &&
        matchesPrice &&
        matchesRating &&
        matchesType &&
        matchesUpcomingOnly
      );
    });

    // Sort
    const originalOrder = new Map(result.map((s, idx) => [s.id, idx] as const));
    const getEventTs = (s: DisplaySession): number | null => {
      if (s.type !== 'event' || !s.startAt) return null;
      const d = new Date(s.startAt);
      const ts = d.getTime();
      return Number.isNaN(ts) ? null : ts;
    };

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        result.sort((a, b) => parsePrice(a.hourlyRate) - parsePrice(b.hourlyRate));
        break;
      case 'price-high':
        result.sort((a, b) => parsePrice(b.hourlyRate) - parsePrice(a.hourlyRate));
        break;
      case 'reviews':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'popularity':
        result.sort((a, b) => b.sales - a.sales);
        break;
      case 'event-soonest': {
        result.sort((a, b) => {
          const aTs = getEventTs(a);
          const bTs = getEventTs(b);

          const aKey = aTs ?? Number.POSITIVE_INFINITY;
          const bKey = bTs ?? Number.POSITIVE_INFINITY;
          if (aKey !== bKey) return aKey - bKey;

          return (originalOrder.get(a.id) ?? 0) - (originalOrder.get(b.id) ?? 0);
        });
        break;
      }
      case 'event-latest': {
        result.sort((a, b) => {
          const aTs = getEventTs(a);
          const bTs = getEventTs(b);

          const aKey = aTs ?? Number.NEGATIVE_INFINITY;
          const bKey = bTs ?? Number.NEGATIVE_INFINITY;
          if (aKey !== bKey) return bKey - aKey;

          return (originalOrder.get(a.id) ?? 0) - (originalOrder.get(b.id) ?? 0);
        });
        break;
      }
      default:
        // relevance - keep original order for matched results
        break;
    }

    return result;
  }, [sessions, searchQuery, sortBy, selectedTags, selectedLocations, selectedTypes, upcomingOnlyEvents, priceRange, minRating]);

  const showEventSortOptions =
    selectedTypes.includes('event') || filteredSessions.some((s) => s.type === 'event');

  // If an event-specific sort is selected but events are not visible, fall back to a general sort.
  useEffect(() => {
    if (!showEventSortOptions && (sortBy === 'event-soonest' || sortBy === 'event-latest')) {
      setSortBy('relevance');
    }
  }, [showEventSortOptions, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedLocations([]);
    setSelectedTypes([]);
    setUpcomingOnlyEvents(false);
    setPriceRange([0, 500]);
    setMinRating(0);
    setSearchQuery("");
    if (onQueryChange) {
      onQueryChange("");
    }
  };

  const activeFiltersCount =
    selectedTags.length +
    selectedLocations.length +
    selectedTypes.length +
    (upcomingOnlyEvents ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  const toggleType = (type: 'individual' | 'group' | 'event') => {
    setSelectedTypes(prev => (prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]));
  };

  const formatEventDateTime = (startAt?: string | null) => {
    if (!startAt) return null;
    const d = new Date(startAt);
    if (Number.isNaN(d.getTime())) return null;
    return format(d, "MMM d • HH:mm");
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Search Header */}
      <div className="space-y-4 mb-8">
        {/* Search Input */}
        <div className="relative flex gap-2">
          <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 dark:text-gray-500" />
          <Input
            type="text"
            placeholder="Search sessions, facilitators, or topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-12 pl-12 pr-4 text-base bg-white dark:bg-[#0f2137] border-gray-100 dark:border-[#1a3a5c] rounded-md focus:border-gray-200 dark:focus:border-[#00CDAC]/30 focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          </div>
          {(searchQuery || activeFiltersCount > 0) && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-12 px-4 border-gray-200 dark:border-[#1a3a5c] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1a3a5c] whitespace-nowrap"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Button */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                className="gap-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 text-xs text-[#00CDAC]">
                    ({activeFiltersCount})
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 sm:w-96 bg-white border-gray-100 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-gray-900 font-medium">Filters</SheetTitle>
                <SheetDescription className="text-gray-400">Narrow down your search</SheetDescription>
              </SheetHeader>

              {/* Clear All Button */}
              {activeFiltersCount > 0 && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Clear all filters ({activeFiltersCount})
                  </Button>
                </div>
              )}
              
              <div className="mt-6 space-y-6">
                {/* Categories/Tags */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer transition-all font-normal ${
                          selectedTags.includes(tag) 
                            ? "bg-gray-900 text-gray-900 dark:text-white border-transparent" 
                            : "border-gray-200 hover:border-gray-300 text-gray-500"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">Type</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedTypes.includes('individual') ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all font-normal ${
                        selectedTypes.includes('individual')
                          ? 'bg-gray-900 text-gray-900 dark:text-white border-transparent'
                          : 'border-gray-200 hover:border-gray-300 text-gray-500'
                      }`}
                      onClick={() => toggleType('individual')}
                    >
                      1:1
                    </Badge>
                    <Badge
                      variant={selectedTypes.includes('group') ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all font-normal ${
                        selectedTypes.includes('group')
                          ? 'bg-gray-900 text-gray-900 dark:text-white border-transparent'
                          : 'border-gray-200 hover:border-gray-300 text-gray-500'
                      }`}
                      onClick={() => toggleType('group')}
                    >
                      Group
                    </Badge>
                    <Badge
                      variant={selectedTypes.includes('event') ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all font-normal ${
                        selectedTypes.includes('event')
                          ? 'bg-gray-900 text-gray-900 dark:text-white border-transparent'
                          : 'border-gray-200 hover:border-gray-300 text-gray-500'
                      }`}
                      onClick={() => toggleType('event')}
                    >
                      Event
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <Label className="text-sm text-gray-500">Upcoming only</Label>
                    <Switch
                      checked={upcomingOnlyEvents}
                      onCheckedChange={(checked) => setUpcomingOnlyEvents(Boolean(checked))}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">Location</Label>
                  <div className="space-y-2">
                    {allLocations.map(location => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={location}
                          checked={selectedLocations.includes(location)}
                          onCheckedChange={() => toggleLocation(location)}
                          className="border-gray-200 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                        />
                        <Label htmlFor={location} className="text-sm text-gray-500 cursor-pointer">
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Price: €{priceRange[0]} - €{priceRange[1]}/hr
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    min={0}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Minimum Rating */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">Minimum Rating</Label>
                  <div className="flex gap-2">
                    {[0, 4, 4.5, 4.8].map(rating => (
                      <Button
                        key={rating}
                        variant={minRating === rating ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setMinRating(rating)}
                        className={`gap-1 ${
                          minRating === rating 
                            ? "bg-gray-900 text-gray-900 dark:text-white" 
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        {rating === 0 ? 'Any' : (
                          <>
                            <Star className="h-3 w-3 fill-current" />
                            {rating}+
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="ghost" 
                    onClick={clearFilters}
                    className="w-full text-gray-400 hover:text-gray-900"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear all
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-40 border-0 bg-transparent text-gray-500 hover:text-gray-900 focus:ring-0">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100">
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              {showEventSortOptions && (
                <>
                  <SelectItem value="event-soonest">Soonest event</SelectItem>
                  <SelectItem value="event-latest">Latest event</SelectItem>
                </>
              )}
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
              <SelectItem value="popularity">Most Popular</SelectItem>
            </SelectContent>
          </Select>

          {/* Active Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <Badge 
                key={tag} 
                className="bg-gray-100 text-gray-600 border-0 gap-1 cursor-pointer hover:bg-gray-200"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            {selectedLocations.map(loc => (
              <Badge 
                key={loc} 
                className="bg-gray-100 text-gray-600 border-0 gap-1 cursor-pointer hover:bg-gray-200"
                onClick={() => toggleLocation(loc)}
              >
                {loc}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            {selectedTypes.map(type => (
              <Badge
                key={type}
                className="bg-gray-100 text-gray-600 border-0 gap-1 cursor-pointer hover:bg-gray-200"
                onClick={() => toggleType(type)}
              >
                {type === 'individual' ? '1:1' : type === 'group' ? 'Group' : 'Event'}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>

          {/* Results Count */}
          <div className="ml-auto text-sm text-gray-400">
            {filteredSessions.length} offers
          </div>
        </div>

        {/* Quick toggle (mobile-first): only when Event type is selected */}
        {selectedTypes.includes('event') && (
          <div className="mt-3 sm:mt-2 flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center justify-between w-full sm:w-auto gap-3 rounded-md bg-white border border-gray-100 px-4 py-3 sm:px-0 sm:py-0 sm:border-0">
              <Label className="text-sm text-gray-600">Upcoming only</Label>
              <Switch checked={upcomingOnlyEvents} onCheckedChange={setUpcomingOnlyEvents} />
            </div>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-white dark:bg-[#0f2137] border-gray-100 dark:border-[#1a3a5c] overflow-hidden rounded-md">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="relative group/card"
              >
                {/* Animated glowing border - always visible in dark mode */}
                <div 
                  className="absolute -inset-[1px] rounded-md opacity-0 dark:opacity-40 group-hover/card:opacity-100 dark:group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #00CDAC, transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'borderGlow 6s ease-in-out infinite',
                  }}
                />
                {/* Secondary glow layer for depth */}
                <div 
                  className="absolute -inset-[2px] rounded-md opacity-0 dark:opacity-20 group-hover/card:opacity-40 dark:group-hover/card:opacity-40 transition-opacity duration-500 pointer-events-none blur-sm"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #00CDAC, transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'borderGlow 6s ease-in-out infinite',
                  }}
                />
                
                <Card 
                  className="relative bg-white dark:bg-[#0f2137] border-gray-100 dark:border-[#1a3a5c] hover:border-gray-200 dark:hover:border-[#00CDAC]/30 hover:shadow-lg hover:shadow-highlight/10 transition-all duration-300 cursor-pointer group overflow-hidden rounded-md"
                  onClick={() => navigate.push(session.type === 'event' ? `/event/${session.id}` : `/session/${session.id}`)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <LQIPImage 
                      src={session.image || '/sessions/breathwork-hero.jpg'} 
                      alt={session.title}
                      aspectRatio="video"
                      className={`group-hover:scale-102 transition-transform duration-500 ${session.isSoldOut ? 'grayscale' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    
                    {/* Sold Out Overlay */}
                    {session.isSoldOut && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                        <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full font-semibold text-sm uppercase tracking-wide shadow-lg transform -rotate-12">
                          Sold Out
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={`text-xs ${
                          session.type === 'event'
                            ? 'bg-gray-900/90'
                            : session.type === 'group'
                              ? 'bg-purple-500/90'
                              : 'bg-[#00CDAC]/90'
                        } text-gray-900 dark:text-white border-0`}
                      >
                        {session.type === 'event' ? 'Event' : session.type === 'group' ? 'Group' : '1:1'}
                      </Badge>
                    </div>
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-900">
                      {session.hourlyRate}
                    </span>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    {/* Title & Facilitator */}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-[#00CDAC] transition-colors line-clamp-1">
                        {session.title}
                      </h3>
                      <p className="text-sm text-gray-400 dark:text-gray-400">{session.facilitatorName}</p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-[#00CDAC] text-[#00CDAC]" />
                        <span className="text-gray-900 dark:text-white">{session.rating.toFixed(1)}</span>
                        <span className="text-gray-300 dark:text-gray-500">({session.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-300 dark:text-gray-500">
                        {session.type === 'event' ? (
                          <>
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span className="line-clamp-1">{formatEventDateTime(session.startAt) || 'Date TBA'}</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="line-clamp-1">{session.location.split(',')[0]}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {session.tags.slice(0, 3).map(tag => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-xs bg-highlight/10 text-highlight border-highlight/20 dark:bg-highlight/15 dark:border-highlight/30"
                          >
                            {tag}
                          </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSessions.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <Search className="h-6 w-6 text-gray-300" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No offers found</h3>
          <p className="text-gray-400 text-sm mb-4">Try adjusting your filters</p>
          <Button variant="ghost" onClick={clearFilters} className="text-gray-500 hover:text-gray-900">
            Clear filters
          </Button>
        </motion.div>
      )}
    </div>
  );
}
