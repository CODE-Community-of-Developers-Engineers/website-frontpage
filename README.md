# C.O.D.E

[![Hugo](https://img.shields.io/badge/Hugo-0.126.1-ff4088?logo=hugo)](https://gohugo.io/)
[![Cloudflare Pages](https://img.shields.io/badge/Hosted_on-Cloudflare_Pages-f38020?logo=cloudflare)](https://pages.cloudflare.com/)

**Your space to build.** A community-focused coding initiative bringing together developers, designers, and tech enthusiasts in the Philadelphia area.

## About

C.O.D.E is a welcoming community for anyone interested in technology, coding, and building projects. Whether you're a seasoned developer or just starting your journey, you'll find a supportive environment to learn, collaborate, and grow.

We host regular events including:

- **Weekend Coding Crew** - Casual coding sessions
- **LeetCode Practice** - Algorithm and interview prep
- **AI Paper Talks** - Discussions on latest AI research
- **Founder Fridays** - Coworking for entrepreneurs
- **Hackathons** - Build projects together
- **Web3 & ML Workshops** - Learn emerging technologies

## Features

- **Blog Platform** - Tech tutorials, event recaps, and community stories
- **Events Carousel** - Rotating display of upcoming community events
- **Meetup Integration** - Live event data from Meetup.com
- **Tech Talent Matchboard** - Connect job seekers with opportunities
- **Event Sponsorship** - Support our community events

## Quick Links

| Resource | Link |
| ---------- | ------ |
| Live Site | [code-philly-community.pages.dev](https://code-philly-community.pages.dev/) |
| Meetup Group | [C.O.D.E](https://www.meetup.com/code-and-coffee-philadelphia/) |
| Merch Store | [Fourth Wall Shop](https://nol-kky-shop.fourthwall.com/) |
| Community Fund | [Givebutter](https://givebutter.com/c_o_d_e) |

## Tech Stack

| Category | Technology |
| ---------- | ------------ |
| Static Site Generator | [Hugo](https://gohugo.io/) v0.126.1 |
| Hosting and CDN | [Cloudflare Pages](https://pages.cloudflare.com/) |
| CSS Framework | [PureCSS](https://purecss.io/) |
| Forms | [Tally.so](https://tally.so/) |
| Fonts | Google Fonts (Vollkorn, Gloria Hallelujah, Space Mono) |

## Architecture Overview

```mermaid
flowchart TB
    subgraph External["External Services"]
        Meetup[Meetup and news feeds]
        Tally[Tally.so Forms]
    end

    subgraph Build["Build Process"]
        Node[Node.js Script]
        Hugo[Hugo Generator]
        CI[GitHub Actions validation]
    end

    subgraph Runtime["Browser Runtime"]
        Menu[menu.js]
        Carousel[events-gallery.js]
        Feeds[live-feeds.js]
    end

    Node -->|generates| EventsData[events-data.js]
    Meetup --> Node
    Node -->|generates| FeedData[live-feeds-data.js]
    Hugo -->|builds| Static[Static HTML/CSS/JS]
    Static --> CI
    CI -->|uploads tested artifact| CF[Cloudflare Pages]
    CF -->|serves| Browser[User Browser]

    Browser --> Menu
    Browser --> Carousel
    Browser --> Feeds
    EventsData --> Carousel
    FeedData --> Feeds
    Tally -->|embeds in| Browser
```

## Getting Started

### Prerequisites

- [Hugo](https://gohugo.io/installation/) v0.126.1 or later (extended version)
- [Node.js](https://nodejs.org/) v22 or later
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/CODE-Community-of-Developers-Engineers/website-frontpage.git
cd website-frontpage

npm ci
npm start
```

### Full Development Build

```bash
npm start
```

This regenerates events and feeds before starting the local Hugo server.

### Production Build

```bash
npm ci
npm run generate:data
HUGO_ENVIRONMENT=production npm run prod:build
npm run check:site -- --dir public
```

To run a local test copy of the prod build use: `npm run prod`

## Build & Deployment Pipeline

```mermaid
flowchart LR
    A[Main push or daily refresh] --> B[Generate data and validate]
    B --> C[Hugo build and browser tests]
    C --> D[Retain artifact and checksum]
    D --> E[Wrangler uploads tested directory]
    E --> F[Check live site and deployed commit]
```

The `hugo.yml` workflow directly uploads to project **code-philly-community** in Cloudflare account **241b2116c32fcb97feef45212430dbce**. It runs on `main` pushes, daily at 10:17 UTC, or manually on `main`. It uses Hugo 0.126.1, Node 22, and Wrangler 4.152.0. Releases are serialized through the production checks. The retired domain and its DNS are outside this deployment path.

Before enabling releases, set the repository secret `CLOUDFLARE_PAGES_API_TOKEN` to a token with **Account / Cloudflare Pages / Edit**, restricted to that account. Do not reuse the old deploy-hook secret. Before merging the migration, verify that the legacy external Git integration cannot deploy the same `main` push to the retired site; this repository change does not disable that external integration.

The production gate validates canonical and preview URLs, sitemap, robots, Google verification, critical assets, search data, a root 404 page, and feed freshness. A successful Meetup fetch is required; zero upcoming events is valid. Optional news failures are recorded per source and displayed as unavailable. If every provider fails, generation stops without replacing the previous file. Data older than 36 hours fails the production check. Generated feed data is rebuilt during release and should not be committed.

### Production checks and alerts

```bash
npm run check:site -- --url https://code-philly-community.pages.dev/
```

The `monitor.yml` workflow runs this check every 15 minutes and retries once after 20 seconds. The maintainer responsible for releases must enable GitHub Actions failure notifications and verify delivery with a manual run. GitHub schedules may be delayed; this is a basic operational check, not a measured availability SLA. On failure, inspect the named check, deployment log, and per-source status in `/js/live-feeds-data.js`. Optional news outages warn; failed or stale Meetup data fails the check. If the deployed website is broken, restore the last successful deployment and rerun the command above.

### Recovery

Each release retains `site.tar.gz` and its SHA256 checksum for 30 days. Its `/deployment.json` records commit, build time, and Actions run ID. The Actions deployment log records the Cloudflare deployment URL/ID. Rebuilding an old commit refetches current content, so use the saved artifact or an existing successful deployment when restoring a release.

In Cloudflare, open **Workers & Pages → code-philly-community → Deployments**, find the previous successful production deployment, and choose **Rollback to this deployment**. Verify the restored commit with `npm run check:site -- --url https://code-philly-community.pages.dev/ --commit <restored-commit>`. Confirm the target project before acting. A rollback drill and notification delivery must be checked by the release owner before relying on this procedure.

If the deployment is no longer available, download the retained Actions artifact, verify `sha256sum -c site.tar.gz.sha256`, extract it to an empty directory, and upload that directory with the same account, project, and production branch as the workflow. Do not regenerate its data. See [Cloudflare's direct-upload CI guide](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/) and [rollback instructions](https://developers.cloudflare.com/pages/configuration/rollbacks/).

## Content Operations

### Adding a Blog Post

1. Create a new folder in `content/blog/`:

   ```bash
   mkdir content/blog/my-new-post
   ```

2. Create `index.md` with front matter:

   ```yaml
   ---
   title: "My New Post Title"
   date: 2025-01-17
   author: "Your Name"
   description: "Brief description of the post"
   featured: false
   topic: "JavaScript"
   tags:
     - javascript
     - tutorial
   image: "/images/optional-hero.jpg"
   ---

   Your markdown content here...
   ```

3. Commit and push to `main` branch

### Adding an Event Image

1. Add your image to `static/images/events/`
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.svg`, `.webp`
   - Filename becomes display name (e.g., `AI_Paper_Talks.jpg` → "AI Paper Talks")

2. The build script auto-generates `events-data.js` during deployment

### Updating Community Links

Edit `content/links/index.md` to add or modify community resource links.

### Embedding a Tally Form

Add an iframe in your markdown:

```html
<iframe src="https://tally.so/embed/YOUR_FORM_ID" width="100%" height="500" frameborder="0"></iframe>
```

## Project Structure

```text
├── content/
│   ├── _index.md              # Homepage
│   ├── blog/                  # Blog posts (page bundles)
│   ├── links/                 # Community links page
│   └── event-sponsorship/     # Sponsorship form
├── layouts/
│   ├── _default/
│   │   ├── baseof.html        # Base template
│   │   ├── list.html          # Blog listing
│   │   └── single.html        # Individual post
│   └── partials/              # Reusable components
├── static/
│   ├── css/                   # Stylesheets
│   ├── js/                    # JavaScript modules
│   └── images/events/         # Event gallery images
├── scripts/
│   └── generate-events-data.js # Build script
├── hugo.toml                  # Hugo configuration
└── CLAUDE.md                  # AI assistant guidance
```

## JavaScript Modules

```mermaid
sequenceDiagram
    participant Browser
    participant EventsData as events-data.js
    participant Carousel as events-gallery.js
    participant Menu as menu.js
    participant MeetupJS as meetup.js
    participant API as Meetup API

    Browser->>EventsData: Load (sets window.eventsImageData)
    Browser->>Carousel: Initialize IIFE
    Carousel->>EventsData: Read eventsImageData
    Carousel->>Browser: Render gallery tiles
    Note over Carousel: Auto-advance every 3s
    Browser->>Menu: Setup event listeners
    Note over Menu: Mobile nav toggle at 1300px
    Browser->>MeetupJS: Fetch events
    MeetupJS->>API: GET via CORS proxy
    API-->>MeetupJS: Event data
    MeetupJS->>Browser: Render event cards
```

| Module | Purpose |
| -------- | --------- |
| `menu.js` | Responsive mobile navigation toggle (breakpoint: 1300px) |
| `events-gallery.js` | Events photo grid (one tile per image) |
| `meetup.js` | Fetches live events from Meetup.com via CORS proxy |
| `events-data.js` | Auto-generated event data from image filenames |

## Contributing

We welcome contributions! Here's how to get involved:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- **CSS**: Use CSS custom properties (variables) defined in `static/css/modern.css`
- **JavaScript**: Vanilla JS, IIFE pattern for modules
- **Hugo**: Follow existing template patterns in `layouts/`

### Pull Request Checks

Every pull request targeting `main` runs the documented GitHub Actions validation checks in `.github/workflows/`. Before opening a PR, run `npm run generate:data`, `npm run validate`, and `npm test` locally when your change touches content, data, scripts, templates, or generated static data. PR checks also build the Hugo site, run end-to-end smoke tests, guard against root-relative asset paths that break project-page deployments, and check internal links in the generated output.

CodeRabbit is installed for this repository and reviews PRs using `.coderabbit.yaml`. It focuses on static-site safety, Hugo templates, content/front matter quality, responsive CSS, browser JavaScript, GitHub Actions, secrets checks, and accessibility-impacting changes. If automatic reviews are paused and an existing PR needs a fresh review, comment `@coderabbitai review`; incremental reviews do not revisit commits that CodeRabbit has already reviewed.

## Community

- **Meetup**: [C.O.D.E](https://www.meetup.com/code-and-coffee-philadelphia/)
- **Website**: [codephilly.com](https://www.codephilly.com/Code-And-Coffee-philidelphia-Website)

Join us for events, ask questions, and connect with fellow developers!

## License

This project is open source and available for community use.

---

Built with caffeine and code by the C.O.D.E community.
