# Coffee & Code Philadelphia

[![Hugo](https://img.shields.io/badge/Hugo-0.126.1-ff4088?logo=hugo)](https://gohugo.io/)
[![GitHub Pages](https://img.shields.io/badge/Hosted_on-GitHub_Pages-222?logo=github)](https://pages.github.com/)
[![Cloudflare](https://img.shields.io/badge/CDN-Cloudflare-f38020?logo=cloudflare)](https://www.cloudflare.com/)

**Your space to build.** A community-focused coding initiative bringing together developers, designers, and tech enthusiasts in the Philadelphia area.

## About

Coffee & Code Philadelphia is a welcoming community for anyone interested in technology, coding, and building projects. Whether you're a seasoned developer or just starting your journey, you'll find a supportive environment to learn, collaborate, and grow.

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
- **Project Request Portal** - Get help with your coding projects
- **Tech Talent Matchboard** - Connect job seekers with opportunities
- **Event Sponsorship** - Support our community events

## Quick Links

| Resource | Link |
|----------|------|
| Live Site | [codephilly.com](https://www.codephilly.com/Code-And-Coffee-philidelphia-Website) |
| Meetup Group | [Coffee & Code Philadelphia](https://www.meetup.com/code-and-coffee-philadelphia/) |
| Merch Store | [Fourth Wall Shop](https://nol-kky-shop.fourthwall.com/) |
| Community Fund | [Hack Club Bank](https://hcb.hackclub.com/donations/start/code-and-coffee-philadelphia) |

## Tech Stack

| Category | Technology |
|----------|------------|
| Static Site Generator | [Hugo](https://gohugo.io/) v0.126.1 |
| Hosting | [GitHub Pages](https://pages.github.com/) |
| CDN | [Cloudflare](https://www.cloudflare.com/) |
| CSS Framework | [PureCSS](https://purecss.io/) |
| Forms | [Tally.so](https://tally.so/) |
| Fonts | Google Fonts (Vollkorn, Gloria Hallelujah, Space Mono) |

## Architecture Overview

```mermaid
flowchart TB
    subgraph External["External Services"]
        Meetup[Meetup.com API]
        Tally[Tally.so Forms]
        CF[Cloudflare CDN]
    end

    subgraph Build["Build Process"]
        Node[Node.js Script]
        Hugo[Hugo Generator]
        GHA[GitHub Actions]
    end

    subgraph Runtime["Browser Runtime"]
        Menu[menu.js]
        Carousel[carousel.js]
        MeetupJS[meetup.js]
    end

    Node -->|generates| EventsData[events-data.js]
    Hugo -->|builds| Static[Static HTML/CSS/JS]
    GHA -->|deploys| GHP[GitHub Pages]
    GHP --> CF
    CF -->|serves| Browser[User Browser]

    Browser --> Menu
    Browser --> Carousel
    Browser --> MeetupJS
    EventsData --> Carousel
    MeetupJS -->|fetches| Meetup
    Tally -->|embeds in| Browser
```

## Getting Started

### Prerequisites

- [Hugo](https://gohugo.io/installation/) v0.126.1 or later (extended version)
- [Node.js](https://nodejs.org/) v20 or later
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Code-And-Coffee-philidelphia-Website.git
cd Code-And-Coffee-philidelphia-Website

# Generate events data (required before first build)
node scripts/generate-events-data.js

# Start development server
hugo server --bind 0.0.0.0 --port 5000 --baseURL http://localhost:5000
```

### Full Development Build

```bash
# Clean build with events data regeneration
rm -rf public && node scripts/generate-events-data.js && hugo server --bind 0.0.0.0 --port 5000 --baseURL http://localhost:5000
```

Quick version (does the same thing): `npm start`

### Production Build

```bash
node scripts/generate-events-data.js && hugo --gc --minify --cleanDestinationDir --forceSyncStatic
```

To run a local test copy of the prod build use: `npm run prod`

## Build & Deployment Pipeline

```mermaid
flowchart LR
    A[Push to main] --> B[GitHub Actions]
    B --> C[Install Hugo + Node]
    C --> D[generate-events-data.js]
    D --> E[Hugo Build]
    E --> F[Upload Artifact]
    F --> G[Deploy to GitHub Pages]
    G --> H[Cloudflare Cache]
    H --> I[Live Site]
```

Deployment is automated via GitHub Actions. Every push to `main` triggers:
1. Installation of Hugo v0.126.1 and Node.js 20
2. Events data generation from image files
3. Hugo build with minification
4. Deployment to GitHub Pages
5. Served via Cloudflare CDN

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

```
├── content/
│   ├── _index.md              # Homepage
│   ├── blog/                  # Blog posts (page bundles)
│   ├── links/                 # Community links page
│   ├── project-request/       # Project help form
│   ├── talent-matchboard/     # Job matching form
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
│   └── images/events/         # Event carousel images
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
    participant Carousel as carousel.js
    participant Menu as menu.js
    participant MeetupJS as meetup.js
    participant API as Meetup API

    Browser->>EventsData: Load (sets window.eventsImageData)
    Browser->>Carousel: Initialize IIFE
    Carousel->>EventsData: Read eventsImageData
    Carousel->>Browser: Render carousel slides
    Note over Carousel: Auto-advance every 3s
    Browser->>Menu: Setup event listeners
    Note over Menu: Mobile nav toggle at 1300px
    Browser->>MeetupJS: Fetch events
    MeetupJS->>API: GET via CORS proxy
    API-->>MeetupJS: Event data
    MeetupJS->>Browser: Render event cards
```

| Module | Purpose |
|--------|---------|
| `menu.js` | Responsive mobile navigation toggle (breakpoint: 1300px) |
| `carousel.js` | Events carousel with auto-rotation (3s interval) |
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

## Community

- **Meetup**: [Coffee & Code Philadelphia](https://www.meetup.com/code-and-coffee-philadelphia/)
- **Website**: [codephilly.com](https://www.codephilly.com/Code-And-Coffee-philidelphia-Website)

Join us for events, ask questions, and connect with fellow developers!

## License

This project is open source and available for community use.

---

Built with caffeine and code by the Coffee & Code Philadelphia community.
