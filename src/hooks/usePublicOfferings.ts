"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import { mockOfferingsSessions, mockOfferingsEvents } from "@/data/offeringsData";
import { isListableOfferingImage } from "@/lib/imageUrl";
import type { FulfillmentMode } from "@/lib/fulfillment";

export type PublicOffering = {
  id: string;
  title: string;
  description: string | null;
  type: "individual" | "group" | "event";
  price: string | null;
  duration: number | null;
  location: string | null;
  is_online: boolean;
  image_url: string | null;
  capacity: number | null;
  start_at: string | null;
  end_at?: string | null;
  tags: string[] | null;
  facilitator_id: string;
  facilitator_name?: string;
  facilitator_avatar?: string;
  rating?: number;
  reviewCount?: number;
  sales?: number;
  views?: number;
  source_platform?: string;
  source_url?: string;
  crawled_at?: string;
  fulfillment?: FulfillmentMode;
};

const getFallbackOfferings = (type?: "individual" | "group" | "event", limit: number = 12): PublicOffering[] => {
  let list: PublicOffering[];
  if (type === "individual") {
    list = mockOfferingsSessions;
  } else if (type === "event" || type === "group") {
    list = mockOfferingsEvents;
  } else {
    list = [...mockOfferingsSessions, ...mockOfferingsEvents];
  }
  return list.slice(0, limit);
};

export function usePublicOfferings(params?: {
  type?: "individual" | "group" | "event";
  limit?: number;
  facilitatorId?: string;
}) {
  const { type, limit = 12, facilitatorId } = params || {};
  const [offerings, setOfferings] = useState<PublicOffering[]>(() => getFallbackOfferings(type, limit));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOfferings = useCallback(async () => {
    try {
      let query = supabase
        .from("offerings")
        .select(`
          id,
          title,
          description,
          type,
          price,
          duration,
          location,
          is_online,
          image_url,
          capacity,
          start_at,
          end_at,
          tags,
          facilitator_id,
          profiles:facilitator_id (
            full_name,
            avatar_url
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq("type", type);
      }

      if (facilitatorId) {
        query = query.eq("facilitator_id", facilitatorId);
      }

      // For events, only show future events
      if (type === "event") {
        query = query.gte("start_at", new Date().toISOString());
        query = query.order("start_at", { ascending: true });
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      if (!data || data.length === 0) {
        setOfferings(getFallbackOfferings(type, limit));
        return;
      }

      const mapped: PublicOffering[] = data.map((item: any) => ({
        id: String(item.id),
        title: item.title || 'Untitled offering',
        description: item.description,
        type: item.type,
        price: item.price == null ? null : String(item.price),
        duration: item.duration,
        location: item.location,
        is_online: item.is_online,
        image_url: item.image_url,
        capacity: item.capacity,
        start_at: item.start_at,
        end_at: item.end_at || null,
        tags: Array.isArray(item.tags)
          ? item.tags
          : typeof item.tags === 'string'
            ? item.tags.split(/[,|/]/).map((tag: string) => tag.trim()).filter(Boolean)
            : [],
        facilitator_id: item.facilitator_id,
        facilitator_name: item.profiles?.full_name || "Unknown",
        facilitator_avatar: item.profiles?.avatar_url || null,
        fulfillment: "orive" as const,
      })).filter((item) => isListableOfferingImage(item.image_url));

      setOfferings(mapped.length > 0 ? mapped : getFallbackOfferings(type, limit));
    } catch (e: any) {
      console.warn("Falling back to mock offerings:", e?.message || e);
      setOfferings(getFallbackOfferings(type, limit));
      setError(e?.message || "Failed to load offerings");
    } finally {
      setLoading(false);
    }
  }, [type, limit, facilitatorId]);

  useEffect(() => {
    fetchOfferings();
  }, [fetchOfferings]);

  return useMemo(
    () => ({ offerings, loading, error, refresh: fetchOfferings }),
    [offerings, loading, error, fetchOfferings]
  );
}
