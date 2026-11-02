"use client";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

import { ArrowLeft, FileText, Bot, Shield, Zap } from "lucide-react";
import { Layout } from "@/components/Layout";

export default function FormationStep2() {
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
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Step 2: AI-Powered Document Preparation
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automated generation of all required legal documents tailored to your jurisdiction
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
                  <h3 className="font-semibold text-lg mb-2">Interactive Information Gathering</h3>
                  <p className="text-muted-foreground">
                    Our AI agent guides you through a conversational interface to collect all necessary information. You'll provide details about shareholders, directors, share capital, business activities, and registered address.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Automated Document Generation</h3>
                  <p className="text-muted-foreground">
                    As you provide information, our system automatically generates all required documents in real-time: Articles of Association, incorporation forms, shareholder agreements, and country-specific certificates.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Real-Time Document Preview</h3>
                  <p className="text-muted-foreground">
                    View each document as it's being created in a side-by-side panel. All information is automatically formatted according to local legal requirements and templates.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Compliance Verification</h3>
                  <p className="text-muted-foreground">
                    Every document is automatically checked against current regulations to ensure full compliance with your chosen jurisdiction's requirements, including minimum capital, shareholder structure, and governance rules.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Generated */}
          <div className="bg-card rounded-lg border shadow-sm p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Documents We Generate</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Articles of Association</h4>
                  <p className="text-sm text-muted-foreground">Company structure and governance rules</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Incorporation Application</h4>
                  <p className="text-sm text-muted-foreground">Official registration forms</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Shareholder Agreements</h4>
                  <p className="text-sm text-muted-foreground">Ownership and voting rights</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Tax Registration Forms</h4>
                  <p className="text-sm text-muted-foreground">VAT and corporate tax setup</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Director Appointments</h4>
                  <p className="text-sm text-muted-foreground">Management structure documentation</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Business Registry Forms</h4>
                  <p className="text-sm text-muted-foreground">Commercial register applications</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card rounded-md border p-6 text-center">
              <Bot className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">AI-Assisted</h3>
              <p className="text-sm text-muted-foreground">
                Smart agent guides you through every question
              </p>
            </div>
            <div className="bg-card rounded-md border p-6 text-center">
              <Zap className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Real-Time Generation</h3>
              <p className="text-sm text-muted-foreground">
                Documents created as you provide information
              </p>
            </div>
            <div className="bg-card rounded-md border p-6 text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Legally Compliant</h3>
              <p className="text-sm text-muted-foreground">
                All documents meet jurisdiction requirements
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
              View Process Overview
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
