#!/usr/bin/env node
/**
 * Lightweight SEO CI guards (no network).
 * Fails if public root layout wrongly disables indexing, or sitemap route is missing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function read(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf8");
}

// 1) Sitemap route must exist (App Router: src/app/sitemap.ts or sitemap.xml/route.ts)
const sitemapCandidates = [
  "src/app/sitemap.ts",
  "src/app/sitemap.js",
  "src/app/sitemap.xml/route.ts",
  "src/app/sitemap.xml/route.js",
];
const hasSitemap = sitemapCandidates.some((p) => fs.existsSync(path.join(root, p)));
if (!hasSitemap) {
  errors.push(
    `Missing sitemap route. Expected one of: ${sitemapCandidates.join(", ")}`
  );
}

// 2) Public root layout must not set robots index: false
const layout = read("src/app/layout.tsx") || read("src/app/layout.js") || "";
if (!layout) {
  errors.push("Missing src/app/layout.tsx (public root layout).");
} else {
  const robotsBlock = layout.match(/robots\s*:\s*\{[\s\S]*?\}/);
  if (robotsBlock) {
    const block = robotsBlock[0];
    // Fail only when index is explicitly false in the public layout robots config
    if (/index\s*:\s*false/.test(block)) {
      errors.push(
        "Public layout sets robots.index to false — marketing pages would be noindexed."
      );
    }
  }
}

// 3) Admin layout should keep noindex (soft warning → hard fail if index:true)
const adminLayout = read("src/app/admin/layout.tsx") || "";
if (adminLayout) {
  if (!/index\s*:\s*false/.test(adminLayout)) {
    errors.push(
      "Admin layout should set robots index: false (noindex for /admin)."
    );
  }
}

// 4) robots.ts should disallow /admin when present
const robotsTs = read("src/app/robots.ts") || "";
if (robotsTs && !/disallow:.*\/admin/i.test(robotsTs.replace(/\s+/g, " "))) {
  // tolerate array form
  if (!robotsTs.includes("/admin")) {
    errors.push("src/app/robots.ts should disallow /admin paths.");
  }
}

if (errors.length) {
  console.error("seo:check failed:\n");
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}

console.log("seo:check passed");
console.log(" - sitemap route present");
console.log(" - public layout not wrongly noindexed");
if (adminLayout) console.log(" - admin layout noindex present");
if (robotsTs) console.log(" - robots.ts references /admin");
