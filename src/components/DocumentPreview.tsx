import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { FileText, CheckCircle2, Clock, ChevronDown, Maximize2, CreditCard, ShieldCheck } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"

interface DocumentPreviewProps {
  documents: any[]
  businessName: string
  country: string
  currentStep: number
}

const documentTemplates = {
  eu: [
    { name: "EU Company Certificate (EUCC / Directive (EU) 2025/25)", status: "in-progress" },
    { name: "Standard Digital Articles of Association (Directive (EU) 2019/1151)", status: "pending" },
    { name: "Digital EU Power of Attorney (Digital EU PoA)", status: "pending" },
    { name: "BRIS Electronic Register Application & EUID Request", status: "pending" },
    { name: "UBO Beneficial Ownership Registry Declaration", status: "pending" },
  ],
  germany: [
    { name: "Articles of Association (Satzung)", status: "in-progress" },
    { name: "Shareholder List (Gesellschafterliste)", status: "pending" },
    { name: "Managing Director Appointment", status: "pending" },
    { name: "Commercial Register Application", status: "pending" },
    { name: "Tax Registration Form", status: "pending" },
  ],
  austria: [
    { name: "Gesellschaftsvertrag", status: "in-progress" },
    { name: "Shareholders Agreement", status: "pending" },
    { name: "Director Appointment Letter", status: "pending" },
    { name: "Firmenbuch Application", status: "pending" },
  ],
}

export function DocumentPreview({ documents, businessName, country, currentStep }: DocumentPreviewProps) {
  const router = useRouter()
  const templates = documentTemplates[country as keyof typeof documentTemplates] || documentTemplates.eu
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)

  const getDocumentStatus = (index: number) => {
    if (currentStep > index + 2) return "completed"
    if (currentStep >= index) return "in-progress"
    return "pending"
  }

  const renderFormContent = (docName: string) => (
    <div className="bg-white text-black p-8 space-y-6 font-serif">
      <div className="border-b-2 border-black pb-4">
        <div className="text-xs uppercase tracking-wider text-gray-600 flex items-center justify-between">
          <span>
            {country === "eu" 
              ? "EUROPEAN UNION • SINGLE MARKET CORPORATE REGISTRY" 
              : country === "germany" 
              ? "Bundesrepublik Deutschland • Handelsregister" 
              : "Republik Österreich • Firmenbuch"}
          </span>
          {country === "eu" && (
            <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-sans font-bold border border-blue-200">
              DIRECTIVE (EU) 2025/25
            </span>
          )}
        </div>
        <h3 className="text-2xl font-bold mt-2">{docName}</h3>
        <div className="text-sm text-gray-600 mt-1">
          Entity: <strong>{businessName || "Your Company Inc."}</strong>
        </div>
      </div>
      
      <div className="space-y-4 text-sm font-sans">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-600">COMPANY NAME / FIRMA</div>
            <div className="border-b border-gray-300 pb-1 font-mono text-sm">{businessName || "_________________"}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-600">EUROPEAN UNIQUE IDENTIFIER (EUID)</div>
            <div className="border-b border-gray-300 pb-1 font-mono text-sm">EU.BRIS.2025-{(businessName || "CO").slice(0, 4).toUpperCase()}-9928</div>
          </div>
        </div>

        {documents.map((doc, i) => (
          <div key={i} className="space-y-1">
            <div className="text-xs font-semibold text-gray-600">{doc.label?.toUpperCase() || `FELD ${i + 1}`}</div>
            <div className="border-b border-gray-300 pb-1">{doc.value || "_________________"}</div>
          </div>
        ))}

        <div className="pt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span>Ort, Datum</span>
            <span className="border-b border-gray-300 w-48"></span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Unterschrift</span>
            <span className="border-b border-gray-300 w-48"></span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
        Dieses Dokument wird automatisch generiert und entspricht den offiziellen Anforderungen.
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Formation Documents</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Official documents for {businessName || "Your Company"}
            </p>
          </div>
          <Button 
            onClick={() => router.push(`/formation/checkout?name=${encodeURIComponent(businessName)}&country=${encodeURIComponent(country)}&tier=professional`)}
            className="bg-highlight hover:bg-highlight/90 text-highlight-foreground font-semibold text-xs gap-1.5 shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Checkout with Stripe
          </Button>
        </div>
      </div>

      {/* Document List */}
      <ScrollArea className="flex-1 px-6 py-4">
        <Accordion type="single" collapsible className="space-y-3">
          {templates.map((doc, index) => {
            const status = getDocumentStatus(index)
            return (
              <AccordionItem key={index} value={`doc-${index}`} className="border-none">
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <AccordionTrigger className="p-4 hover:no-underline [&[data-state=open]>div>svg]:rotate-180">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-1 ${
                        status === "completed" ? "text-green-600" :
                        status === "in-progress" ? "text-primary" :
                        "text-muted-foreground"
                      }`}>
                        {status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : status === "in-progress" ? (
                          <Clock className="h-5 w-5 animate-pulse" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-sm">{doc.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          {status === "in-progress" ? "Being prepared..." : 
                           status === "completed" ? "Ready for review" : "Waiting"}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-4 pb-4">
                    <div className="mt-2 relative">
                      <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-auto">
                        {renderFormContent(doc.name)}
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3 w-full"
                          >
                            <Maximize2 className="h-4 w-4 mr-2" />
                            Vollbild anzeigen
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                          <DialogHeader>
                            <DialogTitle>{doc.name}</DialogTitle>
                          </DialogHeader>
                          {renderFormContent(doc.name)}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            )
          })}
        </Accordion>

        <Separator className="my-6" />

        {/* Document Preview Area */}
        <div className="bg-card rounded-lg p-6 border">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Documents will appear here as they are generated
            </p>
            {currentStep > 0 && (
              <div className="mt-6 text-left space-y-2 text-xs">
                <p className="font-semibold">Current Information:</p>
                {documents.map((doc, i) => (
                  <div key={i} className="text-muted-foreground">
                    • {doc.value}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
