"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { GlobalFatalErrorOverlay } from "@/components/GlobalFatalErrorOverlay";
import { ConnectivityFullScreenFallback } from "@/components/ConnectivityFullScreenFallback";
import { LanguageProvider } from "@/hooks/useLanguage";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
      },
    },
  }));

  return (
    <AppErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              {children}
              <Toaster />
              <Sonner />
              <GlobalFatalErrorOverlay />
              <ConnectivityFullScreenFallback />
            </TooltipProvider>
          </QueryClientProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
