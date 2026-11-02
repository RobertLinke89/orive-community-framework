"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BusinessNameLoader } from "@/components/BusinessNameLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, RefreshCw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Layout } from "@/components/Layout";

type CountryOffer = {
  code: string;
  flag: string;
  nameDe: string;
  nameEn: string;
  legalForm: string;
  price: number;
  durationDe: string;
  durationEn: string;
  pendingDe: string;
  pendingEn: string;
  status: "available" | "pending";
};

const countryOffers: CountryOffer[] = [
  {
    code: "EU",
    flag: "🇪🇺",
    nameDe: "EU Inc.",
    nameEn: "EU Inc.",
    legalForm: "28. Regime",
    price: 599,
    durationDe: "24–48 Stunden",
    durationEn: "24–48 hours",
    pendingDe: "Multi-State Branch · USt-IdNr. Express",
    pendingEn: "Multi-state branch · VAT ID express",
    status: "available",
  },
  {
    code: "DE",
    flag: "🇩🇪",
    nameDe: "Deutschland",
    nameEn: "Germany",
    legalForm: "GmbH / UG",
    price: 599,
    durationDe: "5–8 Werktage",
    durationEn: "5–8 business days",
    pendingDe: "Gewerbe online · Transparenzregister Auto-Sync",
    pendingEn: "Trade licence online · UBO auto-sync",
    status: "available",
  },
  {
    code: "AT",
    flag: "🇦🇹",
    nameDe: "Österreich",
    nameEn: "Austria",
    legalForm: "GmbH",
    price: 649,
    durationDe: "5–7 Werktage",
    durationEn: "5–7 business days",
    pendingDe: "FlexKapG-Vorlage · Firmenbuch Live-Status",
    pendingEn: "FlexKapG template · Live Firmenbuch status",
    status: "available",
  },
  {
    code: "NL",
    flag: "🇳🇱",
    nameDe: "Niederlande",
    nameEn: "Netherlands",
    legalForm: "B.V.",
    price: 699,
    durationDe: "3–5 Werktage",
    durationEn: "3–5 business days",
    pendingDe: "KVK Express · Innovationsbox-Onboarding",
    pendingEn: "KVK express · Innovation box onboarding",
    status: "available",
  },
  {
    code: "ES",
    flag: "🇪🇸",
    nameDe: "Spanien",
    nameEn: "Spain",
    legalForm: "S.L.",
    price: 549,
    durationDe: "5–7 Werktage",
    durationEn: "5–7 business days",
    pendingDe: "CIRCE-Vollautomation · NIF Express",
    pendingEn: "CIRCE full automation · NIF express",
    status: "available",
  },
  {
    code: "PT",
    flag: "🇵🇹",
    nameDe: "Portugal",
    nameEn: "Portugal",
    legalForm: "Lda.",
    price: 549,
    durationDe: "4–6 Werktage",
    durationEn: "4–6 business days",
    pendingDe: "Empresa na Hora API · RCBE Auto-Filing",
    pendingEn: "Empresa na Hora API · RCBE auto-filing",
    status: "available",
  },
  {
    code: "CY",
    flag: "🇨🇾",
    nameDe: "Zypern",
    nameEn: "Cyprus",
    legalForm: "Ltd.",
    price: 799,
    durationDe: "3–5 Werktage",
    durationEn: "3–5 business days",
    pendingDe: "Non-Dom Pack · TIC Same-Day",
    pendingEn: "Non-dom pack · TIC same-day",
    status: "pending",
  },
  {
    code: "FR",
    flag: "🇫🇷",
    nameDe: "Frankreich",
    nameEn: "France",
    legalForm: "SAS / SARL",
    price: 699,
    durationDe: "6–10 Werktage",
    durationEn: "6–10 business days",
    pendingDe: "Guichet Unique · e-Notaire Integration",
    pendingEn: "Guichet Unique · e-notary integration",
    status: "pending",
  },
  {
    code: "IT",
    flag: "🇮🇹",
    nameDe: "Italien",
    nameEn: "Italy",
    legalForm: "S.r.l.",
    price: 699,
    durationDe: "7–12 Werktage",
    durationEn: "7–12 business days",
    pendingDe: "Registro Imprese API · PEC Bundle",
    pendingEn: "Registro Imprese API · PEC bundle",
    status: "pending",
  },
  {
    code: "PL",
    flag: "🇵🇱",
    nameDe: "Polen",
    nameEn: "Poland",
    legalForm: "Sp. z o.o.",
    price: 499,
    durationDe: "5–8 Werktage",
    durationEn: "5–8 business days",
    pendingDe: "S24 Vollautomation · NIP Express",
    pendingEn: "S24 full automation · NIP express",
    status: "pending",
  },
];

