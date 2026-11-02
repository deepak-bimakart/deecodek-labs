import { z } from "zod";

// ──────────────────────────────────────────────────────────────────────
// SECTION TYPE REGISTRY
// Each section has: id, label, description, default content, zod schema
// The frontend renders sections based on type — no React code is stored in DB.
// ──────────────────────────────────────────────────────────────────────

export const ctaSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const metricSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const linkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

// Hero
export const heroSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  primaryCta: ctaSchema.optional(),
  secondaryCta: ctaSchema.optional(),
  metrics: z.array(metricSchema).optional(),
  backgroundImage: z.string().optional(),
});

// Split Hero
export const splitHeroSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  primaryCta: ctaSchema.optional(),
  secondaryCta: ctaSchema.optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  layout: z.enum(["left", "right"]).default("right"),
});

// Editorial Text
export const editorialTextSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  paragraphs: z.array(z.string()),
  stats: z.array(metricSchema).optional(),
  pullQuote: z.string().optional(),
});

// Capabilities Grid
export const capabilitiesGridSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  subheading: z.string().optional(),
  items: z.array(
    z.object({
      icon: z.string().default("Sparkles"),
      title: z.string(),
      description: z.string(),
    })
  ),
  columns: z.number().int().min(1).max(4).default(3),
});

// Services List (auto-populated from CMS — but allow override)
export const servicesListSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  subheading: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  limit: z.number().int().default(6),
  showIcons: z.boolean().default(true),
});

// Product Showcase
export const productShowcaseSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  subheading: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  limit: z.number().int().default(2),
});

// Portfolio Grid
export const portfolioGridSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  subheading: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  limit: z.number().int().default(6),
  featuredOnly: z.boolean().default(false),
});

// Tech Stack
export const techStackSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  groups: z.array(
    z.object({
      label: z.string(),
      items: z.array(z.string()),
    })
  ),
});

// Process Timeline
export const processTimelineSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  subheading: z.string().optional(),
  steps: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      duration: z.string().optional(),
    })
  ),
});

// Statistics
export const statisticsSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  stats: z.array(metricSchema),
});

// Testimonials
export const testimonialsSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  subheading: z.string().optional(),
  limit: z.number().int().default(3),
  featuredOnly: z.boolean().default(true),
});

// Image Gallery
export const imageGallerySchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  images: z.array(
    z.object({
      src: z.string(),
      alt: z.string().default(""),
      caption: z.string().optional(),
    })
  ),
  columns: z.number().int().min(1).max(4).default(3),
});

// Full-width Image
export const fullWidthImageSchema = z.object({
  src: z.string(),
  alt: z.string().default(""),
  caption: z.string().optional(),
  overlay: z.boolean().default(false),
});

// CTA
export const ctaSectionSchema = z.object({
  heading: z.string(),
  subheading: z.string().optional(),
  primaryCta: ctaSchema.optional(),
  secondaryCta: ctaSchema.optional(),
  variant: z.enum(["default", "compact", "banner"]).default("default"),
});

// FAQ
export const faqSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  subheading: z.string().optional(),
  // If empty, auto-pull from CMS Faqs table
  items: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ).default([]),
});

// Contact Form
export const contactFormSchema = z.object({
  heading: z.string(),
  subheading: z.string().optional(),
  services: z.array(z.string()).default([]),
  showBudget: z.boolean().default(true),
});

// Blog Listing
export const blogListingSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  subheading: z.string().optional(),
  limit: z.number().int().default(3),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

// Section type registry
export type SectionType = {
  id: string;
  label: string;
  description: string;
  schema: z.ZodType<any>;
  defaultContent: () => Record<string, any>;
};

