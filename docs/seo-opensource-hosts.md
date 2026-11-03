# Open Source hosts & sitemaps

## Hosts

| Host | Role |
|------|------|
| `deecodeklabs.com` | Marketing / studio site (canonical apex; `www` → apex 301) |
| `opensource.deecodeklabs.com` | OSS playground (middleware rewrites `/` → opensource landing) |
| `deecodeklabs.com/opensource` | Same OSS content on the main host path |

Organization JSON-LD uses a shared `@id` (`{SITE_URL}/#organization`) on both surfaces so Google treats them as one entity.

## Sitemap notes (host-aware)

- Main sitemap: `https://deecodeklabs.com/sitemap.xml` — includes `/opensource` and product/service/blog URLs.
- When crawling `opensource.deecodeklabs.com`, Search Console should use a **URL-prefix** or **Domain** property that covers that host. Submit the main sitemap from the apex property; optionally add a second property for the OSS subdomain.
- Do not invent a separate conflicting Organization name; keep `sameAs` links between GitHub, OSS host, and apex.

## Cross-links

Header and footer always surface a prominent link to `https://opensource.deecodeklabs.com` so PageRank and users can move between studio and OSS.
