import { ShieldCheck } from "lucide-react";

type ShopBuyBoxTrustProps = {
  isDe: boolean;
  methods: string[];
  external?: boolean;
};

export function ShopBuyBoxTrust({ isDe, methods, external = false }: ShopBuyBoxTrustProps) {
  if (external) {
    return (
      <div className="mt-4 space-y-3 border-t border-slate-200 pt-3 text-[12px] leading-relaxed text-slate-600 dark:border-white/10 dark:text-white/55">
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/45">
            <ShieldCheck className="h-3.5 w-3.5 text-[#008975] dark:text-[#00CDAC]" />
            {isDe ? "Partner-Shops" : "Partner shops"}
          </p>
          <ul className="space-y-1">
            <li>
              {isDe
                ? "Kauf und Zahlung laufen beim jeweiligen Händler (Amazon, Decathlon, Thomann u. a.)."
                : "Purchase and payment happen at the retailer (Amazon, Decathlon, Thomann, and others)."}
            </li>
            <li>
              {isDe
                ? "Preise und Verfügbarkeit können dort abweichen. Es gelten die Bedingungen des Händlers."
                : "Prices and stock may differ there. The retailer’s terms apply."}
            </li>
            <li>
              {isDe ? "Fragen zu ORIVE: " : "Questions about ORIVE: "}
              <a href="mailto:contact@orive.app" className="underline underline-offset-2">
                contact@orive.app
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 border-t border-slate-200 pt-3 text-[12px] leading-relaxed text-slate-600 dark:border-white/10 dark:text-white/55">
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/45">
          {isDe ? "Bezahlmethoden" : "Payment methods"}
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {(methods.length > 0 ? methods : ["Shopify"]).map((method) => (
            <li
              key={method}
              className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-700 dark:border-white/15 dark:bg-white/5 dark:text-white/75"
            >
              {method}
            </li>
          ))}
        </ul>
        <p className="mt-1.5">
          {isDe ? "Die Shopify-Kasse zeigt nur die Wege, die dort wirklich anliegen. ORIVE sieht keine Kartennummern." : "Shopify checkout lists only the methods that are actually on. ORIVE never sees card numbers."}
        </p>
      </div>

      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/45">
          <ShieldCheck className="h-3.5 w-3.5 text-[#008975] dark:text-[#00CDAC]" />
          {isDe ? "Käuferschutz" : "Buyer protection"}
        </p>
        <ul className="space-y-1">
          <li>
            {isDe ? "Verkauf über Shopify. Zahlung und Beleg liegen dort." : "Sold through Shopify. Payment and receipt sit there."}
          </li>
          <li>
            {isDe ? "Für Waren gelten die gesetzlichen Verbraucherrechte. Rückgabe und Versand nennt die Kasse." : "Goods keep statutory consumer rights. Returns and shipping are named at checkout."}
          </li>
          <li>
            {isDe ? "Kein pauschaler Sofort-Ersatz. Streitfall: " : "No one-click instant replacement. Disputes: "}
            <a href="mailto:contact@orive.app" className="underline underline-offset-2">
              contact@orive.app
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
