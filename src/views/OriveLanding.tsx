import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Calendar, Users, Sparkles, BarChart3, MessageCircle, Zap, CreditCard, FileText, CheckCircle2, Heart, Target, Globe, Building2, Shield, Clock, Rocket, TrendingUp, Lightbulb, ArrowRight, Columns3 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Layout } from "@/components/Layout";
import { usePublicOfferings } from "@/hooks/usePublicOfferings";
import { OfferingCard } from "@/components/OfferingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunityFrameworkSection } from "@/components/CommunityFrameworkSection";
// Using public folder paths for smaller bundle
const oriveNavigation = "/orive-navigation.png";
const oriveServices = "/orive-services.png";
const oriveCalendar = "/orive-calendar.png";
const oriveProfile = "/orive-profile.png";
const countryAustria = "/countries/austria.jpg";
const countryCyprus = "/countries/cyprus.jpg";
const countryFrance = "/countries/france.jpg";
const countryGermany = "/countries/germany.jpg";
const countryItaly = "/countries/italy.jpg";
const countryNetherlands = "/countries/netherlands.jpg";
const countryPoland = "/countries/poland.jpg";
const countryPortugal = "/countries/portugal.jpg";
const countrySpain = "/countries/spain.jpg";
const OriveLanding = () => {
  const { t, copy } = useLanguage();
  
  // Fetch offerings from database
  const { offerings: sessions, loading: sessionsLoading } = usePublicOfferings({ type: "individual", limit: 4 });
  const { offerings: groupSessions, loading: groupsLoading } = usePublicOfferings({ type: "group", limit: 4 });
  const { offerings: events, loading: eventsLoading } = usePublicOfferings({ type: "event", limit: 4 });

  const features = [{
    icon: Sparkles,
    title: t('smartMatch'),
    description: t('smartMatchDesc'),
    gradient: "from-highlight to-menu-gradient-end",
    slug: "smartmatch"
  }, {
    icon: Calendar,
    title: t('bookingsCalendar'),
    description: t('bookingsCalendarDesc'),
    gradient: "from-success to-highlight",
    slug: "bookings-calendar"
  }, {
    icon: Columns3,
    title: copy("Workspace", "Workspace"),
    description: copy(
      "Kanban, Boards und Fokus aus dem ORIVE Desktop — direkt im dezk, verknüpft mit Terminen, Angeboten und Suchenden.",
      "Kanban, boards, and focus from ORIVE Desktop — inside dezk, linked to dates, offerings, and seekers."
    ),
    gradient: "from-menu-gradient-start to-accent-glow",
    slug: "workspace"
  }, {
    icon: BarChart3,
    title: t('dashboardAnalytics'),
    description: t('dashboardAnalyticsDesc'),
    gradient: "from-accent to-cta-accent",
    slug: "dashboard-analytics"
  }, {
    icon: Users,
    title: t('communityBuildingFeature'),
    description: t('communityBuildingDesc'),
    gradient: "from-menu-gradient-start to-highlight",
    slug: "community-building"
  }, {
    icon: Zap,
    title: t('automation'),
    description: t('automationDesc'),
    gradient: "from-accent to-accent-glow",
    slug: "automation"
  }, {
    icon: CreditCard,
    title: t('payments'),
    description: t('paymentsDesc'),
    gradient: "from-success to-menu-gradient-start",
    slug: "payments"
  }, {
    icon: FileText,
    title: t('customForms'),
    description: t('customFormsDesc'),
    gradient: "from-highlight to-success",
    slug: "custom-forms"
  }, {
    icon: MessageCircle,
    title: t('offersManagement'),
    description: t('offersManagementDesc'),
    gradient: "from-cta-accent to-accent",
    slug: "offers-management"
  }];
  const benefits = [t('benefit1'), t('benefit2'), t('benefit3'), t('benefit4'), t('benefit5'), t('benefit6')];
  return <Layout>
      <div className="min-h-screen bg-background dark:bg-[#0a1628] -mt-16">
        {/* Hero Section - Light mode: clean gradient, Dark mode: corporate */}
      <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50/80 dark:from-[#0a1628] dark:via-[#0a1628] dark:to-[#0f2137]">
        {/* Light mode decorative gradients - soft teal accents */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(0,205,172,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_20%_30%,rgba(0,205,172,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(0,205,172,0.06),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_80%_70%,rgba(0,205,172,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(0,205,172,0.04),transparent_60%)] dark:hidden" />
        
        {/* Abstract decorative glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-highlight/5 blur-[100px] animate-pulse" />
        </div>

        {/* Content overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80 dark:to-[#0a1628] pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center pt-24">
          {/* Badge */}
          <div className="inline-block mb-8 px-6 py-2.5 bg-gray-100/80 dark:bg-foreground/5 border border-gray-200/60 dark:border-foreground/10 rounded-full backdrop-blur-md animate-fade-in">
            <span className="text-gray-600 dark:text-foreground/70 font-semibold text-xs tracking-[0.2em] uppercase">The Future of Facilitation</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] xl:text-[5.5rem] 2xl:text-[6.5rem] font-extrabold text-gray-900 dark:text-foreground leading-[1.1] mb-10 font-raleway animate-fade-in tracking-tighter whitespace-nowrap overflow-hidden text-ellipsis w-[120%] -ml-[10%] text-center">
            Facilitate{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-highlight via-[hsl(180,60%,38%)] to-highlight bg-clip-text text-transparent">
                holistic wellbeing
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-highlight/0 via-highlight to-highlight/0 rounded-full opacity-60" />
            </span>{" "}
            sessions like a{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-cta-accent via-[hsl(45,93%,55%)] to-cta-accent bg-clip-text text-transparent font-black">
                PRO
              </span>
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-gray-500 dark:text-foreground/60 mb-14 max-w-2xl mx-auto leading-relaxed animate-fade-in font-light">
            Professional tools for coaches, therapists, and facilitators to manage bookings, grow their practice, and create lasting impact.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 justify-center items-center animate-fade-in w-full max-w-md mx-auto">
            <Button 
              size="lg" 
              className="w-full bg-highlight hover:bg-highlight/90 text-highlight-foreground font-semibold px-10 py-7 rounded-md shadow-[0_4px_20px_-4px_rgba(0,205,172,0.4)] hover:shadow-[0_8px_30px_-4px_rgba(0,205,172,0.5)] text-base transition-all duration-300" 
              asChild
            >
              <a href="https://orive.app/auth">FREE forever</a>
            </Button>
            <Button 
              size="lg" 
              variant="ghost" 
              className="w-full text-gray-600 dark:text-foreground/70 hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100/60 dark:hover:bg-foreground/5 font-medium px-10 py-7 rounded-md text-base transition-all duration-300" 
              asChild
            >
              <Link href="/formation">Form your Company</Link>
            </Button>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white dark:from-[#0a1628] via-white/80 dark:via-[#0a1628]/80 to-transparent pointer-events-none" />
      </section>

      {/* Visual Showcase – How ORIVE Works */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-[#0a1628] dark:via-[#0f2137] dark:to-[#0a1628]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block mb-4 px-4 py-2 bg-highlight/10 border border-highlight/20 rounded-full backdrop-blur-sm">
              <span className="text-highlight font-semibold text-sm tracking-wide">How It Works</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-raleway">
              Your Practice, <span className="text-highlight">Elevated</span>
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              From your first session to a thriving community — ORIVE supports every step of your journey.
            </p>
          </div>

          {/* Three-panel visual grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Panel 1: Sessions */}
            <div className="group relative overflow-hidden rounded-2xl aspect-[4/3]">
              <img 
                src="/facilitators/facilitator-hero-session.jpg" 
                alt="Professional wellness session" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 rounded-full bg-highlight/90 text-white text-xs font-bold tracking-wide mb-2">Sessions</span>
                <h3 className="text-xl font-bold text-white mb-1">Lead Transformative Sessions</h3>
                <p className="text-white/80 text-sm">Manage 1:1, groups, and retreats from one platform.</p>
              </div>
            </div>

            {/* Panel 2: Dashboard */}
            <div className="group relative overflow-hidden rounded-2xl aspect-[4/3]">
              <img 
                src="/facilitators/facilitator-dashboard.jpg" 
                alt="ORIVE dashboard analytics" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 rounded-full bg-[#01223F]/90 text-white text-xs font-bold tracking-wide mb-2">Dashboard</span>
                <h3 className="text-xl font-bold text-white mb-1">Track Your Growth</h3>
                <p className="text-white/80 text-sm">Analytics, bookings, and payments in one view.</p>
              </div>
            </div>

            {/* Panel 3: Community */}
            <div className="group relative overflow-hidden rounded-2xl aspect-[4/3]">
              <img 
                src="/facilitators/facilitator-community.jpg" 
                alt="Facilitator community gathering" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 rounded-full bg-success/90 text-white text-xs font-bold tracking-wide mb-2">Community</span>
                <h3 className="text-xl font-bold text-white mb-1">Grow Together</h3>
                <p className="text-white/80 text-sm">Connect with a network of like-minded professionals.</p>
              </div>
            </div>
          </div>

          {/* Trust Stats Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10">
            {[
              { value: '2,500+', label: 'Active Facilitators' },
              { value: '98%', label: 'Client Satisfaction' },
              { value: '15+', label: 'Countries' },
              { value: '$0', label: 'Platform Fee' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl lg:text-4xl font-extrabold text-highlight mb-1">{stat.value}</p>
                <p className="text-sm text-foreground/60 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 lg:px-8 bg-background dark:bg-[#0a1628]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-raleway">
              {t('featuresTitle')} <span className="text-highlight">{t('thrive')}</span>
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              {t('featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} href={`/features/${feature.slug}`} className="group relative block">
                {/* Animated border glow */}
                <div 
                  className="absolute -inset-[1px] rounded-md opacity-0 dark:opacity-100 pointer-events-none"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0deg, #00CDAC 60deg, transparent 120deg)',
                    animation: 'borderGlow 6s ease-in-out infinite',
                    animationDelay: `var(--delay)`,
                    "--delay": `${index * 0.5}s`
                  } as React.CSSProperties}
                />
                <Card className="relative p-6 bg-white dark:bg-[#0f2137] backdrop-blur border border-gray-100 dark:border-[#1a3a5c] hover:border-highlight/30 transition-all duration-300 hover:shadow-glow h-full group-hover:translate-y-[-2px]">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed mb-3">{feature.description}</p>
                  <span className="text-sm font-medium text-highlight group-hover:underline inline-flex items-center gap-1">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Benefits Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-r from-highlight/5 to-transparent dark:from-[#0f2137] dark:to-[#0a1628]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-raleway">
              {t('whyChoose')} <span className="text-highlight-gradient">ORIVE</span>
            </h2>
            <p className="text-lg text-foreground/70">
              {t('joinThousands')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-highlight flex-shrink-0 mt-1" />
                <span className="text-foreground/90">{benefit}</span>
              </div>)}
          </div>

          <div className="text-center">
            <Card className="inline-block p-8 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur border-highlight/20">
              <p className="text-4xl font-bold text-highlight mb-2">$0</p>
              <p className="text-foreground/90 mb-4">{t('foreverFree')}</p>
              <p className="text-sm text-foreground/70 max-w-md">
                {t('noCreditCard')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Framework Section */}
      <CommunityFrameworkSection />

      {/* Professional Services Section */}
      <section className="py-20 px-6 lg:px-8 bg-background dark:bg-[#0a1628]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-success/10 border border-success/20 rounded-full backdrop-blur-sm">
              <span className="text-success font-semibold text-sm tracking-wide">{t('professionalServices')}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-raleway">
              {t('comprehensiveSupport')} <span className="bg-gradient-to-r from-success via-highlight to-success bg-clip-text text-transparent">{t('yourGrowth')}</span>
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              {t('servicesIntro')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Purpose Alignment */}
            <div className="group relative">
              <div 
                className="absolute -inset-[1px] rounded-md opacity-0 dark:opacity-100 pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, #00CDAC 60deg, transparent 120deg)',
                  animation: 'borderGlow 6s ease-in-out infinite'
                } as React.CSSProperties}
              />
              <Card className="relative p-6 bg-white dark:bg-[#0f2137] backdrop-blur border border-gray-100 dark:border-[#1a3a5c] hover:border-highlight/30 transition-all duration-300 hover:shadow-glow h-full">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-highlight to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{t('purposeAlignmentTitle')}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                  {t('purposeAlignmentDesc')}
                </p>
                <Link href="/services/purpose-alignment" className="inline-flex items-center gap-2 text-highlight hover:text-accent transition-colors duration-300 text-sm font-medium">
                  {t('learnMore')} <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>
            </div>

            {/* Business Launch */}
            <div className="group relative">
              <div 
                className="absolute -inset-[1px] rounded-md opacity-0 dark:opacity-100 pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, #00CDAC 60deg, transparent 120deg)',
                  animation: 'borderGlow 6s ease-in-out infinite',
                  animationDelay: 'var(--delay)',
                  "--delay": '0.5s'
                } as React.CSSProperties}
              />
              <Card className="relative p-6 bg-white dark:bg-[#0f2137] backdrop-blur border border-gray-100 dark:border-[#1a3a5c] hover:border-success/30 transition-all duration-300 hover:shadow-glow h-full">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success to-highlight flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{t('businessLaunchTitle')}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                  {t('businessLaunchDesc')}
                </p>
                <Link href="/services/business-launch" className="inline-flex items-center gap-2 text-success hover:text-highlight transition-colors duration-300 text-sm font-medium">
                  {t('learnMore')} <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>
            </div>

            {/* Growth Acceleration */}
            <div className="group relative">
              <div 
                className="absolute -inset-[1px] rounded-md opacity-0 dark:opacity-100 pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, #00CDAC 60deg, transparent 120deg)',
                  animation: 'borderGlow 6s ease-in-out infinite',
                  animationDelay: 'var(--delay)',
                  "--delay": '1s'
                } as React.CSSProperties}
              />
              <Card className="relative p-6 bg-white dark:bg-[#0f2137] backdrop-blur border border-gray-100 dark:border-[#1a3a5c] hover:border-accent/30 transition-all duration-300 hover:shadow-glow h-full">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{t('growthAccelerationTitle')}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                  {t('growthAccelerationDesc')}
                </p>
                <Link href="/services/growth-acceleration" className="inline-flex items-center gap-2 text-accent hover:text-accent-glow transition-colors duration-300 text-sm font-medium">
                  {t('learnMore')} <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>
            </div>

            {/* Community Building */}
            <div className="group relative">
              <div 
                className="absolute -inset-[1px] rounded-md opacity-0 dark:opacity-100 pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, #00CDAC 60deg, transparent 120deg)',
                  animation: 'borderGlow 6s ease-in-out infinite',
                  animationDelay: 'var(--delay)',
                  "--delay": '1.5s'
                } as React.CSSProperties}
              />
              <Card className="relative p-6 bg-white dark:bg-[#0f2137] backdrop-blur border border-gray-100 dark:border-[#1a3a5c] hover:border-menu-gradient-end/30 transition-all duration-300 hover:shadow-glow h-full">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-menu-gradient-start to-menu-gradient-end flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{t('communityBuildingTitle')}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                  {t('communityBuildingServiceDesc')}
                </p>
                <Link href="/services/community-building" className="inline-flex items-center gap-2 text-highlight hover:text-menu-gradient-end transition-colors duration-300 text-sm font-medium">
                  {t('learnMore')} <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>
            </div>

            {/* Innovation Consulting */}
            <div className="group relative">
              <div 
                className="absolute -inset-[1px] rounded-md opacity-0 dark:opacity-100 pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, #00CDAC 60deg, transparent 120deg)',
                  animation: 'borderGlow 6s ease-in-out infinite',
                  animationDelay: 'var(--delay)',
                  "--delay": '2s'
                } as React.CSSProperties}
              />
              <Card className="relative p-6 bg-white dark:bg-[#0f2137] backdrop-blur border border-gray-100 dark:border-[#1a3a5c] hover:border-accent-glow/30 transition-all duration-300 hover:shadow-glow h-full">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-glow to-cta-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{t('innovationConsultingTitle')}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                  {t('innovationConsultingDesc')}
                </p>
                <Link href="/services/innovation-consulting" className="inline-flex items-center gap-2 text-accent-glow hover:text-cta-accent transition-colors duration-300 text-sm font-medium">
                  {t('learnMore')} <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>
            </div>

            {/* Impact Measurement */}
            <div className="group relative">
              <div 
                className="absolute -inset-[1px] rounded-md opacity-0 dark:opacity-100 pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, #00CDAC 60deg, transparent 120deg)',
                  animation: 'borderGlow 6s ease-in-out infinite',
                  animationDelay: 'var(--delay)',
                  "--delay": '2.5s'
                } as React.CSSProperties}
              />
              <Card className="relative p-6 bg-white dark:bg-[#0f2137] backdrop-blur border border-gray-100 dark:border-[#1a3a5c] hover:border-success/30 transition-all duration-300 hover:shadow-glow h-full">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{t('impactMeasurementTitle')}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                  {t('impactMeasurementDesc')}
                </p>
                <Link href="/services/impact-measurement" className="inline-flex items-center gap-2 text-success hover:text-accent transition-colors duration-300 text-sm font-medium">
                  {t('learnMore')} <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-foreground/70 mb-6">
              {t('notSure')}
            </p>
            <Button size="lg" variant="outline" className="border-2 border-highlight/30 bg-background/50 backdrop-blur-sm text-foreground hover:bg-highlight/10 hover:border-highlight font-semibold px-8 py-6 rounded-lg transition-all duration-300">
              {t('scheduleConsultation')}
            </Button>
          </div>
        </div>
      </section>

      {/* Offerings Showcase */}
      {(sessions.length > 0 || groupSessions.length > 0 || events.length > 0) && (
        <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30 dark:from-[#0a1628] dark:to-[#0f2137]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-4 py-2 bg-highlight/10 border border-highlight/20 rounded-full backdrop-blur-sm">
                <span className="text-highlight font-semibold text-sm tracking-wide">Discover Experiences</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-raleway">
                Find Your Perfect <span className="text-highlight">Wellness Journey</span>
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Connect with verified facilitators offering transformative sessions, group experiences, and life-changing events.
              </p>
            </div>

            {/* 1:1 Sessions */}
            {sessions.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-highlight" />
                    1:1 Sessions
                  </h3>
                  <Link href="/marketplace" className="text-sm text-highlight hover:underline flex items-center gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {sessionsLoading ? (
                    [...Array(4)].map((_, i) => (
                      <div key={i} className="w-[240px] sm:w-[260px] md:w-[275px] shrink-0 snap-start">
                        <Skeleton className="h-80 rounded-md" />
                      </div>
                    ))
                  ) : (
                    sessions.map((offering) => (
                      <div key={offering.id} className="w-[240px] sm:w-[260px] md:w-[275px] shrink-0 snap-start">
                        <OfferingCard offering={offering} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Group Sessions */}
            {groupSessions.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Group Sessions
                  </h3>
                  <Link href="/marketplace" className="text-sm text-highlight hover:underline flex items-center gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {groupsLoading ? (
                    [...Array(4)].map((_, i) => (
                      <div key={i} className="w-[240px] sm:w-[260px] md:w-[275px] shrink-0 snap-start">
                        <Skeleton className="h-80 rounded-md" />
                      </div>
                    ))
                  ) : (
                    groupSessions.map((offering) => (
                      <div key={offering.id} className="w-[240px] sm:w-[260px] md:w-[275px] shrink-0 snap-start">
                        <OfferingCard offering={offering} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Events */}
            {events.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    Upcoming Events
                  </h3>
                  <Link href="/marketplace" className="text-sm text-highlight hover:underline flex items-center gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {eventsLoading ? (
                    [...Array(4)].map((_, i) => (
                      <div key={i} className="w-[240px] sm:w-[260px] md:w-[275px] shrink-0 snap-start">
                        <Skeleton className="h-80 rounded-md" />
                      </div>
                    ))
                  ) : (
                    events.map((offering) => (
                      <div key={offering.id} className="w-[240px] sm:w-[260px] md:w-[275px] shrink-0 snap-start">
                        <OfferingCard offering={offering} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="text-center mt-12">
              <Button size="lg" className="bg-highlight hover:bg-highlight/90 text-highlight-foreground font-semibold px-10 py-6 rounded-md" asChild>
                <Link href="/marketplace">Explore All Offerings</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Marketing Banner */}
      
      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-background dark:bg-[#0a1628]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 font-raleway">
            {t('readyTransform')}
          </h2>
          <p className="text-lg text-foreground/80 mb-10 max-w-2xl mx-auto">
            {t('joinCommunity')}
          </p>
          <Button size="lg" className="bg-gradient-to-r from-cta-accent to-accent hover:from-accent hover:to-accent-glow text-gray-900 dark:text-white font-semibold px-12 py-6 rounded-lg shadow-elegant text-lg transition-all duration-300" asChild>
            <a href="https://orive.app/auth">{t('getStartedFreeBtn')}</a>
          </Button>
        </div>
      </section>

      </div>
    </Layout>;
};
export default OriveLanding;