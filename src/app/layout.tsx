import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { SeoJsonLd } from "@/components/seo-json-ld";
import { db } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

async function getAnalyticsSettings(): Promise<{
  gaId: string | null;
  plausibleDomain: string | null;
}> {
  try {
    const rows = await db.siteSetting.findMany({
      where: { key: { in: ["analytics.gaId", "analytics.plausibleDomain"] } },
    });
    const map: Record<string, string> = {};
    for (const r of rows) {
      try {
        const v = JSON.parse(r.value);
        map[r.key] = typeof v === "string" ? v : String(v ?? "");
      } catch {
        map[r.key] = r.value;
      }
    }
    return {
      gaId: map["analytics.gaId"]?.trim() || null,
      plausibleDomain: map["analytics.plausibleDomain"]?.trim() || null,
    };
  } catch {
    return { gaId: null, plausibleDomain: null };
  }
}

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DeeCodeK Labs — Software Studio. Product Lab.",
    template: "%s · DeeCodeK Labs",
  },
  description:
    "Custom products, scalable backends, and useful tools engineered for the real world. Software studio and product lab based in India.",
  keywords: [
    "DeeCodeK Labs",
    "software studio",
    "product lab",
    "full-stack development",
    "open source",
    "Flutter apps",
    "SaaS",
    "NestJS",
    "Next.js agency India",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  icons: { icon: "/logo-light.png", apple: "/logo-light.png" },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "DeeCodeK Labs — Software Studio. Product Lab.",
    description:
      "Custom products, scalable backends, and useful tools engineered for the real world.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo-light.png",
        width: 512,
        height: 512,
        alt: "DeeCodeK Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeeCodeK Labs",
    description: "Software Studio. Product Lab.",
    images: ["/logo-light.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const analytics = await getAnalyticsSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <SeoJsonLd />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} ${plexMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SmoothScroll>
            {children}
          </SmoothScroll>
          <Toaster />
          <SonnerToaster position="bottom-right" richColors />
          <AnalyticsScripts
            gaId={analytics.gaId}
            plausibleDomain={analytics.plausibleDomain}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
