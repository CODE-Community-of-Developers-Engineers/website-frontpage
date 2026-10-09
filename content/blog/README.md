# Blog Content Management Guide

This guide explains how to create and manage blog posts for the C.O.D.E website using Hugo's page bundles.

## Hugo Page Bundles

Hugo supports "page bundles" which allow you to organize content and assets together in folders. This makes it easier to manage blog posts with images and other resources.

### Blog Post Structure

Each blog post should be in its own folder with an `index.md` file:

```text
content/blog/
├── your-post-title/
│   ├── index.md          # The blog post content
│   ├── hero-image.jpg    # Featured image
│   ├── diagram.png       # Other images used in the post
│   └── data.csv          # Any other assets
└── another-post/
    ├── index.md
    └── cover.jpg
```

## Creating a New Blog Post

### 1. Create the Post Folder

```bash
mkdir content/blog/your-post-title
```

### 2. Create index.md with Front Matter

```yaml
---
title: "Your Post Title"
date: 2025-06-23
author: "Your Name"
description: "Brief description for SEO and previews"
topic: "tutorial"        # Required: choose from available topics ("press" lists the post under "See us in the press" on the Media page)
tags: ["javascript", "beginners", "web-development"]  # Optional: specific tags
featured: false
image: "hero-image.jpg"  # Optional: header image filename
readingTime: 5           # Optional: estimated reading time in minutes
---

Your post content here...

<!--more-->

More detailed content after the summary break...
```

### 3. Required Front Matter Fields

- **title**: The post title (appears as the main heading)
- **date**: Publication date in YYYY-MM-DD format
- **author**: Author name
- **description**: Brief summary for previews and SEO
- **topic**: Primary topic category (see available topics below)
- **tags**: Array of specific tags for detailed categorization

### 4. Optional Front Matter Fields

- **featured**: Set to `true` to mark as a featured post (shows badge)
- **image**: Filename of the header image (place in same folder)
- **readingTime**: Estimated reading time in minutes

## Topics and Tags System

### Available Topics (choose one)

Primary content categories for broad organization:

- `community` - Community updates, member spotlights, general announcements
- `events` - Event recaps, upcoming events, meetup information
- `tutorial` - Technical tutorials and how-to guides
- `news` - Industry news, tech trends, announcements
- `projects` - Project showcases, open source contributions
- `career` - Career advice, job opportunities, professional development

### Available Tags (choose multiple)

Specific descriptors for detailed categorization:

#### Technologies

- `javascript`, `python`, `react`, `nodejs`, `api`, `web-development`
- `ai`, `machine-learning`, `data-science`, `devops`, `cloud`
- `mobile`, `ios`, `android`, `blockchain`, `gaming`

#### Skill Levels

- `beginners`, `intermediate`, `advanced`

#### Event Types

- `hackathon`, `workshop`, `tech-talk`, `networking`, `meetup`

#### Content Types

- `recap`, `announcement`, `showcase`, `discussion`, `interview`

## Adding Images

### Header/Featured Images

1. Place your header image in the same folder as your `index.md`
2. Reference it in the front matter: `image: "your-image.jpg"`
3. Hugo will automatically use this for social media previews

### Images in Content

Reference images in the same folder directly:

```markdown
![Alt text](diagram.png)
```

Or use Hugo shortcodes for more control:

```markdown
{{< figure src="screenshot.png" alt="Screenshot description" caption="Optional caption" >}}
```

## Content Features

### Summary/Excerpt

Add `<!--more-->` in your content to create a manual summary break. Everything before this tag becomes the excerpt shown in blog lists.

### Code Blocks

Use fenced code blocks with syntax highlighting:

```markdown
```javascript
function hello() {
    console.log("Hello, C.O.D.E!");
}
```

### Links

- Internal links: `[Link text](/blog/other-post/)`
- External links: `[Link text](https://example.com)`

## Blog Publishing Workflow

### 1. Local Development

```bash
# Start Hugo development server
hugo server -D

# View your post at http://localhost:5000
```

### 2. Publishing

1. Create your post folder and `index.md`
2. Add any images or assets to the same folder
3. Test locally with `hugo server`
4. Commit and push to trigger automatic deployment

### 3. Automatic Updates

Hugo automatically:

- Generates the blog listing page
- Creates tag pages
- Updates the RSS feed
- Builds related posts suggestions
- Updates the sitemap

## Example Post Structure

```text
content/blog/building-rest-api/
├── index.md              # Main content
├── api-diagram.png       # Referenced in content
├── postman-screenshot.jpg # Referenced in content
└── cover.jpg            # Featured image
```

```yaml
---
title: "Building Your First REST API"
date: 2025-06-23
author: "Alex Johnson"
description: "Learn to build REST APIs with Node.js and Express"
topic: "tutorial"
tags: ["javascript", "nodejs", "api", "beginners", "backend"]
featured: true
image: "cover.jpg"
readingTime: 8
---

Building REST APIs is essential for modern web development...

<!--more-->

## Setting Up the Project

First, create a new directory...

![API Structure](api-diagram.png)

Here's how to test with Postman:

![Postman Testing](postman-screenshot.jpg)
```

## Best Practices

1. **Use descriptive folder names** - lowercase with hyphens
2. **Optimize images** - compress before adding to reduce load times
3. **Write compelling descriptions** - these appear in social media previews
4. **Choose relevant tags** - typically 3-5 tags per post
5. **Include reading time** - helps readers plan their time
6. **Use the summary break** - control what appears in post previews
7. **Test locally first** - always preview before publishing

## Maintenance

- Review tags periodically to ensure consistency
- Update older posts if information becomes outdated
- Monitor featured posts to keep them current and relevant
- Check image links if you move or rename files
