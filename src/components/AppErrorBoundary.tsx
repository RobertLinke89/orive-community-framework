"use client";
import React from "react";
import { recordOpsTelemetry } from "@/lib/opsTelemetry";
import { OfflineFallback } from "@/components/OfflineFallback";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("App render error:", error);

    const signature =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : typeof error === "string"
          ? error
          : "unknown";

    recordOpsTelemetry("render_error", {
      remaining: null,
      retryAfterSeconds: null,
      policy: signature.slice(0, 140),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <OfflineFallback
          title="Page not found"
          message="This page isn’t available. Please go back or try again later."
        />
      );
    }

    return this.props.children;
  }
}