export const SECTION_TYPES: SectionType[] = [
  {
    id: "hero",
    label: "Hero",
    description: "Oversized headline with CTAs and optional metrics.",
    schema: heroSchema,
    defaultContent: () => ({
      eyebrow: "Eyebrow",
      title: "Your headline here.",
      subtitle: "A supporting one-liner.",
      primaryCta: { label: "Build With Us", href: "/contact" },
      secondaryCta: { label: "Explore Our Work", href: "/work" },
      metrics: [
        { label: "Metric", value: "Value" },
      ],
    }),
  },
  {
    id: "split_hero",
    label: "Split Hero",
    description: "Two-column hero with text on one side, image on the other.",
    schema: splitHeroSchema,
    defaultContent: () => ({
      eyebrow: "Eyebrow",
      title: "Split hero headline.",
      subtitle: "Supporting text.",
      primaryCta: { label: "Build With Us", href: "/contact" },
      image: "",
      layout: "right",
    }),
  },
  {
    id: "editorial_text",
    label: "Editorial Text",
    description: "Long-form text block with stats and pull quote.",
    schema: editorialTextSchema,
    defaultContent: () => ({
      eyebrow: "Section eyebrow",
      heading: "Editorial heading.",
      paragraphs: ["First paragraph.", "Second paragraph."],
      stats: [{ label: "Stat", value: "Value" }],
    }),
  },
  {
    id: "capabilities_grid",
    label: "Capabilities Grid",
    description: "Grid of capability cards with icons.",
    schema: capabilitiesGridSchema,
    defaultContent: () => ({
      eyebrow: "Capabilities",
      heading: "What we do.",
      subheading: "Subheading.",
      items: [
        { icon: "Server", title: "Capability 1", description: "Description." },
        { icon: "Globe", title: "Capability 2", description: "Description." },
        { icon: "Bot", title: "Capability 3", description: "Description." },
      ],
      columns: 3,
    }),
  },
  {
    id: "services_list",
    label: "Services List",
    description: "Auto-populated from CMS Services. Override heading.",
    schema: servicesListSchema,
    defaultContent: () => ({
      eyebrow: "Services",
      heading: "Six categories of work we ship.",
      subheading: "Subheading.",
      ctaLabel: "All services",
      ctaHref: "/services",
      limit: 6,
    }),
  },
  {
    id: "product_showcase",
    label: "Product Showcase",
    description: "Auto-populated from CMS Products (featured).",
    schema: productShowcaseSchema,
    defaultContent: () => ({
      eyebrow: "Products from the Lab",
      heading: "Built in-house. Used in production.",
      ctaLabel: "All products",
      ctaHref: "/products",
      limit: 2,
    }),
  },
  {
    id: "portfolio_grid",
    label: "Portfolio Grid",
    description: "Auto-populated from CMS Projects.",
    schema: portfolioGridSchema,
    defaultContent: () => ({
      eyebrow: "Work",
      heading: "Recent projects.",
      ctaLabel: "All work",
      ctaHref: "/work",
      limit: 6,
    }),
  },
  {
    id: "tech_stack",
    label: "Tech Stack",
    description: "Grouped lists of technologies.",
    schema: techStackSchema,
    defaultContent: () => ({
      eyebrow: "Tech Stack",
      heading: "The tools we use.",
      groups: [
        { label: "Backend", items: ["Node.js", "TypeScript"] },
        { label: "Frontend", items: ["Next.js", "React"] },
      ],
    }),
  },
  {
    id: "process_timeline",
    label: "Process Timeline",
    description: "Numbered process steps with durations.",
    schema: processTimelineSchema,
    defaultContent: () => ({
      eyebrow: "Process",
      heading: "How we work.",
      steps: [
        { title: "Discover", description: "First step.", duration: "1 wk" },
        { title: "Design", description: "Second step.", duration: "1 wk" },
        { title: "Ship", description: "Third step.", duration: "4 wks" },
      ],
    }),
  },
  {
    id: "statistics",
    label: "Statistics",
    description: "Stat block — metrics only.",
    schema: statisticsSchema,
    defaultContent: () => ({
      eyebrow: "By the numbers",
      stats: [
        { label: "Years", value: "8+" },
        { label: "Products", value: "12" },
      ],
    }),
  },
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Auto-populated from CMS Testimonials.",
    schema: testimonialsSchema,
    defaultContent: () => ({
      eyebrow: "Testimonials",
      heading: "What clients say.",
      limit: 3,
    }),
  },
  {
    id: "image_gallery",
    label: "Image Gallery",
    description: "Grid of images with captions.",
    schema: imageGallerySchema,
    defaultContent: () => ({
      heading: "Gallery",
      images: [
        { src: "", alt: "Image 1" },
        { src: "", alt: "Image 2" },
      ],
      columns: 3,
    }),
  },
  {
    id: "full_width_image",
    label: "Full-Width Image",
    description: "Single full-width image with optional caption.",
    schema: fullWidthImageSchema,
    defaultContent: () => ({
      src: "",
      alt: "",
      caption: "",
      overlay: false,
    }),
  },
  {
    id: "cta",
    label: "CTA",
    description: "Call-to-action block.",
    schema: ctaSectionSchema,
    defaultContent: () => ({
      heading: "Have a product in your head?",
      subheading: "Tell us about it.",
      primaryCta: { label: "Build With Us", href: "/contact" },
      secondaryCta: { label: "See our work", href: "/work" },
      variant: "default",
    }),
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Accordion of FAQs — auto-pulls from CMS if items empty.",
    schema: faqSchema,
    defaultContent: () => ({
      eyebrow: "FAQ",
      heading: "Common questions.",
      items: [],
    }),
  },
  {
    id: "contact_form",
    label: "Contact Form",
    description: "Working contact form (stores to CMS).",
    schema: contactFormSchema,
    defaultContent: () => ({
      heading: "Build with us.",
      subheading: "Tell us what you want to ship.",
      services: [],
      showBudget: true,
    }),
  },
  {
    id: "blog_listing",
    label: "Blog Listing",
    description: "Recent published blog posts.",
    schema: blogListingSchema,
    defaultContent: () => ({
      eyebrow: "Blog",
      heading: "Recent writing.",
      ctaLabel: "All posts",
      ctaHref: "/blog",
      limit: 3,
    }),
  },
];

