import Link from 'next/link';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Wallet, 
  Newspaper, 
  Tags,
  ArrowRight,
  ExternalLink
} from "lucide-react";


const capabilities = [
  {
    icon: Wifi,
    title: "Universal Adaptability",
    description: "Deployable by any community, regardless of size or purpose. Built for flexibility and resilience."
  },
  {
    icon: WifiOff,
    title: "Online + Offline",
    description: "Built on bitchat for nearby peer networking via Bluetooth — no centralized infrastructure needed."
  },
  {
    icon: Wallet,
    title: "Integrated Wallet UX",
    description: "Adaptable for both fiat and crypto currencies. Seamless financial interactions within your community."
  },
  {
    icon: Newspaper,
    title: "Community News Flow",
    description: "Built-in media flow with tagging and filters that connect people based on shared values and intent."
  },
  {
    icon: Tags,
    title: "Value Matching",
    description: "Rooted in Spiral Dynamics — a science-backed framework for deeper cultural alignment and fit."
  }
];

export function CommunityFrameworkSection() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-background via-highlight/5 to-background dark:from-[#0a1628] dark:via-[#0f2137] dark:to-[#0a1628]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-highlight/10 border border-highlight/20 rounded-full backdrop-blur-sm">
            <Smartphone className="w-4 h-4 text-highlight" />
            <span className="text-highlight font-semibold text-sm tracking-wide">Community Framework 1.0.1</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 font-raleway">
            ORIVE <span className="text-highlight">Mobile App</span>
          </h2>
          
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed">
            An open and adaptable foundation designed for any community seeking on- & offline connection, 
            alignment, and resilience in a time of rapid change.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {capabilities.map((capability, index) => (
            <Card 
              key={index} 
              className="p-6 bg-gray-100 dark:bg-[#0f2137]/50 backdrop-blur border border-border/50 hover:border-highlight/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-highlight/10 flex items-center justify-center mb-4 group-hover:bg-highlight/20 transition-colors">
                <capability.icon className="w-5 h-5 text-highlight" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{capability.title}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">{capability.description}</p>
            </Card>
          ))}

          {/* Special Card - Why This Matters */}
          <Card className="p-6 bg-gradient-to-br from-highlight/10 to-transparent dark:from-highlight/5 backdrop-blur border border-highlight/20 lg:col-span-1">
            <h3 className="text-lg font-semibold text-foreground mb-3">Why This Matters</h3>
            <p className="text-sm text-foreground/70 leading-relaxed mb-4">
              We are living through unprecedented acceleration. AI is reshaping society faster than anticipated. 
              We need spaces that keep us anchored in human values and help us navigate disruption together.
            </p>
            <p className="text-xs text-foreground/50 italic">
              Your journey matters.
            </p>
          </Card>
        </div>

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            className="bg-highlight hover:bg-highlight/90 text-highlight-foreground font-semibold px-8 py-6 rounded-md"
            asChild
          >
            <Link href="/about">
              {`About ORIVE`}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-border/50 text-foreground/70 hover:text-foreground hover:border-highlight/30 font-medium px-8 py-6 rounded-md"
            asChild
          >
            <a 
              href="https://github.com/orive-community" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View on GitHub
              <ExternalLink className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
