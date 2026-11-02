import Link from 'next/link';

import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DetailBreadcrumbProps {
  items: BreadcrumbItem[];
  quiet?: boolean;
  /** Sit on the hero photo, top-left under the site header. */
  overlay?: boolean;
}

export function DetailBreadcrumb({ items, quiet = false, overlay = false }: DetailBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex min-w-0 max-w-full items-center gap-1.5 text-xs sm:text-sm",
        overlay
          ? "text-white/80"
          : quiet
            ? "text-slate-500 dark:text-white/45"
            : "mb-6 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 w-fit shadow-sm border border-border/30"
      )}
    >
      <Link
        href="/"
        className={cn(
          "transition-colors flex items-center gap-1 shrink-0",
          overlay ? "text-white/80 hover:text-white drop-shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 shrink-0",
                overlay ? "text-white/45" : "text-muted-foreground/50"
              )}
            />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className={cn(
                  "transition-colors shrink-0",
                  overlay ? "text-white/80 hover:text-white drop-shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "font-medium truncate max-w-[10rem] sm:max-w-[16rem]",
                  overlay ? "text-white drop-shadow-sm" : "text-foreground"
                )}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
