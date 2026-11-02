"use client";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

import { ArrowLeft, CheckCircle2, Send, FileCheck, Building2, Calendar } from "lucide-react";
import { Layout } from "@/components/Layout";

export default function FormationStep3() {
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
              <Send className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Step 3: Submission & Registration
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional filing and ongoing support until your company is officially registered
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
                  <h3 className="font-semibold text-lg mb-2">Document Review & Finalization</h3>
                  <p className="text-muted-foreground">
                    Our legal team performs a comprehensive review of all generated documents. We verify accuracy, completeness, and compliance with current regulations before submission.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Official Submission</h3>
                  <p className="text-muted-foreground">
                    We submit your complete application package to the relevant authorities: Commercial Register, Tax Office, and Business Registry. All submissions are tracked with reference numbers.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Authority Communication</h3>
                  <p className="text-muted-foreground">
                    We handle all correspondence with registration authorities on your behalf. If they request additional information or clarifications, we respond promptly to prevent delays.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Registration Completion</h3>
                  <p className="text-muted-foreground">
                    Once approved, we receive your official registration certificates, tax numbers, and commercial register extract. You receive a complete package of all official documents.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Post-Registration Support</h3>
                  <p className="text-muted-foreground">
                    We guide you through initial compliance requirements: opening a business bank account, registering employees, and understanding your tax obligations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card rounded-lg border shadow-sm p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Expected Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold">Days 1-2: Document Review</h4>
                  <p className="text-sm text-muted-foreground">Legal team verification</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold">Day 3: Official Submission</h4>
                  <p className="text-sm text-muted-foreground">Filed with all relevant authorities</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold">Days 4-10: Processing Period</h4>
                  <p className="text-sm text-muted-foreground">Authority review and approval (varies by country)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold">Final Day: Certificate Delivery</h4>
                  <p className="text-sm text-muted-foreground">Complete document package sent to you</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card rounded-md border p-6 text-center">
              <FileCheck className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Expert Review</h3>
              <p className="text-sm text-muted-foreground">
                Legal team verifies all documents
              </p>
            </div>
            <div className="bg-card rounded-md border p-6 text-center">
              <Building2 className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Full Service</h3>
              <p className="text-sm text-muted-foreground">
                We handle all authority communications
              </p>
            </div>
            <div className="bg-card rounded-md border p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Complete Package</h3>
              <p className="text-sm text-muted-foreground">
                All official certificates delivered
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
              Start Your Formation
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
