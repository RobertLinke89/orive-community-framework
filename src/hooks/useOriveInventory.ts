"use client";

import { useCallback, useEffect, useState } from 'react';
import type { PublicOffering } from '@/hooks/usePublicOfferings';
import type { OriveSlot } from '@/lib/orivePublic';

export type OrivePublicOffering = PublicOffering & { slots?: OriveSlot[] };

export function useOriveInventory() {
  const [offerings, setOfferings] = useState<OrivePublicOffering[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/orive/inventory');
      const data = await res.json();
      setOfferings(Array.isArray(data.offerings) ? data.offerings : []);
    } catch {
      setOfferings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { offerings, loading, refresh };
}
