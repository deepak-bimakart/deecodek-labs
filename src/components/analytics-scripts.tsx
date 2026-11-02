"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

type Props = {
  gaId?: string | null;
  plausibleDomain?: string | null;
};

/** Inject GA / Plausible on public pages only (skips /admin). */
export function AnalyticsScripts({ gaId, plausibleDomain }: Props) {
  const pathname = usePathname() || "";
  if (pathname.startsWith("/admin")) return null;

  const ga = typeof gaId === "string" ? gaId.trim() : "";
  const plausible = typeof plausibleDomain === "string" ? plausibleDomain.trim() : "";

  return (
    <>
      {ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(ga)});
            `}
          </Script>
        </>
      ) : null}
      {plausible ? (
        <Script
          defer
          data-domain={plausible}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
