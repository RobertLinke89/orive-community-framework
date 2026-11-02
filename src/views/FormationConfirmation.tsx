"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  FileText, 
  Clock, 
  Mail,
  ExternalLink,
  Share2
} from "lucide-react";
import { toast } from "sonner";

export default function FormationConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const trackingId = searchParams.get("id") || "EU-849201";
  const companyName = searchParams.get("name") || "Your EU Enterprise";
  const amount = searchParams.get("amount") || "599";
  const tier = searchParams.get("tier") || "professional";

  const handleDownloadSummary = () => {
    toast.success("Downloading official preliminary EU formation dossier (PDF)...");
  };

  const steps = [
    {
      title: "Payment Confirmed via Stripe",
      desc: `Official receipt #REC-${trackingId} generated (€${amount}).`,
      status: "completed",
      time: "Just now"
    },
    {
      title: "eIDAS 2.0 Electronic Signature Dispatched",
      desc: "An eIDAS-qualified signature link has been sent to the managing director's email address.",
      status: "in-progress",
      time: "Within 15 minutes"
    },
    {
      title: "BRIS Commercial Register Transmission",
      desc: "Electronic filing transmitted to the interconnected European register network.",
      status: "pending",
      time: "24-48 hours"
    },
    {
      title: "EU Company Certificate (EUCC) Issued",
      desc: "Final multilingual certificate under Directive (EU) 2025/25 and tax IDs issued.",
      status: "pending",
      time: "Final step"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/70 dark:bg-[#071322] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Top Success Banner */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2 border border-emerald-500/20 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Formation Order Confirmed!
            </h1>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Your digital company formation request for <strong className="text-foreground">{companyName}</strong> has been received and verified under European company directives.
            </p>
          </div>

          {/* Reference & Dossier Card */}
          <Card className="border border-border/80 shadow-md bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-highlight/15 via-highlight/5 to-transparent px-6 py-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                  Official BRIS Tracking Reference
                </span>
                <p className="text-xl font-mono font-extrabold text-foreground">{trackingId}</p>
              </div>
              <Badge className="bg-highlight/20 text-highlight hover:bg-highlight/25 border-none px-3 py-1 font-semibold self-start sm:self-auto">
                🇪🇺 EU Inc. Fast-Track Active
              </Badge>
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-border/50 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Entity Name</span>
                  <p className="font-semibold text-foreground mt-0.5">{companyName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Regime Standard</span>
                  <p className="font-semibold text-foreground mt-0.5">Directive (EU) 2019/1151</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Amount Paid (Stripe)</span>
                  <p className="font-semibold text-foreground mt-0.5">€{amount} (Confirmed)</p>
                </div>
              </div>

              {/* Progress Tracker */}
              <div>
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-highlight" />
                  Formation & Registration Timeline
                </h3>

                <div className="space-y-4">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="flex flex-col items-center mt-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.status === "completed" 
                            ? "bg-emerald-500 text-white" 
                            : step.status === "in-progress" 
                            ? "bg-highlight text-white animate-pulse" 
                            : "bg-muted text-muted-foreground border border-border"
                        }`}>
                          {step.status === "completed" ? "✓" : idx + 1}
                        </div>
                        {idx < steps.length - 1 && (
                          <div className={`w-0.5 h-10 ${
                            step.status === "completed" ? "bg-emerald-500/40" : "bg-border"
                          }`} />
                        )}
                      </div>

                      <div className="flex-1 pb-2">
                        <div className="flex items-baseline justify-between">
                          <p className="font-semibold text-sm text-foreground">{step.title}</p>
                          <span className="text-[11px] text-muted-foreground font-mono">{step.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDownloadSummary}
                  variant="outline"
                  className="flex-1 gap-2 border-border/80 hover:bg-muted"
                >
                  <Download className="w-4 h-4" />
                  Download Preliminary Dossier (PDF)
                </Button>

                <Button
                  onClick={() => router.push("/")}
                  className="flex-1 gap-2 bg-highlight hover:bg-highlight/90 text-highlight-foreground font-semibold"
                >
                  Return to Orive Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Guarantee Footer */}
          <div className="p-4 rounded-xl bg-card border border-border/60 flex items-center gap-3 text-xs text-muted-foreground">
            <ShieldCheck className="w-5 h-5 text-highlight flex-shrink-0" />
            <p>
              Official registration confirmation under the European Business Registers Interconnection System (BRIS). For inquiries regarding your ongoing filing, cite reference <strong>{trackingId}</strong> to our legal desk at <a href="mailto:formation@orive.co" className="text-highlight underline">formation@orive.co</a>.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
}
