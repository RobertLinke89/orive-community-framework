"use client";

import logoWhite from "@/assets/logo_white.png";
import { PublicNavbar } from "@/components/PublicNavbar";

export default function NotFound() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      <PublicNavbar />
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10 pt-24 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/orive-logo-wings.png"
          alt="ORIVE"
          className="h-4 w-auto dark:hidden"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoWhite.src}
          alt="ORIVE"
          className="hidden h-10 w-auto dark:block"
        />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This page isn’t available. Please go back or try again later.
        </p>
      </div>
    </main>
  );
}
