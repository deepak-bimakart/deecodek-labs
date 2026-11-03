# SEO runbook — DeeCodeK Labs

Operational steps after deploy. Pair with `docs/seo-keyword-map.md` and `/admin` SEO health.

## 1. Submit sitemap

1. Confirm live: `https://deecodeklabs.com/sitemap.xml` and `https://deecodeklabs.com/robots.txt`.
2. Google Search Console → property for `deecodeklabs.com` (Domain or URL-prefix apex).
3. Sitemaps → add `https://deecodeklabs.com/sitemap.xml` → Submit.
4. Optional: create a property for `opensource.deecodeklabs.com` (see `docs/seo-opensource-hosts.md`).

## 2. Request indexing (priority URLs)

In GSC → URL Inspection → Request indexing for:

- `/`
- `/services`, key service slugs
- `/products`, `/products/marketflow`, `/products/sadika`
- `/work`, `/about`, `/blog`, `/contact`, `/opensource`
- New or updated blog posts after publish

Do not bulk-spam; prioritize money pages and fresh content.

## 3. Read Search Console weekly

Checklist:

- Coverage / Pages: fix excluded by `noindex`, soft 404s, redirect errors.
- Experience: Core Web Vitals (compare to Phase 3 image/JS work).
- Performance: queries vs `docs/seo-keyword-map.md` primaries; adjust titles/H1s.
- Admin: `/admin` SEO health card (missing meta, 404 hits, avg seoScore).
- Admin: `/admin/seo/search-console` — wire `GOOGLE_SEARCH_CONSOLE_*` when ready for API pull.
- 404 monitor → create redirects in `/admin/redirects`.

## 4. Verification & analytics

- Google: `seo.verification.google` in Admin → Settings → SEO.
- Bing: `seo.verification.bing` (msvalidate.01) — same tab.
- Analytics: `analytics.gaId` / `analytics.plausibleDomain` under Settings → Analytics.

## 5. Local / CI guard

```bash
npm run seo:check
```

Fails if public layout wrongly sets `robots.index: false`, admin loses noindex, or sitemap route is missing.
