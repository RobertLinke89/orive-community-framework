"use client";
import { ReactNode } from "react";
import { Footer } from "./Footer";
import { PublicNavbar } from "./PublicNavbar";

interface LayoutProps {
  children: ReactNode;
  /** Hide site footer (forms, focused flows). Navbar stays. */
  hideFooter?: boolean;
}

export function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <PublicNavbar />

      <main className="w-full min-h-0 flex-1 pt-16">{children}</main>

      {!hideFooter && <Footer />}
    </div>
  );
}
