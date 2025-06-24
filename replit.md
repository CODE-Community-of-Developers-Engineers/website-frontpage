# Code & Coffee Philadelphia - Replit Configuration

## Overview

Code & Coffee Philadelphia is a community-focused static website built with Hugo, designed to bring together developers, designers, and tech enthusiasts in the Philadelphia area. The site serves as a central hub for event information, community resources, project requests, and talent matchmaking within the local tech ecosystem.

## System Architecture

### Frontend Architecture
- **Static Site Generator**: Hugo (Go-based)
- **Template Engine**: Hugo's built-in Go templating system
- **CSS Framework**: PureCSS for responsive grid system and base styles
- **Custom Styling**: CSS custom properties (CSS variables) for theming
- **JavaScript**: Vanilla JavaScript for interactive components (carousel, mobile menu, Meetup integration)

### Site Structure
- **Home Page**: Features a carousel/hero section and community information
- **Blog Section**: Hugo's content management for blog posts and updates
- **Service Pages**: Project requests, talent matchboard, event sponsorship (all with embedded Tally forms)
- **Links Page**: Centralized directory of community social media and external resources

### Content Management
- **Markdown-based**: All content stored in Markdown files within the `content/` directory
- **Front Matter**: YAML-based metadata for pages and blog posts
- **Static Assets**: Images, CSS, and JavaScript files served from the `static/` directory

## Key Components

### Navigation System
- **Responsive Design**: Desktop navigation with hamburger menu for mobile devices (breakpoint at 1300px)
- **Menu Management**: JavaScript-based mobile menu toggle with body scroll prevention
- **External Links**: Integration with external services (Meetup, merchandise store, donation platform)

### Form Integration
- **Third-party Forms**: Tally.so embedded forms for project requests, talent matchboard, and event sponsorship
- **Custom Styling**: CSS overrides to match site branding and fix text color issues

### Interactive Elements
- **Carousel Component**: JavaScript-powered image carousel with navigation controls and indicators
- **Meetup Integration**: JavaScript module for fetching and displaying upcoming events (with fallback messaging)

### Styling System
- **Design Tokens**: CSS custom properties for consistent theming
- **Typography**: Google Fonts integration (Vollkorn, Space Mono, Gloria Hallelujah)
- **Color Palette**: Coffee/earth-tone inspired color scheme with accent colors

## Data Flow

### Content Publishing
1. Content authors create Markdown files in the `content/` directory
2. Hugo processes Markdown and templates during build
3. Static HTML, CSS, and JavaScript files are generated
4. Files are served statically (no server-side processing required)

### Form Submissions
1. Users interact with embedded Tally forms
2. Form data is submitted directly to Tally.so servers
3. Site administrators receive notifications via Tally's system
4. No backend processing required on the main site

### Event Information
1. Meetup events are fetched via JavaScript from Meetup.com
2. CORS proxy used for cross-origin requests
3. Fallback messaging displayed if API calls fail
4. Local development uses Express.js proxy server

## External Dependencies

### Build Dependencies
- **Hugo**: Static site generator (v0.121.0)
- **Node.js**: For development server and package management
- **PureCSS**: CSS framework via CDN
- **Google Fonts**: Typography via CDN

### Third-party Services
- **Tally.so**: Form handling for project requests, talent matching, and event sponsorship
- **Meetup.com**: Event information and RSVP management
- **Fourth Wall**: Merchandise store integration
- **Hack Club Bank**: Community fund donation processing
- **GitHub Pages**: Website hosting and deployment

### Development Tools
- **Express.js**: Local development server for API proxying
- **Replit**: Development environment configuration

## Deployment Strategy

### GitHub Actions Workflow
- **Trigger**: Push to main branch or manual workflow dispatch
- **Build Process**: Hugo static site generation with extended features
- **Deployment Target**: GitHub Pages
- **Dependencies**: Automated installation of Hugo CLI and Dart Sass

### Development Workflow
- **Local Development**: Hugo development server on port 5000
- **Replit Integration**: Configured for Node.js 20 environment
- **Live Reload**: Hugo's built-in development server features

### Configuration Files
- **Hugo Config**: Dual configuration (YAML and TOML) for site settings
- **Replit Config**: Workflow configuration for development environment
- **GitHub Actions**: Automated deployment pipeline

## Recent Changes

- June 24, 2025: Enhanced tag pages and improved site styling
  - Created simplified tag pages with focused content and limited sidebar options
  - Removed "Browse by Topic" section from tag pages to reduce clutter
  - Added tag-specific search functionality that only searches within that tag
  - Implemented related tags section showing tags from posts in the current tag
  - Added white backgrounds to hero section, search boxes, and blog headers
  - Updated header logo with mixed fonts: "Code & Coffee" (serif) and "Philadelphia" (cursive)
  