export const SECTION_TYPE_MAP: Record<string, SectionType> = Object.fromEntries(
  SECTION_TYPES.map((t) => [t.id, t])
);

export function getSectionType(id: string): SectionType | undefined {
  return SECTION_TYPE_MAP[id];
}

export function validateSectionContent(typeId: string, content: any) {
  const t = getSectionType(typeId);
  if (!t) return { success: false, error: "Unknown section type" };
  return t.schema.safeParse(content);
}

export type HeroContent = z.infer<typeof heroSchema>;
export type CapabilitiesGridContent = z.infer<typeof capabilitiesGridSchema>;
export type EditorialTextContent = z.infer<typeof editorialTextSchema>;
export type TechStackContent = z.infer<typeof techStackSchema>;
export type CTAContent = z.infer<typeof ctaSectionSchema>;
export type ProductShowcaseContent = z.infer<typeof productShowcaseSchema>;
export type ServicesListContent = z.infer<typeof servicesListSchema>;
export type FAQContent = z.infer<typeof faqSchema>;
export type ContactFormContent = z.infer<typeof contactFormSchema>;
export type BlogListingContent = z.infer<typeof blogListingSchema>;
export type PortfolioGridContent = z.infer<typeof portfolioGridSchema>;
export type ImageGalleryContent = z.infer<typeof imageGallerySchema>;
export type FullWidthImageContent = z.infer<typeof fullWidthImageSchema>;
export type ProcessTimelineContent = z.infer<typeof processTimelineSchema>;
export type StatisticsContent = z.infer<typeof statisticsSchema>;
export type TestimonialsContent = z.infer<typeof testimonialsSchema>;
export type SplitHeroContent = z.infer<typeof splitHeroSchema>;
