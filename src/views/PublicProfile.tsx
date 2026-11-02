"use client";
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from "react";

import { getAvatarUrl, getBannerUrl } from "@/lib/imageUrl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Star,
  Calendar,
  MessageCircle,
  Heart,
  Share2,
  CheckCircle,
  ArrowLeft,
  Clock,
  Users,
  Globe,
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  Briefcase,
  Languages,
  BookOpen,
  Home,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAnonClientHeaders } from "@/lib/anonClientToken";
import { getOpsTelemetryFromInvoke } from "@/lib/opsTelemetry";
import { setMetaDescription, setPageTitle } from "@/lib/branding";
import { useConnectivityBannerStore } from "@/stores/connectivityBannerStore";
import { facilitators as mockFacilitators } from "@/data/facilitatorsData";
import { toast } from "sonner";
// ── Components ──
import { SessionBookingModal } from "@/components/SessionBookingModal";
import { Layout } from "@/components/Layout";

type Profile = {
  id: string;
  username?: string | null;
  full_name: string;
  professional_title: string | null;
  expertise: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  languages?: string[];
  rating?: number;
  reviewCount?: number;
  views?: number;
};

type Offering = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  price: string | null;
  duration: number | null;
  location: string | null;
  image_url: string | null;
  capacity?: number | null;
  start_at?: string | null;
};

