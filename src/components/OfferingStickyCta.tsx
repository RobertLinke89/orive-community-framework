"use client";

import Link from "next/link";

type OfferingStickyCtaProps = {
  price: string;
  note: string;
  actionLabel: string;
  href?: string | null;
  onClick?: () => void;
  external?: boolean;
};

export function OfferingStickyCta({
  price,
  note,
  actionLabel,
  href,
  onClick,
  external,
}: OfferingStickyCtaProps) {
  if (!href && !onClick) return null;

  const buttonClass =
    "shrink-0 h-11 px-5 rounded-full bg-[#00CDAC] hover:bg-[#02AAB0] text-white text-sm font-semibold inline-flex items-center justify-center";

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#02182B]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-slate-900 dark:text-white truncate">{price}</p>
          <p className="text-[11px] text-slate-500 dark:text-white/45 truncate">{note}</p>
        </div>
        {href ? (
          external ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass}>
              {actionLabel}
            </a>
          ) : (
            <Link href={href} className={buttonClass}>
              {actionLabel}
            </Link>
          )
        ) : (
          <button type="button" onClick={onClick} className={buttonClass}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
