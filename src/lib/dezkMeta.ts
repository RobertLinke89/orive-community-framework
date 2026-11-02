import type { Metadata, Viewport } from "next";

export const dezkMetadata: Metadata = {
  title: "dezk",
  applicationName: "ORIVE",
  appleWebApp: {
    capable: true,
    title: "ORIVE",
    statusBarStyle: "default",
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: false,
  },
};

export const dezkViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#011424" },
  ],
};
