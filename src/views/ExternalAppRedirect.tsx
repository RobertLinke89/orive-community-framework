"use client";
import { useEffect } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";

const EXTERNAL_APP_URL = "https://orive.app";

/**
 * Redirects users to the external app domain (orive.app).
 * This handles /auth, /app/*, /onboarding, and /admin/* routes.
 */
export default function ExternalAppRedirect() {
  useEffect(() => {
    // Preserve the path for deep linking
    const currentPath = window.location.pathname;
    const searchParams = window.location.search;
    
    // Map common paths
    let targetPath = currentPath;
    if (currentPath === "/auth") {
      targetPath = "/auth";
    } else if (currentPath.startsWith("/app")) {
      targetPath = currentPath; // Keep /app/* paths
    } else if (currentPath === "/onboarding") {
      targetPath = "/onboarding";
    } else if (currentPath.startsWith("/admin")) {
      targetPath = currentPath; // Keep /admin/* paths
    }
    
    const redirectUrl = `${EXTERNAL_APP_URL}${targetPath}${searchParams}`;
    
    // Redirect to external app
    window.location.href = redirectUrl;
  }, []);

  return <LoadingScreen />;
}
