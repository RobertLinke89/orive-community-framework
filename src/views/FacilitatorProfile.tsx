"use client";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Star,
  MessageCircle,
  Heart,
  Share2,
  Clock,
  Languages,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { SessionBookingModal } from "@/components/SessionBookingModal";
import { OfferingCard } from "@/components/OfferingCard";
import { toast } from "sonner";
import { getFacilitatorById } from "@/data/facilitatorsData";
import { ElementAvatar } from "@/components/directory/ElementAvatar";
import { ELEMENT_OF, type ElementKey } from "@/components/directory/elements";
import { allMockOfferings } from "@/data/offeringsData";
import { useLanguage } from "@/hooks/useLanguage";
import type { PublicOffering } from "@/hooks/usePublicOfferings";

interface FacilitatorData {
  id: string;
  full_name: string;
  professional_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  location: string | null;
  expertise: string | null;
  source_platform?: string | null;
  source_url?: string | null;
  isClaimed?: boolean;
  rating?: number | null;
  reviewCount?: number | null;
  hourlyRate?: string | null;
  languages?: string[] | string | null;
  responseTime?: string | null;
}

interface Offering {
  id: string;
  title: string;
  description: string | null;
  type: string;
  price: string | null;
  duration: number | null;
  location: string | null;
  is_online: boolean;
  image_url: string | null;
  capacity: number | null;
  start_at: string | null;
  tags?: string[] | null;
}

