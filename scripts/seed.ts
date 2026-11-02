import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// DeeCodeK Labs seed — uses real brand content provided by founder
async function main() {
  console.log("🌱 Seeding DeeCodeK Labs...");

  // ──────────────────────────────────────────────────────────────────────
  // USERS
  // ──────────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);

  const superAdmin = await db.user.upsert({
    where: { email: "admin@deecodeklabs.com" },
    update: {},
    create: {
      email: "admin@deecodeklabs.com",
      name: "DeeCodeK Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  const editorUser = await db.user.upsert({
    where: { email: "editor@deecodeklabs.com" },
    update: {},
    create: {
      email: "editor@deecodeklabs.com",
      name: "Content Editor",
      passwordHash,
      role: "EDITOR",
      isActive: true,
    },
  });

  console.log(`  ✓ Users: ${superAdmin.email}, ${editorUser.email}`);

  // ──────────────────────────────────────────────────────────────────────
  // SITE SETTINGS
  // ──────────────────────────────────────────────────────────────────────
  const settings = [
    { key: "brand.name", value: JSON.stringify("DeeCodeK Labs") },
    { key: "brand.tagline", value: JSON.stringify("Software Studio. Product Lab.") },
    { key: "brand.email", value: JSON.stringify("hello@deecodeklabs.com") },
    { key: "theme.default", value: JSON.stringify("light") },
    { key: "theme.available", value: JSON.stringify(["light", "dark"]) },
    { key: "homepage.heroTitle", value: JSON.stringify("We Build Software That Actually Ships.") },
    {
      key: "homepage.heroSubtitle",
      value: JSON.stringify(
        "Custom products, scalable backends, and useful tools engineered for the real world."
      ),
    },
    { key: "homepage.primaryCtaLabel", value: JSON.stringify("Build With Us") },
    { key: "homepage.primaryCtaHref", value: JSON.stringify("/contact") },
    { key: "homepage.secondaryCtaLabel", value: JSON.stringify("Explore Our Work") },
    { key: "homepage.secondaryCtaHref", value: JSON.stringify("/work") },
    { key: "social.github", value: JSON.stringify("https://github.com/deecodeklabs") },
    { key: "social.linkedin", value: JSON.stringify("https://linkedin.com/company/deecodeklabs") },
    { key: "social.twitter", value: JSON.stringify("https://twitter.com/deecodeklabs") },
    {
      key: "social.links",
      value: JSON.stringify([
        { id: "social_github", label: "GitHub", url: "https://github.com/deecodeklabs", icon: "github" },
        { id: "social_linkedin", label: "LinkedIn", url: "https://linkedin.com/company/deecodeklabs", icon: "linkedin" },
        { id: "social_twitter", label: "Twitter", url: "https://twitter.com/deecodeklabs", icon: "twitter" },
      ]),
    },
    {
      key: "listHero.products",
      value: JSON.stringify({
        eyebrow: "Products from the Lab",
        title: "Built in-house. Used in production.",
        subtitle: "Products we build to scratch our own itch — then turn into something others can use.",
      }),
    },
    {
      key: "listHero.work",
      value: JSON.stringify({
        eyebrow: "Work",
        title: "Selected projects and case studies.",
        subtitle: "We don't publish case studies we can't stand behind. When a project ships and the story is real, it shows up here.",
      }),
    },
    {
      key: "listHero.blog",
      value: JSON.stringify({
        eyebrow: "Blog",
        title: "Writing on engineering, product, and studio life.",
        subtitle: "Notes from building software in the open.",
      }),
    },
    {
      key: "listHero.services",
      value: JSON.stringify({
        eyebrow: "Services",
        title: "Six categories of work we ship.",
        subtitle: "From a blank repo to a deployed product. Each category maps to a real codebase we've shipped.",
      }),
    },
    { key: "analytics.gaId", value: JSON.stringify("") },
    { key: "analytics.plausibleDomain", value: JSON.stringify("") },
    { key: "opensource.url", value: JSON.stringify("https://opensource.deecodeklabs.com") },
    { key: "opensource.seo.title", value: JSON.stringify("Open Source Playground") },
    {
      key: "opensource.seo.description",
      value: JSON.stringify(
        "Small experiments. Useful tools. Developer-first open source software from DeeCodeK Labs."
      ),
    },
    { key: "opensource.seo.ogImage", value: JSON.stringify("") },
    { key: "opensource.projects", value: JSON.stringify([
      {
        id: "oss_seed_1",
        name: "Ext Forge",
        slug: "ext-forge",
        description: "A drag-and-drop visual builder for creating browser extensions and connecting workflows.",
        repoUrl: "https://github.com/deecodeklabs",
        demoUrl: "",
        category: "DEVELOPER TOOL",
        filterCat: "developer",
        symbol: "⚙",
        technologies: ["Electron", "JavaScript", "Visual Builder"],
        stars: 0,
        forks: 0,
        isFeatured: true,
        sortOrder: 0,
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "oss_seed_2",
        name: "LaraDevenv",
        slug: "laradevenv",
        description: "A local development environment concept focused on making PHP development simpler.",
        repoUrl: "https://github.com/deecodeklabs",
        demoUrl: "",
        category: "UTILITY",
        filterCat: "utilities",
        symbol: ">_",
        technologies: ["Go", "PHP"],
        stars: 0,
        forks: 0,
        isFeatured: false,
        sortOrder: 1,
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "oss_seed_3",
        name: "Study Buddy",
        slug: "study-buddy",
        description: "An AI-assisted learning experiment with document understanding and summarisation.",
        repoUrl: "https://github.com/deecodeklabs",
        demoUrl: "",
        category: "EXPERIMENT",
        filterCat: "experiments",
        symbol: "✦",
        technologies: ["Python", "AI"],
        stars: 0,
        forks: 0,
        isFeatured: false,
        sortOrder: 2,
        status: "wip",
        createdAt: new Date().toISOString(),
      },
      {
        id: "oss_seed_4",
        name: "JSON Chunker",
        slug: "json-chunker",
        description: "A developer utility for splitting and processing large JSON data into manageable chunks.",
        repoUrl: "https://github.com/deecodeklabs",
        demoUrl: "",
        category: "DEVELOPER TOOL",
        filterCat: "developer",
        symbol: "{ }",
        technologies: ["Laravel", "PHP"],
        stars: 0,
        forks: 0,
        isFeatured: false,
        sortOrder: 3,
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ]) },
  ];

  for (const s of settings) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // Migrate: if social.links is empty/missing but legacy keys exist, seed from them
  const socialLinksSetting = await db.siteSetting.findUnique({ where: { key: "social.links" } });
  let hasLinks = false;
  if (socialLinksSetting) {
    try {
      const parsed = JSON.parse(socialLinksSetting.value);
      hasLinks = Array.isArray(parsed) && parsed.length > 0;
    } catch {}
  }
  if (!hasLinks) {
    const legacyKeys = await db.siteSetting.findMany({
      where: { key: { in: ["social.github", "social.linkedin", "social.twitter"] } },
    });
    const map: Record<string, any> = {};
    for (const s of legacyKeys) {
      try {
        map[s.key] = JSON.parse(s.value);
      } catch {
        map[s.key] = s.value;
      }
    }
    const migrated = [
      map["social.github"] && {
        id: "social_github",
        label: "GitHub",
        url: map["social.github"],
        icon: "github",
      },
      map["social.linkedin"] && {
        id: "social_linkedin",
        label: "LinkedIn",
        url: map["social.linkedin"],
        icon: "linkedin",
      },
      map["social.twitter"] && {
        id: "social_twitter",
        label: "Twitter",
        url: map["social.twitter"],
        icon: "twitter",
      },
    ].filter(Boolean);
    if (migrated.length > 0) {
      await db.siteSetting.upsert({
        where: { key: "social.links" },
        update: { value: JSON.stringify(migrated) },
        create: { key: "social.links", value: JSON.stringify(migrated) },
      });
      console.log(`  ✓ Migrated social.links from legacy keys (${migrated.length})`);
    }
  }

  console.log(`  ✓ Site settings (${settings.length})`);

  // ──────────────────────────────────────────────────────────────────────
  // NAVIGATION MENUS
  // ──────────────────────────────────────────────────────────────────────
  const headerMenu = await db.navigationMenu.upsert({
    where: { slug: "header" },
    update: {},
    create: { name: "Header", slug: "header" },
  });

  const headerItems = [
    { label: "Services", url: "/services", sortOrder: 1 },
    { label: "Products", url: "/products", sortOrder: 2 },
    { label: "Work", url: "/work", sortOrder: 3 },
    { label: "About", url: "/about", sortOrder: 4 },
    { label: "Blog", url: "/blog", sortOrder: 5 },
    { label: "Open Source", url: "https://opensource.deecodeklabs.com", sortOrder: 6, isNewTab: true },
    { label: "Build With Us", url: "/contact", sortOrder: 7, isButton: true },
  ];

  await db.navigationItem.deleteMany({ where: { menuId: headerMenu.id } });
  for (const item of headerItems) {
    await db.navigationItem.create({
      data: { ...item, menuId: headerMenu.id },
    });
  }

  const footerMenu = await db.navigationMenu.upsert({
    where: { slug: "footer" },
    update: {},
    create: { name: "Footer", slug: "footer" },
  });

  const footerItems = [
    { label: "Services", url: "/services", sortOrder: 1 },
    { label: "Products", url: "/products", sortOrder: 2 },
    { label: "Work", url: "/work", sortOrder: 3 },
    { label: "About", url: "/about", sortOrder: 4 },
    { label: "Blog", url: "/blog", sortOrder: 5 },
    { label: "Open Source", url: "https://opensource.deecodeklabs.com", sortOrder: 6, isNewTab: true },
    { label: "Contact", url: "/contact", sortOrder: 7 },
  ];

  await db.navigationItem.deleteMany({ where: { menuId: footerMenu.id } });
  for (const item of footerItems) {
    await db.navigationItem.create({
      data: { ...item, menuId: footerMenu.id },
    });
  }
  console.log(`  ✓ Navigation menus`);

  // ──────────────────────────────────────────────────────────────────────
  // HOMEPAGE PAGE + SECTIONS
  // ──────────────────────────────────────────────────────────────────────
  const homepageSeo = await db.seoMetadata.create({
    data: {
      metaTitle: "DeeCodeK Labs — Software Studio. Product Lab.",
      metaDescription:
        "Custom products, scalable backends, and useful tools engineered for the real world.",
      ogTitle: "DeeCodeK Labs",
      ogDescription: "Software Studio. Product Lab.",
      robotsIndex: true,
      robotsFollow: true,
    },
  });

  const homepage = await db.page.upsert({
    where: { slug: "home" },
    update: { seoId: homepageSeo.id },
    create: {
      title: "Homepage",
      slug: "home",
      pageType: "homepage",
      isHomepage: true,
      status: "PUBLISHED",
      publishedAt: new Date(),
      updatedById: superAdmin.id,
      seoId: homepageSeo.id,
    },
  });

  await db.pageSection.deleteMany({ where: { pageId: homepage.id } });

  // Section 1: Hero
  await db.pageSection.create({
    data: {
      pageId: homepage.id,
      sectionType: "hero",
      title: "Hero",
      sortOrder: 0,
      isVisible: true,
      designVariant: "default",
      themeVariant: "auto",
      content: JSON.stringify({
        eyebrow: "Software Studio · Product Lab",
        title: "We Build Software That Actually Ships.",
        subtitle:
          "Custom products, scalable backends, and useful tools engineered for the real world.",
        primaryCta: { label: "Build With Us", href: "/contact" },
        secondaryCta: { label: "Explore Our Work", href: "/work" },
        metrics: [
          { label: "Products shipped", value: "12+" },
          { label: "Avg. shipping cycle", value: "6 wks" },
          { label: "Production users", value: "30K+" },
        ],
      }),
    },
  });

  // Section 2: Capabilities
  await db.pageSection.create({
    data: {
      pageId: homepage.id,
      sectionType: "capabilities_grid",
      title: "Capabilities",
      sortOrder: 1,
      isVisible: true,
      content: JSON.stringify({
        eyebrow: "Capabilities",
        heading: "What we ship, end to end.",
        subheading:
          "From a blank repo to a deployed product — backend, frontend, mobile, AI agents, and the SaaS business layer around it.",
        items: [
          {
            icon: "Server",
            title: "Scalable Backends",
            description:
              "Type-safe Node.js / NestJS APIs, Prisma schemas, queue workers, and infra that survives real load.",
          },
          {
            icon: "Globe",
            title: "Full-Stack Web",
            description:
              "Next.js App Router, server components, design systems, and editorial frontends that don't look like a template.",
          },
          {
            icon: "Smartphone",
            title: "Flutter Mobile",
            description:
              "Offline-first Android + iOS apps with native-feeling UX and clean state architecture.",
          },
          {
            icon: "Bot",
            title: "AI Agent Systems",
            description:
              "Tool-using LLM agents, RAG pipelines, evaluation harnesses — built for production workloads.",
          },
          {
            icon: "Boxes",
            title: "SaaS Products",
            description:
              "Multi-tenant SaaS with billing, RBAC, audit logs, and the unglamorous plumbing that makes it work.",
          },
          {
            icon: "Plug",
            title: "API & Integrations",
            description:
              "REST + OpenAPI, third-party integrations, webhook systems, and SDK design that other devs actually enjoy.",
          },
        ],
      }),
    },
  });

  // Section 3: Products from the Lab
  await db.pageSection.create({
    data: {
      pageId: homepage.id,
      sectionType: "product_showcase",
      title: "Products from the Lab",
      sortOrder: 2,
      isVisible: true,
      content: JSON.stringify({
        eyebrow: "Products from the Lab",
        heading: "Built in-house. Used in production.",
        subheading:
          "Two products live in the lab right now — one aimed at marketers, one aimed at boutique owners.",
        ctaLabel: "All products",
        ctaHref: "/products",
      }),
    },
  });

  // Section 4: How We Work — Process Timeline (NEW)
  await db.pageSection.create({
    data: {
      pageId: homepage.id,
      sectionType: "process_timeline",
      title: "How We Work",
      sortOrder: 3,
      isVisible: true,
      content: JSON.stringify({
        eyebrow: "How We Work",
        heading: "From first idea to production.",
        subheading:
          "We turn complex ideas into reliable software through a focused engineering process.",
        steps: [
          {
            title: "Discover",
            description:
              "Understand the problem, users and business requirements. We map the territory before we move.",
            duration: "1 wk",
          },
          {
            title: "Architect",
            description:
              "Plan the system architecture, technology choices and delivery approach. Schema first, code second.",
            duration: "1 wk",
          },
          {
            title: "Build",
            description:
              "Develop, integrate and test the product. Working software, not slides, by end of week four.",
            duration: "4 wks",
          },
          {
            title: "Ship",
            description:
              "Deploy, monitor, optimize and improve. Production-grade from day one, with on-call coverage.",
            duration: "ongoing",
          },
        ],
      }),
    },
  });

  // Section 5: Tech Stack
  await db.pageSection.create({
    data: {
      pageId: homepage.id,
      sectionType: "tech_stack",
      title: "Technology Stack",
      sortOrder: 4,
      isVisible: true,
      content: JSON.stringify({
        eyebrow: "Technology Stack",
        heading: "The tools we reach for, every week.",
        groups: [
          {
            label: "Backend",
            items: ["Node.js", "NestJS", "TypeScript", "Prisma", "PostgreSQL", "Redis", "BullMQ"],
          },
          {
            label: "Frontend",
            items: ["Next.js", "React", "Tailwind CSS", "shadcn/ui", "Framer Motion", "TanStack Query"],
          },
          {
            label: "Mobile",
            items: ["Flutter", "Dart", "Riverpod", "Hive", "Firebase"],
          },
          {
            label: "AI / Data",
            items: ["OpenAI", "LangChain", "Pinecone", "Pandas", "Playwright"],
          },
        ],
      }),
    },
  });

  // Section 6: Why DeeCodeK
  await db.pageSection.create({
    data: {
      pageId: homepage.id,
      sectionType: "editorial_text",
      title: "Why DeeCodeK Labs",
      sortOrder: 5,
      isVisible: true,
      content: JSON.stringify({
        eyebrow: "Why DeeCodeK Labs",
        heading: "We optimize for shipped, not for slides.",
        paragraphs: [
          "Most studios sell decks. We ship production software — the kind that has real users, real billing, and real 3am pages. Every engagement starts with a six-week path to a working product, not a 60-page proposal.",
          "We're a small studio on purpose. The person who writes the schema is the person who writes the deploy script is the person who answers the on-call. No relay race, no hand-offs, no 'the backend team will get to it next sprint'.",
          "And we build our own products in parallel — so the code we ship to clients is informed by what we learn running software in production ourselves.",
        ],
        stats: [
          { label: "Years building", value: "8+" },
          { label: "Products in production", value: "12" },
          { label: "Client codebases", value: "30+" },
          { label: "Avg. response time", value: "<4h" },
        ],
      }),
    },
  });

  // Section 7: CTA
  await db.pageSection.create({
    data: {
      pageId: homepage.id,
      sectionType: "cta",
      title: "CTA",
      sortOrder: 6,
      isVisible: true,
      content: JSON.stringify({
        heading: "Have a product in your head?",
        subheading:
          "Tell us what you want to build. We'll tell you, honestly, whether it's a six-week build or a six-month one — and what the first six weeks would look like.",
        primaryCta: { label: "Build With Us", href: "/contact" },
        secondaryCta: { label: "See our work", href: "/work" },
      }),
    },
  });

  console.log(`  ✓ Homepage with 7 sections (incl. How We Work timeline)`);

  // ──────────────────────────────────────────────────────────────────────
  // SERVICES — six categories
  // ──────────────────────────────────────────────────────────────────────
  const servicesData = [
    {
      title: "Backend Development",
      slug: "backend-development",
      summary: "Type-safe Node.js backends that survive real production load.",
      description:
        "NestJS modules, Prisma schemas, queue workers, and the unglamorous plumbing — auth, audit, RBAC, migrations — that make a backend actually production-grade.",
      icon: "Server",
      technologies: ["Node.js", "NestJS", "TypeScript", "Prisma", "PostgreSQL", "Redis"],
      capabilities: [
        "Modular NestJS architecture",
        "Prisma schema design + migrations",
        "JWT + session auth with refresh rotation",
        "Role-based access control",
        "Background jobs with BullMQ",
        "Structured logging + health endpoints",
      ],
      isFeatured: true,
      sortOrder: 1,
    },
    {
      title: "Full-Stack Web Applications",
      slug: "full-stack-web-applications",
      summary: "Next.js App Router apps with real editorial design — not SaaS templates.",
      description:
        "Server components, design systems, content-driven frontends, and the integration layer that connects a public site to a custom headless CMS.",
      icon: "Globe",
      technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui", "TanStack Query"],
      capabilities: [
        "Next.js App Router architecture",
        "Server components + RSC patterns",
        "Design systems with Tailwind + shadcn/ui",
        "Custom headless CMS integration",
        "SSR + ISR + edge caching",
        "Form validation with React Hook Form + Zod",
      ],
      isFeatured: true,
      sortOrder: 2,
    },
    {
      title: "Flutter Mobile Apps",
      slug: "flutter-mobile-apps",
      summary: "Offline-first Android + iOS apps with native-feeling UX.",
      description:
        "Clean Riverpod architecture, local-first storage, background sync, and UIs that feel like they belong on the device — not like a wrapped web view.",
      icon: "Smartphone",
      technologies: ["Flutter", "Dart", "Riverpod", "Hive", "Firebase", "Workmanager"],
      capabilities: [
        "Riverpod state architecture",
        "Offline-first data layer",
        "Background sync + workmanager",
        "Native-feeling UI + animations",
        "Firebase / custom backend integration",
        "Play Store + App Store deployment",
      ],
      isFeatured: false,
      sortOrder: 3,
    },
    {
      title: "AI Agent Systems",
      slug: "ai-agent-systems",
      summary: "Tool-using LLM agents and RAG pipelines built for production workloads.",
      description:
        "Agent loops with real tool calls, retrieval pipelines with evaluation harnesses, prompt versioning, and the observability layer that tells you when (not if) the model drifts.",
      icon: "Bot",
      technologies: ["OpenAI", "LangChain", "Pinecone", "TypeScript", "Python", "Playwright"],
      capabilities: [
        "Tool-using agent loops",
        "RAG with chunking + reranking",
        "Prompt versioning + A/B",
        "Evaluation harnesses",
        "Cost + latency observability",
        "Streaming + structured output",
      ],
      isFeatured: true,
      sortOrder: 4,
    },
    {
      title: "SaaS Product Development",
      slug: "saas-product-development",
      summary: "Multi-tenant SaaS with billing, RBAC, audit logs — the full business layer.",
      description:
        "Tenant isolation, usage metering, Stripe billing, plan gating, audit trails, and the onboarding flows that turn signups into paying customers.",
      icon: "Boxes",
      technologies: ["Next.js", "Stripe", "PostgreSQL", "Prisma", "BullMQ", "Resend"],
      capabilities: [
        "Multi-tenant data isolation",
        "Stripe billing + usage metering",
        "Plan gating + feature flags",
        "Audit logs + compliance-ready",
        "Onboarding + activation flows",
        "Admin + customer-facing portals",
      ],
      isFeatured: true,
      sortOrder: 5,
    },
    {
      title: "API Design & Integrations",
      slug: "api-design-integrations",
      summary: "REST + OpenAPI, third-party integrations, webhooks, and SDKs other devs enjoy.",
      description:
        "Versioned REST APIs with OpenAPI docs, idempotent webhook receivers, retry strategies, and SDKs in TypeScript / Python that don't make people angry.",
      icon: "Plug",
      technologies: ["OpenAPI", "Swagger", "TypeScript", "Webhooks", "Zod", "Stripe"],
      capabilities: [
        "OpenAPI-spec'd REST endpoints",
        "Webhook senders + receivers",
        "Idempotency + retry strategies",
        "Third-party API integrations",
        "SDK generation (TS / Python)",
        "API versioning + deprecation",
      ],
      isFeatured: false,
      sortOrder: 6,
    },
  ];

  for (const s of servicesData) {
    const existing = await db.service.findUnique({ where: { slug: s.slug } });
    if (existing) {
      await db.service.update({
        where: { id: existing.id },
        data: {
          ...s,
          technologies: JSON.stringify(s.technologies),
          capabilities: JSON.stringify(s.capabilities),
          richContent: s.description,
          status: "PUBLISHED",
        },
      });
    } else {
      await db.service.create({
        data: {
          ...s,
          technologies: JSON.stringify(s.technologies),
          capabilities: JSON.stringify(s.capabilities),
          richContent: s.description,
          status: "PUBLISHED",
        },
      });
    }
  }
  console.log(`  ✓ Services (${servicesData.length})`);

  // ──────────────────────────────────────────────────────────────────────
  // PRODUCTS — MarketFlow + Sadika
  // ──────────────────────────────────────────────────────────────────────
  const marketFlow = await db.product.upsert({
    where: { slug: "marketflow" },
    update: {},
    create: {
      name: "MarketFlow",
      slug: "marketflow",
      tagline: "Every signal. One screen.",
      category: "Marketing Technology",
      summary:
        "Unified marketing dashboard aggregating 28+ platforms — ads, analytics, social, email, CRM, SEO — into one command center.",
      description:
        "MarketFlow collapses a marketer's scattered tab graveyard into a single live dashboard. Ads, analytics, social, email, CRM, SEO — all unified into one command center with cross-platform metrics and a unified lead inbox. Currently in late-stage development.",
      richContent:
        "# MarketFlow\n\nEvery signal. One screen. A unified marketing dashboard aggregating 28+ platforms into one command center.",
      status: "coming_soon",
      technologies: JSON.stringify(["Next.js", "Node.js", "PostgreSQL", "Redis", "BullMQ", "Playwright"]),
      gallery: JSON.stringify([]),
      isFeatured: true,
      sortOrder: 1,
    },
  });

  const marketFlowFeatures = [
    { title: "Platform Integrations", description: "28+ ad, analytics, social, email, CRM and SEO platforms wired in.", sortOrder: 1 },
    { title: "Unified Lead Inbox", description: "Every inbound lead from every channel in a single inbox.", sortOrder: 2 },
    { title: "Cross-Platform Metrics", description: "Normalized cost, reach, conversion and ROAS across platforms.", sortOrder: 3 },
    { title: "Campaign Management", description: "Pause, scale and clone campaigns across networks in one action.", sortOrder: 4 },
    { title: "Reporting", description: "Auto-generated stakeholder reports with white-label export.", sortOrder: 5 },
  ];
  await db.productFeature.deleteMany({ where: { productId: marketFlow.id } });
  for (const f of marketFlowFeatures) {
    await db.productFeature.create({
      data: { ...f, productId: marketFlow.id },
    });
  }

  const sadika = await db.product.upsert({
    where: { slug: "sadika" },
    update: {},
    create: {
      name: "Sadika",
      slug: "sadika",
      tagline: "Aapki dukaan, aapki taraf.",
      category: "Boutique Technology",
      summary:
        "Premium offline Android app for ladies' tailoring boutiques. Customer management, orders, measurements, billing — all in a stunning Noir Couture design.",
      description:
        "Sadika is a premium offline-first Android app built for ladies' tailoring boutiques. Customer management, measurement records, order tracking, fabric inventory and billing — all wrapped in a Noir Couture design language that feels like a couture atelier, not a billing app.",
      richContent:
        "# Sadika\n\nAapki dukaan, aapki taraf. Premium offline-first Android app for ladies' tailoring boutiques.",
      status: "in_development",
      technologies: JSON.stringify(["Flutter", "Dart", "Riverpod", "Hive", "SQLite", "Material 3"]),
      gallery: JSON.stringify([]),
      isFeatured: true,
      sortOrder: 2,
    },
  });

  const sadikaFeatures = [
    { title: "Customer Management", description: "Customer profiles with measurement history and order timeline.", sortOrder: 1 },
    { title: "Measurement Records", description: "Structured measurement records with body diagrams.", sortOrder: 2 },
    { title: "Order Tracking", description: "Order status pipeline from stitch to delivery.", sortOrder: 3 },
    { title: "Fabric Inventory", description: "Fabric stock with auto-deduction on order completion.", sortOrder: 4 },
    { title: "Billing", description: "GST-ready invoices with print + share.", sortOrder: 5 },
    { title: "Offline-First Architecture", description: "Works without internet. Syncs when network returns.", sortOrder: 6 },
  ];
  await db.productFeature.deleteMany({ where: { productId: sadika.id } });
  for (const f of sadikaFeatures) {
    await db.productFeature.create({
      data: { ...f, productId: sadika.id },
    });
  }
  console.log(`  ✓ Products (MarketFlow, Sadika) with features`);

  // ──────────────────────────────────────────────────────────────────────
  // BLOG CATEGORIES + ONE SAMPLE POST
  // ──────────────────────────────────────────────────────────────────────
  const catEngineering = await db.blogCategory.upsert({
    where: { slug: "engineering" },
    update: {},
    create: { name: "Engineering", slug: "engineering", description: "How we build." },
  });

  const catProduct = await db.blogCategory.upsert({
    where: { slug: "product" },
    update: {},
    create: { name: "Product", slug: "product", description: "How we think about products." },
  });

  const catStudio = await db.blogCategory.upsert({
    where: { slug: "studio" },
    update: {},
    create: { name: "Studio", slug: "studio", description: "Life at DeeCodeK Labs." },
  });

  const tagShipping = await db.blogTag.upsert({
    where: { slug: "shipping" },
    update: {},
    create: { name: "shipping", slug: "shipping" },
  });

  const tagNestjs = await db.blogTag.upsert({
    where: { slug: "nestjs" },
    update: {},
    create: { name: "nestjs", slug: "nestjs" },
  });

  // Portfolio projects (published, honest placeholders — no fake metrics)
  await db.project.upsert({
    where: { slug: "retail-ops-console" },
    update: { status: "PUBLISHED" },
    create: {
      name: "Retail Ops Console",
      slug: "retail-ops-console",
      category: "Full-stack",
      summary: "Internal operations console for a boutique retail brand — inventory, orders, and staff workflows in one place.",
      description:
        "A production ops console built for day-to-day retail teams. Focused on clear workflows, offline-friendly patterns, and a deployable Next.js stack.",
      caseStudy:
        "We shipped a usable v1 in six weeks: auth, RBAC, inventory views, and order status pipelines. Continued iteration on reporting after launch.",
      coverImage: null,
      gallery: "[]",
      technologies: JSON.stringify(["Next.js", "Prisma", "PostgreSQL", "Tailwind"]),
      projectUrl: "",
      isFeatured: true,
      status: "PUBLISHED",
      completionDate: new Date("2025-11-01"),
    },
  });

  await db.project.upsert({
    where: { slug: "api-platform-scaffold" },
    update: { status: "PUBLISHED" },
    create: {
      name: "API Platform Scaffold",
      slug: "api-platform-scaffold",
      category: "Backend",
      summary: "A NestJS API scaffold with auth, audit logs, and structured modules — used as a starting point for client backends.",
      description:
        "Reusable backend foundation: JWT sessions, role checks, request logging, and modular domain folders so new products start from a working base.",
      caseStudy: null,
      coverImage: null,
      gallery: "[]",
      technologies: JSON.stringify(["NestJS", "TypeScript", "PostgreSQL"]),
      projectUrl: "",
      isFeatured: false,
      status: "PUBLISHED",
      completionDate: new Date("2025-08-15"),
    },
  });
  console.log("  ✓ Portfolio projects (2 published)");

  const samplePost = await db.blogPost.upsert({
    where: { slug: "shipping-vs-slides" },
    update: { status: "PUBLISHED", publishedAt: new Date() },
    create: {
      title: "Shipping vs. Slides: why we open with a six-week path",
      slug: "shipping-vs-slides",
      excerpt:
        "Most studios sell decks. We ship production software. Here's the operating principle behind how we run an engagement.",
      content:
        "# Shipping vs. Slides\n\nMost studios sell decks. We ship production software — the kind that has real users, real billing, and real 3am pages.\n\nEvery engagement starts with a six-week path to a working product, not a 60-page proposal. Here's why.\n\n## The proposal trap\n\nA proposal is a promise about the future. The future has a strong preference for not matching your proposal. So we don't sell the future — we sell the first six weeks.\n\nIn six weeks, you can have:\n\n- A real schema, migrated.\n- A real backend, deployed.\n- A real frontend, on a real URL.\n- Real auth, real RBAC, real audit logs.\n\nThat's not a demo. That's a v0.1.\n\n## What we don't do\n\nWe don't write 60-page strategy decks before we've typed a single line of code. We don't wait three weeks for stakeholder alignment on a Figma file. We don't split backend and frontend into two teams that hand off tickets to each other.\n\nWe ship. Then we iterate. Then we ship again.",
      coverImage: null,
      readingMinutes: 4,
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: superAdmin.id,
      categoryId: catStudio.id,
    },
  });

  await db.blogPostTag.deleteMany({ where: { postId: samplePost.id } });
  await db.blogPostTag.create({
    data: { postId: samplePost.id, tagId: tagShipping.id },
  });

  console.log(`  ✓ Blog categories + sample post`);

  // ──────────────────────────────────────────────────────────────────────
  // FAQS
  // ──────────────────────────────────────────────────────────────────────
  const faqs = [
    {
      question: "Do you work with early-stage founders?",
      answer:
        "Yes. If you can articulate the problem and the user, we can take it from there. We've taken several products from a Notion doc to a paying customer base.",
      category: "Engagements",
      sortOrder: 1,
    },
    {
      question: "What does a typical engagement look like?",
      answer:
        "Six weeks to a working v0.1, then a rolling monthly retainer to ship features against a roadmap we maintain together. No 60-page proposals.",
      category: "Engagements",
      sortOrder: 2,
    },
    {
      question: "Do you write code or just consult?",
      answer:
        "We write code. This is not a consultancy that hands you a slide deck and a Notion doc. Every engagement ends with a deployed, working codebase.",
      category: "Engagements",
      sortOrder: 3,
    },
    {
      question: "Who owns the IP?",
      answer: "You do. Always. Code is in your GitHub, infra is in your accounts, domains are in your name.",
      category: "Legal",
      sortOrder: 4,
    },
    {
      question: "Do you take equity?",
      answer:
        "Rarely, and only for products where we'd be a genuine technical co-founder rather than a vendor. Default is cash.",
      category: "Engagements",
      sortOrder: 5,
    },
  ];
  for (const f of faqs) {
    const existing = await db.faq.findFirst({ where: { question: f.question } });
    if (!existing) {
      await db.faq.create({ data: { ...f, status: "PUBLISHED" } });
    }
  }
  console.log(`  ✓ FAQs (${faqs.length})`);

  console.log(`  ✓ Testimonials: skipped (we never fabricate)`);

  console.log("\n✅ DeeCodeK Labs seed complete.\n");
  console.log("   Admin login:");
  console.log("     Email:    admin@deecodeklabs.com");
  console.log("     Password: ChangeMe123!");
  console.log("");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
