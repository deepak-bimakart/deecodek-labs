# DeeCodeK Labs — Full-Stack Website + Custom Headless CMS

A complete production-ready website platform with a custom-built CMS, for **DeeCodeK Labs** — Software Studio. Product Lab.

## Stack

- **Next.js 16** App Router (frontend + API)
- **TypeScript 5**
- **Prisma ORM** + SQLite (dev) — switch to PostgreSQL for prod by changing `provider` in `prisma/schema.prisma` and `DATABASE_URL` in `.env`
- **NextAuth.js v4** — credentials provider, JWT sessions, RBAC
- **Tailwind CSS 4** + shadcn/ui
- **@dnd-kit** for drag-and-drop section reordering
- **react-hook-form** + **zod** for forms and validation
- **react-markdown** for blog content rendering

## Brand system

**Main site (studio)**

- **Light theme** (default): White + Teal (#087F70) + Black
- **Dark theme**: Peacock Blue (#05090D bg / #087C91 accent) + Black
- Typography: Space Grotesk (display) · DM Sans (body) · IBM Plex Mono (labels)

**Open Source subdomain (playground)** — mint `#83e6a2` on forest black; Space Grotesk + mono. Served from the same Next.js app at `/opensource`, rewritten to `/` when `Host` is `opensource.deecodeklabs.com`.

## Admin login

Default credentials (change immediately):

```
Email:    admin@deecodeklabs.com
Password: ChangeMe123!
```

Editor user also seeded:

```
Email:    editor@deecodeklabs.com
Password: ChangeMe123!
```

## Routes

### Public site

- `/` — Homepage (dynamic, CMS-driven)
- `/services` + `/services/[slug]` — 6 service categories
- `/products` + `/products/[slug]` — MarketFlow, Sadika
- `/work` + `/work/[slug]` — Portfolio
- `/about`
- `/blog` + `/blog/[slug]`
- `/contact` — Working form, stores to DB
- `/opensource` — CMS-driven OSS playground (also `opensource.deecodeklabs.com` via host rewrite)
- `/sitemap.xml` — Auto-generated
- `/robots.txt`

### Admin CMS (`/admin/*`)

Protected by middleware + NextAuth. Sidebar nav groups: Dashboard, Content, Business, Publishing, Communication, Configuration.

- `/admin` — Dashboard with real DB stats
- `/admin/login` — Auth
- `/admin/pages` + `/admin/pages/new` + `/admin/pages/[id]` — Page builder with three-panel editor + drag-drop sections
- `/admin/services` + `/admin/services/new` + `/admin/services/[id]`
- `/admin/products` + `/admin/products/new` + `/admin/products/[id]`
- `/admin/portfolio` + `/admin/portfolio/new` + `/admin/portfolio/[id]`
- `/admin/blog` + `/admin/blog/new` + `/admin/blog/[id]`
- `/admin/media` — Drag-drop upload, alt text, search, delete
- `/admin/contact` + `/admin/contact/[id]` — Status pipeline, notes, CSV export
- `/admin/seo` — Per-record SEO + robots + sitemap
- `/admin/settings` — Brand, theme, social, FAQs, testimonials
- `/admin/opensource` — OSS projects (powers `/opensource` + subdomain)

## API

### Public (`/api/public/*`)

- `GET /api/public/pages`, `GET /api/public/pages/[slug]`
- `GET /api/public/services`, `GET /api/public/services/[slug]`
- `GET /api/public/products`, `GET /api/public/products/[slug]`
- `GET /api/public/projects`, `GET /api/public/projects/[slug]`
- `GET /api/public/blog`, `GET /api/public/blog/[slug]`
- `GET /api/public/navigation`
- `GET /api/public/settings` — allowlisted brand/social/theme keys only
- `GET /api/public/opensource` — OSS projects from CMS settings
- `POST /api/public/contact` — rate-limited, honeypot, validated

### Admin (`/api/admin/*`)

Protected by per-action RBAC (`getCurrentUser` + `can()`). CRUD for: pages + sections (reorder/duplicate/publish), services, products, projects, blog posts, media (upload + alt + delete), contact (notes + CSV), SEO, FAQs, testimonials, opensource projects, site settings. Categories/tags have list+create APIs; navigation editor and redirect middleware are deferred (v2).

Publish endpoints create content revisions (snapshots) for future restore.

## Section types (17)

Hero, Split Hero, Editorial Text, Capabilities Grid, Services List, Product Showcase, Portfolio Grid, Tech Stack, Process Timeline, Statistics, Testimonials, Image Gallery, Full-width Image, CTA, FAQ, Contact Form, Blog Listing.

Each has a Zod schema in `src/lib/sections.ts`. Content is JSON, validated per type — **no React code is stored in the DB**.

## RBAC

Four roles: `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `VIEWER`.

Permission matrix in `src/lib/rbac.ts` covers all module actions (view, create, update, delete, publish). Every admin API endpoint checks `can(role, permission)` server-side — frontend button hiding is secondary.

## Database schema

23 models in `prisma/schema.prisma`:

User, Account, Session, VerificationToken, Page, PageSection, ContentRevision, Service, Product, ProductFeature, Project, BlogPost, BlogCategory, BlogTag, BlogPostTag, MediaAsset, NavigationMenu, NavigationItem, SiteSetting, SeoMetadata, Testimonial, Faq, ContactSubmission, ContactNote, Redirect, AuditLog.

## Local development

```bash
bun install           # install deps
bun run db:push       # create/migrate schema
bunx tsx scripts/seed.ts   # seed DeeCodeK content + admin user
bun run dev           # start dev server on port 3000
bun run lint          # ESLint check
```

## Production notes

- Switch `prisma/schema.prisma` provider from `sqlite` to `postgresql`
- Set `DATABASE_URL` to a real Postgres connection string
- Set `NEXTAUTH_SECRET` to a strong random value (currently a dev fallback)
- Set `NEXTAUTH_URL` to your production domain
- Media uploads go to `/public/uploads` — for production, swap the upload handler in `src/app/api/admin/media/upload/route.ts` for S3-compatible storage
- Run `bunx tsx scripts/seed.ts` once after first deploy to create the admin user

## What's intentionally NOT in v1

These are scaffolded or simplified — full implementation would be a separate engagement:

- **Visual page builder live preview**: three-panel editor with section list, content editor, and properties — but inline WYSIWYG editing of the live site is not implemented (the editor works on form fields per section type, then "Preview" opens the public route in a new tab).
- **Revision restore UI**: revisions are saved on every publish, but the restore-from-revision UI isn't built yet (data is in DB, restore endpoint TBD).
- **Full RBAC UI for users + roles + audit logs**: API exists, UI is in `/admin/settings` as static panels.
- **Email notifications on contact submission**: SMTP integration stubbed but not wired (you'd add a `sendEmail()` call in `src/app/api/public/contact/route.ts`).
- **Redirect middleware**: redirects are stored in DB but not applied at request time yet.

## Files of interest

- `prisma/schema.prisma` — full data model
- `scripts/seed.ts` — real DeeCodeK content seed
- `src/lib/sections.ts` — section type registry + Zod schemas
- `src/lib/auth.ts` — NextAuth config
- `src/lib/rbac.ts` — permission matrix
- `src/middleware.ts` — admin route protection
- `src/components/sections/renderer.tsx` — section renderer (server component)
- `src/components/admin/page-builder.tsx` — drag-drop page editor
- `src/components/admin/section-editor.tsx` — per-section-type form editor
