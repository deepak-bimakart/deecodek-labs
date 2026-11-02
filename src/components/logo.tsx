import Image from "next/image";

// DeeCodeK Labs logo — uses the real brand logo image.
// Renders both light and dark variants, toggles visibility via CSS
// based on the .dark class on <html>. This is more reliable than
// useTheme() which can have hydration timing issues with next/image.
export function Logo({ className }: { className?: string }) {
  return (
    <div className={`relative inline-flex ${className ?? ""}`} style={{ minHeight: "1em" }}>
      {/* Light variant — visible when NOT in dark mode */}
      <Image
        src="/logo-light.png"
        alt="DeeCodeK Labs"
        width={120}
        height={93}
        className="h-auto w-auto dark:hidden"
        priority
      />
      {/* Dark variant — visible only in dark mode */}
      <Image
        src="/logo-dark.png"
        alt="DeeCodeK Labs"
        width={120}
        height={93}
        className="hidden h-auto w-auto dark:block"
        priority
      />
    </div>
  );
}