function formatPrice(price: number, isDe: boolean) {
  return new Intl.NumberFormat(isDe ? "de-DE" : "en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function FormationCheck() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language, copy } = useLanguage();
  const isDe = language === "de";

  const initialName = searchParams.get("name") || "";
  const highlightCountry = searchParams.get("country") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [queryName, setQueryName] = useState(initialName);
  const [selectedCode, setSelectedCode] = useState(
    highlightCountry && countryOffers.some((c) => c.code === highlightCountry)
      ? highlightCountry
      : "EU"
  );

  useEffect(() => {
    setQueryName(initialName);
  }, [initialName]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2800);
    return () => clearTimeout(timer);
  }, [initialName]);

  const selected = countryOffers.find((c) => c.code === selectedCode) ?? countryOffers[0];
  const displayName = (initialName || queryName || copy("Ihre Gesellschaft", "Your company")).trim();

  const handleRecheck = () => {
    const params = new URLSearchParams();
    if (queryName.trim()) params.set("name", queryName.trim());
    params.set("tier", "professional");
    setIsLoading(true);
    router.push(`/formation/check?${params.toString()}`);
  };

  const handleContinue = () => {
    router.push(
      `/formation/checkout?name=${encodeURIComponent(displayName)}&country=${selected.code}&tier=professional`
    );
  };

  if (isLoading) {
    return (
      <BusinessNameLoader
        businessName={displayName}
        onComplete={() => setIsLoading(false)}
      />
    );
  }

  return (
    <Layout hideFooter>
    <div className="min-h-[calc(100dvh-4rem)] bg-[#F7F7F7] dark:bg-[#011424] text-[#01223F] dark:text-white">
      <main className="max-w-[1120px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#017F80] dark:text-[#00CDAC]">
          {copy("Namensprüfung · EU", "Name check · EU")}
        </p>
        <div className="border border-slate-200 dark:border-white/15 bg-white dark:bg-[#02182B] p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Input
              value={queryName}
              onChange={(e) => setQueryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRecheck()}
              placeholder={copy(
                "Firmenname erneut prüfen",
                "Check company name again"
              )}
              className="h-12 bg-[#F7F7F7] dark:bg-[#011424] border-slate-200 dark:border-white/15 text-sm rounded-md"
            />
            <Button
              onClick={handleRecheck}
              className="h-12 px-5 rounded-md bg-[#01223F] hover:bg-[#017F80] dark:bg-white dark:text-[#01223F] dark:hover:bg-[#00CDAC] text-white text-sm font-semibold shrink-0"
            >
              {copy("Neu prüfen", "Check again")}
            </Button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              {copy("Empfehlungen für", "Recommendations for")}
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-[#01223F] dark:text-white">
              {displayName}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              {copy(
                "Name freigegeben für die Registrierung. Wählen Sie die Jurisdiktion – Kosten, Dauer und Pending-Features im Überblick.",
                "Name cleared for registration. Choose a jurisdiction — cost, duration, and pending features at a glance."
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/formation")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#01223F] dark:hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {copy("Anderen Namen prüfen", "Check another name")}
          </button>
        </div>

        <div className="mt-10 grid lg:grid-cols-[1fr_280px] gap-8 items-start">
          <div className="border border-slate-200 dark:border-white/15 bg-white dark:bg-[#02182B] overflow-hidden">
            <div className="hidden md:grid grid-cols-[minmax(0,1.4fr)_6.5rem_7.5rem_minmax(0,1.2fr)_6.5rem] gap-3 px-4 py-3 border-b border-slate-200 dark:border-white/10 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <span>{copy("Land", "Country")}</span>
              <span>{copy("Kosten", "Cost")}</span>
              <span>{copy("Dauer", "Duration")}</span>
              <span>Pending</span>
              <span className="text-right">{copy("Aktion", "Action")}</span>
            </div>

            <ul>
              {countryOffers.map((offer) => {
                const active = selectedCode === offer.code;
                const available = offer.status === "available";
                return (
                  <li
                    key={offer.code}
                    className={`border-b border-slate-200/80 dark:border-white/10 last:border-0 ${
                      active ? "bg-[#F7F7F7] dark:bg-white/[0.04]" : ""
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_6.5rem_7.5rem_minmax(0,1.2fr)_6.5rem] gap-2 md:gap-3 items-center px-4 py-4">
                      <div className="min-w-0 flex items-start gap-3">
                        <span className="text-xl leading-none mt-0.5" aria-hidden>
                          {offer.flag}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#01223F] dark:text-white truncate">
                            {isDe ? offer.nameDe : offer.nameEn}
                          </p>
                          <p className="text-[12px] text-slate-500 dark:text-slate-400">
                            {offer.legalForm}
                          </p>
                          <p className="md:hidden mt-2 text-[12px] text-slate-500">
                            <span className="font-semibold text-[#01223F] dark:text-white">
                              {formatPrice(offer.price, isDe)}
                            </span>
                            <span className="mx-1.5 text-slate-300">·</span>
                            {isDe ? offer.durationDe : offer.durationEn}
                          </p>
                        </div>
                      </div>

                      <p className="hidden md:block text-sm font-semibold tabular-nums text-[#01223F] dark:text-white">
                        {formatPrice(offer.price, isDe)}
                      </p>

                      <p className="hidden md:block text-[13px] text-slate-600 dark:text-slate-300">
                        {isDe ? offer.durationDe : offer.durationEn}
                      </p>

                      <div className="min-w-0">
                        {available ? (
                          <p className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-700 dark:text-emerald-400">
                            <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                            {copy("Verfügbar", "Available")}
                          </p>
                        ) : (
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-400">
                            Pending
                          </p>
                        )}
                        <p className="mt-0.5 text-[12px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-2">
                          {isDe ? offer.pendingDe : offer.pendingEn}
                        </p>
                      </div>

                      <div className="md:justify-self-end">
                        <Button
                          type="button"
                          disabled={!available}
                          onClick={() => setSelectedCode(offer.code)}
                          variant={active ? "default" : "outline"}
                          className={`h-9 px-3 text-xs font-semibold rounded-md w-full md:w-auto ${
                            active
                              ? "bg-[#01223F] hover:bg-[#017F80] dark:bg-white dark:text-[#01223F] dark:hover:bg-[#00CDAC] text-white"
                              : "border-slate-200 dark:border-white/15"
                          } disabled:opacity-40`}
                        >
                          {available
                            ? active
                              ? copy("Gewählt", "Selected")
                              : copy("Auswählen", "Select")
                            : copy("Bald", "Soon")}
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="border border-slate-200 dark:border-white/15 bg-white dark:bg-[#02182B] p-5 sticky top-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {copy("Ihre Auswahl", "Your selection")}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl">{selected.flag}</span>
              <div>
                <p className="text-sm font-semibold text-[#01223F] dark:text-white">
                  {isDe ? selected.nameDe : selected.nameEn}
                </p>
                <p className="text-[12px] text-slate-500">{selected.legalForm}</p>
              </div>
            </div>

            <dl className="mt-5 space-y-3 text-sm border-t border-slate-200 dark:border-white/10 pt-4">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">{copy("Kosten", "Cost")}</dt>
                <dd className="font-semibold tabular-nums">{formatPrice(selected.price, isDe)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">{copy("Dauer", "Duration")}</dt>
                <dd className="font-medium text-right">
                  {isDe ? selected.durationDe : selected.durationEn}
                </dd>
              </div>
              <div className="pt-1">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Pending
                </dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {isDe ? selected.pendingDe : selected.pendingEn}
                </dd>
              </div>
            </dl>

            <Button
              onClick={handleContinue}
              disabled={selected.status !== "available"}
              className="mt-6 w-full h-11 rounded-md bg-[#01223F] hover:bg-[#017F80] dark:bg-white dark:text-[#01223F] dark:hover:bg-[#00CDAC] text-white text-sm font-semibold disabled:opacity-40"
            >
              {copy("Weiter zur Gründung", "Continue to formation")}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </aside>
        </div>
      </main>
    </div>
    </Layout>
  );
}
