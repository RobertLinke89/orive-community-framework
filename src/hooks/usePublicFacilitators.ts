"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAnonClientHeaders } from "@/lib/anonClientToken";
import { getOpsTelemetryFromInvoke } from "@/lib/opsTelemetry";

export type PublicFacilitator = {
  id: string;
  username?: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  views: number;
  tags: string[];
  hourlyRate?: string;
  location?: string;
};

type BackendProfile = {
  id: string;
  username?: string | null;
  full_name: string | null;
  professional_title: string | null;
  expertise: string | null;
  location: string | null;
  avatar_url: string | null;
  banner_url: string | null;
};

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function parseExpertiseTags(expertise?: string | null): string[] {
  if (!expertise) return [];
  return expertise
    .split(/[,/|•·\n]/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function usePublicFacilitators(params: {
  pageSize?: number;
  fallbackByName: Map<string, PublicFacilitator>;
}) {
  const pageSize = params.pageSize ?? 12;
  const fallbackByName = params.fallbackByName;

  const [items, setItems] = useState<PublicFacilitator[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);
  const loadingRef = useRef(false);

  const mapProfileToFacilitator = useCallback(
    (p: BackendProfile): PublicFacilitator => {
      const name = (p.full_name || "Unnamed").trim();
      const fallback = fallbackByName.get(normalizeName(name));

      const tags =
        fallback?.tags?.length
          ? fallback.tags
          : parseExpertiseTags(p.expertise ?? undefined);

      return {
        id: p.id,
        username: (p.username ?? undefined) || undefined,
        name,
        avatar: p.avatar_url || fallback?.avatar || "/default-avatar.png",
        // Public directory only returns onboarding_completed=true; treat as verified.
        isVerified: true,
        rating: fallback?.rating ?? 0,
        reviewCount: fallback?.reviewCount ?? 0,
        views: fallback?.views ?? 0,
        tags,
        hourlyRate: fallback?.hourlyRate,
        location: p.location || fallback?.location,
      };
    },
    [fallbackByName]
  );

  const fetchPage = useCallback(
    async (targetPage: number) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const resp: any = await supabase.functions.invoke(
          "get-public-profiles",
          { body: { page: targetPage, pageSize }, headers: getAnonClientHeaders() }
        );

        const data = resp?.data;
        const error = resp?.error;
        setRateLimitRemaining(getOpsTelemetryFromInvoke(resp).remaining);

        if (error) throw error;

        const profiles: BackendProfile[] = (data?.profiles ?? []) as BackendProfile[];
        const mapped = profiles.map(mapProfileToFacilitator);
        const serverHasMore = Boolean(data?.hasMore);

        setHasMore(serverHasMore);
        setPage(targetPage);
        setItems((prev) => {
          const base = prev ?? [];
          const seen = new Set(base.map((x) => x.id));
          const merged = [...base];
          for (const m of mapped) {
            if (!seen.has(m.id)) {
              merged.push(m);
              seen.add(m.id);
            }
          }
          return merged;
        });
      } catch (e: any) {
        console.error("Failed to fetch public facilitators:", e);
        setError(e?.message || "Failed to load profiles");
        // leave items as-is; the caller can choose to fall back to mock data.
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [mapProfileToFacilitator, pageSize]
  );

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    if (!hasMore) return;
    await fetchPage(page + 1);
  }, [fetchPage, hasMore, page]);

  const refresh = useCallback(async () => {
    setItems(null);
    setPage(1);
    setHasMore(false);
    await fetchPage(1);
  }, [fetchPage]);

  useEffect(() => {
    // initial load
    fetchPage(1);
  }, [fetchPage]);

  return useMemo(
    () => ({ items, loading, error, hasMore, loadMore, refresh, rateLimitRemaining }),
    [items, loading, error, hasMore, loadMore, refresh, rateLimitRemaining]
  );
}
