#!/usr/bin/env node

/**
 * Events Data Validator
 *
 * Validates that events-data.js was generated correctly and contains valid data.
 * Run with: npm run validate:events
 */

const fs = require('fs');
const path = require('path');

const EVENTS_DATA_PATH = path.join(__dirname, '..', 'static', 'js', 'events-data.js');
const EVENTS_IMAGES_DIR = path.join(__dirname, '..', 'static', 'images', 'events');

// Check if events-data.js exists
if (!fs.existsSync(EVENTS_DATA_PATH)) {
  console.error('✗ events-data.js not found at static/js/events-data.js');
  console.error('  Run: node scripts/generate-events-data.js');
  process.exit(1);
}

const content = fs.readFileSync(EVENTS_DATA_PATH, 'utf8');

// Check it sets window.eventsImageData
if (!content.includes('window.eventsImageData')) {
  console.error('✗ events-data.js missing window.eventsImageData assignment');
  process.exit(1);
}

// Extract and validate the array
const match = content.match(/window\.eventsImageData\s*=\s*(\[[\s\S]*?\]);/);
if (!match) {
  console.error('✗ events-data.js has invalid format - cannot parse array');
  process.exit(1);
}

let data;
try {
  // Use Function constructor instead of eval for slightly safer parsing
  data = new Function(`return ${match[1]}`)();
} catch (e) {
  console.error('✗ events-data.js contains invalid JavaScript:', e.message);
  process.exit(1);
}

// Validate array structure
if (!Array.isArray(data)) {
  console.error('✗ events-data.js: eventsImageData is not an array');
  process.exit(1);
}

if (data.length === 0) {
  console.error('✗ events-data.js contains empty array - no events found');
  console.error('  Check that static/images/events/ contains image files');
  process.exit(1);
}

// Validate each event object
let errors = [];
data.forEach((event, index) => {
  if (!event.filename) {
    errors.push(`Event ${index}: missing 'filename' property`);
  }
  if (!event.name) {
    errors.push(`Event ${index}: missing 'name' property`);
  }

  // Check that the image file actually exists
  if (event.filename) {
    const imagePath = path.join(EVENTS_IMAGES_DIR, event.filename);
    if (!fs.existsSync(imagePath)) {
      errors.push(`Event '${event.name}': image file not found at ${event.filename}`);
    }
  }
});

if (errors.length > 0) {
  console.error('✗ events-data.js validation failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

// List validated events
console.log(`✓ Validated events-data.js with ${data.length} event(s):`);
data.forEach(event => {
  console.log(`  - ${event.name} (${event.filename})`);
});
