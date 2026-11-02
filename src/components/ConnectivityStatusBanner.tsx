"use client";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConnectivityBannerStore } from "@/stores/connectivityBannerStore";

export function ConnectivityStatusBanner() {
  const { open, message, detail, retry, retrying, dismiss, retryNow } =
    useConnectivityBannerStore();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={cn(
            "fixed top-0 left-0 right-0 z-[95]",
            "border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/70"
          )}
        >
          <div className="mx-auto flex w-full max-w-6xl items-start gap-3 px-4 py-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{message}</p>
              {detail ? (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{detail}</p>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {retry ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8"
                  disabled={retrying}
                  onClick={retryNow}
                >
                  {retrying ? "Retrying…" : "Retry"}
                </Button>
              ) : null}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={dismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
