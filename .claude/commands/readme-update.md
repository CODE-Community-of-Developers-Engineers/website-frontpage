---
description: Review and update README.md based on recent git changes (project-aware)
argument-hint: [commits=20] [--dry-run]
---

# README.md Review and Update

Review the README.md against recent git changes with full project context. This command understands the Hugo static site architecture, JavaScript modules, and content structure.

## Arguments
- **commits**: Number of recent commits to analyze (default: 20)
- **--dry-run**: Preview changes without applying them

## Step 1: Gather Git Context

### 1.1 Changed Files Analysis
Run `git log --oneline -N --name-only --pretty=format: | sort -u | grep -v '^$'` (N = commit count, default 20).

### 1.2 Categorize Changes by Component

Map changed files to project components:

| File Pattern | Component | README Section |
|--------------|-----------|----------------|
| `layouts/**/*.html` | Hugo Templates | Architecture / Templates |
| `layouts/partials/**` | Partial Components | Templates |
| `static/js/*.js` | JavaScript Modules | Frontend / JavaScript |
| `static/css/*.css` | Stylesheets | Frontend / CSS |
| `content/**/*.md` | Content Pages | Content Structure |
| `content/blog/**` | Blog Posts | Blog Post Front Matter |
| `.github/workflows/*.yml` | CI/CD | CI/CD |
| `scripts/*.js` | Build Scripts | Build Commands |
| `hugo.toml` | Hugo Config | Configuration |
| `static/images/**` | Images/Assets | Architecture / Data Flow |

### 1.3 Get Commit Context
Run `git log --oneline -N` for change summary.

## Step 2: Read Current README.md

Read `/Users/macbook/Desktop/Code-And-Coffee-Philidelphia-Website/README.md` and parse:

1. **Section headers** - Map all ## and ### headers
2. **Build commands** - Development and production build instructions
3. **Architecture sections** - Content structure, templates, frontend
4. **Design system** - CSS variables and fonts
5. **External services** - Tally.so, Meetup API, Cloudflare, GitHub Pages

## Step 3: Section-Specific Validation

### 3.1 Build Commands

**Source of truth**: `CLAUDE.md` and `package.json` (if exists)

Verify build commands are accurate:
- Development server command
- Production build command
- Events data generation script

```bash
# Verify scripts exist
ls scripts/
cat scripts/generate-events-data.js | head -20
```

### 3.2 Content Structure

**Source of truth**: `content/` directory

Use Glob to verify documented content paths:
```bash
# Find all content directories
ls -la content/
```

Expected structure:
- `content/_index.md` - Homepage
- `content/blog/` - Blog posts
- `content/links/` - Links page
- `content/project-request/` - Project request page
- `content/talent-matchboard/` - Talent matchboard page
- `content/event-sponsorship/` - Event sponsorship page

### 3.3 Templates

**Source of truth**: `layouts/` directory

Verify template paths:
- `layouts/_default/baseof.html` - Base template
- `layouts/_default/list.html` - List template
- `layouts/_default/single.html` - Single page template
- `layouts/partials/` - Partial components

```bash
ls layouts/_default/
ls layouts/partials/
```

### 3.4 JavaScript Modules

**Source of truth**: `static/js/*.js` files

Verify all JS modules are documented:

```bash
ls static/js/*.js
```

Expected modules:
- `menu.js` - Responsive navigation
- `carousel.js` - Events carousel
- `meetup.js` - Meetup API integration
- `events-data.js` - Generated events data

Check for any new JS files not in README.

### 3.5 CSS / Design System

**Source of truth**: `static/css/*.css` files

Verify CSS variables documented match actual values:

```bash
grep -E "^\s*--" static/css/*.css | head -20
```

Check:
- Color variables (background, accent, button, text)
- Font families (sans, display, mono)

### 3.6 External Services

Verify documented services are still in use:
- **Tally.so** - Check for Tally embeds in templates
- **Meetup.com API** - Check `meetup.js`
- **Cloudflare** - Check `.github/workflows/cf_cache_purge.yml`
- **GitHub Pages** - Check `.github/workflows/hugo.yml`

### 3.7 CI/CD Workflows

**Source of truth**: `.github/workflows/*.yml`

```bash
ls .github/workflows/
```

Verify each workflow is documented with its purpose.

### 3.8 Blog Post Front Matter

**Source of truth**: Sample blog posts in `content/blog/`

Verify documented front matter fields match actual usage:

```bash
# Check front matter in a blog post
head -20 content/blog/*/index.md | head -40
```

## Step 4: Cross-Reference Validation

### 4.1 File Path Validation
Extract all file paths from README and verify existence with Glob.

### 4.2 Command Validation
Verify commands in README code blocks:
- `hugo server` commands
- `node scripts/generate-events-data.js`
- Any npm commands

### 4.3 Port Documentation
Verify port numbers (5000 for dev server) match actual configs.

## Step 5: Generate Staleness Report

```
## README Staleness Report

### Critical Issues
- [ ] [Section]: [Issue] - [Details]

### Missing Documentation
- [ ] [Component]: [What's missing]

### Outdated Information
- [ ] [Section]: [What changed]

### Minor Improvements
- [ ] [Section]: [Suggestion]
```

## Step 6: Apply Updates

### If --dry-run:
1. Display full staleness report
2. Show proposed edits (before/after snippets)
3. Exit without changes

### If applying (default):
1. Use Edit tool for each required change
2. Preserve existing formatting and style
3. Update tables in-place
4. Add new sections if major features missing
5. Run `git diff README.md` to show all changes
6. Present summary for review

## Step 7: Output Summary

```
## README Update Summary

**Commits Analyzed**: N
**Components Affected**: [list]
**Sections Updated**: X

### Changes Made
| Section | Type | Description |
|---------|------|-------------|
| ... | ... | ... |

### Verification Commands
git diff README.md          # Review changes
git add README.md && git commit -m "docs: update README for recent changes"
git checkout README.md      # Revert if needed
```

## Safety

- Only modifies README.md
- Git-based rollback always available
- Human review via `git diff`
- Dry-run mode for preview
