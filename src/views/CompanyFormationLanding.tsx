"use client";

import { useRouter } from 'next/navigation';
import { useState } from "react";
import Link from "next/link";
import { 
  Check, 
  Search, 
  FileText, 
  Clock, 
  Building2, 
  ShieldCheck, 
  Send, 
  ArrowRight, 
  Sparkles, 
  Scale, 
  Landmark, 
  Lock, 
  Award, 
  Zap, 
  CreditCard, 
  ChevronRight,
  Globe2,
  FileCheck2,
  CheckCircle2,
  BadgeCheck,
  Star,
  Calendar,
  Briefcase,
  TrendingUp,
  Shield,
  HelpCircle,
  Users,
  Rocket,
  Percent,
  CircleDollarSign,
  type LucideIcon
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/hooks/useLanguage";

function BrandMark({
  src,
  className = "h-4 w-4",
}: {
  src: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

const FORMATION_PARTNERS = [
  { name: "Qonto", logo: "/partners/qonto.svg" },
  { name: "Revolut Business", logo: "/partners/revolut.svg" },
  { name: "Wise Business", logo: "/partners/wise.svg" },
  { name: "Deutsche Bank", logo: "/partners/deutschebank.svg" },
  { name: "Stripe Payments", logo: "/partners/stripe.svg" },
] as const;

const HERO_TRUST_BADGES = [
  {
    labelDe: "eIDAS 2.0",
    labelEn: "eIDAS 2.0",
    logo: "/partners/eidas.svg",
    tipDe: "Rechtssichere Video-Identifikation und digitale Notarbeglaubigung nach eIDAS 2.0.",
    tipEn: "Legally binding video identification and digital notarization under eIDAS 2.0.",
  },
  {
    labelDe: "EU BRIS",
    labelEn: "EU BRIS",
    logo: "/partners/europeanunion.svg",
    tipDe: "Kopplung an das europäische Unternehmensregister BRIS inkl. EUID.",
    tipEn: "Connected to the European Business Registers Interconnection System (BRIS) with EUID.",
  },
  {
    labelDe: "ISO 27001",
    labelEn: "ISO 27001",
    logo: "/partners/iso27001.svg",
    tipDe: "Informationssicherheit nach ISO 27001 – DSGVO-konforme Datenverarbeitung.",
    tipEn: "Information security aligned with ISO 27001 — GDPR-compliant data handling.",
  },
  {
    labelDe: "Abnahmegarantie",
    labelEn: "Acceptance guarantee",
    logo: "/partners/guarantee.svg",
    tipDe: "100 % Genehmigungsgarantie — bei Ablehnung Geld zurück.",
    tipEn: "100% approval guarantee — money back if the filing is rejected.",
  },
] as const;

function JurisdictionCriterion({
  icon: Icon,
  label,
  value,
  tip,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tip: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 text-left rounded-md px-2 py-1.5 w-full hover:bg-[#F7F7F7] dark:hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00CDAC]/50"
        >
          <Icon
            className="w-3.5 h-3.5 text-[#017F80] dark:text-[#00CDAC] shrink-0"
            strokeWidth={1.5}
          />
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] uppercase tracking-[0.14em] font-semibold text-slate-400 leading-none">
              {label}
            </span>
            <span className="block text-xs font-semibold text-[#01223F] dark:text-white truncate mt-0.5">
              {value}
            </span>
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
        <p className="font-semibold mb-0.5">{label}</p>
        <p className="text-muted-foreground">{tip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

const countryAustria = "/countries/austria.jpg";
const countryCyprus = "/countries/cyprus.jpg";
const countryGermany = "/countries/germany.jpg";
const countrySpain = "/countries/spain.jpg";
const countryFrance = "/countries/france.jpg";
const countryItaly = "/countries/italy.jpg";
const countryNetherlands = "/countries/netherlands.jpg";
const countryPoland = "/countries/poland.jpg";
const countryPortugal = "/countries/portugal.jpg";

interface CountryItem {
  code: string;
  nameDe: string;
  nameEn: string;
  flag: string;
  image: string;
  legalForm: string;
  /** Short card label */
  taxShort: string;
  capitalShort: string;
  timeShort: string;
  bestForShortDe: string;
  bestForShortEn: string;
  highlightShortDe: string;
  highlightShortEn: string;
  /** Full detail for tooltips */
  taxRate: string;
  minCapital: string;
  processTime: string;
  highlightDe: string;
  highlightEn: string;
  bestForDe: string;
  bestForEn: string;
  documents: string[];
}

const countries: CountryItem[] = [
  {
    code: "EU",
    nameDe: "EU Inc. (28. Regime)",
    nameEn: "EU Inc. (28th Regime)",
    flag: "🇪🇺",
    image: countryGermany,
    legalForm: "EU Cross-Border Entity",
    taxShort: "Lokal / PE",
    capitalShort: "ab 1 €",
    timeShort: "24–48 Std.",
    bestForShortDe: "EU-weit digital",
    bestForShortEn: "EU digital",
    highlightShortDe: "eIDAS 2.0",
    highlightShortEn: "eIDAS 2.0",
    taxRate: "Harmonisiert / Lokale Betriebsstätte",
    minCapital: "ab 1 €",
    processTime: "24–48 Stunden (100% digital)",
    highlightDe: "EU-weite Niederlassungsfreiheit & eIDAS 2.0 Legitimation",
    highlightEn: "EU-wide freedom of establishment & eIDAS 2.0 digital cert",
    bestForDe: "Digitale Dienstleister, Facilitators, grenzüberschreitende Coaches",
    bestForEn: "Digital service providers, facilitators, cross-border coaches",
    documents: [
      "EU Company Certificate (EUCC / Richtlinie (EU) 2025/25)",
      "Standard-Digitalsatzung (Richtlinie (EU) 2019/1151)",
      "Digitale EU-Gründungsvollmacht (Digital EU PoA)",
      "BRIS-Registerkopplung & Europäische Kennung (EUID)",
      "UBO-Transparenzregisterzertifikat"
    ]
  },
  {
    code: "DE",
    nameDe: "Deutschland",
    nameEn: "Germany",
    flag: "🇩🇪",
    image: countryGermany,
    legalForm: "GmbH oder UG (haftungsbeschränkt)",
    taxShort: "ca. 28–30%",
    capitalShort: "1 € / 12.500 €",
    timeShort: "5–8 Tage",
    bestForShortDe: "DACH & Enterprise",
    bestForShortEn: "DACH & enterprise",
    highlightShortDe: "Bonität",
    highlightShortEn: "Credibility",
    taxRate: "15% KSt + GewSt (eff. ca. 28–30%)",
    minCapital: "1 € (UG) / 12.500 € (GmbH Teilerbringung)",
    processTime: "5–8 Werktage",
    highlightDe: "Höchste internationale Bonität & Marktreputation",
    highlightEn: "Highest international credibility & market trust",
    bestForDe: "Unternehmen mit Fokus auf den DACH-Raum & institutionelle Partner",
    bestForEn: "Businesses targeting the DACH region & enterprise clients",
    documents: [
      "Handelsregisterauszug (Amtsgericht)",
      "Notarielle Gründungsurkunde & Gesellschaftervertrag",
      "Gesellschafterliste & UBO-Eintragung",
      "Steuerliche Erfassung & USt-IdNr.",
      "Gewerbeanmeldung"
    ]
  },
  {
    code: "AT",
    nameDe: "Österreich",
    nameEn: "Austria",
    flag: "🇦🇹",
    image: countryAustria,
    legalForm: "GmbH (FlexKapG-ready)",
    taxShort: "23%",
    capitalShort: "5.000 €",
    timeShort: "5–7 Tage",
    bestForShortDe: "AT Facilitators",
    bestForShortEn: "AT facilitators",
    highlightShortDe: "Banken-Hub",
    highlightShortEn: "Banking hub",
    taxRate: "23% Körperschaftsteuer",
    minCapital: "5.000 € (Gründungsprivileg) / 10.000 €",
    processTime: "5–7 Werktage",
    highlightDe: "Erstklassige Bankeninfrastruktur & zentraleuropäischer Hub",
    highlightEn: "First-class banking infrastructure & Central European hub",
    bestForDe: "Österreichische Facilitators, Therapeuten & Studios",
    bestForEn: "Austrian facilitators, therapists, and studio practices",
    documents: [
      "Firmenbuchauszug (Landesgericht)",
      "Errichtungserklärung / Gesellschaftsvertrag",
      "Musterzeichnung & Gesellschafterbeschluss",
      "Finanzamts-Steuernummer & UID-Nummer",
      "Gewerbeberechtigungsnachweis"
    ]
  },
  {
    code: "CY",
    nameDe: "Zypern",
    nameEn: "Cyprus",
    flag: "🇨🇾",
    image: countryCyprus,
    legalForm: "Private Limited Company (Ltd.)",
    taxShort: "12,5%",
    capitalShort: "ab 1.000 €",
    timeShort: "3–5 Tage",
    bestForShortDe: "Online & IP",
    bestForShortEn: "Online & IP",
    highlightShortDe: "Steueroptimiert",
    highlightShortEn: "Tax-optimized",
    taxRate: "12,5% KSt (eine der niedrigsten der EU)",
    minCapital: "ab 1.000 € (empfohlen)",
    processTime: "3–5 Werktage",
    highlightDe: "EU-konforme Steueroptimierung & Non-Dom-Vorteile",
    highlightEn: "EU-compliant tax optimization & non-dom benefits",
    bestForDe: "Internationale Online-Akademien, IP-Assets & Remote-Services",
    bestForEn: "International online academies, IP holding & remote services",
    documents: [
      "Certificate of Incorporation (Registrar of Companies)",
      "Memorandum & Articles of Association",
      "Certificate of Directors, Secretary & Registered Office",
      "Tax Identification Code (TIC) & VAT Number",
      "Share Certificates"
    ]
  },
  {
    code: "ES",
    nameDe: "Spanien",
    nameEn: "Spain",
    flag: "🇪🇸",
    image: countrySpain,
    legalForm: "Sociedad Limitada (S.L.)",
    taxShort: "15% Startup",
    capitalShort: "ab 1 €",
    timeShort: "5–7 Tage",
    bestForShortDe: "Retreats & Südeu.",
    bestForShortEn: "Retreats & South EU",
    highlightShortDe: "Startup-Gesetz",
    highlightShortEn: "Startup Law",
    taxRate: "15% für neue Startups (reg. 25%)",
    minCapital: "ab 1 € (Ley Crea y Crece)",
    processTime: "5–7 Werktage",
    highlightDe: "Startup-Gesetz & Digital Nomad Visum Kompatibilität",
    highlightEn: "Startup Law benefits & Digital Nomad Visa synergy",
    bestForDe: "Retreat-Veranstalter, Lifestyle-Unternehmer & Coaches in Südeuropa",
    bestForEn: "Retreat organizers, lifestyle entrepreneurs & southern EU practices",
    documents: [
      "Escritura Pública de Constitución",
      "Certificado del Registro Mercantil Central",
      "Número de Identificación Fiscal (NIF/CIF)",
      "Estatutos Sociales",
      "Certificado de Titularidad Real"
    ]
  },
  {
    code: "PT",
    nameDe: "Portugal",
    nameEn: "Portugal",
    flag: "🇵🇹",
    image: countryPortugal,
    legalForm: "Sociedade por Quotas (Lda.)",
    taxShort: "17% KMU",
    capitalShort: "ab 1 €",
    timeShort: "4–6 Tage",
    bestForShortDe: "Wellness & Expats",
    bestForShortEn: "Wellness & expats",
    highlightShortDe: "Tech & D2",
    highlightShortEn: "Tech & D2",
    taxRate: "17% für KMU bis 50k € (reg. 21%)",
    minCapital: "ab 1 € pro Geschäftsanteil",
    processTime: "4–6 Werktage",
    highlightDe: "Innovationsfreundlich, Tech-Ökosystem & D2-Visum",
    highlightEn: "Innovation-friendly, tech hub & D2 entrepreneur visa",
    bestForDe: "Workshops, Wellness-Communities & europäische Expats",
    bestForEn: "Workshops, wellness communities & European expats",
    documents: [
      "Certidão Permanente da Empresa",
      "Pacto Social & Certificado de Admissibilidade",
      "Número de Identificação Fiscal de Pessoa Coletiva (NIPC)",
      "Registo Central do Beneficiário Efetivo (RCBE)",
      "Declaração de Início de Atividade"
    ]
  },
  {
    code: "NL",
    nameDe: "Niederlande",
    nameEn: "Netherlands",
    flag: "🇳🇱",
    image: countryNetherlands,
    legalForm: "Besloten Vennootschap (B.V.)",
    taxShort: "19% / 25,8%",
    capitalShort: "ab 0,01 €",
    timeShort: "3–5 Tage",
    bestForShortDe: "Tech & Holding",
    bestForShortEn: "Tech & holding",
    highlightShortDe: "Holding & IP",
    highlightShortEn: "Holding & IP",
    taxRate: "19% bis 200k € Gewinn (reg. 25,8%)",
    minCapital: "ab 0,01 € (Flex-B.V.)",
    processTime: "3–5 Werktage",
    highlightDe: "Weltklasse Holding-Struktur & Innovationsbox",
    highlightEn: "World-class holding structures & IP innovation box",
    bestForDe: "Technologie-Startups, Lizenzierungs-Entities & Holdings",
    bestForEn: "Tech startups, licensing entities & international holdings",
    documents: [
      "KVK Uittreksel (Handelskammer-Auszug)",
      "Notariële Oprichtingsakte (Notary Deed)",
      "Statuten van de Vennootschap",
      "RSIN & Btw-identificatienummer",
      "UBO-Registerverklaring"
    ]
  }
];

type LifecycleTab = "start" | "comply" | "grow";

/** 5 women + 4 men — facilitator formation testimonials for hero marquee */
const formationHeroReviews = [
  {
    name: "Elena V.",
    company: "Mindful Leadership EU Inc.",
    avatar: "/avatars/seeker-01.jpg",
    quoteDe:
      "Als Facilitatorin mit Klienten in ganz Europa war die Gründung über ORIVE unkompliziert und sofort steuerlich einsatzbereit.",
    quoteEn:
      "As a facilitator with clients across Europe, incorporating via ORIVE was smooth and ready to bill from day one.",
  },
  {
    name: "Marcus H.",
    company: "Nordlicht Coaching GmbH",
    avatar: "/avatars/seeker-05.jpg",
    quoteDe:
      "Namensprüfung, Notar und Register — alles digital. Meine GmbH war in unter einer Woche einsatzbereit.",
    quoteEn:
      "Name check, notary and register — all digital. My company was ready in under a week.",
  },
  {
    name: "Mei C.",
    company: "Stillpoint Sessions B.V.",
    avatar: "/avatars/seeker-08.jpg",
    quoteDe:
      "ORIVE hat mir die Gründung abgenommen, damit ich mich auf Sessions konzentrieren kann — transparent und schlüsselfertig.",
    quoteEn:
      "ORIVE handled incorporation so I could stay focused on sessions — transparent and turnkey.",
  },
  {
    name: "David M.",
    company: "Pathfinder Retreats Ltd.",
    avatar: "/avatars/seeker-07.jpg",
    quoteDe:
      "Klare Festpreise, eIDAS-Notar und fertige Zertifikate im Safe. Genau so muss digitale Gründung aussehen.",
    quoteEn:
      "Clear fixed pricing, eIDAS notary and certificates in the vault. This is how digital formation should work.",
  },
  {
    name: "Victoria C.",
    company: "Leadership Circle UG",
    avatar: "/avatars/seeker-06.jpg",
    quoteDe:
      "Von der ersten Satzung bis zur USt-IdNr. begleitet — ich konnte direkt mit Klienten abrechnen.",
    quoteEn:
      "Guided from first articles to VAT ID — I could invoice clients immediately.",
  },
  {
    name: "Thomas S.",
    company: "Atemraum Studio GmbH",
    avatar: "/avatars/seeker-02.jpg",
    quoteDe:
      "Von der Namensprüfung bis zum Registereintrag alles digital. In wenigen Tagen war meine Praxis rechtssicher gegründet.",
    quoteEn:
      "From name check to register filing — all digital. My practice was legally set up within days.",
  },
  {
    name: "Sofia R.",
    company: "Casa Soma S.L.",
    avatar: "/avatars/seeker-04.jpg",
    quoteDe:
      "Als Praxis in Spanien brauchte ich eine schlanke S.L. ORIVE hat Kosten und Dauer klar gemacht — ohne Kanzlei-Chaos.",
    quoteEn:
      "As a practice in Spain I needed a lean S.L. ORIVE made cost and timeline clear — without law-firm chaos.",
  },
  {
    name: "Jan L.",
    company: "Baltic Breath Ltd.",
    avatar: "/facilitators/facilitator-2.jpg",
    quoteDe:
      "Dokumentensafe mit Registerauszug und UBO-Zertifikat — Banken und Partner akzeptieren alles ohne Nachfragen.",
    quoteEn:
      "Document vault with register extract and UBO certificate — banks and partners accept everything without follow-ups.",
  },
  {
    name: "Amara K.",
    company: "Open Circle EU Inc.",
    avatar: "/avatars/seeker-03.jpg",
    quoteDe:
      "EU-weite Facilitator-Arbeit, eine Rechtsform. Die Gründung fühlte sich an wie ein Registeramt — nur digital und menschlich.",
    quoteEn:
      "EU-wide facilitator work, one legal entity. Formation felt like a registry — only digital and human.",
  },
] as const;

export default function CompanyFormationLanding() {
  const router = useRouter();
  const { language, copy } = useLanguage();
  const isDe = language === "de";

  const [businessName, setBusinessName] = useState("");
  const [activeCompassTab, setActiveCompassTab] = useState("all");
  const [activeLifecycleTab, setActiveLifecycleTab] = useState<LifecycleTab>("start");

  const lifecycleSteps: {
    id: LifecycleTab;
    icon: typeof Rocket;
    label: string;
    points: { icon: typeof FileText; title: string; body: string }[];
  }[] = [
    {
      id: "start",
      icon: Rocket,
      label: copy("01. Starten (Gründung)", "01. Start (Incorporation)"),
      points: [
        {
          icon: FileText,
          title: copy("Automatisierte Satzungen", "Compliant Articles"),
          body: copy("Rechtssichere Gründungsverträge, Gesellschafterbeschlüsse und Musterzeichnungen – fachanwaltlich geprüft nach geltendem EU- und Landesrecht.", "Legally compliant Articles of Association, shareholder resolutions, and specimen signatures generated automatically."),
        },
        {
          icon: Scale,
          title: copy("eIDAS 2.0 Video-Notar", "eIDAS 2.0 Digital Notary"),
          body: copy("Notartermin bequem per Videokonferenz von zu Hause aus. Kein physischer Notartermin, keine Botschaftsreisen, keine Apostillen-Odyssee.", "Legally binding notarization via video identification from anywhere in the world with zero consulate or travel hurdles."),
        },
        {
          icon: Landmark,
          title: copy("Registereintragung & HRB", "Commercial Court Filing"),
          body: copy("Direkte elektronische Einreichung beim zuständigen Amtsgericht mit BRIS-Europakennung (EUID) und Bereitstellung im Dokumentensafe.", "Direct electronic court filing, official HRB company extract delivery, and synchronized European BRIS registration."),
        },
      ],
    },
    {
      id: "comply",
      icon: ShieldCheck,
      label: copy("02. Absichern (Worry-Free Compliance)", "02. Comply (Worry-Free Compliance)"),
      points: [
        {
          icon: Calendar,
          title: copy("Automatischer Fristen-Radar", "Statutory Deadline Tracker"),
          body: copy("Verpassen Sie nie wieder Pflichten beim Registergericht oder Bundesanzeiger. Unser Fristen-Radar alarmiert Sie rechtzeitig vor jeder Einreichung.", "Never miss an annual filing or statutory commercial court deadline. Automated alerts keep your entity in 100% Good Standing."),
        },
        {
          icon: ShieldCheck,
          title: copy("Transparenzregister & UBO", "Transparency Register & UBO"),
          body: copy("Gesetzlich vorgeschriebene Meldungen der wirtschaftlich Berechtigten werden laufend überwacht und rechtssicher hinterlegt – bußgeldsicher.", "Mandatory Ultimate Beneficial Owner (UBO) filings continuously audited and submitted in compliance with EU anti-money laundering law."),
        },
        {
          icon: Award,
          title: copy("2 Satzungsänderungen / Jahr", "2 Free Annual Amendments"),
          body: copy("Geschäftsführerwechsel, Sitzverlegungen oder Gesellschafterwechsel ohne teure Kanzleirechnung vorbereiten und beglaubigen lassen.", "Update corporate officers, registered address, or share allocations without expensive legal consultation invoices."),
        },
      ],
    },
    {
      id: "grow",
      icon: TrendingUp,
      label: copy("03. Wachsen (Banking & Scale)", "03. Grow (Banking & Scale)"),
      points: [
        {
          icon: CreditCard,
          title: copy("Sofort-Geschäftskonto", "Instant Business Banking"),
          body: copy("Bevorzugte Express-Kontoeröffnung mit SEPA-IBAN bei Partnern wie Qonto, Revolut Business und Wise – für sofortige Zahlungsfähigkeit.", "Direct expedited onboarding with leading business banking partners to get your SEPA IBAN ready immediately."),
        },
        {
          icon: Building2,
          title: copy("Virtuelles Büro & Registered Agent", "Registered Office & Virtual Agent"),
          body: copy("Zustellungsfähige repräsentative Geschäftsadresse in europäischen Wirtschaftszentren mit digitaler Postweiterleitung.", "Official legal domicile in European business hubs with automated digital mail scanning and forwarding."),
        },
        {
          icon: Zap,
          title: copy("Steuer-Onboarding & USt-IdNr.", "Tax Registration & VAT ID"),
          body: copy("Steuerliche Erfassung beim Finanzamt und schnelle Zuteilung der europäischen USt-IdNr. für grenzüberschreitenden B2B-Handel.", "Fast-track corporate tax registration and European VAT ID issuance to bill global clients with zero delay."),
        },
      ],
    },
  ];

  const handleCheckAvailability = (overrideCountry?: string) => {
    const params = new URLSearchParams();
    if (businessName.trim()) params.set("name", businessName.trim());
    if (overrideCountry) params.set("country", overrideCountry);
    params.set("tier", "professional");
    router.push(`/formation/check?${params.toString()}`);
  };

  const filteredCountries = countries.filter(c => {
    if (activeCompassTab === "all") return true;
    if (activeCompassTab === "dach") return c.code === "DE" || c.code === "AT";
    if (activeCompassTab === "digital") return c.code === "EU" || c.code === "NL";
    if (activeCompassTab === "tax") return c.code === "CY" || c.code === "PT" || c.code === "ES";
    return true;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-[#01223F] text-foreground relative overflow-hidden selection:bg-[#00CDAC]/20 selection:text-[#00CDAC]">
        
        {/* =========================================================================
            1. HERO — institutional company formation
        ========================================================================= */}
        <section className="relative border-b border-slate-200/80 dark:border-white/10 bg-white dark:bg-transparent overflow-hidden">
          {/* Soft studio atmosphere — peeks through the dark wash */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden dark:block"
            style={{
              backgroundImage: "url(/formation-section-bg.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "saturate(0.85) brightness(0.7)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden dark:block"
            style={{ backgroundColor: "rgba(1, 34, 63, 0.88)" }}
          />
          <div className="relative z-10 max-w-[1180px] mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">
              {copy("Digitale Gesellschaftsgründung · EU", "Digital company formation · EU")}
            </p>

            {/* Trust badges with logos */}
            <div
              aria-label={copy("Vertrauenssignale", "Trust signals")}
              className="mt-6 flex flex-wrap items-center gap-2"
            >
              {HERO_TRUST_BADGES.map((badge) => {
                const label = isDe ? badge.labelDe : badge.labelEn;
                const tip = isDe ? badge.tipDe : badge.tipEn;
                return (
                  <Tooltip key={badge.labelEn}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-200/80 dark:border-white/10 bg-[#F7F7F7] dark:bg-[#02182B] px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.04em] text-[#01223F] dark:text-white hover:border-slate-300 dark:hover:border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00CDAC]/50"
                      >
                        <BrandMark src={badge.logo} className="h-3.5 w-3.5 text-[#017F80] dark:text-[#00CDAC]" />
                        <span>{label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[240px] text-xs leading-relaxed">
                      {tip}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            <div className="mt-14 sm:mt-16 grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] gap-10 lg:gap-12 items-start">
              <div className="min-w-0">
                <h1 className="max-w-[18ch] text-[2.35rem] sm:text-5xl lg:text-[3.25rem] font-semibold tracking-[-0.035em] leading-[1.08] text-[#01223F] dark:text-white">
                  {copy(
                    "Digitale Firmengründung in Europa.",
                    "Digital company formation in Europe."
                  )}
                  <span className="block mt-2 text-[#01223F]/55 dark:text-white/55 font-medium text-[1.35rem] sm:text-2xl lg:text-[1.75rem] tracking-[-0.02em] leading-snug">
                    {copy(
                      "Rechtssicher, transparent und schlüsselfertig.",
                      "Legally sound, transparent, and turnkey."
                    )}
                  </span>
                </h1>

                <p className="mt-6 max-w-[36rem] text-[16px] sm:text-[17px] leading-[1.7] text-slate-600 dark:text-slate-300">
                  {copy(
                    "Haftungsbeschränkte Gesellschaften in zehn europäischen Jurisdiktionen. Vollständig digital, notariell legitimiert — inklusive Firmenkonto, Steuernummer und Registereintrag.",
                    "Limited liability entities across ten European jurisdictions. Fully digital and notarially legitimised — including business account, tax number and register entry."
                  )}
                </p>

                <div className="mt-20 w-full max-w-xl border border-slate-200 dark:border-white/15 bg-[#F7F7F7] dark:bg-[#02182B] p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
                    <div className="relative flex-1 min-w-0">
                      <Input
                        type="text"
                        placeholder={copy(
                          "Firmenname (z. B. Orive Health GmbH)",
                          "Company name (e.g. Orive Health GmbH)"
                        )}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCheckAvailability()}
                        className="h-12 px-4 bg-white dark:bg-[#011424] border-slate-200 dark:border-white/15 text-[#01223F] dark:text-white placeholder:text-slate-400 text-sm rounded-md focus-visible:ring-1 focus-visible:ring-[#017F80] focus-visible:border-[#017F80] w-full"
                      />
                    </div>

                    <Button
                      onClick={() => handleCheckAvailability()}
                      className="w-full sm:w-auto shrink-0 h-12 px-5 rounded-md bg-[#01223F] hover:bg-[#017F80] dark:bg-white dark:text-[#01223F] dark:hover:bg-[#00CDAC] text-white text-sm font-semibold whitespace-nowrap transition-colors flex items-center justify-center gap-2"
                    >
                      <span>{copy("Verfügbarkeit prüfen", "Check availability")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="mt-6 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-[#01223F] dark:text-white">4.9 / 5.0</span>
                  <span className="mx-2 text-slate-300 dark:text-white/20">·</span>
                  {copy("Über 1.400 erfolgreiche Gründungen", "Over 1,400 successful formations")}
                  <span className="mx-2 text-slate-300 dark:text-white/20">·</span>
                  {copy("100 % Genehmigungsgarantie", "100% approval guarantee")}
                </p>

                {/* Partner trust logos */}
                <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/10">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-3">
                    {copy("Banking & Payments Partner", "Banking & payments partners")}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    {FORMATION_PARTNERS.map((partner) => (
                      <div
                        key={partner.name}
                        className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300"
                        title={partner.name}
                      >
                        <BrandMark
                          src={partner.logo}
                          className="h-4 w-4 text-[#01223F] dark:text-white"
                        />
                        <span className="hidden sm:inline">{partner.name.split(" ")[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside
                className="relative pt-2 h-[28rem] sm:h-[32rem] lg:h-[36rem] overflow-hidden"
                aria-label={copy("Facilitator-Stimmen", "Facilitator reviews")}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-12 z-20 bg-gradient-to-b from-white dark:from-[#011424] to-transparent"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-12 z-20 bg-gradient-to-t from-white dark:from-[#011424] to-transparent"
                  aria-hidden
                />
                <div className="formation-review-marquee">
                  {[0, 1].map((dup) => (
                    <ul
                      key={dup}
                      className="flex flex-col gap-7 sm:gap-8 pb-7 sm:pb-8"
                      aria-hidden={dup === 1 || undefined}
                    >
                      {formationHeroReviews.map((review) => (
                        <li key={`${dup}-${review.name}`}>
                          <article className="rounded-2xl bg-white dark:bg-[#02182B] border border-slate-200/90 dark:border-white/10 shadow-[0_8px_24px_-12px_rgba(1,34,63,0.18)] px-4 sm:px-5 py-4 flex flex-col justify-center">
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-0.5" aria-hidden>
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-3 h-3 fill-[#00CDAC] text-[#00CDAC]"
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                5.0 {copy("Bewertung", "rating")}
                              </span>
                            </div>
                            <p className="mt-2 text-[13px] leading-snug text-[#01223F] dark:text-slate-200">
                              {copy(review.quoteDe, review.quoteEn)}
                            </p>
                            <div className="mt-2.5 flex items-center gap-2.5">
                              <img
                                src={review.avatar}
                                alt=""
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200/80 dark:ring-white/10 shrink-0"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-[#017F80] dark:text-[#00CDAC]">
                                  {review.name}
                                </p>
                                <p className="text-[11px] text-[#017F80]/80 dark:text-[#00CDAC]/80 truncate">
                                  {review.company}
                                </p>
                              </div>
                            </div>
                          </article>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. TRUST METRICS
        ========================================================================= */}
        <section className="relative py-10 sm:py-12 bg-[#F7F7F7] dark:bg-[#02182B] border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
              <div className="border-l border-[#017F80]/40 dark:border-[#00CDAC]/40 pl-4">
                <dt className="text-[1.65rem] sm:text-[1.85rem] font-semibold tracking-tight text-[#01223F] dark:text-white leading-none">
                  99,6%
                </dt>
                <dd className="mt-2 text-sm font-medium text-[#01223F] dark:text-white">
                  {copy("Register-Zulassung", "Register approval")}
                </dd>
                <dd className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                  {copy("beim ersten Einreichen", "on first submission")}
                </dd>
              </div>

              <div className="border-l border-[#017F80]/40 dark:border-[#00CDAC]/40 pl-4">
                <dt className="text-[1.65rem] sm:text-[1.85rem] font-semibold tracking-tight text-[#01223F] dark:text-white leading-none">
                  24–48h
                </dt>
                <dd className="mt-2 text-sm font-medium text-[#01223F] dark:text-white">
                  {copy("Express-Gründung", "Express formation")}
                </dd>
                <dd className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                  {copy("in digitalen EU-Zonen", "in digital EU zones")}
                </dd>
              </div>

              <div className="border-l border-[#017F80]/40 dark:border-[#00CDAC]/40 pl-4">
                <dt className="text-[1.65rem] sm:text-[1.85rem] font-semibold tracking-tight text-[#01223F] dark:text-white leading-none">
                  1.200+
                </dt>
                <dd className="mt-2 text-sm font-medium text-[#01223F] dark:text-white">
                  {copy("Gegründete Entities", "Formed entities")}
                </dd>
                <dd className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                  {copy("in 10 EU-Ländern", "across 10 EU countries")}
                </dd>
              </div>

              <div className="border-l border-[#017F80]/40 dark:border-[#00CDAC]/40 pl-4">
                <dt className="text-[1.65rem] sm:text-[1.85rem] font-semibold tracking-tight text-[#01223F] dark:text-white leading-none">
                  100%
                </dt>
                <dd className="mt-2 text-sm font-medium text-[#01223F] dark:text-white">
                  {copy("Rechtssicherheits-Garantie", "Legal guarantee")}
                </dd>
                <dd className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                  {copy("Geld zurück bei Ablehnung", "Money back if rejected")}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* =========================================================================
            3. LIFECYCLE — Start, Comply, Grow (full-bleed photo background)
        ========================================================================= */}
        <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#011424] min-h-[40rem] sm:min-h-[44rem]">
          {/*
            Photo anchored to the right half so face/framing stay stable while the
            section height changes. Navy + CSS gradients stay vector-sharp.
          */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[62%] lg:w-[58%] select-none"
            aria-hidden
          >
            <picture>
              <source srcSet="/formation-section-bg.webp" type="image/webp" />
              <img
                src="/formation-section-bg.jpg"
                alt=""
                width={1800}
                height={2400}
                sizes="(min-width: 1024px) 58vw, (min-width: 640px) 62vw, 100vw"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-[62%_18%] sm:object-[58%_14%] lg:object-[55%_12%]"
              />
            </picture>
            {/* Soft left edge so the photo dissolves into navy as width scales */}
            <div className="absolute inset-y-0 left-0 w-[42%] bg-[linear-gradient(90deg,#011424_0%,rgba(1,20,36,0.88)_38%,rgba(1,20,36,0.35)_72%,transparent_100%)]" />
          </div>
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,20,36,0.28)_0%,transparent_30%,transparent_70%,rgba(1,20,36,0.5)_100%)]"
            aria-hidden
          />

          <div className="relative max-w-[1120px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <div className="max-w-xl lg:max-w-[34rem]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00CDAC]">
                {copy("Ganzheitliche Begleitung", "End-to-End Business Platform")}
              </p>
              <h2 className="mt-4 max-w-[18ch] text-3xl sm:text-[2.75rem] font-semibold tracking-[-0.03em] leading-[1.08] text-white">
                {copy("Starten. Absichern. Wachsen.", "Start, Comply, and Grow Your Business")}
              </h2>
              <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-white/70">
                {copy(
                  "ORIVE begleitet die Gesellschaft über den Notartermin hinaus – von der Satzung über laufende Registerpflichten bis zu Banking und Skalierung.",
                  "ORIVE supports the company beyond notarization — from articles through ongoing filings to banking and scale."
                )}
              </p>

              <ol className="mt-10 border-t border-white/15">
                {lifecycleSteps.map((step, index) => {
                  const open = activeLifecycleTab === step.id;
                  const num = String(index + 1).padStart(2, "0");
                  return (
                    <li
                      key={step.id}
                      className={`border-b border-white/15 transition-colors ${
                        open ? "bg-white/[0.06] backdrop-blur-[2px]" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveLifecycleTab(step.id)}
                        aria-expanded={open}
                        className="flex w-full items-center gap-4 text-left py-5 px-1 sm:px-2 group"
                      >
                        <span
                          className={`font-mono text-[13px] tabular-nums shrink-0 w-8 transition-colors ${
                            open ? "text-[#00CDAC]" : "text-white/40"
                          }`}
                        >
                          {num}
                        </span>
                        <span
                          className={`flex-1 text-[15px] sm:text-base font-semibold tracking-tight transition-colors ${
                            open
                              ? "text-white"
                              : "text-white/65 group-hover:text-white"
                          }`}
                        >
                          {step.label.replace(/^\d+\.\s*/, "")}
                        </span>
                        <step.icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            open ? "text-[#00CDAC]" : "text-white/40"
                          }`}
                          strokeWidth={1.5}
                        />
                      </button>

                      {open && (
                        <div className="pb-6 pl-9 sm:pl-10 pr-1 sm:pr-2 space-y-0 border-l border-[#00CDAC]/40 ml-2 sm:ml-3">
                          {step.points.map((point) => (
                            <div
                              key={point.title}
                              className="grid grid-cols-[1.75rem_1fr] gap-x-3 gap-y-1 py-4 first:pt-0 border-b border-white/10 last:border-0"
                            >
                              <point.icon
                                className="w-4 h-4 mt-0.5 text-white/45"
                                strokeWidth={1.5}
                              />
                              <div>
                                <h3 className="text-sm font-semibold text-white">
                                  {point.title}
                                </h3>
                                <p className="mt-1 text-[13px] leading-relaxed text-white/60">
                                  {point.body}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. DOCUMENT BUILDING BLOCKS
        ========================================================================= */}
        <section className="relative py-16 sm:py-24 border-y border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#011424]">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">
              {copy("Dokumenten-Bausteine", "Document building blocks")}
            </p>
            <h2 className="mt-4 max-w-[22ch] text-3xl sm:text-[2.5rem] font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {copy(
                "Was der Gründer erhält.",
                "What the founder receives."
              )}
            </h2>

            <ul className="mt-10 grid sm:grid-cols-2 gap-3">
              {[
                {
                  icon: Landmark,
                  titleDe: "Handelsregisterauszug",
                  titleEn: "Commercial register extract",
                  metaDe: "HRB · Amtsgericht",
                  metaEn: "HRB · Commercial court",
                  badgeDe: "Zertifikat",
                  badgeEn: "Certificate",
                },
                {
                  icon: Scale,
                  titleDe: "Notarielle Gründungsurkunde",
                  titleEn: "Notarial deed of incorporation",
                  metaDe: "eIDAS 2.0 · Video-Notar",
                  metaEn: "eIDAS 2.0 · Video notary",
                  badgeDe: "Urkunde",
                  badgeEn: "Deed",
                },
                {
                  icon: FileText,
                  titleDe: "Gesellschaftsvertrag / Satzung",
                  titleEn: "Articles of association",
                  metaDe: "Fachanwaltlich geprüft",
                  metaEn: "Counsel-reviewed",
                  badgeDe: "Vertrag",
                  badgeEn: "Contract",
                },
                {
                  icon: Users,
                  titleDe: "Gesellschafterliste & Musterzeichnung",
                  titleEn: "Shareholder list & specimen signature",
                  metaDe: "Registergericht-konform",
                  metaEn: "Court-compliant",
                  badgeDe: "Liste",
                  badgeEn: "Register",
                },
                {
                  icon: ShieldCheck,
                  titleDe: "UBO-Transparenzregister",
                  titleEn: "UBO transparency register",
                  metaDe: "GwG / AML-Bescheinigung",
                  metaEn: "AML certificate",
                  badgeDe: "Zertifikat",
                  badgeEn: "Certificate",
                },
                {
                  icon: FileCheck2,
                  titleDe: "Steuerliche Erfassung",
                  titleEn: "Tax registration certificate",
                  metaDe: "Finanzamt · Steuernummer",
                  metaEn: "Tax office · Tax ID",
                  badgeDe: "Bescheid",
                  badgeEn: "Notice",
                },
                {
                  icon: Globe2,
                  titleDe: "USt-IdNr. / EU VAT",
                  titleEn: "VAT ID / EU VAT",
                  metaDe: "Grenzüberschreitender B2B-Handel",
                  metaEn: "Cross-border B2B trade",
                  badgeDe: "Zertifikat",
                  badgeEn: "Certificate",
                },
                {
                  icon: CreditCard,
                  titleDe: "Geschäftskonto-Bestätigung",
                  titleEn: "Business account confirmation",
                  metaDe: "SEPA-IBAN · Partnerbank",
                  metaEn: "SEPA IBAN · Partner bank",
                  badgeDe: "Nachweis",
                  badgeEn: "Proof",
                },
              ].map((doc) => (
                <li
                  key={doc.titleEn}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/15 bg-[#F7F7F7] dark:bg-[#02182B]"
                >
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-[#017F80] dark:text-[#00CDAC] flex items-center justify-center shrink-0">
                    <doc.icon className="w-4.5 h-4.5 w-[1.125rem] h-[1.125rem]" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#01223F] dark:text-white truncate">
                      {copy(doc.titleDe, doc.titleEn)}
                    </p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate">
                      {copy(doc.metaDe, doc.metaEn)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#017F80] dark:text-[#00CDAC] shrink-0">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {copy(doc.badgeDe, doc.badgeEn)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* =========================================================================
            5. INTERACTIVE JURISDICTION COMPASS (COUNTRY COMPARATOR)
        ========================================================================= */}
        <section className="relative py-16 sm:py-24 bg-[#F7F7F7] dark:bg-[#02182B] border-y border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">
              {copy("Jurisdiktions-Kompass", "Jurisdiction Compass")}
            </p>
            <h2 className="mt-4 max-w-[28ch] text-3xl sm:text-[2.5rem] font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {copy("Welches Land passt zu deinem Geschäftsmodell?", "Choose the Optimal European Jurisdiction")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              {copy(
                "Steuer, Kapital, Dauer, Zielgruppe — Stichworte zum Vergleich. Details per Hover.",
                "Tax, capital, timeline, fit — keywords to compare. Hover for details."
              )}
            </p>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 mt-10 mb-10 border-b border-slate-200/80 dark:border-white/10">
              {[
                { id: "all", labelDe: "Alle Länder", labelEn: "All Jurisdictions" },
                { id: "digital", labelDe: "Digital & EU-Weit (EU Inc. / B.V.)", labelEn: "Digital & Cross-Border" },
                { id: "dach", labelDe: "DACH-Raum (Deutschland & Österreich)", labelEn: "DACH Region (DE / AT)" },
                { id: "tax", labelDe: "Steueroptimiert (Zypern, Portugal, Spanien)", labelEn: "Tax-Optimized (CY, PT, ES)" },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCompassTab(tab.id)}
                  className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px ${
                    activeCompassTab === tab.id
                      ? "border-[#01223F] text-[#01223F] dark:border-white dark:text-white"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-[#01223F] dark:hover:text-white"
                  }`}
                >
                  {isDe ? tab.labelDe : tab.labelEn}
                </button>
              ))}
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredCountries.map(country => (
                <div
                  key={country.code}
                  className="bg-white dark:bg-[#011424] border border-slate-200/80 dark:border-white/10 rounded-md overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Image with Flag */}
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={country.image}
                        alt={country.nameDe}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xl leading-none">{country.flag}</span>
                            <h3 className="text-base font-semibold text-white tracking-[-0.02em] truncate">
                              {isDe ? country.nameDe : country.nameEn}
                            </h3>
                          </div>
                          <p className="text-[11px] text-white/70 mt-0.5 truncate">
                            {country.legalForm}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#00CDAC] shrink-0">
                          {country.processTime.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Selection criteria — short labels; details in tooltips */}
                    <div className="px-2.5 pt-2.5 pb-1">
                      <div className="grid grid-cols-2 gap-0">
                        <JurisdictionCriterion
                          icon={Percent}
                          label={copy("Steuer", "Tax")}
                          value={country.taxShort}
                          tip={country.taxRate}
                        />
                        <JurisdictionCriterion
                          icon={CircleDollarSign}
                          label={copy("Kapital", "Capital")}
                          value={country.capitalShort}
                          tip={country.minCapital}
                        />
                        <JurisdictionCriterion
                          icon={Clock}
                          label={copy("Dauer", "Time")}
                          value={country.timeShort}
                          tip={country.processTime}
                        />
                        <JurisdictionCriterion
                          icon={Users}
                          label={copy("Ideal für", "Best for")}
                          value={isDe ? country.bestForShortDe : country.bestForShortEn}
                          tip={isDe ? country.bestForDe : country.bestForEn}
                        />
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="mt-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-[#F7F7F7] dark:hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00CDAC]/50"
                          >
                            <Sparkles
                              className="w-3.5 h-3.5 text-[#017F80] dark:text-[#00CDAC] shrink-0"
                              strokeWidth={1.5}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[9px] uppercase tracking-[0.14em] font-semibold text-slate-400 leading-none">
                                {copy("Vorteil", "Edge")}
                              </span>
                              <span className="block text-xs font-semibold text-[#01223F] dark:text-white truncate mt-0.5">
                                {isDe ? country.highlightShortDe : country.highlightShortEn}
                              </span>
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
                          <p className="font-semibold mb-0.5">{copy("Besonderer Vorteil", "Key advantage")}</p>
                          <p className="text-muted-foreground">
                            {isDe ? country.highlightDe : country.highlightEn}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* CTA Footer */}
                  <div className="px-4 pb-4 pt-1">
                    <Button
                      onClick={() => handleCheckAvailability(country.code)}
                      className="w-full h-10 rounded-md bg-[#01223F] hover:bg-[#017F80] dark:bg-white dark:text-[#01223F] dark:hover:bg-[#00CDAC] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <span>{copy("Diese Jurisdiktion wählen", "Select this Jurisdiction")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. THE 4-STEP REGULATED FORMATION JOURNEY
        ========================================================================= */}
        <section className="relative py-16 sm:py-24 bg-white dark:bg-[#011424] border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">
              {copy("Strukturierter Ablauf", "Formation Roadmap")}
            </p>
            <h2 className="mt-4 max-w-[28ch] text-3xl sm:text-[2.5rem] font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {copy("In 4 Schritten zur eingetragenen Gesellschaft", "4 Steps to Your Registered Company")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              {copy("Transparenter, nachvollziehbarer Ablauf mit ständiger Einsicht in den Bearbeitungsstatus in Ihrem Gründungs-Dashboard.", "Transparent, certified legal workflow with real-time tracking in your corporate formation dashboard.")}
            </p>

            <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="relative p-5 sm:p-6 rounded-md bg-[#F7F7F7] dark:bg-[#02182B] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-semibold tracking-tight text-[#017F80] dark:text-[#00CDAC]">01</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#017F80] dark:text-[#00CDAC]">Sofort</span>
                  </div>
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-[#01223F] dark:text-white mb-2">
                    {copy("Namensprüfung & Freigabe", "Name Verification")}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {copy("Echtzeit-Abgleich Ihres Firmennamens gegen europäische Handelsregister (BRIS) und EUIPO-Markenverzeichnisse zur Vermeidung von Registerblockaden.", "Real-time check against European commercial registers and trademark databases to guarantee acceptance.")}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center gap-1.5 text-xs font-semibold text-[#017F80] dark:text-[#00CDAC]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{copy("Kostenlos vorab", "Free Pre-Check")}</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative p-5 sm:p-6 rounded-md bg-[#F7F7F7] dark:bg-[#02182B] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-semibold tracking-tight text-[#017F80] dark:text-[#00CDAC]">02</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#017F80] dark:text-[#00CDAC]">15–30 Min</span>
                  </div>
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-[#01223F] dark:text-white mb-2">
                    {copy("Digitale Urkundenerstellung", "Document Generation")}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {copy("Automatisierte Generierung von Gesellschaftsvertrag, Gesellschafterliste, UBO-Transparenzerklärung und Musterzeichnungen nach EU-Standard.", "Automated generation of Articles of Association, Shareholder Register, and UBO declarations aligned with EU law.")}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center gap-1.5 text-xs font-semibold text-[#017F80] dark:text-[#00CDAC]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{copy("Rechtlich zertifiziert", "Legally Certified")}</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative p-5 sm:p-6 rounded-md bg-[#F7F7F7] dark:bg-[#02182B] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-semibold tracking-tight text-[#017F80] dark:text-[#00CDAC]">03</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#017F80] dark:text-[#00CDAC]">1–3 Tage</span>
                  </div>
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-[#01223F] dark:text-white mb-2">
                    {copy("Notarielle Beglaubigung", "Notary & Filing")}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {copy("Rechtssichere eIDAS-Videoidentifikation oder Einreichung via digitaler notarieller Gründungsvollmacht direkt beim zuständigen Registergericht.", "eIDAS 2.0 digital verification and direct registration filing with the authorized European court.")}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center gap-1.5 text-xs font-semibold text-[#017F80] dark:text-[#00CDAC]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{copy("Keine Anreise nötig", "Zero Physical Travel")}</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative p-5 sm:p-6 rounded-md bg-[#F7F7F7] dark:bg-[#02182B] border border-slate-200/80 dark:border-white/10 border-l-2 border-l-[#01223F] dark:border-l-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-semibold tracking-tight text-[#017F80] dark:text-[#00CDAC]">04</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#01223F] dark:text-white">Startklar</span>
                  </div>
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-[#01223F] dark:text-white mb-2">
                    {copy("Konto, Steuernummer & Go", "Bank Account & Go")}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {copy("Aushändigung der amtlichen Registerauszüge, Bereitstellung des europäischen Geschäftskontos (IBAN) und Beantragung der Steuernummer (USt-IdNr.).", "Official commercial extract delivery, European business IBAN setup, and VAT registration ready to bill clients.")}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center gap-1.5 text-xs font-semibold text-[#017F80] dark:text-[#00CDAC]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{copy("Schlüsselfertig", "Turnkey Ready")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. BANKING & FINTECH ECOSYSTEM (INSTANT READINESS)
        ========================================================================= */}
        <section className="relative py-12 sm:py-14 bg-[#F7F7F7] dark:bg-[#02182B] border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 mb-8">
              {copy("Vollständige finanzielle Geschäftsfähigkeit ab Tag 1 mit unseren Partnern", "Instant Banking Readiness with Leading Financial Partners")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-12">
              {FORMATION_PARTNERS.map((partner) => (
                <div
                  key={partner.name}
                  className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#01223F] dark:text-white"
                >
                  <BrandMark
                    src={partner.logo}
                    className="h-5 w-5 text-[#01223F] dark:text-white"
                  />
                  <span>{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. ZENBUSINESS SOCIAL PROOF: REAL FOUNDER EXPERIENCES & REVIEWS
        ========================================================================= */}
        <section className="relative py-16 sm:py-24 bg-white dark:bg-[#011424] border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">
              {copy("Erfolgsgeschichten", "Customer Testimonials")}
            </p>
            <h2 className="mt-4 max-w-[28ch] text-3xl sm:text-[2.5rem] font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {copy("Von Gründern für Gründer empfohlen", "Trusted by over 1,400+ European Founders")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              {copy("Echte Erfahrungen von Unternehmern, Facilitators und Tech-Gründern, die den ORIVE Digitalstandard nutzen.", "Hear how real entrepreneurs, facilitators, and digital leaders incorporated effortlessly with ORIVE.")}
            </p>

            <div className="mt-12 grid md:grid-cols-3 gap-4 sm:gap-5">
              {/* Review 1 */}
              <div className="p-5 sm:p-6 rounded-md bg-[#F7F7F7] dark:bg-[#02182B] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-4" aria-hidden>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#00CDAC] text-[#00CDAC]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {copy("„In 48 Stunden von der Satzung zur eingetragenen GmbH – ohne jemals ein Notariat betreten zu haben. Die Vorab-Freigabe des Geschäftskontos bei Qonto war ein absoluter Gamechanger für uns.“", "“From drafting articles to a fully registered GmbH in 48 hours without visiting a physical notary. The instant bank account setup was an absolute gamechanger.”")}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-[#01223F] dark:text-white text-xs sm:text-sm">Dr. Julian Bergmann</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">BioMed Systems GmbH · Berlin</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#017F80] dark:text-[#00CDAC] shrink-0">
                    🇩🇪 GmbH
                  </span>
                </div>
              </div>

              {/* Review 2 */}
              <div className="p-5 sm:p-6 rounded-md bg-[#F7F7F7] dark:bg-[#02182B] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-4" aria-hidden>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#00CDAC] text-[#00CDAC]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {copy("„Als Online-Facilitator und Coach arbeite ich mit Klienten in ganz Europa. Die EU Inc. über ORIVE einzurichten war unkompliziert, transparent und sofort steuerlich einsatzbereit.“", "“As an online facilitator working across Europe, setting up an EU Inc. via ORIVE was smooth, fully transparent, and ready to bill clients immediately.”")}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-[#01223F] dark:text-white text-xs sm:text-sm">Elena Vasquez</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Mindful Leadership EU Inc. · Wien</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#017F80] dark:text-[#00CDAC] shrink-0">
                    🇪🇺 EU Inc.
                  </span>
                </div>
              </div>

              {/* Review 3 */}
              <div className="p-5 sm:p-6 rounded-md bg-[#F7F7F7] dark:bg-[#02182B] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-4" aria-hidden>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#00CDAC] text-[#00CDAC]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {copy("„Die Worry-Free Compliance ist unbezahlbar. Das Transparenzregister und die jährlichen Registerpflichten laufen im Hintergrund auf Autopilot. Keine Bußgeldangst mehr.“", "“The Worry-Free Compliance service is priceless. Annual filings and transparency register updates run on autopilot in the background. Pure peace of mind.”")}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-[#01223F] dark:text-white text-xs sm:text-sm">Janis Lindner</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Nordic Commerce Ltd. · Hamburg</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#017F80] dark:text-[#00CDAC] shrink-0">
                    🇨🇾 Private Ltd.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. EXECUTIVE PRICING & PACKAGES TABLE
        ========================================================================= */}
        <section className="relative py-16 sm:py-24 bg-[#F7F7F7] dark:bg-[#02182B] border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">
              {copy("Transparente Festpreise", "Transparent Fixed Pricing")}
            </p>
            <h2 className="mt-4 max-w-[28ch] text-3xl sm:text-[2.5rem] font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
              {copy("Wählen Sie Ihr Gründungspaket", "Choose Your Incorporation Package")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              {copy("Alle Pakete beinhalten rechtssichere Gründungsdokumente, Notarkorrespondenz und 24/7 Dokumentenzugriff.", "All packages include compliant articles, notary synchronization, and 24/7 access to your corporate vault.")}
            </p>

            {/* Mobile Cards View (< md) */}
            <div className="grid grid-cols-1 gap-4 mt-12 md:hidden mb-8">
              {/* Basic */}
              <div className="bg-white dark:bg-[#011424] border border-slate-200/80 dark:border-white/10 rounded-md p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Basic</span>
                  <span className="text-xs text-slate-400">7–10 Werktage</span>
                </div>
                <div className="text-3xl font-semibold tracking-tight text-[#01223F] dark:text-white">€299</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">einmalig zzgl. amtl. Registergebühren</p>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00CDAC]" /> <span>Digitale Satzungserstellung</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00CDAC]" /> <span>Handelsregister-Einreichung</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00CDAC]" /> <span>Zugang zum Dokumentensafe</span></li>
                  <li className="flex items-center gap-2 text-slate-400"><Check className="w-4 h-4 text-slate-300" /> <span>Worry-Free Compliance zubuchbar</span></li>
                </ul>
                <Button 
                  onClick={() => router.push("/formation/checkout?tier=basic")} 
                  variant="outline" 
                  className="w-full h-11 text-xs font-semibold rounded-md border-slate-200 dark:border-white/15"
                >
                  Start Basic (€299)
                </Button>
              </div>

              {/* Professional (Highlighted) */}
              <div className="relative bg-white dark:bg-[#011424] border border-slate-200/80 dark:border-white/10 border-l-2 border-l-[#01223F] dark:border-l-white rounded-md p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#017F80] dark:text-[#00CDAC] mb-3">
                  {copy("Beliebteste Wahl · Empfohlen", "Most Popular Choice")}
                </p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#01223F] dark:text-white">Professional</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">5–7 Werktage</span>
                </div>
                <div className="text-3xl font-semibold tracking-tight text-[#01223F] dark:text-white">€599</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Schlüsselfertige Gründung inklusive Steuern</p>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00CDAC]" /> <span>Alles aus Basic</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00CDAC]" /> <span>Steuerliche Erfassung & USt-IdNr.</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00CDAC]" /> <span>Geschäftskonto-Setup (SEPA-IBAN)</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00CDAC]" /> <span>1h Rechts- & Strukturberatung</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00CDAC]" /> <span>UBO-Transparenzregister-Eintragung</span></li>
                  <li className="flex items-center gap-2 font-semibold text-[#01223F] dark:text-white"><ShieldCheck className="w-4 h-4 text-[#00CDAC]" /> <span>Inkl. 1 Jahr Worry-Free Compliance™</span></li>
                </ul>
                <Button 
                  onClick={() => router.push("/formation/checkout?tier=professional")} 
                  className="w-full h-11 rounded-md bg-[#01223F] hover:bg-[#017F80] dark:bg-white dark:text-[#01223F] dark:hover:bg-[#00CDAC] text-white font-semibold text-xs transition-colors"
                >
                  Start Professional (€599)
                </Button>
              </div>

              {/* Premium */}
              <div className="bg-white dark:bg-[#011424] border border-slate-200/80 dark:border-white/10 rounded-md p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Premium</span>
                  <span className="text-xs text-slate-400">3–5 Werktage Express</span>
                </div>
                <div className="text-3xl font-semibold tracking-tight text-[#01223F] dark:text-white">€999</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Express-Verarbeitung & Concierge Support</p>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00CDAC]" /> <span>Alles aus Professional</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00CDAC]" /> <span>Express-Registereinreichung</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00CDAC]" /> <span>3h persönliche Expertenberatung</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00CDAC]" /> <span>Buchhaltungssoftware-Anbindung</span></li>
                  <li className="flex items-center gap-2 font-semibold text-[#01223F] dark:text-white"><ShieldCheck className="w-4 h-4 text-[#00CDAC]" /> <span>Inkl. 1 Jahr Worry-Free Compliance™</span></li>
                </ul>
                <Button 
                  onClick={() => router.push("/formation/checkout?tier=premium")} 
                  variant="outline" 
                  className="w-full h-11 text-xs font-semibold rounded-md border-slate-200 dark:border-white/15"
                >
                  Start Premium (€999)
                </Button>
              </div>
            </div>

            {/* Desktop Full Feature Matrix (hidden on mobile < md) */}
            <div className="hidden md:block mt-12 bg-white dark:bg-[#011424] border border-slate-200/80 dark:border-white/10 rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-white/10 bg-[#F7F7F7]/80 dark:bg-[#02182B]/60">
                      <th className="p-6 font-semibold text-[#01223F] dark:text-white text-sm">Leistungsumfang</th>
                      <th className="p-6 text-center">
                        <span className="block font-semibold text-[#01223F] dark:text-white">Basic</span>
                        <span className="text-2xl font-semibold tracking-tight text-[#01223F] dark:text-white mt-1 block">€299</span>
                        <span className="text-[11px] text-slate-400">7–10 Werktage</span>
                      </th>
                      <th className="p-6 text-center border-x border-slate-200/80 dark:border-white/10 bg-[#F7F7F7] dark:bg-[#02182B] border-t-2 border-t-[#01223F] dark:border-t-white">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#017F80] dark:text-[#00CDAC] mb-1">
                          {copy("Beliebteste Wahl", "Most Popular")}
                        </span>
                        <span className="block font-semibold text-[#01223F] dark:text-white">Professional</span>
                        <span className="text-2xl font-semibold tracking-tight text-[#01223F] dark:text-white mt-1 block">€599</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">5–7 Werktage</span>
                      </th>
                      <th className="p-6 text-center">
                        <span className="block font-semibold text-[#01223F] dark:text-white">Premium</span>
                        <span className="text-2xl font-semibold tracking-tight text-[#01223F] dark:text-white mt-1 block">€999</span>
                        <span className="text-[11px] text-slate-400">3–5 Werktage Express</span>
                      </th>
                      <th className="p-6 text-center">
                        <span className="block font-semibold text-[#01223F] dark:text-white">Enterprise</span>
                        <span className="text-2xl font-semibold tracking-tight text-[#01223F] dark:text-white mt-1 block">Individuell</span>
                        <span className="text-[11px] text-slate-400">Multi-Entity & Holding</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs sm:text-sm">
                    <tr>
                      <td className="p-4 pl-6 font-medium text-[#01223F] dark:text-white">Fachanwaltliche Mustersatzung & Urkunden</td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                      <td className="p-4 text-center bg-[#F7F7F7]/60 dark:bg-[#02182B]/40 border-x border-slate-200/60 dark:border-white/10"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 pl-6 font-medium text-[#01223F] dark:text-white">Digitale Handelsregister-Einreichung</td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                      <td className="p-4 text-center bg-[#F7F7F7]/60 dark:bg-[#02182B]/40 border-x border-slate-200/60 dark:border-white/10"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 pl-6 font-medium text-[#01223F] dark:text-white">Steuernummer & USt-IdNr. Beantragung</td>
                      <td className="p-4 text-center text-slate-300 dark:text-slate-600">—</td>
                      <td className="p-4 text-center bg-[#F7F7F7]/60 dark:bg-[#02182B]/40 border-x border-slate-200/60 dark:border-white/10"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 pl-6 font-medium text-[#01223F] dark:text-white">Geschäftskonto-Setup (SEPA / IBAN)</td>
                      <td className="p-4 text-center text-slate-300 dark:text-slate-600">—</td>
                      <td className="p-4 text-center bg-[#F7F7F7]/60 dark:bg-[#02182B]/40 border-x border-slate-200/60 dark:border-white/10"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 pl-6 font-medium text-[#01223F] dark:text-white">
                        <span className="flex items-center gap-1.5 font-semibold text-[#01223F] dark:text-white">
                          <ShieldCheck className="w-4 h-4 text-[#00CDAC]" />
                          ORIVE Worry-Free Compliance™ (1 Jahr)
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-400 text-xs">Option (€149/J.)</td>
                      <td className="p-4 text-center bg-[#F7F7F7]/60 dark:bg-[#02182B]/40 border-x border-slate-200/60 dark:border-white/10 font-semibold text-[#01223F] dark:text-white">Inklusive</td>
                      <td className="p-4 text-center font-semibold text-[#01223F] dark:text-white">Inklusive</td>
                      <td className="p-4 text-center font-semibold text-[#01223F] dark:text-white">Dauerhaft</td>
                    </tr>
                    <tr>
                      <td className="p-4 pl-6 font-medium text-[#01223F] dark:text-white">Persönliche Rechts- & Strukturberatung</td>
                      <td className="p-4 text-center text-slate-300 dark:text-slate-600">—</td>
                      <td className="p-4 text-center bg-[#F7F7F7]/60 dark:bg-[#02182B]/40 border-x border-slate-200/60 dark:border-white/10 font-semibold text-[#01223F] dark:text-white">1 Stunde</td>
                      <td className="p-4 text-center font-semibold text-[#01223F] dark:text-white">3 Stunden</td>
                      <td className="p-4 text-center font-semibold text-[#01223F] dark:text-white">Unbegrenzt</td>
                    </tr>
                    <tr>
                      <td className="p-4 pl-6 font-medium text-[#01223F] dark:text-white">Transparenzregister (UBO) Anmeldung</td>
                      <td className="p-4 text-center text-slate-300 dark:text-slate-600">—</td>
                      <td className="p-4 text-center bg-[#F7F7F7]/60 dark:bg-[#02182B]/40 border-x border-slate-200/60 dark:border-white/10"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 pl-6 font-medium text-[#01223F] dark:text-white">Express-Prioritätsbehandlung</td>
                      <td className="p-4 text-center text-slate-300 dark:text-slate-600">—</td>
                      <td className="p-4 text-center bg-[#F7F7F7]/60 dark:bg-[#02182B]/40 border-x border-slate-200/60 dark:border-white/10 text-slate-300 dark:text-slate-600">—</td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 pl-6 font-medium text-[#01223F] dark:text-white">Dedizierter Betreuer & Holding-Struktur</td>
                      <td className="p-4 text-center text-slate-300 dark:text-slate-600">—</td>
                      <td className="p-4 text-center bg-[#F7F7F7]/60 dark:bg-[#02182B]/40 border-x border-slate-200/60 dark:border-white/10 text-slate-300 dark:text-slate-600">—</td>
                      <td className="p-4 text-center text-slate-300 dark:text-slate-600">—</td>
                      <td className="p-4 text-center"><Check className="w-4 h-4 text-[#00CDAC] mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            10. COMPREHENSIVE EXPERT LEGAL FAQ
        ========================================================================= */}
        <section className="relative py-16 sm:py-24 bg-white dark:bg-[#011424] border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#017F80] dark:text-[#00CDAC]">
                {copy("Häufige Rechts- & Gründungsfragen", "Frequently Asked Questions")}
              </p>
              <h2 className="mt-4 mx-auto max-w-[28ch] text-3xl sm:text-[2.5rem] font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
                {copy("Wichtige Fragen zur digitalen Gründung", "Corporate Formation Knowledge Base")}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                {copy("Kompakte, fachanwaltlich verifizierte Antworten auf Ihre Gründungsfragen.", "Clear, compliant answers to standard corporate and tax questions.")}
              </p>
            </div>

            <Accordion type="single" collapsible className="mt-12 max-w-3xl mx-auto space-y-2">
              <AccordionItem value="faq-1" className="border-0 rounded-md px-5 bg-[#F7F7F7] dark:bg-[#02182B]">
                <AccordionTrigger className="hover:no-underline py-4 text-left font-semibold tracking-[-0.01em] text-[#01223F] dark:text-white text-sm sm:text-base">
                  {copy("Wie funktioniert die notarielle Beglaubigung 100% digital ohne physische Anreise?", "How does the notarization work 100% online without physical travel?")}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {copy("Gemäß der europäischen Digitalisierungsrichtlinie (EU) 2019/1151 und den nationalen Umsetzungsgesetzen (wie dem deutschen DiRUG) können Gesellschaften vollständig im Online-Verfahren gegründet werden. Die Identitätsprüfung erfolgt rechtssicher über ein eIDAS-zertifiziertes Video-Ident-Verfahren. Alternativ erstellen wir eine digitale notarielle Gründungsvollmacht, sodass unser Notariatspartner die Eintragung für Sie vollzieht.", "Pursuant to Directive (EU) 2019/1151 on digital company formation, entities can be formed completely online. Identity verification is performed via eIDAS-qualified trust services and video identification, eliminating the need for physical notary appointments.")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="border-0 rounded-md px-5 bg-[#F7F7F7] dark:bg-[#02182B]">
                <AccordionTrigger className="hover:no-underline py-4 text-left font-semibold tracking-[-0.01em] text-[#01223F] dark:text-white text-sm sm:text-base">
                  {copy("Benötige ich einen Wohnsitz im Gründungsland?", "Do I need to be a resident in the chosen jurisdiction?")}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {copy("Nein. Gesellschafter und Geschäftsführer einer europäischen Kapitalgesellschaft (z. B. GmbH, EU Inc., S.L., Ltd.) müssen keinen Wohnsitz im jeweiligen Land haben. Das Unternehmen benötigt lediglich eine offizielle inländische Geschäftsadresse (Registered Office / Domiziladresse), die wir im Rahmen des Gründungsprozesses für Sie bereitstellen.", "No. Founders and managing directors of an EU entity are not required to reside in the country of incorporation. You only need a domestic registered seat, which we provide as part of our registered agent package.")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3" className="border-0 rounded-md px-5 bg-[#F7F7F7] dark:bg-[#02182B]">
                <AccordionTrigger className="hover:no-underline py-4 text-left font-semibold tracking-[-0.01em] text-[#01223F] dark:text-white text-sm sm:text-base">
                  {copy("Wann und wie muss das Stammkapital eingezahlt werden?", "When and how does share capital need to be deposited?")}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {copy("Das hängt von der gewählten Rechtsform ab: Eine deutsche UG (haftungsbeschränkt) kann bereits ab 1 € Stammkapital gegründet werden, während bei einer GmbH mindestens 12.500 € (halbe Stammeinlage) auf das Firmenkonto eingezahlt werden müssen. Bei der EU Inc. oder portugiesischen Lda. genügt ebenfalls 1 €. Die Einzahlungsbestätigung der Bank wird direkt elektronisch an das Registergericht übermittelt.", "Capital requirements vary by entity: a German UG or Portuguese Lda can be started with just €1, whereas a German GmbH requires €12,500 initially deposited. The bank deposit confirmation is transmitted electronically to the commercial court.")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4" className="border-0 rounded-md px-5 bg-[#F7F7F7] dark:bg-[#02182B]">
                <AccordionTrigger className="hover:no-underline py-4 text-left font-semibold tracking-[-0.01em] text-[#01223F] dark:text-white text-sm sm:text-base">
                  {copy("Wie erhalte ich meine Steuernummer und USt-IdNr. (VAT ID)?", "How do I receive my tax number and European VAT ID?")}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {copy("In unserem Professional- und Premium-Paket ist der steuerliche Erfassungsbogen enthalten. Sobald der Handelsregisterauszug vorliegt, reichen wir die Unterlagen beim zuständigen Finanzamt ein. Sie erhalten sowohl Ihre lokale Steuernummer als auch Ihre europäische Umsatzsteuer-Identifikationsnummer (USt-IdNr.) für grenzüberschreitende Rechnungsstellung.", "Our Professional and Premium packages include the official tax registration questionnaire. Once the register extract is issued, filings are submitted to the tax authority to issue both your corporate tax code and European VAT ID.")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5" className="border-0 rounded-md px-5 bg-[#F7F7F7] dark:bg-[#02182B]">
                <AccordionTrigger className="hover:no-underline py-4 text-left font-semibold tracking-[-0.01em] text-[#01223F] dark:text-white text-sm sm:text-base">
                  {copy("Was passiert, wenn das Register meinen Wunschnamen ablehnt?", "What happens if the commercial register rejects my proposed name?")}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {copy("Durch unsere vorgeschaltete BRIS- und Markenprüfung passiert dies in weniger als 0,4% aller Fälle. Sollte das Register dennoch Einwände erheben, korrigieren und reichen wir den Gründungsantrag mit einem Alternativnamen kostenlos für Sie nach. Scheitert eine Gründung unverschuldet, greift unsere 100% Geld-zurück-Garantie.", "With our automated clearance pre-check, name conflicts happen in less than 0.4% of filings. If the registrar requests a modification, we amend and refile with an alternative name at zero additional cost.")}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-6" className="border-0 rounded-md px-5 bg-[#F7F7F7] dark:bg-[#02182B]">
                <AccordionTrigger className="hover:no-underline py-4 text-left font-semibold tracking-[-0.01em] text-[#01223F] dark:text-white text-sm sm:text-base">
                  {copy("Welche Rechtsform eignet sich am besten für Facilitators, Coaches & Praxen?", "Which legal structure is best for facilitators, coaches & private practices?")}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {copy("Für den DACH-Raum ist die UG (haftungsbeschränkt) oder GmbH der anerkannte Goldstandard mit vollem Haftungsschutz. Für Coaches mit europaweiter digitaler Kundschaft eignet sich die EU Inc. oder eine zyprische Limited aufgrund schlanker Administration und attraktiver Steuersätze. In unserem Professional-Paket beraten wir Sie 1-on-1 zur optimalen Struktur.", "For DACH-focused founders, a GmbH or UG offers unmatched credibility and liability shielding. For cross-border online coaches, an EU Inc. or Cyprus Ltd offers streamlined administration and favorable taxation.")}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* =========================================================================
            11. FINAL CONVERSION & ASSURANCE CTA
        ========================================================================= */}
        <section className="relative py-16 sm:py-24 bg-[#F7F7F7] dark:bg-[#02182B] border-b border-slate-200/80 dark:border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="mx-auto max-w-[22ch] text-3xl sm:text-[2.75rem] font-semibold tracking-[-0.03em] leading-[1.08] text-[#01223F] dark:text-white">
                {copy("Starten Sie Ihre digitale Unternehmensgründung heute", "Launch Your Digital European Entity Today")}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {copy("Schützen Sie Ihr Privatvermögen, gewinnen Sie institutionelles Vertrauen bei Klienten und Kunden und eröffnen Sie Ihr vollwertiges europäisches Unternehmen in Rekordzeit.", "Shield your personal liability, gain corporate trust with participants and clients, and launch your fully compliant European entity in record time.")}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => handleCheckAvailability()}
                  className="w-full sm:w-auto h-12 px-6 rounded-md bg-[#01223F] hover:bg-[#017F80] dark:bg-white dark:text-[#01223F] dark:hover:bg-[#00CDAC] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span>{copy("Kostenlose Vorprüfung starten", "Start Free Clearance Check")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                {copy("Dauert nur 2 Minuten · Keine Kreditkarte für die Vorprüfung erforderlich", "Takes only 2 minutes · No credit card required for clearance check")}
              </p>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}