"use client";
import { usePathname } from 'next/navigation';

import { useConnectivityBannerStore } from "@/stores/connectivityBannerStore";
import { OfflineFallback } from "@/components/OfflineFallback";

export function ConnectivityFullScreenFallback() {
  const _pathname = usePathname(); const location = { pathname: _pathname };
  const { open, message, detail, retry, retrying, retryNow, dismiss } =
    useConnectivityBannerStore();

  // Never cover the dedicated health check route.
  if (!open || location.pathname === "/health") return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <OfflineFallback
        title="Connectivity issue"
        message={message || "We’re having trouble loading this page right now."}
        detail={detail}
        primaryAction={
          retry
            ? { label: retrying ? "Retrying…" : "Retry", onClick: () => void retryNow(), disabled: retrying }
            : { label: "Reload", onClick: () => window.location.reload() }
        }
        secondaryAction={{ label: "Dismiss", onClick: dismiss }}
      />
    </div>
  );
}
