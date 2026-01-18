#!/usr/bin/env node

/**
 * Front Matter Validator for Blog Posts
 *
 * Validates that all blog posts have required front matter fields.
 * Run with: npm run validate:frontmatter
 */

const fs = require('fs');
const path = require('path');

// gray-matter parses YAML front matter from markdown files
let matter;
try {
  matter = require('gray-matter');
} catch (e) {
  console.error('Error: gray-matter not installed. Run: npm install');
  process.exit(1);
}

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'blog');
const REQUIRED_FIELDS = ['title', 'date'];

let errors = [];
let warnings = [];

function validatePost(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(content);
  const relativePath = path.relative(process.cwd(), filePath);

  // Check required fields
  REQUIRED_FIELDS.forEach(field => {
    if (!data[field]) {
      errors.push(`${relativePath}: Missing required field '${field}'`);
    }
  });

  // Validate date format if present
  if (data.date) {
    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      errors.push(`${relativePath}: Invalid date format '${data.date}'`);
    }
  }

  // Warn about recommended fields (non-blocking)
  if (!data.author) {
    warnings.push(`${relativePath}: Missing recommended field 'author'`);
  }
  if (!data.description) {
    warnings.push(`${relativePath}: Missing recommended field 'description'`);
  }
}

// Check if blog directory exists
if (!fs.existsSync(CONTENT_DIR)) {
  console.log('No blog directory found at content/blog/ - skipping validation');
  process.exit(0);
}

// Find all index.md files in blog directories (Hugo page bundles)
const blogDirs = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => path.join(CONTENT_DIR, d.name, 'index.md'))
  .filter(f => fs.existsSync(f));

// Also check for standalone .md files in blog root (non-bundle posts)
// Exclude _index.md (list page) and README.md (documentation)
const standaloneFiles = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
  .filter(f => f.isFile() &&
    f.name.endsWith('.md') &&
    f.name !== '_index.md' &&
    f.name.toLowerCase() !== 'readme.md')
  .map(f => path.join(CONTENT_DIR, f.name));

const allPosts = [...blogDirs, ...standaloneFiles];

if (allPosts.length === 0) {
  console.log('No blog posts found to validate');
  process.exit(0);
}

// Validate each post
allPosts.forEach(validatePost);

// Output warnings (non-blocking)
if (warnings.length > 0) {
  console.log('\nWarnings (non-blocking):');
  warnings.forEach(w => console.log(`  ⚠ ${w}`));
}

// Output errors and exit with failure if any
if (errors.length > 0) {
  console.error('\nFront matter validation failed:');
  errors.forEach(e => console.error(`  ✗ ${e}`));
  console.error(`\n${errors.length} error(s) found in ${allPosts.length} post(s)`);
  process.exit(1);
}

console.log(`\n✓ Validated ${allPosts.length} blog post(s) - all required fields present`);
