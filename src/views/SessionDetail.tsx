"use client";
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { isSafeAvatarUrl } from "@/lib/safeImage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowRight, MapPin, Clock, Users,
  Heart, Share2, CheckCircle2, Copy, Check, Globe, ExternalLink
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { SimilarOfferings } from "@/components/SimilarOfferings";
import { SessionBookingModal } from "@/components/SessionBookingModal";
import { DetailBreadcrumb } from "@/components/DetailBreadcrumb";
import { OfferingLocationMap } from "@/components/OfferingLocationMap";
import { OfferingStickyCta } from "@/components/OfferingStickyCta";
import { OfferingFactPills } from "@/components/OfferingFactPills";
import { OfferingThingsToKnow, bookingPriceNote } from "@/components/OfferingThingsToKnow";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { offeringGalleryOf } from "@/lib/imageUrl";
import { OfferingImageStage } from "@/components/OfferingImageStage";
import { OfferingHeroHeading } from "@/components/OfferingHeroHeading";
import { getSessionById } from "@/data/sessionsData";
import { getFacilitatorById } from "@/data/facilitatorsData";
import { isOriveBookable, partnerLabel, resolveFulfillment } from "@/lib/fulfillment";
import { ensureOfferingDescription } from "@/lib/offeringDescription";

interface SessionData {
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
  facilitator_id: string;
  cancellation_policy: string | null;
  source_url?: string | null;
  source_platform?: string | null;
}

interface FacilitatorData {
  id: string;
  full_name: string;
  professional_title: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  tags?: string[];
  isClaimed?: boolean;
}

