"use client";
import { Button } from "@/components/ui/button";
import logoWhite from "@/assets/logo_white.png";

type Props = {
  title: string;
  message: string;
  /** Kept for callers; not shown on the simplified fallback UI. */
  detail?: string;
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  secondaryAction?: { label: string; onClick: () => void };
};

export function OfflineFallback({
  title,
  message,
  primaryAction,
  secondaryAction,
}: Props) {
  const hasActions = Boolean(primaryAction || secondaryAction);

  return (
    <main className="min-h-screen w-full bg-offline text-offline-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/orive-logo-wings.png"
          alt="ORIVE"
          className="mx-auto h-4 w-auto dark:hidden"
          loading="eager"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoWhite.src}
          alt="ORIVE"
          className="mx-auto hidden h-10 w-auto dark:block"
          loading="eager"
        />

        <h1 className="mt-8 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-offline-foreground/75">{message}</p>

        {hasActions ? (
          <div className="mt-7 flex flex-col gap-2">
            {primaryAction ? (
              <Button
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className="h-11 bg-offline-foreground text-offline hover:bg-offline-foreground/90"
              >
                {primaryAction.label}
              </Button>
            ) : null}

            {secondaryAction ? (
              <Button
                variant="secondary"
                onClick={secondaryAction.onClick}
                className="h-11 bg-offline-foreground/10 text-offline-foreground hover:bg-offline-foreground/15"
              >
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
