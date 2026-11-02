import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StoryChapter } from "./story-chapter";

export function StoryCloseCta({
  index = "03",
  label = "CLOSE",
  heading = "Ready when you are.",
  subheading = "Tell us what you want to ship. We'll tell you what the first six weeks look like.",
  primary = { label: "Start a conversation", href: "/contact" },
  secondary,
}: {
  index?: string;
  label?: string;
  heading?: string;
  subheading?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <StoryChapter id="chapter-close" index={index} label={label} className="border-b border-border">
      <div className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,255,255,0.08), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center lg:px-10 lg:py-28">
          <h2 className="display-lg mx-auto max-w-3xl font-medium text-balance text-primary-foreground">
            {heading}
          </h2>
          {subheading && (
            <p className="mt-6 text-lg text-primary-foreground/80">{subheading}</p>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={primary.href}
              className="group inline-flex items-center gap-1.5 rounded-md bg-primary-foreground px-5 py-3 text-sm font-medium text-primary transition-all hover:bg-primary-foreground/90"
            >
              {primary.label}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            {secondary && (
              <Link
                href={secondary.href}
                className="group inline-flex items-center gap-1.5 rounded-md border border-primary-foreground/30 px-5 py-3 text-sm font-medium transition-all hover:bg-primary-foreground/10"
              >
                {secondary.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </StoryChapter>
  );
}
