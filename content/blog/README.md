# Blog Content Management Guide

This guide explains how to create and manage blog posts for the Code & Coffee Philadelphia website.

## Creating a New Blog Post

### 1. File Location
Create new blog posts in the `content/blog/` directory with a `.md` extension.

**File naming convention:**
- Use lowercase letters
- Separate words with hyphens
- Use descriptive names
- Example: `getting-started-with-react.md`

### 2. Front Matter Structure

Every blog post must start with YAML front matter:

```yaml
---
title: "Your Post Title"
date: 2025-06-23
author: "Author Name"
description: "Brief description for SEO and previews"
tags: ["tag1", "tag2", "tag3"]
featured: true # Optional: makes this a featured post
---
```

### 3. Required Fields
- **title**: The post title (will appear as the main heading)
- **date**: Publication date in YYYY-MM-DD format
- **author**: Author name
- **description**: Brief summary for previews and SEO

### 4. Optional Fields
- **tags**: Array of tags for categorization and filtering
- **featured**: Set to `true` to mark as a featured post

### 5. Available Tags
Use relevant tags from these categories:
- **Topics**: `community`, `events`, `networking`, `hackathon`, `workshops`
- **Technologies**: `javascript`, `python`, `react`, `ai`, `machine-learning`, `web-development`
- **Skill Levels**: `beginners`, `intermediate`, `advanced`
- **Event Types**: `meetup`, `tech-talk`, `project-showcase`

## Content Structure

### Summary/Excerpt
Add `<!--more-->` in your content to create a manual summary break. Everything before this tag becomes the excerpt shown in lists.

### Images
Place images in the `static/media/blog/` directory and reference them:
```markdown
![Alt text]({{ "media/blog/your-image.jpg" | relURL }})
```

### Links
- Internal links: `[Link text]({{ "page-url" | relURL }})`
- External links: `[Link text](https://example.com)`

## Blog Features

### Tag Filtering
The blog automatically generates:
- Tag filter buttons on the blog listing page
- Clickable tags on individual posts
- Automatic tag aggregation across all posts

### Featured Posts
Posts marked with `featured: true` will:
- Display a "Featured" badge
- Have enhanced styling with gradient background
- Appear prominently in the listing

### Responsive Design
All blog content is automatically responsive and follows the site's design system.

## Examples

### Minimal Post
```yaml
---
title: "Quick Update"
date: 2025-06-23
author: "Team"
description: "A quick community update"
tags: ["community", "updates"]
---

Your content here...
```

### Full Featured Post
```yaml
---
title: "Advanced React Patterns Workshop Recap"
date: 2025-06-23
author: "Jane Doe"
description: "Key takeaways from our advanced React patterns workshop including hooks, context, and performance optimization"
tags: ["react", "javascript", "workshops", "web-development", "advanced"]
featured: true
---

Workshop overview and content...

<!--more-->

Detailed content continues here...
```

## Best Practices

1. **Use descriptive titles** that clearly indicate the post content
2. **Choose relevant tags** - typically 3-5 tags per post
3. **Write compelling descriptions** for better engagement
4. **Include images** to make posts more visual
5. **Use the summary break** (`<!--more-->`) to control excerpts
6. **Test locally** using `hugo server` before publishing

## Publication Process

1. Create your markdown file in `content/blog/`
2. Test locally with Hugo server
3. Commit and push to trigger automatic deployment via GitHub Actions
4. Posts automatically appear on the blog listing page with filtering

## Maintenance

- Review tags periodically to ensure consistency
- Update older posts if information becomes outdated
- Monitor featured posts to keep them current and relevant