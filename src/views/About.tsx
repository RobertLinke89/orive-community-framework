import Link from 'next/link';
import { Layout } from "@/components/Layout";
import { EuropeFacilitatorMap } from "@/components/EuropeFacilitatorMap";
import { Shield, ArrowRight, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  return <Layout>
      {/* Hero Section */}
      <div className="relative min-h-[40vh] w-full flex flex-col bg-gradient-to-br from-primary via-primary/95 to-primary/80 dark:from-[#0a1628] dark:via-[#0a1628] dark:to-[#0f2137] overflow-hidden -mt-16 pt-16">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,205,172,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(22,177,195,0.1),transparent_50%)]" />
        
        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
          <div className="w-full max-w-3xl text-center flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              About <span className="bg-gradient-to-r from-[#00CDAC] to-[#16B1C3] bg-clip-text text-transparent">ORIVE</span>
            </h1>
            <p className="text-lg text-white/80 mb-2">
              Home of Freedom Lovers
            </p>
            <p className="text-xl text-[#00CDAC] font-medium">
              Join a growing worldwide movement into a new world of health
            </p>
          </div>
        </div>
      </div>
      
      <div className="py-20 bg-background dark:bg-[#0a1628]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">

          {/* Main Content */}
          <div className="space-y-8 text-base leading-relaxed">
            {/* Transformation Section */}
            <div className="border-l-2 border-highlight/30 pl-6 py-4">
              <h2 className="text-xl font-semibold text-foreground mb-3">A New Understanding of Health</h2>
              <p className="text-foreground/70 mb-3">
                We are witnessing a profound transformation in how humanity understands wellbeing. What was once seen as the absence of disease is now recognized as a vibrant state of physical, mental, emotional, and spiritual harmony. This shift represents more than a trend—it's an awakening to the interconnected nature of our existence.
              </p>
              <p className="text-foreground/70">
                Across Europe and beyond, a conscious society is emerging. People are moving beyond symptom management toward root-cause healing. They're discovering that true health flows from holistic connection—to ourselves, to each other, to nature, and to something greater than ourselves.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-foreground/70">
                This is the boom of holistic connection—a renaissance of practices once dismissed as alternative, now embraced as essential. Breathwork, meditation, plant medicine integration, somatic healing, and energy work are no longer fringe; they're becoming foundational to how conscious individuals approach life.
              </p>
              
              <p className="text-foreground/70">
                The wellness economy is projected to reach €1.2 trillion across European markets by 2027, but this number tells only part of the story. Behind these figures lies a deeper truth: millions of people are choosing to invest in their inner transformation, recognizing that outer success means little without inner peace.
              </p>

              <p className="text-foreground/70">
                ORIVE exists at the heart of this movement. We're not just building a platform—we're nurturing an ecosystem where those who facilitate healing can connect with those seeking transformation. Where conscious entrepreneurs can build businesses that serve both personal fulfillment and collective evolution.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-foreground/70">
                The old paradigm taught separation—mind from body, work from spirit, success from fulfillment. The new paradigm recognizes unity. Our physical health reflects our emotional state. Our business success mirrors our internal alignment. Our outer world manifests our inner landscape.
              </p>

              <p className="text-foreground/70">
                This transformation isn't about rejecting conventional medicine or traditional business—it's about expanding beyond their limitations. It's about integrating ancient wisdom with modern innovation. It's about building lives and businesses that honor the full spectrum of human experience.
              </p>

              <p className="text-foreground/70">
                At ORIVE, we believe that when individuals heal and align with their truth, they naturally create value for others. When entrepreneurs build from authenticity rather than formula, they create businesses that resonate and endure. This is the foundation of a conscious economy—one where prosperity and purpose dance together.
              </p>
            </div>

            {/* Center Quote */}
            <div className="py-8 my-8 border-y border-border/20">
              <p className="text-foreground text-center leading-relaxed">
                <span className="block text-sm font-normal mb-3 text-foreground/50 uppercase tracking-widest">always remember</span>
                <span className="block text-4xl md:text-5xl lg:text-6xl font-bold text-highlight tracking-tight">Your Journey Matters.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Find Your Facilitator Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 pt-12 border-t border-border/20">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="lg:col-span-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC] mb-4">
                For Seekers
              </p>
              
              <h2 className="text-3xl lg:text-4xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white mb-8">
                Find the perfect facilitator for your transformation
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-highlight/10 border border-highlight/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-highlight" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Verified Professionals</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">
                      All facilitators are verified through our rigorous screening process with credential checks and reviews.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-highlight/10 border border-highlight/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-highlight" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Secure Booking</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">
                      Book sessions with confidence. Secure payments and transparent pricing with no hidden fees.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-highlight/10 border border-highlight/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-highlight" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Smart Matching</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">
                      Our AI-powered matching connects you with facilitators aligned to your specific goals and preferences.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-highlight/10 border border-highlight/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-highlight" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Satisfaction Guaranteed</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">
                      If your first session doesn't meet expectations, we'll help you find a better match at no extra cost.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" className="mt-8" asChild>
                <Link href="/marketplace">
                  Find Facilitators <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="lg:col-span-8 -mx-2 sm:mx-0">
              <EuropeFacilitatorMap />
            </div>
          </div>
        </div>
      </div>
    </Layout>;
};
export default About;