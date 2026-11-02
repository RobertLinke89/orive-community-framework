import "../index.css";
import { Providers } from "./providers";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "ORIVE – Your Journey Matters",
  description: "Holistic Wellbeing sessions in virtual and in-person formats — book 1:1 or group experiences.",
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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://img.evbuc.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://img.evbuc.com" />
        <link rel="preconnect" href="https://cdn.evbuc.com" crossOrigin="" />
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
