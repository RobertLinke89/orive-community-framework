"use client";
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useEffect } from "react";
import { ArrowLeft, CheckCircle2, Sparkles, Calendar, BarChart3, Users, Zap, CreditCard, FileText, MessageCircle, ArrowRight, Play, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

// Feature data reflecting actual internal app capabilities
const featuresData = {
  "smartmatch": {
    icon: Sparkles,
    title: "SmartMatch",
    subtitle: "Intelligent matching algorithm connects you with ideal participants",
    gradient: "from-highlight to-[hsl(180,60%,32%)]",
    heroImage: "/orive-navigation.png",
    description: "Our AI-powered SmartMatch system analyzes participant needs, preferences, and goals to connect them with the perfect facilitator. The infinite canvas radar view provides an intuitive visual interface for discovering ideal matches.",
    benefits: [
      "AI-driven matching based on participant needs and facilitator expertise",
      "Infinite canvas radar visualization for intuitive discovery",
      "Real-time filtering by specialty, location, and availability",
      "Bidirectional data mapping ensures consistent recommendations",
      "Personalized suggestions that improve over time"
    ],
    capabilities: [
      { title: "Visual Discovery", desc: "Navigate an infinite canvas with facilitator profiles arranged by relevance and specialty" },
      { title: "Smart Filtering", desc: "Filter by expertise, location, price range, and session type in real-time" },
      { title: "Compatibility Score", desc: "See how well each facilitator matches your specific needs and goals" },
      { title: "Quick Preview", desc: "Preview facilitator profiles, ratings, and available sessions without leaving the view" }
    ],
    cta: "Experience SmartMatch",
    ctaLink: "/marketplace"
  },
  "bookings-calendar": {
    icon: Calendar,
    title: "Bookings & Calendar",
    subtitle: "Manage all your sessions in one intuitive calendar",
    gradient: "from-[hsl(142,76%,36%)] to-highlight",
    heroImage: "/orive-calendar.png",
    description: "A professional weekly calendar view displays all your sessions, workshops, and retreats with color-coded service icons. Real-time availability management and automated scheduling eliminate double-bookings and administrative overhead.",
    benefits: [
      "Weekly calendar view with color-coded session types",
      "Real-time availability slots with overlap validation",
      "Automated scheduling based on your preferences",
      "Client details, service type, and status at a glance",
      "Modal dialogs for detailed booking information"
    ],
    capabilities: [
      { title: "Weekly Overview", desc: "See your entire week's schedule with sessions displayed by time and type" },
      { title: "Availability Management", desc: "Set recurring weekly availability with automatic conflict detection" },
      { title: "Booking Details", desc: "View client info, session notes, and payment status from calendar entries" },
      { title: "Quick Actions", desc: "Confirm, reschedule, or cancel bookings directly from the calendar" }
    ],
    cta: "Explore Calendar",
    ctaLink: "/auth"
  },
  "dashboard-analytics": {
    icon: BarChart3,
    title: "Dashboard & Analytics",
    subtitle: "Track your growth with comprehensive insights",
    gradient: "from-[hsl(45,93%,47%)] to-[hsl(174,72%,36%)]",
    heroImage: "/orive-profile.png",
    description: "Professional infographics and charts show your profile views, share clicks, and booking conversion funnels. Filter by time range, UTM source, and social media channel to understand what drives your business growth.",
    benefits: [
      "Real-time profile view and engagement tracking",
      "Booking conversion funnel visualization",
      "UTM source and campaign attribution",
      "Social media channel performance breakdown",
      "Customizable time-range filtering"
    ],
    capabilities: [
      { title: "Performance Dashboard", desc: "High-level metrics showing bookings, revenue, and client satisfaction" },
      { title: "Conversion Funnels", desc: "Track how visitors become clients through profile views to bookings" },
      { title: "Marketing Attribution", desc: "See which campaigns and channels drive the most conversions" },
      { title: "Growth Trends", desc: "Compare performance across time periods to identify opportunities" }
    ],
    cta: "View Analytics Demo",
    ctaLink: "/auth"
  },
  "community-building": {
    icon: Users,
    title: "Community Building",
    subtitle: "Connect and grow with fellow facilitators",
    gradient: "from-[hsl(180,60%,32%)] to-highlight",
    heroImage: "/orive-services.png",
    description: "Build meaningful connections within a supportive professional network. Discover similar facilitators, share experiences, and collaborate on events. Social sharing functionality and review systems help build your reputation.",
    benefits: [
      "Similar Facilitators recommendations based on expertise",
      "Social sharing for sessions and experiences",
      "Client review and feedback system",
      "Collaborative event and retreat planning",
      "Professional networking opportunities"
    ],
    capabilities: [
      { title: "Facilitator Discovery", desc: "Find and connect with facilitators who share your approach and values" },
      { title: "Reviews & Ratings", desc: "Build credibility with client testimonials and star ratings" },
      { title: "Social Sharing", desc: "Share your offerings across X, Facebook, LinkedIn, and WhatsApp" },
      { title: "Support Network", desc: "Access a community of professionals for advice and collaboration" }
    ],
    cta: "Join the Community",
    ctaLink: "/auth"
  },
  "automation": {
    icon: Zap,
    title: "Automation",
    subtitle: "Automate reminders, follow-ups, and admin tasks",
    gradient: "from-[hsl(174,72%,36%)] to-[hsl(174,72%,45%)]",
    heroImage: "/orive-navigation.png",
    description: "Focus on what matters most—your participants. Our automated booking lifecycle system handles confirmation emails, SMS reminders, and follow-up messages. Pre-session reminders and post-session check-ins run automatically via email and SMS.",
    benefits: [
      "Automated booking confirmation emails",
      "24-hour pre-session reminder notifications",
      "Post-session follow-up with WhatsApp support link",
      "Rescheduling notifications with updated calendar files",
      "Cancellation handling with automatic refund processing"
    ],
    capabilities: [
      { title: "Email Automation", desc: "Automatic booking confirmations, reminders, and follow-ups via Resend" },
      { title: "SMS Notifications", desc: "Real-time text message updates via Twilio integration" },
      { title: "Calendar Sync", desc: "RFC 5545 compliant .ics files for seamless calendar integration" },
      { title: "WhatsApp Support", desc: "24/7 AI-assisted client support through WhatsApp" }
    ],
    cta: "See Automation in Action",
    ctaLink: "/auth"
  },
  "payments": {
    icon: CreditCard,
    title: "Payments",
    subtitle: "Integrated payment processing for seamless transactions",
    gradient: "from-[hsl(142,76%,36%)] to-[hsl(180,60%,32%)]",
    heroImage: "/orive-profile.png",
    description: "Accept payments globally with integrated Stripe processing. Track payment status from unpaid to paid to refunded. Professional payment status badges throughout your dashboard keep you informed at every step.",
    benefits: [
      "Stripe integration for global payment acceptance",
      "Real-time payment status tracking",
      "Automated payment lifecycle management",
      "Professional invoicing and receipts",
      "Refund processing and history"
    ],
    capabilities: [
      { title: "Global Payments", desc: "Accept payments in multiple currencies from clients worldwide" },
      { title: "Status Tracking", desc: "Monitor unpaid, paid, and refunded statuses at a glance" },
      { title: "Secure Processing", desc: "PCI-compliant payment handling through Stripe" },
      { title: "Financial Reports", desc: "Export payment data for accounting and tax purposes" }
    ],
    cta: "Start Accepting Payments",
    ctaLink: "/auth"
  },
  "custom-forms": {
    icon: FileText,
    title: "Custom Forms",
    subtitle: "Create personalized intake forms and questionnaires",
    gradient: "from-highlight to-[hsl(142,76%,36%)]",
    heroImage: "/orive-services.png",
    description: "Understand your participants better with customizable intake forms, waivers, and questionnaires. Access professional admin resources including preparation guides and liability waivers, all available as platform templates.",
    benefits: [
      "Customizable intake form templates",
      "Professional waiver and consent forms",
      "Pre-session questionnaires and assessments",
      "Document library with admin resources",
      "GDPR-compliant data collection"
    ],
    capabilities: [
      { title: "Form Builder", desc: "Create custom forms tailored to your practice and client needs" },
      { title: "Template Library", desc: "Access professional intake forms, waivers, and guides" },
      { title: "Document Management", desc: "Store and organize all client documents securely" },
      { title: "Consent Tracking", desc: "Automatic timestamping and storage of client consents" }
    ],
    cta: "Explore Form Templates",
    ctaLink: "/auth"
  },
  "offers-management": {
    icon: MessageCircle,
    title: "Offers Management",
    subtitle: "Showcase your workshops, retreats, and sessions",
    gradient: "from-[hsl(45,93%,47%)] to-[hsl(174,72%,36%)]",
    heroImage: "/orive-services.png",
    description: "Create beautiful listings that attract the right people. Full CRUD management for 1:1 sessions, group experiences, and events. Multi-step creation wizards and image galleries make your offerings stand out.",
    benefits: [
      "Multi-type offerings: 1:1, group, and events",
      "Rich media galleries with multiple images",
      "Detailed venue and location management",
      "Flexible pricing and capacity settings",
      "Cancellation policy configuration"
    ],
    capabilities: [
      { title: "Session Types", desc: "Create 1:1 sessions, group experiences, workshops, and retreats" },
      { title: "Visual Galleries", desc: "Upload multiple images to showcase your spaces and experiences" },
      { title: "Event Details", desc: "Set dates, times, capacity, online/offline options, and more" },
      { title: "Live Preview", desc: "See exactly how your offerings appear to potential clients" }
    ],
    cta: "Create Your First Offering",
    ctaLink: "/auth"
  },
  "workspace": {
    icon: Columns3,
    title: "Workspace",
    subtitle: "Kanban, boards, and focus from ORIVE Desktop — inside dezk",
    gradient: "from-[hsl(180,60%,32%)] to-[hsl(174,72%,45%)]",
    heroImage: "/orive-navigation.png",
    description: "The desktop workspace returns as a first-class dezk tab: plan prep and follow-ups on a Kanban board, open whiteboard boards for room and offering sketches, and track focus time. Jump straight into calendar, offerings, or seekers without leaving your flow.",
    benefits: [
      "Kanban columns for ideas, ready, live, and done",
      "Whiteboard boards for mapping sessions and offers",
      "Built-in task timer for preparation and follow-up",
      "Deep links into calendar, offerings, and seekers",
      "Local persistence so your board survives reloads"
    ],
    capabilities: [
      { title: "Kanban Flow", desc: "Move tasks across Ideas → Ready → Live → Done as the session day unfolds" },
      { title: "Boards", desc: "Open business maps and value-stream boards inspired by the original ORIVE Desktop" },
      { title: "Time Tracking", desc: "Start a timer on any task to capture prep and admin minutes" },
      { title: "Connected dezk", desc: "One click into Dates, Offerings, or Seekers from any linked task" }
    ],
    cta: "Open Workspace in dezk",
    ctaLink: "/dezk?tab=workspace"
  }
};

export default function FeatureDetail() {
  const params = (useParams<{ slug: string }>() || {}) as any; const { slug } = params;
  const feature = slug ? featuresData[slug as keyof typeof featuresData] : null;

  // Smooth scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!feature) {
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Feature not found</h1>
            <Link href="/for-facilitators" className="text-highlight hover:underline">
              Back to Features
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const Icon = feature.icon;

  return (
    <Layout>
      <motion.div 
        className="min-h-screen bg-white dark:bg-[#0a1628]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-[#0f2137] dark:to-[#0a1628] border-b border-gray-100 dark:border-[#1a3a5c] overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(0,205,172,0.08),transparent_50%)]" />
          
          <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-24">
            <Link 
              href="/for-facilitators" 
              className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Features</span>
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="w-8 h-8 text-gray-900 dark:text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-raleway">
                  {feature.title}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  {feature.subtitle}
                </p>
                <Button 
                  size="lg" 
                  className="bg-highlight hover:bg-highlight/90 text-white font-bold px-8 py-6 rounded-md shadow-[0_4px_20px_-4px_rgba(0,205,172,0.4)]"
                  asChild
                >
                  <Link href={feature.ctaLink}>
                    {feature.cta}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
              
              {/* Feature preview image */}
              <div className="relative">
                <div className="rounded-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-[#1a3a5c]">
                  <img 
                    src={feature.heroImage} 
                    alt={feature.title}
                    className="w-full h-auto"
                  />
                </div>
                {/* Decorative elements */}
                <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-lg bg-gradient-to-br ${feature.gradient} opacity-20 blur-xl`} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Description */}
          <div className="mb-16">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl">
              {feature.description}
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 font-raleway">Key Benefits</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {feature.benefits.map((benefit, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start gap-4 p-4 rounded-md bg-gray-50 dark:bg-[#0f2137] border border-gray-100 dark:border-[#1a3a5c]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-highlight flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Capabilities Grid */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 font-raleway">What You Can Do</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {feature.capabilities.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="p-6 rounded-lg bg-white dark:bg-[#0f2137] border border-gray-100 dark:border-[#1a3a5c] shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-gray-900 dark:text-white font-bold text-sm mb-4`}>
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Related features */}
          {slug === "workspace" && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-raleway">Works with</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { href: "/features/bookings-calendar", label: "Bookings & Calendar" },
                  { href: "/features/offers-management", label: "Offers Management" },
                  { href: "/features/custom-forms", label: "Custom Forms" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-md border border-gray-100 dark:border-[#1a3a5c] bg-gray-50 dark:bg-[#0f2137] px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 hover:border-highlight"
                  >
                    {item.label}
                    <ArrowRight className="w-4 h-4 text-highlight" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-[#0f2137] dark:to-[#0a1628] rounded-md p-8 lg:p-12 border border-gray-100 dark:border-[#1a3a5c] text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 font-raleway">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Join thousands of facilitators who are already using these tools to grow their practice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-highlight hover:bg-highlight/90 text-highlight-foreground font-medium px-8 rounded-md"
                asChild
              >
                <Link href={feature.ctaLink.startsWith("/") ? feature.ctaLink : "https://orive.app/auth"}>
                  {feature.ctaLink.startsWith("/dezk") ? feature.cta : "Get Started Free"}
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-200 dark:border-[#1a3a5c] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0f2137] rounded-md"
                asChild
              >
                <Link href="/for-facilitators">View All Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
