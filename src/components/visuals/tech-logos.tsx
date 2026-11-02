// Monochrome tech logo SVGs — all use currentColor, inherit brand color
// Simplified but recognizable representations of each technology's icon

type IconProps = { className?: string };

export function NodeJsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 1.5L2.5 7v10L12 22.5 21.5 17V7L12 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M9 9v6M9 9l6 6M15 9v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function NestJsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 2C8 2 5 5 5 9c0 3 2 5 4 6l-1 4c0 1 1 2 2 2h4c1 0 2-1 2-2l-1-4c2-1 4-3 4-6 0-4-3-7-7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="10" cy="9" r="1" fill="currentColor"/>
      <circle cx="14" cy="9" r="1" fill="currentColor"/>
    </svg>
  );
}

export function NextJsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8 8v8M8 8l8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M16 8v8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function ReactIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.2"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.2" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.2" transform="rotate(120 12 12)"/>
    </svg>
  );
}

export function TypeScriptIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M7 10h4M9 10v6M13 16c.5.5 1.5 1 2.5 1 1.5 0 2.5-1 2.5-2s-1-1.5-2.5-2c-1.5-.5-2.5-1-2.5-2s1-2 2.5-2c1 0 2 .5 2.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function TailwindIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 12c1-4 3-6 6-6 2 0 3 1 4 3 1 2 2 3 4 3 3 0 5-2 6-6-1 4-3 6-6 6-2 0-3-1-4-3-1-2-2-3-4-3-3 0-5 2-6 6z" fill="currentColor"/>
    </svg>
  );
}

export function PostgreSqlIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <ellipse cx="12" cy="13" rx="8" ry="9" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8 11c1-2 3-2 4 0M12 11c1-2 3-2 4 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <path d="M9 16c1 1 4 1 6 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

export function RedisIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="3" y="11" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="3" y="17" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M7 7h1M7 13h1M7 19h1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

export function PrismaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 18L12 3l7 15-7 3-7-3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M12 3v18M5 18l7-3M19 18l-7-3" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function FlutterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M14 3L7 10l3 3 10-10h-6z" fill="currentColor"/>
      <path d="M14 13l-4 4 4 4h6l-4-4 4-4h-6z" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}

export function DartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 5l9-2 7 7-2 9-9 2-7-7 2-9z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M5 5l9-2-2 9-7-7z" fill="currentColor" opacity="0.3"/>
    </svg>
  );
}

export function OpenAiIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 4c-2 0-4 1-5 3-2 0-3 2-3 4s1 3 3 4c1 2 3 3 5 3s4-1 5-3c2-1 3-2 3-4s-1-4-3-4c-1-2-3-3-5-3z" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

export function FramerMotionIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 3h14L12 10h7l-9 11v-8H5V3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function ShadcnIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="13" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

export function TanstackIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8 12l4-4 4 4-4 4z" fill="currentColor"/>
    </svg>
  );
}

export function BullmqIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="8" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8 12h2M14 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function HiveIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M8 4l4 4-4 4-4-4 4-4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M16 12l4 4-4 4-4-4 4-4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function FirebaseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 18L9 4l4 8-8 6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M9 4l8 14-4-4-4 4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function LangchainIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="6" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="18" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="12" cy="16" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8 8l4 8M16 8l-4 8" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

export function PineconeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 3l3 4-3 4-3-4 3-4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M12 11l3 4-3 4-3-4 3-4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function PandasIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="6" y="3" width="3" height="18" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="11" y="3" width="3" height="18" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="16" y="3" width="3" height="18" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

export function PlaywrightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 8l7-4 7 4-7 12L5 8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M12 4v16" stroke="currentColor" strokeWidth="1"/>
    </svg>
  );
}

// Registry: tech name → icon component
export const TECH_ICONS: Record<string, (props: IconProps) => JSX.Element> = {
  "Node.js": NodeJsIcon,
  "NestJS": NestJsIcon,
  "Next.js": NextJsIcon,
  "React": ReactIcon,
  "TypeScript": TypeScriptIcon,
  "Tailwind CSS": TailwindIcon,
  "PostgreSQL": PostgreSqlIcon,
  "Redis": RedisIcon,
  "Prisma": PrismaIcon,
  "Flutter": FlutterIcon,
  "Dart": DartIcon,
  "OpenAI": OpenAiIcon,
  "Framer Motion": FramerMotionIcon,
  "shadcn/ui": ShadcnIcon,
  "TanStack Query": TanstackIcon,
  "BullMQ": BullmqIcon,
  "Hive": HiveIcon,
  "Firebase": FirebaseIcon,
  "LangChain": LangchainIcon,
  "Pinecone": PineconeIcon,
  "Pandas": PandasIcon,
  "Playwright": PlaywrightIcon,
};

export function TechLogo({ name, className }: { name: string; className?: string }) {
  const Icon = TECH_ICONS[name] ?? ShadcnIcon;
  return <Icon className={className} />;
}