export default function SessionDetail() {
  const params = (useParams<{ sessionId: string }>() || {}) as any; const { sessionId } = params;
  const navigate = useRouter();
  const { language, copy } = useLanguage();
  const isDe = language === 'de';
  const [session, setSession] = useState<SessionData | null>(null);
  const [facilitator, setFacilitator] = useState<FacilitatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      // Only real UUIDs exist in the DB; anything else would just produce a 400 + console error.
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(sessionId))) throw new Error("not-a-uuid");
      const { data: sessionData, error: sessionError } = await supabase
        .from("offerings")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      // Fetch facilitator
      const { data: facilitatorData, error: facilitatorError } = await supabase
        .from("public_profiles")
        .select("id, full_name, professional_title, avatar_url, location, bio")
        .eq("id", sessionData.facilitator_id)
        .maybeSingle();

      if (facilitatorData) {
        setFacilitator(facilitatorData);
      }
    } catch (error) {
      // Fallback to local session data if not found in database
      const mockSession = getSessionById(sessionId);
      if (mockSession) {
        setSession({
          id: mockSession.id,
          title: mockSession.title,
          description: mockSession.description,
          type: "individual",
          price: mockSession.hourlyRate,
          duration: 60,
          location: mockSession.location,
          is_online: false,
          image_url: mockSession.image,
          capacity: 1,
          start_at: null,
          tags: mockSession.tags,
          facilitator_id: mockSession.facilitatorId,
          cancellation_policy: null,
          source_url: mockSession.source_url || null,
          source_platform: mockSession.source_platform || null,
        });

        const fac = getFacilitatorById(mockSession.facilitatorId);
        if (fac) {
          setFacilitator({
            id: fac.id,
            full_name: fac.name,
            professional_title: fac.tags?.[0] || "Facilitator",
            avatar_url: fac.avatar,
            location: fac.location,
            bio: fac.bio,
            tags: fac.tags,
            isClaimed: fac.isClaimed ?? false,
          });
        }
      } else {
        // not found: the page shows the "Angebot nicht gefunden" state below (server already answers 404 for invalid ids)
      }
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleNativeShare = async () => {
    if (!("share" in navigator)) return false;
    try {
      await navigator.share({
        title: session?.title || "Session",
        text: `Check out this session: ${session?.title}`,
        url: shareUrl,
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (platform: "twitter" | "facebook" | "linkedin" | "whatsapp") => {
    const text = session ? `Check out this session: ${session.title}` : "Check out this session";
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer");
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from saved" : "Added to saved");
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background">
           <div className="container mx-auto px-4 py-8 space-y-8">
             <Skeleton className="w-full h-[400px] rounded-lg" />
             <div className="grid lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                 <Skeleton className="h-12 w-3/4" />
                 <Skeleton className="h-6 w-1/2" />
                 <Skeleton className="h-32 w-full" />
               </div>
               <div className="lg:col-span-1">
                 <Skeleton className="h-64 w-full" />
               </div>
             </div>
           </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold text-foreground mb-4">Angebot nicht gefunden</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">Dieses Angebot wurde entfernt oder existiert nicht.</p>
          <Button onClick={() => navigate.push("/marketplace")} size="lg">
            Zum Marktplatz
          </Button>
        </div>
      </Layout>
    );
  }

  const gallery = offeringGalleryOf({
    id: session.id,
    image_url: session.image_url,
    tags: session.tags,
    title: session.title,
    type: session.type,
  });
  const initials = (facilitator?.full_name || "F").split(" ").map(n => n[0]).join("").toUpperCase();
  const fulfillment = resolveFulfillment({ id: session.id, source_url: session.source_url });
  const priceNote = bookingPriceNote(fulfillment, isDe, session.source_platform);
  const hasPrice = Boolean(session.price && session.price !== "0" && session.price !== "Free");
  const priceLabel = hasPrice ? String(session.price) : (copy('Preis auf Anfrage', 'Price on request'));
  const oriveBookable = isOriveBookable({ id: session.id, source_url: session.source_url }) && Boolean(facilitator?.isClaimed);
  const ctaLabel = oriveBookable
    ? (copy('Platz reservieren', 'Reserve your spot'))
    : session.source_url
      ? (copy(`Bei ${partnerLabel(session.source_platform)} öffnen`, `Open on ${partnerLabel(session.source_platform)}`))
      : '';

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-24 lg:pb-12">
        {/* Hero Image */}
        <div className="relative w-full">
          <OfferingImageStage images={gallery} title={session.title} />

          <div className="absolute top-20 left-4 z-10 max-w-[min(100%,36rem)] pr-24">
            <DetailBreadcrumb
              overlay
              items={[
                { label: copy("Marktplatz", "Marketplace"), href: "/" },
                { label: session.type === "individual" ? (copy("Sessions", "Sessions")) : (copy("Events", "Events")), href: "/" },
                { label: session.title }
              ]}
            />
          </div>
          
          {/* Floating Action Buttons */}
          <div className="absolute top-20 right-4 flex items-center gap-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className={`bg-white/90 backdrop-blur-sm hover:bg-white w-10 h-10 rounded-full ${
                isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async (e) => {
                    const didShare = await handleNativeShare();
                    if (didShare) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-600 hover:text-gray-900 w-10 h-10 rounded-full"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50">
                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                  {copied ? <Check className="w-4 h-4 mr-2 text-highlight" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied!" : "Copy link"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("twitter")} className="cursor-pointer">
                  Share on X
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer">
                  Share on Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("whatsapp")} className="cursor-pointer">
                  Share on WhatsApp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 sm:pb-10 z-10">
            <div className="max-w-6xl mx-auto">
              <OfferingHeroHeading
                title={session.title}
                category={Array.isArray(session.tags) && session.tags[0] ? session.tags[0] : session.type}
                location={session.is_online ? (copy('Online', 'Online')) : session.location}
                facilitatorName={facilitator?.full_name}
                listingLabel={
                  fulfillment === 'external'
                    ? (copy(`Gelistet auf ${partnerLabel(session.source_platform)}`, `Listed on ${partnerLabel(session.source_platform)}`))
                    : null
                }
              />
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-4 -mt-8 relative z-20">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Meta Card */}
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <OfferingFactPills
                    isDe={isDe}
                    title={session.title}
                    type={session.type}
                    location={session.location}
                    isOnline={session.is_online}
                    duration={session.duration ? (copy(`${session.duration} Min.`, `${session.duration} min`)) : ''}
                    capacity={session.capacity}
                    tags={session.tags}
                    fulfillment={fulfillment}
                    partner={session.source_platform}
                  />
                </CardContent>
              </Card>

              {/* Description Section */}
              <Card className="border-border/50 shadow-sm">
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">
                      {copy('Über diese Session', 'About This Session')}
                    </h2>
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                      <p className="leading-relaxed whitespace-pre-wrap text-muted-foreground text-justify">
                        {ensureOfferingDescription({
                          title: session.title,
                          description: session.description,
                          tags: session.tags,
                          location: session.location,
                          facilitatorName: facilitator?.full_name,
                          type: session.type,
                          lang: language === "de" ? "de" : "en",
                        })}
                      </p>
                    </div>
                    {Array.isArray(session.tags) && session.tags.length > 0 && (
                      <div className="pt-4 flex flex-wrap gap-2">
                        {session.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-secondary/50">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

              {(session.is_online || session.location) ? (
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6 md:p-8">
                  <OfferingLocationMap
                    location={session.location}
                    isOnline={session.is_online}
                    isDe={isDe}
                  />
                </CardContent>
              </Card>
              ) : null}

              {/* Meet the Facilitator */}
              {facilitator && (
                <Card className="border-border/50 shadow-sm overflow-hidden">
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Meet Your Facilitator</h2>
                    
                    <div 
                      onClick={() => navigate.push(`/facilitator/${facilitator.id}`)}
                      className="flex items-start gap-4 md:gap-6 p-4 md:p-6 rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 hover:from-muted hover:to-muted/40 transition-all cursor-pointer group border border-border/50"
                    >
                      <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-highlight/20 shadow-sm">
                        {isSafeAvatarUrl(facilitator.avatar_url) ? (
                          <AvatarImage src={facilitator.avatar_url || undefined} alt={facilitator.full_name} />
                        ) : null}
                        <AvatarFallback className="text-xl bg-highlight/10 text-highlight font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                          <h3 className="font-bold text-foreground text-lg md:text-xl group-hover:text-highlight transition-colors">
                            {facilitator.full_name}
                          </h3>
                          {facilitator.isClaimed ? (
                            <CheckCircle2 className="w-5 h-5 text-highlight hidden md:block" />
                          ) : null}
                        </div>
                        {facilitator.professional_title ? (
                        <p className="text-sm md:text-base text-highlight font-medium mb-2">
                          {facilitator.professional_title}
                        </p>
                        ) : null}
                        {facilitator.location && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{facilitator.location}</span>
                          </div>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-highlight transition-colors flex-shrink-0 mt-2 hidden md:block" />
                    </div>

                    {facilitator.bio && (
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm md:text-base">
                        {facilitator.bio}
                      </p>
                    )}

                    <Button
                      variant="outline"
                      className="w-full border-highlight/30 text-highlight hover:bg-highlight/10 hover:border-highlight"
                      onClick={() => navigate.push(`/facilitator/${facilitator.id}`)}
                    >
                      View Full Profile
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border/50 shadow-sm bg-muted/20">
                <CardContent className="p-6 md:p-8">
                  <OfferingThingsToKnow
                    fulfillment={fulfillment}
                    partner={session.source_platform}
                    cancellation={session.cancellation_policy}
                    isDe={isDe}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-border/50 shadow-lg shadow-highlight/5">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-4xl font-bold text-foreground tracking-tight">
                        {session.price && session.price !== "0" && session.price !== "Free" ? session.price : "Free"}
                      </span>
                      {session.price && session.price !== "0" && session.price !== "Free" && (
                        <span className="text-muted-foreground mb-1 font-medium">per session</span>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-border/60" />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground text-lg">Quick Summary</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-highlight/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-highlight" />
                        </div>
                        <span className="font-medium text-muted-foreground">{session.duration || "N/A"} minutes length</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-highlight/10 flex items-center justify-center flex-shrink-0">
                          <Globe className="w-4 h-4 text-highlight" />
                        </div>
                        <span className="font-medium text-muted-foreground">{session.is_online ? "Online via Video Call" : "In-Person Session"}</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-highlight/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-highlight" />
                        </div>
                        <span className="font-medium text-muted-foreground">
                          {session.capacity ? `Max ${session.capacity} spots` : "Private 1:1 Session"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {oriveBookable ? (
                    <Button 
                      className="w-full h-12 rounded-full text-sm font-semibold bg-[#00CDAC] hover:bg-[#02AAB0] text-white"
                      onClick={() => setBookingModalOpen(true)}
                    >
                      {copy('Platz reservieren', 'Reserve your spot')}
                    </Button>
                  ) : session.source_url ? (
                    <a
                      href={session.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-12 rounded-full text-sm font-semibold bg-[#00CDAC] hover:bg-[#02AAB0] text-white inline-flex items-center justify-center gap-2"
                    >
                      {copy(`Bei ${partnerLabel(session.source_platform)} öffnen`, `Open on ${partnerLabel(session.source_platform)}`)}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                      {copy('Dieses Listing ist nicht über ORIVE buchbar.', 'Not available to book on ORIVE.')}
                    </p>
                  )}

                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground font-medium mt-2">{priceNote}</p>

                    {facilitator && !facilitator.isClaimed && (
                      <div className="pt-2 text-center">
                        <Link
                          href={`/auth?claim=${encodeURIComponent(facilitator.id)}&name=${encodeURIComponent(facilitator.full_name)}&session=${encodeURIComponent(session.title)}`}
                          className="text-[11px] text-slate-400 hover:text-[#00CDAC] transition-colors"
                        >
                          Sind Sie {facilitator.full_name}? <span className="underline font-medium">Kalender freischalten →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <SimilarOfferings
          excludeId={session.id}
          title={session.title}
          type={session.type}
          location={session.location}
          tags={session.tags}
        />

        <OfferingStickyCta
          price={priceLabel}
          note={priceNote}
          actionLabel={ctaLabel}
          href={oriveBookable ? undefined : session.source_url}
          onClick={oriveBookable ? () => setBookingModalOpen(true) : undefined}
          external={!oriveBookable}
        />

        {/* Booking Modal */}
        {facilitator && session && (
          <SessionBookingModal
            open={bookingModalOpen}
            onOpenChange={setBookingModalOpen}
            sessionTitle={session.title}
            sessionPrice={session.price || "Free"}
            sessionDuration={session.duration || undefined}
            facilitatorId={facilitator.id}
            facilitatorName={facilitator.full_name}
            isClaimed={facilitator.isClaimed}
            eventStartAt={session.start_at}
            eventCapacity={session.capacity}
            offeringId={session.id}
          />
        )}
      </div>
    </Layout>
  );
}
