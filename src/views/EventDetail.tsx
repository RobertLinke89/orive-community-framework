"use client";
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
// Event detail page for public viewing
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  Calendar, 
  Clock,
  Users,
  ArrowLeft,
  Share2,
  Heart
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { SessionBookingModal } from "@/components/SessionBookingModal";
import { DetailBreadcrumb } from "@/components/DetailBreadcrumb";
import { toast } from "sonner";
import { getAvatarUrl } from "@/lib/imageUrl";
import { format } from "date-fns";
import { ensureOfferingDescription } from "@/lib/offeringDescription";
import { useLanguage } from "@/hooks/useLanguage";
import { OfferingHeroHeading } from "@/components/OfferingHeroHeading";
import { partnerLabel, resolveFulfillment } from "@/lib/fulfillment";

interface EventData {
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
  facilitator_id: string;
}

interface FacilitatorData {
  id: string;
  full_name: string;
  professional_title: string | null;
  avatar_url: string | null;
  location: string | null;
}

export default function EventDetail() {
  const params = (useParams<{ eventId: string }>() || {}) as any; const { eventId } = params;
  const navigate = useRouter();
  const { language, copy } = useLanguage();
  const isDe = language === 'de';
  const [event, setEvent] = useState<EventData | null>(null);
  const [facilitator, setFacilitator] = useState<FacilitatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from("offerings")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch facilitator
      const { data: facilitatorData, error: facilitatorError } = await supabase
        .from("public_profiles")
        .select("id, full_name, professional_title, avatar_url, location")
        .eq("id", eventData.facilitator_id)
        .single();

      if (!facilitatorError && facilitatorData) {
        setFacilitator(facilitatorData);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event?.title || "Event",
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background p-4 space-y-6">
          <Skeleton className="w-full h-64 rounded-lg" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Event not found</h1>
            <p className="text-muted-foreground">This event may have been removed or doesn't exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-24">
        {/* Header Image */}
        <div className="relative h-64 bg-gradient-to-br from-highlight/20 to-highlight/5">
          {event.image_url && (
            <img 
              src={event.image_url} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-16 left-4 z-10 max-w-[min(100%,34rem)] pr-20">
            <DetailBreadcrumb
              overlay
              items={[
                { label: copy("Marktplatz", "Marketplace"), href: "/" },
                { label: copy("Events", "Events"), href: "/" },
                { label: event.title }
              ]}
            />
          </div>
          <button 
            onClick={() => navigate.back()}
            className="absolute top-4 right-16 p-2 bg-background/80 backdrop-blur-sm rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-full backdrop-blur-sm ${isFavorite ? 'bg-red-500 text-gray-900 dark:text-white' : 'bg-background/80'}`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 bg-background/80 backdrop-blur-sm rounded-full"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 bg-gradient-to-t from-black/70 to-transparent pt-16">
            <OfferingHeroHeading
              title={event.title}
              category={event.type || (copy('Event', 'Event'))}
              location={event.is_online ? (copy('Online', 'Online')) : event.location}
              facilitatorName={facilitator?.full_name}
              listingLabel={
                resolveFulfillment({ id: event.id, source_url: (event as any).source_url }) === 'external'
                  ? (copy(`Gelistet auf ${partnerLabel((event as any).source_platform)}`, `Listed on ${partnerLabel((event as any).source_platform)}`))
                  : null
              }
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-6 space-y-6">
          {/* Event Date */}
          {event.start_at && (
            <div className="flex items-center gap-3 p-4 bg-highlight/10 rounded-md">
              <Calendar className="w-6 h-6 text-highlight" />
              <div>
                <p className="font-semibold text-foreground">
                  {format(new Date(event.start_at), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.start_at), "h:mm a")}
                </p>
              </div>
            </div>
          )}

          {/* Event Info */}
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            {event.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{event.duration} minutes</span>
              </div>
            )}
            {event.capacity && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{event.capacity} spots</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-highlight">
            {event.price || "Free"}
          </div>

          {/* Description */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <h2 className="font-semibold text-foreground mb-2">
                {copy('Über dieses Event', 'About this event')}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
                {ensureOfferingDescription({
                  title: event.title,
                  description: event.description,
                  location: event.location,
                  facilitatorName: facilitator?.full_name,
                  type: event.type,
                  lang: language === "de" ? "de" : "en",
                })}
              </p>
            </CardContent>
          </Card>

          {/* Facilitator */}
          {facilitator && (
            <Card 
              className="border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate.push(`/facilitator/${facilitator.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={getAvatarUrl(facilitator.avatar_url)} />
                    <AvatarFallback>{facilitator.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{facilitator.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{facilitator.professional_title || "Facilitator"}</p>
                    {facilitator.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{facilitator.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Book Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
          <Button 
            className="w-full bg-highlight hover:bg-highlight/90 text-white font-bold h-12"
            onClick={() => setBookingModalOpen(true)}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Register Now · {event.price || "Free"}
          </Button>
        </div>

        {/* Booking Modal */}
        {facilitator && event && (
          <SessionBookingModal
            open={bookingModalOpen}
            onOpenChange={setBookingModalOpen}
            sessionTitle={event.title}
            sessionPrice={event.price || "Free"}
            sessionDuration={event.duration || undefined}
            facilitatorId={facilitator.id}
            facilitatorName={facilitator.full_name}
            eventStartAt={event.start_at}
            eventCapacity={event.capacity}
            offeringId={event.id}
          />
        )}
      </div>
    </Layout>
  );
}
