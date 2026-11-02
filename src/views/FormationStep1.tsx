"use client";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

import { ArrowLeft, Search, CheckCircle2, Shield, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";

export default function FormationStep1() {
  const navigate = useRouter();

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate.push("/formation")}
            className="mb-8 hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Formation
          </Button>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Step 1: Business Name Verification
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ensuring your business name is available and compliant with local regulations
            </p>
          </div>

          {/* What Happens Section */}
          <div className="bg-card rounded-lg border shadow-sm p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-semibold mb-6">What Happens in This Step</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Name Availability Check</h3>
                  <p className="text-muted-foreground">
                    We verify your chosen business name against the commercial register of your selected country. This ensures no other company is using the same or a similar name that could cause legal conflicts.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Legal Compliance Review</h3>
                  <p className="text-muted-foreground">
                    Our system checks if your name meets all legal requirements, including proper designation (GmbH, SL, etc.), character restrictions, and prohibited words that may require special permissions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Alternative Suggestions</h3>
                  <p className="text-muted-foreground">
                    If your preferred name is unavailable, we provide intelligent alternative suggestions that maintain your brand identity while ensuring availability and compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card rounded-md border p-6 text-center">
              <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Instant Results</h3>
              <p className="text-sm text-muted-foreground">
                Get immediate feedback on name availability
              </p>
            </div>
            <div className="bg-card rounded-md border p-6 text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Legal Protection</h3>
              <p className="text-sm text-muted-foreground">
                Ensure compliance with local regulations
              </p>
            </div>
            <div className="bg-card rounded-md border p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Pre-Approved</h3>
              <p className="text-sm text-muted-foreground">
                Names are pre-verified for registration
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate.push("/formation")}
              className="px-8"
            >
              Start Name Check
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
