# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Code & Coffee Philadelphia community website built with Hugo static site generator. Hosted on GitHub Pages with Cloudflare CDN.

## Build Commands

```bash
# Development server
hugo server --bind 0.0.0.0 --port 5000 --baseURL http://localhost:5000

# Full development build (regenerates events data)
rm -rf public && node scripts/generate-events-data.js && hugo server --bind 0.0.0.0 --port 5000 --baseURL http://localhost:5000

# Production build
node scripts/generate-events-data.js && hugo --gc --minify --cleanDestinationDir --forceSyncStatic
```

**Important:** Always run `node scripts/generate-events-data.js` before building - the events carousel depends on the generated `/static/js/events-data.js` file.

## Architecture

### Content Structure (Hugo Page Bundles)
- `/content/blog/` - Blog posts, each in a folder with `index.md` and optional images
- `/content/_index.md` - Homepage
- `/content/links/`, `/content/project-request/`, `/content/talent-matchboard/`, `/content/event-sponsorship/` - Static pages

### Templates
- `/layouts/_default/baseof.html` - Base template
- `/layouts/_default/list.html` - Blog listing with search/filtering
- `/layouts/_default/single.html` - Individual blog post
- `/layouts/partials/` - Reusable components (header, footer, sidebars)

### Frontend
- **CSS:** PureCSS grid framework + custom styles in `/static/css/`
- **JavaScript:** Vanilla JS modules in `/static/js/`
  - `menu.js` - Responsive navigation (breakpoint: 1300px)
  - `carousel.js` - Auto-rotating events carousel
  - `meetup.js` - Meetup.com API integration with CORS proxy fallback
  - `events-data.js` - Auto-generated from `/static/images/events/` filenames

### Data Flow
- **Events carousel:** Image files in `/static/images/events/` → `generate-events-data.js` → `events-data.js` → carousel display
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
--background: #E9E3DC  /* cream */
--accent: #59969B      /* teal */
--button: #3B2521      /* brown */
--text-primary: #3B2521
--font-sans: 'Vollkorn', serif
--font-display: 'Gloria Hallelujah', cursive
--font-mono: 'Space Mono', monospace
```

## External Services

- **Tally.so** - Form handling (project requests, talent matchboard)
- **Meetup.com API** - Event display
- **Cloudflare** - CDN and cache (manual purge via GitHub Actions)
- **GitHub Pages** - Hosting

## CI/CD

- **hugo.yml** - Deploys to GitHub Pages on push to main
- **cf_cache_purge.yml** - Manual Cloudflare cache purge (requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID` secrets)
