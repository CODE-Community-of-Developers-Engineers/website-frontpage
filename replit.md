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

- June 23, 2025: Template structure improvements and carousel removal
  - Removed carousel component per user feedback
  - Created reusable header and footer partials for consistent site structure
  - Implemented baseof.html template for DRY architecture
  - Cleaned up template inheritance structure
  - Fixed blog system with proper tagging and filtering functionality

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

Preferred communication style: Simple, everyday language.