"use client";
import { useEffect, useMemo, useState } from "react";
import { OfflineFallback } from "@/components/OfflineFallback";

type FatalInfo = {
  title: string;
  message: string;
  detail?: string;
};

function looksLikeChunkLoadFailure(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("chunkloaderror") ||
    m.includes("loading chunk") ||
    m.includes("failed to fetch dynamically imported module") ||
    m.includes("importing a module script failed")
  );
}

export function GlobalFatalErrorOverlay() {
  const [fatal, setFatal] = useState<FatalInfo | null>(null);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const msg = String(event?.message ?? "");
      if (!msg) return;

      if (looksLikeChunkLoadFailure(msg)) {
        setFatal({
          title: "Update required",
          message: "Some parts of the app failed to load (often caused by caching/CDN issues).",
          detail: "Reload the page. If it keeps happening, clear browser cache or disable any CDN script optimizers.",
        });
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      const msg =
        reason instanceof Error
          ? `${reason.name}: ${reason.message}`
          : typeof reason === "string"
            ? reason
            : "";

      if (msg && looksLikeChunkLoadFailure(msg)) {
        setFatal({
          title: "Update required",
          message: "A required app file failed to load.",
          detail: "Reload the page to fetch the latest assets.",
        });
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  const content = useMemo(() => fatal, [fatal]);
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-[92]">
      <OfflineFallback
        title={content.title}
        message={content.message}
      />
    </div>
  );
}
