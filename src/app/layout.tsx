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
import { SITE_URL } from "@/lib/seo";
import { getGlobalSeoSettings } from "@/lib/seo-settings";

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

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getGlobalSeoSettings();
  const verification: Metadata["verification"] = {};
  if (seo.googleVerification) verification.google = seo.googleVerification;
  if (seo.bingVerification) {
    verification.other = { "msvalidate.01": seo.bingVerification };
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: seo.defaultTitle,
      template: seo.titleTemplate,
    },
    description: seo.defaultDescription,
    keywords: [
      seo.siteName,
      "software studio",
      "product lab",
      "full-stack development",
      "open source",
      "Flutter apps",
      "SaaS",
      "NestJS",
      "Next.js agency India",
    ],
    authors: [{ name: seo.siteName, url: SITE_URL }],
    creator: seo.siteName,
    publisher: seo.siteName,
    category: "technology",
    verification: Object.keys(verification).length ? verification : undefined,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",
    other: {
      "msapplication-TileColor": "#087F70",
    },
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
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      url: SITE_URL,
      siteName: seo.siteName,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: seo.defaultOgImage,
          width: 512,
          height: 512,
          alt: seo.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.siteName,
      description: "Software Studio. Product Lab.",
      images: [seo.defaultOgImage],
    },
  };
}

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
          <SmoothScroll>{children}</SmoothScroll>
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
