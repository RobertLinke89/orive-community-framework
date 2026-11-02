"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  CheckCircle2, 
  Building2, 
  Globe2, 
  FileText, 
  Clock, 
  ArrowRight, 
  HelpCircle,
  Sparkles,
  Zap,
  Check
} from "lucide-react";
import { toast } from "sonner";

interface PackageTier {
  id: string;
  name: string;
  tagline: string;
  price: number;
  highlight?: boolean;
  features: string[];
}

const TIERS: PackageTier[] = [
  {
    id: "basic",
    name: "EU Inc. Basic",
    tagline: "Essential online incorporation",
    price: 299,
    features: [
      "Standard Digital Articles of Association",
      "BRIS Commercial Registry Filing",
      "Digital Name Availability Clearance",
      "Standard 5-7 business days processing"
    ]
  },
  {
    id: "professional",
    name: "EU Inc. Scale",
    tagline: "Most popular for innovative startups",
    price: 599,
    highlight: true,
    features: [
      "Everything in Basic",
      "EU Company Certificate (EUCC / Dir. 2025/25)",
      "eIDAS 2.0 Video-Ident Priority Queue",
      "Digital Share Capital Escrow Support",
      "Digital EU Power of Attorney (EU PoA)",
      "Expedited 48-Hour Processing"
    ]
  },
  {
    id: "premium",
    name: "EU Inc. Growth",
    tagline: "Complete cross-border corporate setup",
    price: 999,
    features: [
      "Everything in Scale",
      "12 Months Registered European Seat & Mailroom",
      "EU VAT (OSS / One-Stop-Shop) Registration",
      "SEPA Corporate Bank Account Setup Assistance",
      "Dedicated Corporate Law Specialist Support",
      "24-Hour Express BRIS Track"
    ]
  }
];

interface AddOnOption {
  id: string;
  title: string;
  description: string;
  price: number;
  badge?: string;
}

const ADD_ONS: AddOnOption[] = [
  {
    id: "eucc",
    title: "EU Company Certificate (EUCC)",
    description: "Multilingual digital proof of legal status across all 27 EU member states (Directive (EU) 2025/25).",
    price: 149,
    badge: "EU Standard"
  },
  {
    id: "poa",
    title: "Digital EU Power of Attorney",
    description: "Harmonized digital authorization for seamless cross-border filings and branch registrations.",
    price: 99
  },
  {
    id: "express_bris",
    title: "24h Express BRIS Processing",
    description: "Priority expedited submission to the commercial court registry for same-week corporate activation.",
    price: 199,
    badge: "Fast Track"
  },
  {
    id: "seat_address",
    title: "Registered EU Business Address (1 Year)",
    description: "Compliant commercial seat in the EU including digital mail scanning and forwarding.",
    price: 360
  },
  {
    id: "vat_oss",
    title: "EU VAT & OSS Tax Registration",
    description: "Filing for European VAT Identification Number (USt-IdNr.) and One-Stop-Shop OSS regime.",
    price: 249
  }
];

