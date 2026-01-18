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

## Coding Principles

### LET IT CRASH
- Log errors to console and let components fail visibly rather than silently degrading
- Do not hide failures with empty catch blocks or silent fallbacks
- Prefer clear error states over graceful degradation - users should know when something is broken

### SOLID (Single Responsibility Focus)
- Each function should do one thing and do it well
- Each JS module should have a single, clear purpose (e.g., `menu.js` handles only navigation, `carousel.js` handles only the carousel)
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

## Hugo Best Practices

### Directory Structure
| Directory | Purpose |
|-----------|---------|
| `assets/` | Resources processed through Hugo Pipes (CSS, Sass, JS) |
| `content/` | Markdown content files organized as page bundles |
| `data/` | Data files (JSON, TOML, YAML) for templates |
| `layouts/` | Templates that transform content |
| `static/` | Files copied verbatim (favicons, images, pre-built JS) |

**Key Rules:**
- Use `assets/` for CSS/JS needing processing; `static/` for files copied as-is
- Never commit `public/` or `resources/` directories

### Page Bundles
- **Leaf bundles** (`index.md`): Single pages with their own resources
- **Branch bundles** (`_index.md`): List pages that can have children
- Keep images/resources with their content in the same bundle folder

### Templates

**Partials Best Practices:**
- Use `{{ partialCached "name.html" . }}` for repeated partials (sidebars, menus)
- Pass minimal context - only what the partial needs
- Partials can return values for data transformations

**Template Lookup Order (most to least specific):**
1. Kind → Layout → Output format → Language → Type → Section
2. Use `type` and `layout` in front matter for custom templates

### Hugo Pipes (Asset Processing)
```html
{{ $css := resources.Get "css/main.scss" | css.Sass | resources.Minify | resources.Fingerprint }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}">
```
- Chain operations for efficiency (Hugo caches entire pipelines)
- Use `resources.Fingerprint` for cache-busting in production

### Image Processing
```html
{{ $img := .Resources.Get "hero.jpg" }}
{{ $resized := $img.Resize "800x webp q85" }}
<img src="{{ $resized.RelPermalink }}" alt="...">
```
- Methods: `Resize`, `Fit`, `Fill`, `Crop`, `Filter`
- Options: dimensions, format (`webp`, `jpg`), quality (`q85`), anchor (`Smart`)
- Cache processed images in `resources/` for faster CI builds

### Taxonomies
- Default: `tags` and `categories`
- Assign in front matter: `tags: ["javascript", "hugo"]`
- Hugo auto-generates taxonomy and term pages
- Use `[taxonomy]_weight` for custom sort order per term

### Multilingual Sites
- Translation by filename: `about.en.md`, `about.fr.md`
- Translation by directory: separate `contentDir` per language
- Use `translationKey` in front matter to link non-matching pages
- Access translations: `.IsTranslated`, `.Translations`, `.AllTranslations`

### Performance
- Run `hugo --templateMetrics` to profile slow templates
- Use `partialCached` for any partial with 100% cache potential
- Add Hugo to antivirus exclusions (can slow builds 400%+)
- Production: `hugo --gc --minify --cleanDestinationDir`

### Common Template Functions
```html
{{ if .Params.featured }}...{{ end }}           # Conditional
{{ with .Params.author }}{{ . }}{{ end }}       # Conditional + rebind
{{ range .Pages }}...{{ end }}                  # Loop
{{ partial "header.html" . }}                   # Include partial
{{ where .Pages "Params.featured" true }}       # Filter
{{ sort .Pages "Date" "desc" }}                 # Sort
{{ .Date.Format "January 2, 2006" }}            # Date format
```