type AvailabilitySlot = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PublicProfile() {
  const params = (useParams<{ id?: string; username?: string }>() || {}) as any; const { id, username } = params;
  const navigate = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileNotPublic, setProfileNotPublic] = useState(false);
  const [opsRemaining, setOpsRemaining] = useState<number | null>(null);
  const [opsRetryAfterSeconds, setOpsRetryAfterSeconds] = useState<number | null>(null);
  const [opsPolicy, setOpsPolicy] = useState<string | null>(null);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const sessionsScrollRef = useRef<HTMLDivElement>(null);

  const expertiseTags = useMemo(() => {
    const expertise = profile?.expertise as unknown;
    if (Array.isArray(expertise)) return expertise.map(String).filter(Boolean);
    if (typeof expertise === 'string') {
      return expertise.split(",").map((t) => t.trim()).filter(Boolean);
    }
    return [];
  }, [profile?.expertise]);

  const skillCategories = ["Emotional", "Environmental", "Spiritual", "Physical", "Mental", "Social"];
  
  const activeBadges = useMemo(() => 
    skillCategories.filter((s) =>
      expertiseTags.some((t) => t.toLowerCase().includes(s.toLowerCase()))
    ),
    [expertiseTags]
  );
  
  const particles = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 3,
    })), []
  );

  useEffect(() => {
    if (username === 'profiles' || id === 'profiles') {
      navigate.replace('/marketplace');
      return;
    }
    if (id || username) {
      loadProfile();
    }
  }, [id, username]);

  const loadProfile = async () => {
    try {
      setProfileNotPublic(false);
      const resp: any = await supabase.functions.invoke("get-public-profile", {
        body: id ? { profileId: id } : { username },
        headers: getAnonClientHeaders(),
      });

      const data = resp?.data;
      const error = resp?.error;
      const status = resp?.response?.status ?? error?.status;
      const profileTelemetry = getOpsTelemetryFromInvoke(resp);
      setOpsRemaining(profileTelemetry.remaining);
      setOpsRetryAfterSeconds(profileTelemetry.retryAfterSeconds);
      setOpsPolicy(profileTelemetry.policy);

      if (error) {
        // Fallback to local mock data if username matches
        if (username) {
          const mock = mockFacilitators.find(f => f.username === username || f.name.toLowerCase().replace(/\s+/g, '-') === username);
          if (mock) {
            const mappedProfile: Profile = {
              id: mock.id,
              username: mock.username || username,
              full_name: mock.name,
              professional_title: mock.professionalTitle || "Wellness Facilitator",
              expertise: mock.tags.join(', '),
              bio: mock.bio || `Expert in ${mock.tags.join(' and ')}. Helping you achieve holistic wellbeing through professional guidance and personalized support.`,
              location: mock.location,
              avatar_url: mock.avatar,
              banner_url: null
            };
            setProfile(mappedProfile);
            setOfferings([{
              id: `mock-offering-${mock.id}`,
              type: 'session',
              title: `${mock.tags[0]} with ${mock.name}`,
              description: `A personalized ${mock.tags[0].toLowerCase()} session designed to help you reach your wellness goals.`,
              price: mock.hourlyRate,
              duration: 60,
              location: mock.location,
              image_url: null
            }]);
            setPageTitle(mock.name);
            setLoading(false);
            return;
          }
        }

        if (status === 404 || data?.error === "Profile not public") {
          setProfile(null);
          setProfileNotPublic(true);
          setPageTitle("Profile not public");
          return;
        }
        throw error;
      }

      const profileData = (data?.profile ?? null) as Profile | null;
      if (!profileData) {
        setProfile(null);
        setProfileNotPublic(true);
        setPageTitle("Profile not public");
        return;
      }

      if (id) {
        const u = (profileData.username ?? "").toString().trim();
        if (u) {
          navigate.replace(`/${encodeURIComponent(u)}`);
          return;
        }
      }

      setProfile(profileData);
      setPageTitle(profileData.full_name);

      const expertise = (profileData.expertise || "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(", ");

      setMetaDescription(
        expertise
          ? `Book a session with ${profileData.full_name} — ${expertise}.`
          : `Book a session with ${profileData.full_name} on Orive.`
      );

      // Fetch offerings
      const { data: offeringsData, error: offeringsError } = await supabase
        .from("offerings")
        .select("id, type, title, description, price, duration, location, image_url, capacity, start_at")
        .eq("facilitator_id", profileData.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!offeringsError && offeringsData) {
        setOfferings(offeringsData);
      }

      // Fetch availability
      const availabilityInvoke: any = await supabase.functions.invoke("get-public-availability", {
        body: { facilitatorId: profileData.id },
        headers: getAnonClientHeaders(),
      });

      if (!availabilityInvoke.error) {
        setAvailability(availabilityInvoke.data?.slots || []);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleBookOffering = (offering: Offering) => {
    setSelectedOffering(offering);
    setBookingModalOpen(true);
  };

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: "left" | "right") => {
    ref.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: profile?.full_name || "Facilitator",
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const shownSkillBadges = activeBadges.length > 0 ? activeBadges : skillCategories.slice(0, 3);




  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#01223F] relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#00CDAC]/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#02AAB0]/5 rounded-full blur-[150px]" />
          
          {/* Twinkling Stars */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-[#00CDAC]/40"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `var(--size)`,
                height: `var(--size)`,
                animationDelay: `var(--delay)`,
                animationDuration: `var(--duration)`,
                "--size": `${p.size}px`,
                "--delay": `${p.delay}s`,
                "--duration": `${p.duration}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {loading ? (
            <div className="space-y-8 animate-pulse p-4">
              <Skeleton className="w-full h-48 rounded-md bg-[#0f2137]" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                  <Skeleton className="h-[500px] w-full rounded-lg bg-[#0f2137]" />
                </div>
                <div className="lg:col-span-8 space-y-6">
                  <Skeleton className="h-48 w-full rounded-lg bg-[#0f2137]" />
                  <Skeleton className="h-96 w-full rounded-lg bg-[#0f2137]" />
                </div>
              </div>
            </div>
          ) : !profile ? (
            <div className="text-center p-12 bg-gray-100 dark:bg-white/5 backdrop-blur-xl rounded-md border border-gray-200 dark:border-white/10 max-w-xl mx-auto shadow-2xl mt-12">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {profileNotPublic ? "Private Profile" : "Profile Not Found"}
              </h1>
              <p className="text-gray-500 dark:text-white/60 mb-10 text-lg">
                {profileNotPublic
                  ? "This facilitator's profile is currently set to private."
                  : "We couldn't find the profile you were looking for. It might have been moved or removed."}
              </p>
              <Button 
                onClick={() => navigate.push("/marketplace")} 
                className="bg-[#00CDAC] text-white hover:bg-[#00CDAC]/90 font-bold rounded-md px-10 h-14 text-lg transition-all shadow-glow"
              >
                Browse Marketplace
              </Button>
            </div>
          ) : (
            <>
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-gray-500 dark:text-white/50 text-sm mb-8">
                <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1.5 font-medium">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <ChevronRight className="w-4 h-4 opacity-30" />
                <Link href="/marketplace" className="hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Marketplace</Link>
                <ChevronRight className="w-4 h-4 opacity-30" />
                <span className="text-[#00CDAC] font-bold tracking-tight">{profile.full_name}</span>
              </nav>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                  <aside className="bg-white dark:bg-white/[0.03] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-md p-8 shadow-md dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative group">
                    <div className="absolute top-6 right-6 flex gap-2">
                      <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        className={cn(
                          "p-2.5 rounded-full transition-all duration-300 border backdrop-blur-md",
                          isFavorite 
                            ? "bg-red-500/20 border-red-500/30 text-red-500" 
                            : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                        )}
                      >
                        <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                      </button>
                      <button
                        onClick={handleShare}
                        title="Share profile"
                        className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 backdrop-blur-md transition-all duration-300"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="relative">
                        <div className="absolute -inset-1.5 bg-gradient-to-br from-[#00CDAC] to-[#02AAB0] rounded-full blur-md opacity-20" />
                        <Avatar className="w-32 h-32 border-2 border-gray-200 dark:border-white/10 p-1 bg-gray-100 dark:bg-white/5">
                          <AvatarImage src={getAvatarUrl(profile.avatar_url)} className="rounded-full object-cover" />
                          <AvatarFallback className="text-4xl bg-[#0f2137] text-[#00CDAC]">
                            {profile.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-2 right-2 w-5 h-5 bg-[#22C55E] rounded-full border-4 border-[#01223F] shadow-lg animate-pulse" />
                      </div>

                      <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
                          {profile.full_name}
                          <CheckCircle className="w-6 h-6 text-[#00CDAC] fill-[#00CDAC]/10" />
                        </h1>
                        <p className="text-[#00CDAC] font-medium tracking-wide uppercase text-xs">
                          {profile.professional_title || "Wellness Professional"}
                        </p>
                      </div>

                      <div className="flex items-center gap-8 w-full border-y border-gray-100 dark:border-white/5 py-6">
                        <div className="flex-1 text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-900 dark:text-white text-lg font-bold">
                            <Star className="w-4 h-4 text-[#FDDB5B] fill-[#FDDB5B]" />
                            <span>{profile.rating?.toFixed(1) || "5.0"}</span>
                          </div>
                          <p className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-widest mt-1">Rating</p>
                        </div>
                        <div className="w-px h-8 bg-gray-100 dark:bg-white/5" />
                        <div className="flex-1 text-center">
                          <div className="text-gray-900 dark:text-white text-lg font-bold">{profile.reviewCount || "0"}</div>
                          <p className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-widest mt-1">Reviews</p>
                        </div>
                        <div className="w-px h-8 bg-gray-100 dark:bg-white/5" />
                        <div className="flex-1 text-center">
                          <div className="text-gray-900 dark:text-white text-lg font-bold">{profile.views || "0"}</div>
                          <p className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-widest mt-1">Views</p>
                        </div>
                      </div>

                      <div className="w-full space-y-4 pt-2 text-left">
                        {profile.location && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3 text-gray-500 dark:text-white/60">
                              <MapPin className="w-4 h-4 text-[#00CDAC]" />
                              <span>Location</span>
                            </div>
                            <span className="text-gray-900 dark:text-white font-medium">{profile.location}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3 text-gray-500 dark:text-white/60">
                            <Clock className="w-4 h-4 text-[#00CDAC]" />
                            <span>Responds in</span>
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium">~2 hours</span>
                        </div>
                        {profile.languages && profile.languages.length > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3 text-gray-500 dark:text-white/60">
                              <Languages className="w-4 h-4 text-[#00CDAC]" />
                              <span>Languages</span>
                            </div>
                            <span className="text-gray-900 dark:text-white font-medium">{(Array.isArray(profile.languages) ? profile.languages : String(profile.languages).split(/[,|/]/)).filter(Boolean).join(", ")}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full h-14 bg-gradient-to-r from-[#00CDAC] to-[#02AAB0] hover:opacity-90 text-white font-bold rounded-lg transition-all shadow-lg shadow-[#00CDAC]/10 border-none group"
                        onClick={() => toast.info("Messaging coming soon")}
                      >
                        <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Send a Message
                      </Button>
                    </div>
                  </aside>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                  <section className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-md p-8 sm:p-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                      <span className="w-8 h-1 bg-gradient-to-r from-[#00CDAC] to-transparent rounded-full" />
                      About
                    </h2>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-600 dark:text-white/80 text-lg leading-relaxed font-light first-letter:text-4xl first-letter:font-bold first-letter:text-[#00CDAC] first-letter:mr-3 first-letter:float-left">
                        {profile.bio || `Hello, I'm ${profile.full_name}, a dedicated facilitator specializing in holistic wellbeing...`}
                      </p>
                    </div>

                    {expertiseTags.length > 0 && (
                      <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-white/40 uppercase tracking-[0.2em] mb-6">Expertise & Specialties</h3>
                        <div className="flex flex-wrap gap-2.5">
                          {expertiseTags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md hover:bg-[#00CDAC]/10 hover:border-[#00CDAC]/30 transition-all cursor-default"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Offerings */}
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="w-8 h-1 bg-gradient-to-r from-[#00CDAC] to-transparent rounded-full" />
                        Offerings
                      </h2>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => scroll(sessionsScrollRef, "left")}
                          className="rounded-full bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => scroll(sessionsScrollRef, "right")}
                          className="rounded-full bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    <div 
                      ref={sessionsScrollRef} 
                      className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 -mx-4 px-4 snap-x"
                    >
                      {offerings.length > 0 ? (
                        offerings.map((offering) => (
                          <div
                            key={offering.id}
                            onClick={() => handleBookOffering(offering)}
                            className="flex-shrink-0 w-[300px] group cursor-pointer snap-start"
                          >
                            <div className="relative aspect-[4/3] rounded-md overflow-hidden mb-4 bg-gray-100 dark:bg-[#0a1628] border border-gray-100 dark:border-white/5 group-hover:border-[#00CDAC]/30 transition-all duration-500">
                              {offering.image_url ? (
                                <img src={offering.image_url} alt={offering.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#02AAB0]/20 to-transparent flex items-center justify-center">
                                  <Calendar className="w-12 h-12 text-gray-300 dark:text-white/10" />
                                </div>
                              )}
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-[#00CDAC] text-white border-none font-bold">
                                  {offering.type === 'session' ? '1:1' : offering.type}
                                </Badge>
                              </div>
                              <div className="absolute top-4 right-4 bg-gray-50 dark:bg-[#01223F]/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10">
                                {offering.price}
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-[#01223F] via-transparent to-transparent opacity-60" />
                            </div>
                            
                            <div className="space-y-1 px-1">
                              <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-tight group-hover:text-[#00CDAC] transition-colors line-clamp-1">
                                {offering.title}
                              </h3>
                              <div className="flex items-center gap-4 text-gray-400 dark:text-white/40 text-xs">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{offering.duration} min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>{offering.location || 'Online'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="w-full py-20 text-center bg-gray-100 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-md">
                          <p className="text-gray-400 dark:text-white/40 font-medium">No active sessions listed at this time.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-md p-8">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 font-raleway">
                        <GraduationCap className="w-6 h-6 text-[#00CDAC]" />
                        Education
                      </h2>
                      <div className="space-y-6">
                        {[
                          { title: "Somatic Healing", institute: "Intl. Institute of Arts", year: "2024" },
                          { title: "Breathwork Science", institute: "Wellness Academy", year: "2018" }
                        ].map((edu, i) => (
                          <div key={i} className="relative pl-6 border-l border-gray-200 dark:border-white/10 pb-2">
                            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#00CDAC]" />
                            <h4 className="text-gray-900 dark:text-white font-bold text-sm tracking-tight">{edu.title}</h4>
                            <p className="text-gray-400 dark:text-white/40 text-xs mt-1">{edu.institute} • {edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-md p-8">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 font-raleway">
                        <Briefcase className="w-6 h-6 text-[#00CDAC]" />
                        Experience
                      </h2>
                      <div className="space-y-6">
                        {[
                          { role: "Senior Lead", firm: "Orive Platform", period: "2020 - Now" },
                          { role: "Holistic Consultant", firm: "Private Practice", period: "2018 - 2020" }
                        ].map((exp, i) => (
                          <div key={i} className="relative pl-6 border-l border-gray-200 dark:border-white/10 pb-2">
                            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#00CDAC]" />
                            <h4 className="text-gray-900 dark:text-white font-bold text-sm tracking-tight">{exp.role}</h4>
                            <p className="text-gray-400 dark:text-white/40 text-xs mt-1">{exp.firm} • {exp.period}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          .shadow-glow { box-shadow: 0 0 20px rgba(0, 205, 172, 0.2); }
        `}</style>

        {/* Booking Modal */}
        {selectedOffering && profile && (
          <SessionBookingModal
            open={bookingModalOpen}
            onOpenChange={setBookingModalOpen}
            sessionTitle={selectedOffering.title}
            sessionPrice={selectedOffering.price || "Free"}
            sessionDuration={selectedOffering.duration || undefined}
            facilitatorId={profile.id}
            facilitatorName={profile.full_name}
            offeringId={selectedOffering.id}
          />
        )}
      </div>
    </Layout>
  );
}