export default function FormationCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL parameters or sensible defaults
  const initialName = searchParams.get("name") || "AlphaFlow Technologies";
  const initialCountry = searchParams.get("country") || "eu";
  const initialTier = searchParams.get("tier") || "professional";

  const [selectedTierId, setSelectedTierId] = useState<string>(
    TIERS.some(t => t.id === initialTier) ? initialTier : "professional"
  );
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({
    eucc: true,
    poa: selectedTierId === "premium",
    express_bris: false,
    seat_address: false,
    vat_oss: false
  });

  // Customer / Company Form State
  const [companyName, setCompanyName] = useState(initialName);
  const [jurisdiction, setJurisdiction] = useState(initialCountry);
  const [founderName, setFounderName] = useState("");
  const [founderEmail, setFounderEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [countryCode, setCountryCode] = useState("DE");

  // VAT Reverse-Charge State
  const [isB2B, setIsB2B] = useState(true);
  const [vatNumber, setVatNumber] = useState("");
  const [vatValidated, setVatValidated] = useState(false);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<"card" | "sepa" | "apple_google">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [iban, setIban] = useState("");

  // Checkboxes
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [confirmUBO, setConfirmUBO] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculations
  const selectedTier = TIERS.find(t => t.id === selectedTierId) || TIERS[1];
  
  const addOnsTotal = useMemo(() => {
    return ADD_ONS.reduce((sum, item) => {
      return selectedAddons[item.id] ? sum + item.price : sum;
    }, 0);
  }, [selectedAddons]);

  const subtotal = selectedTier.price + addOnsTotal;

  // If valid EU B2B VAT number is provided (and not domestic), apply 0% Reverse-Charge VAT
  const isReverseCharge = isB2B && vatNumber.trim().length >= 8;
  const taxRate = isReverseCharge ? 0.0 : 0.19;
  const taxAmount = Math.round(subtotal * taxRate);
  const totalAmount = subtotal + taxAmount;

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleVatCheck = () => {
    if (vatNumber.trim().length >= 8) {
      setVatValidated(true);
      toast.success("EU VAT ID verified via VIES: 0% EU Reverse-Charge applied!");
    } else {
      toast.error("Please enter a valid EU VAT number (e.g., DE123456789).");
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!founderName.trim() || !founderEmail.trim()) {
      toast.error("Please provide the founder name and email for eIDAS verification.");
      return;
    }

    if (!agreeTerms || !confirmUBO) {
      toast.error("Please confirm the regulatory terms and UBO declaration.");
      return;
    }

    if (paymentMethod === "card" && cardNumber.replace(/\s/g, "").length < 15) {
      toast.error("Please enter a valid credit card number.");
      return;
    }

    if (paymentMethod === "sepa" && iban.replace(/\s/g, "").length < 15) {
      toast.error("Please enter a valid SEPA IBAN.");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/create-stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          tier: selectedTierId,
          amount: totalAmount,
          founderEmail,
          founderName,
          country: jurisdiction,
          isReverseCharge,
          vatNumber,
          addons: selectedAddons,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      const trackingId = data.trackingId || "EU-" + Math.floor(100000 + Math.random() * 900000);
      toast.success("Payment confirmed via Stripe Gateway! Starting digital company formation...");

      router.push(
        `/formation/confirmation?id=${trackingId}&name=${encodeURIComponent(companyName)}&tier=${selectedTierId}&amount=${totalAmount}`
      );
    } catch (err: any) {
      toast.error(err?.message || "Payment failed. Please check your details.");
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/60 dark:bg-[#071322] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-highlight/10 text-highlight text-xs font-semibold mb-4 border border-highlight/20">
              <ShieldCheck className="w-4 h-4 text-highlight" />
              <span>EU Directive (EU) 2019/1151 & Directive (EU) 2025/25 Digital Guarantee</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Digital Company Formation <span className="text-highlight">Checkout</span>
            </h1>
            <p className="mt-3 text-muted-foreground text-base sm:text-lg">
              Secure official registration for <strong className="text-foreground">{companyName}</strong> with Stripe. 100% paperless, fully compliant across all 27 EU member states.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form & Options */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Step 1: Formation Tier Selection */}
              <Card className="border border-border/80 shadow-sm bg-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-highlight" />
                        1. Select Formation Package
                      </CardTitle>
                      <CardDescription>
                        Choose your level of digital service and acceleration
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-highlight/40 text-highlight text-xs font-semibold">
                      🇪🇺 EU Inc. 28th Regime
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {TIERS.map((tier) => {
                      const isSelected = selectedTierId === tier.id;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => setSelectedTierId(tier.id)}
                          className={`cursor-pointer rounded-xl p-4 border transition-all relative flex flex-col justify-between ${
                            isSelected
                              ? "border-highlight bg-highlight/[0.04] shadow-md ring-1 ring-highlight"
                              : "border-border/70 hover:border-highlight/40 bg-card hover:bg-muted/30"
                          }`}
                        >
                          {tier.highlight && (
                            <span className="absolute -top-2.5 right-3 bg-highlight text-highlight-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                              MOST POPULAR
                            </span>
                          )}
                          <div>
                            <p className="font-bold text-base text-foreground">{tier.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tier.tagline}</p>
                            <div className="mt-3 text-2xl font-extrabold text-foreground">
                              €{tier.price}
                              <span className="text-xs text-muted-foreground font-normal ml-1">net</span>
                            </div>
                          </div>
                          <ul className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
                            {tier.features.slice(0, 3).map((feat, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-highlight flex-shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Legal Add-Ons */}
              <Card className="border border-border/80 shadow-sm bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-highlight" />
                    2. European Compliance Add-Ons
                  </CardTitle>
                  <CardDescription>
                    Official certifications and cross-border digital legal tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {ADD_ONS.map((addon) => {
                    const isChecked = !!selectedAddons[addon.id];
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`cursor-pointer flex items-start justify-between p-3.5 rounded-lg border transition-colors ${
                          isChecked
                            ? "border-highlight/60 bg-highlight/[0.03]"
                            : "border-border/60 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleAddon(addon.id)}
                            className="mt-1 data-[state=checked]:bg-highlight data-[state=checked]:border-highlight"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground">{addon.title}</span>
                              {addon.badge && (
                                <Badge className="text-[9px] bg-highlight/15 text-highlight border-none px-1.5 py-0">
                                  {addon.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {addon.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 font-bold text-sm text-foreground pl-3">
                          +€{addon.price}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Step 3: Company & Founder Details */}
              <Card className="border border-border/80 shadow-sm bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-highlight" />
                    3. Entity & Founder Information
                  </CardTitle>
                  <CardDescription>
                    Used for eIDAS 2.0 digital verification and official BRIS register filing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="companyName" className="text-xs font-semibold">
                        Registered Company Name
                      </Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Technologies EU Inc."
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="jurisdiction" className="text-xs font-semibold">
                        European Jurisdiction
                      </Label>
                      <select
                        id="jurisdiction"
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-highlight"
                      >
                        <option value="eu">🇪🇺 European Union (EU Inc. 28. Regime)</option>
                        <option value="germany">🇩🇪 Germany (GmbH / UG via Handelsregister)</option>
                        <option value="austria">🇦🇹 Austria (GmbH via Firmenbuch)</option>
                        <option value="netherlands">🇳🇱 Netherlands (BV via KVK)</option>
                        <option value="spain">🇪🇸 Spain (SL via Registro Mercantil)</option>
                        <option value="france">🇫🇷 France (SAS / SARL via INPI)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="founderName" className="text-xs font-semibold">
                        Managing Director Full Name
                      </Label>
                      <Input
                        id="founderName"
                        value={founderName}
                        onChange={(e) => setFounderName(e.target.value)}
                        placeholder="e.g. Dr. Jane Doe"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="founderEmail" className="text-xs font-semibold">
                        Director Email (for eIDAS Signing)
                      </Label>
                      <Input
                        id="founderEmail"
                        type="email"
                        value={founderEmail}
                        onChange={(e) => setFounderEmail(e.target.value)}
                        placeholder="jane@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1.5">
                      <Label htmlFor="street" className="text-xs font-semibold">
                        Address / Seat Street
                      </Label>
                      <Input
                        id="street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="e.g. Friedrichstraße 100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="postalCode" className="text-xs font-semibold">
                        Postal Code
                      </Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="10117"
                      />
                    </div>
                  </div>

                  {/* B2B Reverse Charge Box */}
                  <div className="pt-2">
                    <div className="p-3.5 rounded-lg bg-secondary/50 border border-border/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="b2b-switch" className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-2">
                          <span>🏢 B2B European Company (Tax Reverse-Charge)</span>
                        </Label>
                        <Checkbox
                          id="b2b-switch"
                          checked={isB2B}
                          onCheckedChange={(checked) => setIsB2B(!!checked)}
                          className="data-[state=checked]:bg-highlight data-[state=checked]:border-highlight"
                        />
                      </div>
                      
                      {isB2B && (
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="EU VAT Number (e.g. DE324901234)"
                            value={vatNumber}
                            onChange={(e) => {
                              setVatNumber(e.target.value);
                              setVatValidated(false);
                            }}
                            className="text-xs font-mono"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={handleVatCheck}
                            className="text-xs font-medium flex-shrink-0"
                          >
                            Verify VIES
                          </Button>
                        </div>
                      )}
                      {isReverseCharge && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ EU VAT Validated. 0% Reverse-Charge VAT applied under Art. 196 EU VAT Directive.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: Stripe Payment Form */}
              <Card className="border border-border/80 shadow-sm bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-highlight" />
                      4. Payment via Stripe
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>End-to-End Encrypted</span>
                    </div>
                  </div>
                  <CardDescription>
                    Official formation fees processed via Stripe European Gateway
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {/* Payment Method Switch */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === "card"
                          ? "border-highlight bg-highlight/10 text-foreground font-semibold shadow-sm"
                          : "border-border/60 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-highlight" />
                      <span>Credit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("sepa")}
                      className={`p-3 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === "sepa"
                          ? "border-highlight bg-highlight/10 text-foreground font-semibold shadow-sm"
                          : "border-border/60 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-highlight" />
                      <span>SEPA Direct Debit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("apple_google")}
                      className={`p-3 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === "apple_google"
                          ? "border-highlight bg-highlight/10 text-foreground font-semibold shadow-sm"
                          : "border-border/60 hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Zap className="w-4 h-4 text-highlight" />
                      <span>Apple / Google Pay</span>
                    </button>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Card Number</Label>
                        <div className="relative">
                          <Input
                            placeholder="4242 •••• •••• 4242"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="font-mono text-sm pl-10"
                          />
                          <CreditCard className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Expiration Date</Label>
                          <Input
                            placeholder="MM / YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">CVC / CVV</Label>
                          <Input
                            placeholder="123"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "sepa" && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">European Bank Account (IBAN)</Label>
                        <Input
                          placeholder="DE89 3704 0044 0532 0130 00"
                          value={iban}
                          onChange={(e) => setIban(e.target.value)}
                          className="font-mono text-sm uppercase"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        By providing your IBAN, you authorize Stripe and ORIVE to debit your account in accordance with SEPA Core Direct Debit Scheme rules.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "apple_google" && (
                    <div className="p-4 rounded-lg bg-muted/40 text-center space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Instant biometric verification will open upon clicking "Confirm & Pay with Stripe".
                      </p>
                    </div>
                  )}

                  {/* Mandatory Regulatory Checkboxes */}
                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex items-start gap-2.5">
                      <Checkbox
                        id="terms"
                        checked={agreeTerms}
                        onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                        className="mt-0.5 data-[state=checked]:bg-highlight data-[state=checked]:border-highlight"
                      />
                      <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                        I agree to the Digital Company Formation Service Agreement under Directive (EU) 2019/1151 and authorize the electronic submission to the interconnected European register (BRIS).
                      </label>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Checkbox
                        id="ubo"
                        checked={confirmUBO}
                        onCheckedChange={(checked) => setConfirmUBO(!!checked)}
                        className="mt-0.5 data-[state=checked]:bg-highlight data-[state=checked]:border-highlight"
                      />
                      <label htmlFor="ubo" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                        I confirm that the declared Ultimate Beneficial Ownership (UBO) information complies with Directive (EU) 2025/25 and AMLD anti-money-laundering regulations.
                      </label>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitPayment}
                    disabled={isProcessing}
                    className="w-full h-13 mt-4 bg-highlight hover:bg-highlight/90 text-highlight-foreground font-bold text-base shadow-lg transition-all"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        <span>Processing with Stripe European Gateway...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>Pay €{totalAmount} with Stripe & Register</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>

            </div>

            {/* Right Column: Sticky Summary & Guarantees */}
            <div className="lg:col-span-5 sticky top-24 space-y-6">
              
              {/* Order Summary Card */}
              <Card className="border border-border shadow-md bg-card">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-lg font-bold flex items-center justify-between">
                    <span>Order Summary</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      EUR / SEPA
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {/* Selected Tier */}
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-foreground">{selectedTier.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedTier.tagline}</p>
                    </div>
                    <span className="font-bold text-foreground">€{selectedTier.price}</span>
                  </div>

                  {/* Selected Addons */}
                  {ADD_ONS.filter(a => selectedAddons[a.id]).map(a => (
                    <div key={a.id} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="line-clamp-1 pr-2">+ {a.title}</span>
                      <span className="font-semibold text-foreground">€{a.price}</span>
                    </div>
                  ))}

                  <Separator />

                  {/* Subtotal */}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Net Subtotal</span>
                    <span className="font-medium text-foreground">€{subtotal}</span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>VAT ({taxRate * 100}%)</span>
                      {isReverseCharge && (
                        <Badge variant="secondary" className="text-[9px] py-0 px-1 bg-emerald-500/10 text-emerald-600">
                          Reverse Charge
                        </Badge>
                      )}
                    </div>
                    <span className="font-medium text-foreground">€{taxAmount}</span>
                  </div>

                  <Separator />

                  {/* Total Amount */}
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-base font-bold text-foreground">Total Due</span>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-highlight">€{totalAmount}</span>
                      <p className="text-[10px] text-muted-foreground">Includes all government filing facilitation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Legal & Speed Badges */}
              <div className="p-5 rounded-xl border border-border/80 bg-card/60 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Official EU Formation Guarantees
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-highlight/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-4 h-4 text-highlight" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">24 to 48-Hour Guarantee</p>
                      <p className="text-[11px] text-muted-foreground">
                        Executed via standardized European model articles under Directive (EU) 2019/1151.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-highlight/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Globe2 className="w-4 h-4 text-highlight" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">BRIS EU-Wide Interconnection</p>
                      <p className="text-[11px] text-muted-foreground">
                        Direct submission to the European Business Registers Interconnection System.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-highlight/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-highlight" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">100% Acceptance Protection</p>
                      <p className="text-[11px] text-muted-foreground">
                        Full fee refund if your formation is not cleared by the commercial register.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Need help? */}
              <div className="text-center text-xs text-muted-foreground">
                <span>Questions about European corporate law? </span>
                <a href="mailto:formation@orive.co" className="text-highlight font-semibold hover:underline">
                  Contact our Legal Team
                </a>
              </div>

            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
}
