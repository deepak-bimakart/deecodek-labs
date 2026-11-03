# SEO overhaul — final report

## Phases shipped (code)

| Phase | Commit message | Highlights |
|-------|----------------|------------|
| 1 | Phase 1 SEO foundations… | SSR counters, www→apex, admin noindex, favicons, sitemap, breadcrumbs |
| 2 | Phase 2: structured data JSON-LD… | Organization / WebSite / entity JSON-LD + CMS schema fields |
| 3 | Phase 3: Core Web Vitals… | Image/JS reductions, below-fold dynamic imports |
| 4 | Phase 4: on-page SEO, keyword map, E-E-A-T, OG image | Keyword map, founder block, related links, `opengraph-image.tsx`, PageHero space fix |
| 5 | Phase 5: CMS SEO panel foundations | Per-entity SEO panel, scores, bulk/404 tools |
| 6 | Phase 6: SEO health dashboard and GSC placeholder | `/admin/seo/search-console`, dashboard health card |
| 7 | Phase 7: RSS, TOC, author pages, editorial briefs | `/feed.xml`, blog TOC, `/blog/author/[id]`, 10 briefs |
| 8 | Phase 8: OSS cross-links and entity JSON-LD | Header/footer OSS links, shared Organization `@id` |
| 9 | Phase 9: SEO CI check, runbook, final report | `seo:check`, runbook, this report |

## Key URLs

- Site: `https://deecodeklabs.com`
- Sitemap: `/sitemap.xml` · Robots: `/robots.txt` · RSS: `/feed.xml`
- OG default: `/opengraph-image`
- Admin SEO: `/admin/seo`, `/admin/seo/bulk`, `/admin/seo/404s`, `/admin/seo/search-console`
- OSS: `https://opensource.deecodeklabs.com` and `/opensource`

## Key docs / scripts

- `docs/seo-keyword-map.md`
- `docs/editorial/calendar-and-briefs.md`
- `docs/seo-opensource-hosts.md`
- `docs/seo-runbook.md`
- `scripts/seo-check.mjs` → `npm run seo:check`

## Remaining manual tasks

1. Verify Google + Bing ownership tokens in production Settings (and Bing token if empty).
2. Submit sitemap in GSC; request indexing for priority URLs (runbook §1–2).
3. Optional: set `GOOGLE_SEARCH_CONSOLE_*` env for live GSC UI (currently placeholder).
4. Fill founder photo via `about.founder.photo` when asset is ready.
5. Publish editorial briefs from `docs/editorial/calendar-and-briefs.md` on a 2×/month cadence.
6. Confirm CMS header/footer nav includes Open Source (hardcoded fallback also present).
7. Monitor CWV in GSC after Phase 3 ships to production traffic.
8. Review SEO health card weekly; clear 404s with redirects.
