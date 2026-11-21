import "../index.css";
import { Providers } from "./providers";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://orive.co"),
  title: { default: "ORIVE – Breathwork, Yoga, Eisbaden & Sound Healing in Europa", template: "%s" },
  description: "Finde Facilitators, Sessions und Retreats für Breathwork, Yoga, Eisbaden, Sound Healing und mehr – in ganz Europa.",
  openGraph: {
    siteName: "ORIVE",
    type: "website",
    locale: "de_DE",
    images: [{ url: "/og/orive-default.jpg", width: 1200, height: 630, alt: "ORIVE – Facilitators, Sessions und Retreats in Europa" }],
  },
  twitter: { card: "summary_large_image", images: ["/og/orive-default.jpg"] },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#00CDAC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://img.evbuc.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://img.evbuc.com" />
        <link rel="preconnect" href="https://cdn.evbuc.com" crossOrigin="" />
        {/* Umami: self-hosted, cookieless reach measurement (approved 2026-11-10). Collector /stats/ is proxied by NPM to the internal umami container. */}
        <script
          defer
          src="/stats/script.js"
          data-website-id="3c4a70b9-449a-4683-b887-40d3f270d31e"
          data-domains="orive.co,www.orive.co"
          data-do-not-track="true"
        />
      </head>
      <body className="antialiased min-h-screen relative font-sans w-full max-w-[100vw] overflow-x-hidden bg-background">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{localStorage.removeItem('theme')}catch(e){}`,
          }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
