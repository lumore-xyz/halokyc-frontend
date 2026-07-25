#!/usr/bin/env node
/**
 * Lightweight local crawl check for marketing pages.
 * Verifies: public route status, canonical URL, robots directive,
 * unique title, unique description, exactly one H1.
 * Run: node scripts/seo-crawl-check.js
 * Requires: NEXT_PUBLIC_SITE_URL env var set, dev server running on port 3000
 */

import { fetch } from "undici";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const MARKETING_ROUTES = [
  "/",
  "/product",
  "/workflow",
  "/security",
  "/pricing",
  "/credits",
  "/privacy",
  "/terms",
  "/data-retention",
];

const NON_INDEXABLE_ROUTES = [
  "/admin",
  "/dashboard",
  "/login",
  "/select-account",
  "/verify",
  "/privacy/dashboard",
];

async function fetchPage(url) {
  try {
    const response = await fetch(url, { redirect: "manual" });
    const html = await response.text();
    return { status: response.status, html, headers: response.headers };
  } catch (e) {
    return { status: 0, html: "", error: e.message };
  }
}

function extractMetadata(html, path) {
  const results = {
    path,
    canonical: null,
    title: null,
    description: null,
    robots: null,
    h1Count: 0,
    h1Text: null,
    ogUrl: null,
    ogTitle: null,
    ogDescription: null,
    twitterCard: null,
    errors: [],
  };

  // Extract canonical
  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"\/?>/);
  if (canonicalMatch) {
    results.canonical = canonicalMatch[1];
  }

  // Extract title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) {
    results.title = titleMatch[1];
  }

  // Extract description
  const descMatch = html.match(/<meta name="description" content="([^"]+)"\/?>/);
  if (descMatch) {
    results.description = descMatch[1];
  }

  // Extract robots
  const robotsMatch = html.match(/<meta name="robots" content="([^"]+)"\/?>/);
  if (robotsMatch) {
    results.robots = robotsMatch[1];
  }

  // Count H1s
  const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/g);
  results.h1Count = h1Matches ? h1Matches.length : 0;
  if (h1Matches && h1Matches.length > 0) {
    results.h1Text = h1Matches[0].replace(/<[^>]+>/g, "");
  }

  // Extract OG
  const ogUrlMatch = html.match(/<meta property="og:url" content="([^"]+)"\/?>/);
  if (ogUrlMatch) results.ogUrl = ogUrlMatch[1];

  const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"\/?>/);
  if (ogTitleMatch) results.ogTitle = ogTitleMatch[1];

  const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"\/?>/);
  if (ogDescMatch) results.ogDescription = ogDescMatch[1];

  const twitterCardMatch = html.match(/<meta name="twitter:card" content="([^"]+)"\/?>/);
  if (twitterCardMatch) results.twitterCard = twitterCardMatch[1];

  return results;
}

function validateResults(results) {
  const errors = [];

  if (results.status !== 200) {
    errors.push(`HTTP ${results.status}: ${results.error || "Non-200 status"}`);
  }

  if (!results.canonical) {
    errors.push("Missing canonical link");
  } else {
    const expected = `${BASE_URL}${results.path}`;
    if (results.canonical !== expected) {
      errors.push(`Canonical mismatch: expected ${expected}, got ${results.canonical}`);
    }
  }

  if (!results.title) {
    errors.push("Missing title");
  }

  if (!results.description) {
    errors.push("Missing meta description");
  }

  if (results.h1Count === 0) {
    errors.push("Missing H1");
  } else if (results.h1Count > 1) {
    errors.push(`Multiple H1s (${results.h1Count})`);
  }

  if (!results.ogUrl) {
    errors.push("Missing og:url");
  } else if (results.ogUrl !== results.canonical) {
    errors.push(`og:url (${results.ogUrl}) differs from canonical (${results.canonical})`);
  }

  if (!results.ogTitle) {
    errors.push("Missing og:title");
  }

  if (!results.ogDescription) {
    errors.push("Missing og:description");
  }

  if (!results.twitterCard) {
    errors.push("Missing twitter:card");
  }

  return errors;
}

async function main() {
  console.log(`\n🔍 SEO Crawl Check — ${BASE_URL}\n`);

  const allResults = [];
  let hasErrors = false;

  for (const path of MARKETING_ROUTES) {
    const url = `${BASE_URL}${path}`;
    process.stdout.write(`  Checking ${path}... `);

    const { status, html } = await fetchPage(url);
    const meta = extractMetadata(html, path);
    meta.status = status;

    const errors = validateResults(meta);
    meta.errors = errors;

    if (errors.length > 0) {
      hasErrors = true;
      console.log("❌ FAIL");
      errors.forEach((e) => console.log(`    - ${e}`));
    } else {
      console.log("✅ OK");
    }

    allResults.push(meta);
  }

  // Check non-indexable routes
  console.log("\n🔒 Checking non-indexable routes...\n");
  for (const path of NON_INDEXABLE_ROUTES) {
    const url = `${BASE_URL}${path}`;
    process.stdout.write(`  Checking ${path}... `);

    const { status, html } = await fetchPage(url);
    if (status === 200) {
      const robotsMatch = html.match(/<meta name="robots" content="([^"]+)"\/?>/);
      if (robotsMatch && robotsMatch[1].includes("noindex")) {
        console.log("✅ noindex present");
      } else {
        console.log("❌ MISSING noindex");
        hasErrors = true;
      }
    } else if (status === 302 || status === 307) {
      console.log(`✅ Redirected (${status})`);
    } else {
      console.log(`⚠️  Status ${status}`);
    }
  }

  // Check for duplicate titles/descriptions
  console.log("\n🔍 Checking for duplicate metadata...\n");
  const titles = new Map();
  const descriptions = new Map();

  allResults.forEach((r) => {
    if (r.title) titles.set(r.title, (titles.get(r.title) || 0) + 1);
    if (r.description) descriptions.set(r.description, (descriptions.get(r.description) || 0) + 1);
  });

  titles.forEach((count, title) => {
    if (count > 1) {
      console.log(`❌ Duplicate title (${count}x): "${title}"`);
      hasErrors = true;
    }
  });

  descriptions.forEach((count, desc) => {
    if (count > 1) {
      console.log(`❌ Duplicate description (${count}x): "${desc.substring(0, 80)}..."`);
      hasErrors = true;
    }
  });

  if (titles.size === MARKETING_ROUTES.length && descriptions.size === MARKETING_ROUTES.length) {
    console.log("✅ All titles and descriptions are unique");
  }

  console.log("\n" + "=".repeat(50));
  if (hasErrors) {
    console.log("❌ SEO CHECK FAILED");
    process.exit(1);
  } else {
    console.log("✅ ALL SEO CHECKS PASSED");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});