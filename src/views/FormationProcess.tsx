"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FormationChat } from "@/components/FormationChat";
import { DocumentPreview } from "@/components/DocumentPreview";
import { PublicNavbar } from "@/components/PublicNavbar";

export default function FormationProcess() {
  const searchParams = useSearchParams();
  const businessName = searchParams.get("name") || "";
  const country = searchParams.get("country") || "germany";

  const [documents, setDocuments] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const handleUpdateDocuments = (newDoc: any) => {
    setDocuments((prev) => [...prev, newDoc]);
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <PublicNavbar fixed={false} />

      <div className="border-b border-border bg-card px-6 py-2 text-sm text-muted-foreground">
        Company Formation Process
        {businessName ? ` · ${businessName}` : ""}
      </div>

      <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize={66} minSize={50}>
          <FormationChat
            businessName={businessName}
            country={country}
            onUpdateDocuments={handleUpdateDocuments}
            onStepChange={setCurrentStep}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={34} minSize={25}>
          <DocumentPreview
            documents={documents}
            businessName={businessName}
            country={country}
            currentStep={currentStep}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
