"use client";
import { usePathname } from 'next/navigation';
import { useEffect } from "react";

import { setMetaDescription, setPageTitle } from "@/lib/branding";

function getRouteTitle(pathname: string): string | null {
  // Internal app
  if (pathname === "/app" || pathname === "/app/") return "SmartMatch";
  if (pathname.startsWith("/app/calendar")) return "Calendar";
  if (pathname.startsWith("/app/whatsapp")) return "WhatsApp";
  if (pathname.startsWith("/app/kanban")) return "Tasks";
  if (pathname.startsWith("/app/business")) return "Business Settings";
  if (pathname.startsWith("/app/settings")) return "Settings";
  if (pathname.startsWith("/app/notifications")) return "Notifications";
  if (pathname.startsWith("/app")) return "Dashboard";

  // Public / marketing routes inside this same project
  if (pathname === "/") return "ORIVE";
  if (pathname.startsWith("/auth")) return "Sign in";
  if (pathname.startsWith("/reset-password")) return "Reset password";
  if (pathname.startsWith("/marketplace")) return "Marketplace";
  if (pathname.startsWith("/session/")) return "Session";
  if (pathname.startsWith("/event/")) return "Event";
  if (pathname.startsWith("/experience/")) return "Experience";
  if (pathname.startsWith("/blog")) return "Blog";
  if (pathname.startsWith("/shop")) return "Shop";
  if (pathname.startsWith("/about")) return "About";
  if (pathname.startsWith("/for-facilitators")) return "For facilitators";

  // Dynamic titles (profile names, etc.) should be set by the page itself.
  if (pathname.startsWith("/p/")) return null;

  return null;
}

function getRouteDescription(pathname: string): string | null {
  // App (product-focused)
  if (pathname === "/app" || pathname === "/app/") {
    return "SmartMatch dashboard for facilitators to manage clients, sessions, and daily workflow.";
  }
  if (pathname.startsWith("/app/calendar")) {
    return "Manage your bookings and availability in a professional calendar.";
  }
  if (pathname.startsWith("/app/whatsapp")) {
    return "Manage client conversations and follow-ups from your Orive workspace.";
  }
  if (pathname.startsWith("/app/kanban")) {
    return "Organize tasks and keep your facilitator workflow on track.";
  }
  if (pathname.startsWith("/app/business")) {
    return "Update your facilitator profile, offerings, and business settings.";
  }
  if (pathname.startsWith("/app/settings")) {
    return "Configure your account and app preferences.";
  }
  if (pathname.startsWith("/app/notifications")) {
    return "View updates and important notifications.";
  }
  if (pathname.startsWith("/app")) {
    return "Orive App — your professional workspace for managing sessions and clients.";
  }

  // Marketing / discovery (SEO-oriented)
  if (pathname === "/") {
    return "Holistic wellbeing sessions in virtual and in-person formats — book 1:1 or group experiences.";
  }
  if (pathname.startsWith("/marketplace")) {
    return "Discover professional wellbeing facilitators, sessions, and events for your transformation journey.";
  }
  if (pathname.startsWith("/session/")) {
    return "Explore session details and book a 1:1 wellbeing experience.";
  }
  if (pathname.startsWith("/event/")) {
    return "Explore event details, share with friends, and reserve your spot.";
  }
  if (pathname.startsWith("/experience/")) {
    return "Explore curated experiences and book transformative wellbeing journeys.";
  }
  if (pathname.startsWith("/blog")) {
    return "The world of wellbeing — evidence-based insights on breathwork, cold exposure, movement, and rituals.";
  }
  if (pathname.startsWith("/shop")) {
    return "Shop curated wellbeing products and tools to support your routine.";
  }
  if (pathname.startsWith("/about")) {
    return "Learn about Orive — a professional platform connecting facilitators and clients for wellbeing sessions.";
  }
  if (pathname.startsWith("/for-facilitators")) {
    return "List sessions, events and retreats on ORIVE. No monthly fee. Guests pay through Stripe when a listing is booked on ORIVE.";
  }
  if (pathname.startsWith("/auth")) {
    return "Sign in to access your Orive account.";
  }
  if (pathname.startsWith("/reset-password")) {
    return "Reset your password to regain access to your Orive account.";
  }

  // Dynamic descriptions (e.g., /p/:id) should be set by the page itself.
  if (pathname.startsWith("/p/")) return null;

  return null;
}

/**
 * Ensures the tab title matches the environment:
 * - app.* hostnames => "... | Orive App"
 * - other hostnames => "... | Orive"
 *
 * Individual pages can still set a specific title; this manager just normalizes
 * the brand suffix when pages hardcode it.
 */
export function AppBrandingManager() {
  const _pathname = usePathname(); const location = { pathname: _pathname };

  useEffect(() => {
    const routeTitle = getRouteTitle(location.pathname);
    if (routeTitle !== null) setPageTitle(routeTitle);

    const routeDescription = getRouteDescription(location.pathname);
    if (routeDescription !== null) setMetaDescription(routeDescription);
  }, [location.pathname]);

  return null;
}