- June 24, 2025: Implemented compact tag display with expandable/collapsible functionality
  - Created compact tag display showing 10 most popular tags initially (sorted by usage frequency)
  - Added "Show More/Show Fewer" toggle button matching site button design
  - Fixed initial menu expansion issue on page load
  - Removed sticky sidebar positioning for better scrolling behavior
  - Enhanced tag styling to match site-wide button consistency
  - Maintained all existing tag filtering functionality

- June 24, 2025: Enhanced blog post sidebar and hero section
  - Created custom sidebar for individual blog posts with article metadata
  - Added table of contents with clickable navigation and active section highlighting
  - Implemented clean white sidebar background with theme-consistent styling
  - Fixed mobile navigation functionality and enhanced hero section design
  - Added elegant bordered container around hero section with subtle background pattern
  - Fixed mobile hamburger menu to properly show/hide navigation overlay
  - Resolved CSS conflicts that prevented mobile navigation from displaying
  - Enhanced button styling consistency across all elements
  - Implemented proper mobile menu state tracking to prevent toggle conflicts
  - Created dynamic events carousel that reads from events image folder
  - Added auto-advancing carousel functionality (3-second intervals)
  - Fixed responsive navigation breakpoints at 1300px screen width

- June 23, 2025: Enhanced carousel with coffee-themed imagery and smooth transitions
  - Redesigned all three slides with detailed coffee-themed SVG illustrations
  - Implemented advanced slide transitions with cubic-bezier easing and transform effects
  - Added coffee-inspired color gradients and atmospheric overlays
  - Enhanced slide content with animated text effects and coffee-themed language
  - Improved visual hierarchy with better typography and text shadows
  - Added hover effects and smooth scaling animations for interactive elements

- June 23, 2025: Applied consistent button styling across blog elements
  - Updated featured badges, topic badges, and tag buttons to match site-wide button design
  - Used Gloria Hallelujah font and bordered button style from original design
  - Enhanced related posts section with proper button styling and card layout
  - Maintained hover effects and transitions consistent with site design

- June 23, 2025: Enhanced blog post header design
  - Redesigned blog post headers with modern layout and visual hierarchy
  - Added hero image support with hover effects and proper proportions
  - Created styled badges for featured posts and topic categories
  - Improved metadata section with icons and better readability
  - Enhanced content body typography with better spacing

- June 23, 2025: Enhanced blog layout and filtering system
  - Implemented full-width responsive blog layout with improved mobile experience
  - Added multi-tag selection filtering in sidebar with clear functionality
  - Separated topic and tag filtering systems for better content organization
  - Ensured blog posts display newest to oldest (chronological order)
  - Created responsive grid layout for blog post cards with hover effects
  - Added comprehensive search functionality with real-time filtering

- June 23, 2025: Organized content structure with Hugo page bundles
  - Converted blog posts to use Hugo page bundles (each post in its own folder)
  - Organized all pages into dedicated folders for better content management
  - Added support for header images in blog posts
  - Created comprehensive content management documentation
  - Set up automatic blog page generation and tag management
  - Added example blog posts demonstrating proper structure and formatting

- June 23, 2025: Complete modern blog-focused redesign with original branding
  - Redesigned entire site with modern layout while preserving original Code & Coffee aesthetics
  - Restored original color scheme (coffee tones, #59969B accent, #E9E3DC background)
  - Kept original button styles with Gloria Hallelujah font and bordered design
  - Maintained Vollkorn typography and subtle grid background pattern
  - Implemented comprehensive blog-first layout with sidebar, related posts, and tag filtering
  - Created modular component system with reusable partials
  - Added responsive grid layouts and improved mobile experience
  - Integrated tag cloud and community links in sidebar

- June 23, 2025: Template structure improvements and carousel removal
  - Removed carousel component per user feedback
  - Created reusable header and footer partials for consistent site structure
  - Implemented baseof.html template for DRY architecture
  - Cleaned up template inheritance structure

- June 23, 2025: Enhanced blog system with tagging and filtering
  - Added tag-based filtering on blog listing page
  - Implemented featured post functionality with badges
  - Improved blog post templates with better metadata display
  - Created comprehensive content management documentation

- June 23, 2025: Initial Hugo template conversion
  - Converted static HTML site to Hugo static site generator
  - Implemented responsive navigation with mobile menu
  - Created blog functionality with Hugo content management
  - Set up GitHub Pages deployment workflow

## Changelog

- June 23, 2025: Initial setup

## User Preferences

- **Communication style**: Simple, everyday language
- **Design preferences**: Modern blog-focused layout with original Code & Coffee branding maintained
- **Color scheme**: Original coffee-tone palette (#E9E3DC background, #59969B accent, warm earth tones)
- **Typography**: Vollkorn serif for body text, Gloria Hallelujah for buttons/headings, original button styles with borders
- **Filtering preferences**: Multi-tag selection capability, separate topic categories, clear filter options