import Image from "next/image";

// DeeCodeK Labs logo — uses the real brand logo image.
// Renders both light and dark variants, toggles visibility via CSS
// based on the .dark class on <html>. This is more reliable than
// useTheme() which can have hydration timing issues with next/image.
// No priority: header logo is not the LCP element on the homepage.
export function Logo({ className }: { className?: string }) {
  return (
    <div className={`relative inline-flex ${className ?? ""}`} style={{ minHeight: "1em" }}>
      <Image
        src="/images/optimized/brand/logo-light.png"
        alt="DeeCodeK Labs"
        width={120}
        height={93}
        sizes="120px"
        className="h-auto w-auto dark:hidden"
      />
      <Image
        src="/images/optimized/brand/logo-dark.png"
        alt="DeeCodeK Labs"
        width={120}
        height={93}
        sizes="120px"
        className="hidden h-auto w-auto dark:block"
      />
    </div>
  );
}
