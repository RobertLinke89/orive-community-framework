"use client";
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useEffect } from "react";
import { ArrowLeft, CheckCircle2, Target, Rocket, TrendingUp, Users, Lightbulb, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

const servicesData = {
  "purpose-alignment": {
    icon: Target,
    title: "Purpose Alignment",
    subtitle: "Clarify your mission and create meaningful impact",
    gradient: "from-highlight to-menu-gradient-end",
    description: "Align your offerings with your authentic purpose to create transformative experiences that resonate deeply with your clients.",
    benefits: [
      "Discover your unique facilitation style and strengths",
      "Align your services with your core values and mission",
      "Create offerings that authentically represent who you are",
      "Build a practice that feels fulfilling and sustainable",
      "Attract clients who resonate with your approach"
    ],
    process: [
      { step: "1", title: "Discovery Session", desc: "Deep dive into your background, experiences, and aspirations" },
      { step: "2", title: "Values Mapping", desc: "Identify your core values and how they translate to your work" },
      { step: "3", title: "Offering Design", desc: "Craft services that authentically express your purpose" },
      { step: "4", title: "Implementation", desc: "Launch your aligned offerings with confidence" }
    ]
  },
  "business-launch": {
    icon: Rocket,
    title: "Business Launch",
    subtitle: "Launch your facilitator practice with confidence",
    gradient: "from-success to-highlight",
    description: "From setup to your first clients, we guide you through every step of launching your wellness business.",
    benefits: [
      "Complete business setup and legal foundations",
      "Professional branding and online presence",
      "Pricing strategy that reflects your value",
      "Marketing plan to attract your first clients",
      "Systems and tools for smooth operations"
    ],
    process: [
      { step: "1", title: "Foundation", desc: "Business structure, legal requirements, and initial setup" },
      { step: "2", title: "Brand Development", desc: "Create your visual identity and messaging" },
      { step: "3", title: "Platform Setup", desc: "Build your online presence and booking system" },
      { step: "4", title: "Launch Strategy", desc: "Execute your go-to-market plan" }
    ]
  },
  "growth-acceleration": {
    icon: TrendingUp,
    title: "Growth Acceleration",
    subtitle: "Scale your impact and reach more people",
    gradient: "from-accent to-accent-glow",
    description: "Strategic growth planning tailored to facilitators who want to expand their reach without losing authenticity.",
    benefits: [
      "Scalable business models that maintain quality",
      "Revenue diversification strategies",
      "Team building and delegation frameworks",
      "Advanced marketing and visibility tactics",
      "Partnership and collaboration opportunities"
    ],
    process: [
      { step: "1", title: "Growth Audit", desc: "Analyze current performance and identify opportunities" },
      { step: "2", title: "Strategy Design", desc: "Create a customized growth roadmap" },
      { step: "3", title: "Implementation", desc: "Execute growth initiatives with support" },
      { step: "4", title: "Optimization", desc: "Measure, learn, and refine your approach" }
    ]
  },
  "community-building": {
    icon: Users,
    title: "Community Building",
    subtitle: "Foster connection and lasting relationships",
    gradient: "from-menu-gradient-start to-menu-gradient-end",
    description: "Create engaged communities around your work that support your clients and amplify your impact.",
    benefits: [
      "Build loyal client communities that refer and return",
      "Create group programs and membership offerings",
      "Foster peer support among your clients",
      "Develop community-led content and events",
      "Scale your impact through collective experiences"
    ],
    process: [
      { step: "1", title: "Community Design", desc: "Define your community's purpose and structure" },
      { step: "2", title: "Platform Selection", desc: "Choose and set up the right tools" },
      { step: "3", title: "Engagement Strategy", desc: "Create rituals and content that foster connection" },
      { step: "4", title: "Growth & Nurture", desc: "Scale while maintaining intimacy" }
    ]
  },
  "innovation-consulting": {
    icon: Lightbulb,
    title: "Innovation Consulting",
    subtitle: "Develop unique programs that stand out",
    gradient: "from-accent-glow to-cta-accent",
    description: "Innovate your offerings and stay ahead with unique programs that differentiate you in the market.",
    benefits: [
      "Develop signature methodologies and frameworks",
      "Create innovative program formats and delivery",
      "Stay ahead of industry trends and opportunities",
      "Differentiate from competitors authentically",
      "Build intellectual property and thought leadership"
    ],
    process: [
      { step: "1", title: "Innovation Audit", desc: "Assess current offerings and market positioning" },
      { step: "2", title: "Ideation Workshop", desc: "Generate and evaluate new concepts" },
      { step: "3", title: "Prototype & Test", desc: "Develop and validate new offerings" },
      { step: "4", title: "Launch & Iterate", desc: "Bring innovations to market" }
    ]
  },
  "impact-measurement": {
    icon: BarChart3,
    title: "Impact Measurement",
    subtitle: "Track and demonstrate your results",
    gradient: "from-success to-accent",
    description: "Use data to refine your approach, show real results, and build credibility with evidence-based outcomes.",
    benefits: [
      "Define meaningful metrics for your practice",
      "Implement tracking systems that don't overwhelm",
      "Create compelling case studies and testimonials",
      "Use data to improve your offerings",
      "Build credibility with evidence-based results"
    ],
    process: [
      { step: "1", title: "Metrics Design", desc: "Define what success looks like for your clients" },
      { step: "2", title: "Systems Setup", desc: "Implement simple, effective tracking tools" },
      { step: "3", title: "Data Collection", desc: "Gather insights without burdening clients" },
      { step: "4", title: "Storytelling", desc: "Transform data into compelling narratives" }
    ]
  }
};

export default function ServiceDetail() {
  const params = (useParams<{ slug: string }>() || {}) as any; const { slug } = params;
  const service = slug ? servicesData[slug as keyof typeof servicesData] : null;

  // Smooth scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!service) {
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Service not found</h1>
            <Link href="/for-facilitators" className="text-highlight hover:underline">
              Back to Services
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const Icon = service.icon;

  return (
    <Layout>
      <motion.div 
        className="min-h-screen bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <Link 
              href="/for-facilitators" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Services</span>
            </Link>

            <div className="flex items-start gap-6">
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${service.gradient} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h1>
                <p className="text-lg text-gray-600">
                  {service.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Description */}
          <div className="mb-12">
            <p className="text-lg text-gray-700 leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">What You'll Get</h2>
            <div className="space-y-4">
              {service.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-highlight flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Process */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Our Process</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {service.process.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-md p-6 border border-gray-100">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${service.gradient} flex items-center justify-center text-gray-900 dark:text-white font-bold text-sm mb-4`}>
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-8 border border-gray-100 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Schedule a free consultation to discuss how we can help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-highlight hover:bg-highlight/90 text-white font-bold px-8"
                asChild
              >
                <a href="https://orive.app/auth">Get Started Free</a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}