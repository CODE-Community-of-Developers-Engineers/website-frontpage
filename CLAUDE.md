# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

C.O.D.E (Community of Developers & Engineers) Philadelphia community website built with Hugo static site generator. Hosted on GitHub Pages with Cloudflare CDN.

## Build Commands

```bash
# Development server
hugo server --bind 0.0.0.0 --port 5000 --baseURL http://localhost:5000

# Full development build (regenerates events data)
rm -rf public && node scripts/generate-events-data.js && hugo server --bind 0.0.0.0 --port 5000 --baseURL http://localhost:5000

# Production build
node scripts/generate-events-data.js && hugo --gc --minify --cleanDestinationDir --forceSyncStatic
```

**Important:** Always run `node scripts/generate-events-data.js` before building - the events gallery depends on the generated `/static/js/events-data.js` file.

## Validation & Linting

```bash
# Run all validation (events data + front matter)
npm run validate

# Individual validation scripts
npm run validate:events       # Validates events-data.js structure
npm run validate:frontmatter  # Validates YAML front matter in content files

# Lint markdown files (requires: npm install -g markdownlint-cli2)
markdownlint-cli2

# Lint Hugo templates (requires: pip install djlint)
djlint layouts/ --lint
```

CI runs these checks on every PR via `.github/workflows/lint.yml` and `.github/workflows/pr-checks.yml`.

## Architecture

### Content Structure (Hugo Page Bundles)
- `/content/blog/` - Blog posts, each in a folder with `index.md` and optional images
- `/content/_index.md` - Homepage
- `/content/links/`, `/content/onboarding/`, `/content/event-sponsorship/` - Static pages

### Templates
- `/layouts/_default/baseof.html` - Base template
- `/layouts/blog/list.html` - Media page (`/blog/`): posts with `topic: "press"` appear under "See us in the press", the rest under "From the blog"
- `/layouts/_default/list.html` - Generic listing with search/filtering
- `/layouts/_default/single.html` - Individual blog post
- `/layouts/partials/` - Reusable components (header, footer, post-card, sidebars)

### Frontend
- **CSS:** PureCSS grid framework + custom styles in `/static/css/`
- **JavaScript:** Vanilla JS modules in `/static/js/`
  - `menu.js` - Responsive navigation (breakpoint: 960px)
  - `events-gallery.js` - Photo grid of events on the homepage
  - `meetup.js` - Meetup.com API integration with CORS proxy fallback
  - `events-data.js` - Auto-generated from `/static/images/events/` filenames

### Data Flow
- **Events gallery:** Image files in `/static/images/events/` → `generate-events-data.js` → `events-data.js` → gallery tiles (filename becomes the caption)
- **Forms:** Embedded Tally.so iframes
- **Event info:** Meetup.com API → client-side rendering

## Blog Post Front Matter

```yaml
title: "Post Title"
date: 2025-06-23
author: "Author Name"
featured: true  # Appears at top of listing
topic: "JavaScript"  # For categorization
tags: ["javascript", "web"]  # For filtering
image: "/images/post-image.jpg"
```

## Design System

```css
--background: #ffffff
--surface-alt: #f7f5f2   /* warm off-white for alternating sections */
--ink: #2a1c18           /* espresso, matches the logo */
--accent: #1f7a80        /* teal */
--text-primary: #2a1c18
--font-sans: 'Inter', sans-serif
--font-mono: 'JetBrains Mono', monospace  /* wordmark, eyebrow labels */
```

## External Services

- **Tally.so** - Form handling (project requests, talent matchboard)
- **Meetup.com API** - Event display
- **Cloudflare** - CDN and cache (manual purge via GitHub Actions)
- **GitHub Pages** - Hosting

## CI/CD

- **hugo.yml** - Deploys to GitHub Pages on push to main
- **lint.yml** - Runs markdown, YAML, and template linting
- **pr-checks.yml** - Validates events data, front matter, and internal links on PRs
- **cf_cache_purge.yml** - Manual Cloudflare cache purge (requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID` secrets)

## Coding Principles

### LET IT CRASH
- Log errors to console and let components fail visibly rather than silently degrading
- Do not hide failures with empty catch blocks or silent fallbacks
- Prefer clear error states over graceful degradation - users should know when something is broken

### SOLID (Single Responsibility Focus)
- Each function should do one thing and do it well
- Each JS module should have a single, clear purpose (e.g., `menu.js` handles only navigation, `events-gallery.js` handles only the events gallery)
- Extract new functionality into separate functions/modules rather than expanding existing ones

### KISS (Keep It Simple, Stupid)
- Vanilla JavaScript only - no frameworks or unnecessary dependencies
- Prefer readable, straightforward code over clever solutions
- Don't abstract until you have concrete repetition (no premature abstractions)
- Use the simplest approach that works

### Pure Functions
- Separate pure data transformations from DOM operations where reasonable
- Pure functions: take inputs, return outputs, no side effects
- Keep DOM manipulation at the boundaries (event handlers, render functions)
- Example: Extract date formatting, data filtering, or text transformations into pure helper functions
