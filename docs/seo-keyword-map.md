# DeeCodeK Labs — SEO keyword map

One **primary intent** per key URL. Secondary terms support the page; do not target competing primaries on the same URL.

| Page | Path | Primary intent / keyword | Secondary support |
|------|------|--------------------------|-------------------|
| Home | `/` | Software studio & product lab India | Custom software development, NestJS Next.js Flutter |
| Services list | `/services` | Custom software development services | Full-stack product engineering, MVP studio |
| Service (dynamic) | `/services/[slug]` | `[Service title]` + delivery (e.g. NestJS API development) | Related stack terms from service technologies |
| Products list | `/products` | DeeCodeK Labs products | SaaS tools, studio-built products |
| MarketFlow | `/products/marketflow` | MarketFlow trading / market intelligence product | Fintech dashboard, market data product |
| Sadika | `/products/sadika` | Sadika app / product | Consumer mobile app, Flutter product |
| Work list | `/work` | Software portfolio / case studies | Shipped client products, production systems |
| Work detail | `/work/[slug]` | `[Project name]` case study | Outcome + stack keywords from project |
| About | `/about` | About DeeCodeK Labs / Deepak founder | Software studio Mumbai, E-E-A-T |
| Blog list | `/blog` | Engineering & product blog | NestJS, Next.js, Flutter, AI, SaaS |
| Blog post | `/blog/[slug]` | Post focus keyword (CMS `focusKeyword`) | Category + tags; link to related services |
| Contact | `/contact` | Hire DeeCodeK Labs / contact studio | Start a build, product engineering inquiry |
| Open Source | `/opensource` | DeeCodeK Labs open source | Developer tools, OSS playground, packages |

## Notes

- Prefer **one H1** aligned to the primary intent; keep meta title ≤ ~60 chars where possible.
- Service and product slugs inherit primary intent from CMS title + `seo.focusKeyword` when set.
- Internal links: blog → related services; service detail → related work + products; product pages → contact / services CTA.
- Host note: marketing site `deecodeklabs.com` (www → apex); OSS surface `opensource.deecodeklabs.com` shares Organization `@id`.