function cleanFacilitatorBio(bio: string | null | undefined): string | null {
  if (!bio) return null;
  const cleaned = bio
    .replace(/\s*Dieses Profil und[^.]*\./gi, '')
    .replace(/\s*This profile and[^.]*\./gi, '')
    .replace(/\s*werden automatisch[^.]*\./gi, '')
    .replace(/\b(\w+)\/r\b/g, '$1')
    .replace(/\b(\w+)\/in\b/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || null;
}

function toPublicOffering(offering: Offering, facilitator: FacilitatorData): PublicOffering {
  const type =
    offering.type === 'individual' || offering.type === 'session'
      ? 'individual'
      : offering.type === 'group'
        ? 'group'
        : 'event';
  return {
    id: offering.id,
    title: offering.title,
    description: offering.description,
    type,
    price: offering.price,
    duration: offering.duration,
    location: offering.location,
    is_online: offering.is_online,
    image_url: offering.image_url,
    capacity: offering.capacity,
    start_at: offering.start_at,
    tags: offering.tags || [],
    facilitator_id: facilitator.id,
    facilitator_name: facilitator.full_name,
    facilitator_avatar: facilitator.avatar_url || undefined,
  };
}

export default function FacilitatorProfile() {
  const params = (useParams<{ id: string }>() || {}) as { id?: string };
  const { id } = params;
  const { language, copy } = useLanguage();
  const isDe = language === 'de';
  const [facilitator, setFacilitator] = useState<FacilitatorData | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) fetchFacilitatorData();
  }, [id]);

  const fetchFacilitatorData = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;
      setFacilitator({
        ...profile,
        bio: cleanFacilitatorBio(profile.bio),
      });

      const { data: offeringsData, error: offeringsError } = await supabase
        .from("offerings")
        .select("*")
        .eq("facilitator_id", id)
        .eq("status", "active");

      if (!offeringsError && offeringsData) setOfferings(offeringsData);
    } catch {
      const localFac = getFacilitatorById(id);
      if (localFac) {
        setFacilitator({
          id: localFac.id,
          full_name: localFac.name,
          professional_title: localFac.professionalTitle || localFac.tags?.[0] || "Facilitator",
          bio: cleanFacilitatorBio(localFac.bio || `${localFac.name} arbeitet mit ${localFac.tags.join(', ')}.`),
          avatar_url: localFac.avatar,
          banner_url: null,
          location: localFac.location,
          expertise: localFac.tags.join(', '),
          source_platform: localFac.source_platform || null,
          source_url: localFac.source_url || null,
          isClaimed: localFac.isClaimed ?? false,
          rating: localFac.rating,
          reviewCount: localFac.reviewCount,
          hourlyRate: localFac.hourlyRate,
        });

        setOfferings(
          allMockOfferings
            .filter(o => o.facilitator_id === id)
            .map(o => ({
              id: o.id,
              title: o.title,
              description: o.description,
              type: o.type,
              price: o.price,
              duration: o.duration,
              location: o.location,
              is_online: o.is_online,
              image_url: o.image_url,
              capacity: o.capacity,
              start_at: o.start_at,
              tags: o.tags,
            }))
        );
      } else {
        toast.error(copy("Profil konnte nicht geladen werden", "Failed to load facilitator profile"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: facilitator?.full_name || "Facilitator", url: window.location.href });
      } else {
        throw new Error("Share not supported");
      }
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success(copy("Link kopiert", "Link copied"));
    }
  };

  const expertiseTags = useMemo(
    () =>
      facilitator?.expertise
        ?.split(",")
        .map((t) => t.trim())
        .filter(Boolean) || [],
    [facilitator?.expertise]
  );

  const cardOfferings = useMemo(
    () => (facilitator ? offerings.map((item) => toPublicOffering(item, facilitator)) : []),
    [offerings, facilitator]
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background p-8 mt-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-6">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <Skeleton className="lg:col-span-5 h-[420px] rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!facilitator) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
              {copy("Profil nicht gefunden", "Profile not found")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-white/60 mb-8">
              {copy("Dieses Facilitator-Profil wurde verschoben oder entfernt.", "This facilitator profile may have been moved or removed.")}
            </p>
            <Button asChild className="bg-[#00CDAC] text-white hover:opacity-90 rounded-full px-8">
              <Link href="/marketplace">{copy("Zum Marketplace", "Explore Marketplace")}</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const aboutText = cleanFacilitatorBio(facilitator.bio);
  const firstOffering = offerings[0];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 pt-24 pb-16">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-7 space-y-12">
              <header className="flex items-start gap-5 sm:gap-7">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#01223F] shrink-0 flex items-center justify-center">
                  <ElementAvatar
                    element={
                      (facilitator.expertise || facilitator.professional_title || "")
                        .split(",")
                        .map((t) => t.trim())
                        .map((t) => ELEMENT_OF[t === "Bodywork" ? "BodyWork" : t] as ElementKey | undefined)
                        .find(Boolean) || "aether"
                    }
                    avatar={facilitator.avatar_url}
                    size={112}
                  />
                </div>
                <div className="min-w-0 pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">
                    {facilitator.professional_title || (copy("Facilitator", "Facilitator"))}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight leading-tight">
                    {facilitator.full_name}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500 dark:text-white/65">
                    {typeof facilitator.rating === 'number' && facilitator.rating > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-slate-900 dark:text-white">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {facilitator.rating.toFixed(1)}
                        {typeof facilitator.reviewCount === 'number' && facilitator.reviewCount > 0 && (
                          <span className="text-slate-400 font-normal">({facilitator.reviewCount})</span>
                        )}
                      </span>
                    )}
                    {facilitator.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {facilitator.location}
                      </span>
                    )}
                    {(() => {
                      const raw = facilitator.languages;
                      const langs = (Array.isArray(raw) ? raw : String(raw || "").split(/[,|/]/))
                        .map((s) => s.trim())
                        .filter(Boolean);
                      return langs.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5" />
                      {langs.join(", ")}
                    </span>
                      ) : null;
                    })()}
                  </div>
                </div>
              </header>

              {aboutText && (
                <section>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {copy("Über", "About")}
                  </h2>
                  <p className="text-base leading-relaxed text-slate-600 dark:text-white/75 max-w-2xl">
                    {aboutText}
                  </p>
                </section>
              )}

              {expertiseTags.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {copy("Schwerpunkte", "Focus")}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {expertiseTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-white/80 bg-slate-100 dark:bg-white/5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">
                  {copy("Angebote", "Offerings")}
                </h2>
                {cardOfferings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {cardOfferings.map((offering) => (
                      <OfferingCard key={offering.id} offering={offering} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-white/40 py-8">
                    {copy("Aktuell keine öffentlichen Angebote.", "No public offerings right now.")}
                  </p>
                )}
              </section>
            </div>

            <aside className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 sm:p-7">
                {facilitator.hourlyRate && (
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                    {facilitator.hourlyRate.replace('/hr', '').trim()}
                    <span className="ml-1.5 text-sm font-normal text-slate-400">
                      {copy("pro Stunde", "per hour")}
                    </span>
                  </p>
                )}

                <dl className="mt-5 space-y-3 text-sm">
                  {facilitator.location && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-slate-400 inline-flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {copy("Ort", "Location")}
                      </dt>
                      <dd className="text-slate-900 dark:text-white font-medium text-right">{facilitator.location}</dd>
                    </div>
                  )}
                  {facilitator.responseTime ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-400 inline-flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      {copy("Antwort", "Replies")}
                    </dt>
                    <dd className="text-slate-900 dark:text-white font-medium">{facilitator.responseTime}</dd>
                  </div>
                  ) : null}
                </dl>

                <button
                  type="button"
                  onClick={() => {
                    if (firstOffering) {
                      setSelectedOffering(firstOffering);
                      setBookingModalOpen(true);
                    } else {
                      toast.info(copy("Anfrage folgt in Kürze.", "Inquiries open shortly."));
                    }
                  }}
                  className="mt-6 w-full h-12 rounded-full bg-[#00CDAC] hover:brightness-105 text-white text-sm font-semibold"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    {copy("Anfrage senden", "Send inquiry")}
                  </span>
                </button>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="flex-1 h-10 rounded-full border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Heart className={cn("w-3.5 h-3.5", isFavorite && "fill-[#FF385C] text-[#FF385C]")} />
                      {copy("Merken", "Save")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex-1 h-10 rounded-full border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Share2 className="w-3.5 h-3.5" />
                      {copy("Teilen", "Share")}
                    </span>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {selectedOffering && (
          <SessionBookingModal
            open={bookingModalOpen}
            onOpenChange={setBookingModalOpen}
            sessionTitle={selectedOffering.title}
            sessionPrice={selectedOffering.price || "Free"}
            sessionDuration={selectedOffering.duration || undefined}
            facilitatorId={facilitator.id}
            facilitatorName={facilitator.full_name}
            isClaimed={facilitator.isClaimed}
            offeringId={selectedOffering.id}
          />
        )}
      </div>
    </Layout>
  );
}
