#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const MEETUP_RSS_URL = 'https://www.meetup.com/code-coffee-philly/events/rss/';
const OUTPUT_FILE = path.join(__dirname, '..', 'static', 'js', 'live-feeds-data.js');

// --- RSS XML parsing (same approach as SonOfAnton) ---

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`);
  const match = regex.exec(xml);
  return match ? match[1] : null;
}

function extractCDATA(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`);
  const match = regex.exec(xml);
  return match ? match[1] : null;
}

function stripHtml(text) {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\\/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function parseMeetupRSS(xml) {
  const events = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const title = extractCDATA(itemXml, 'title') || extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const guid = extractTag(itemXml, 'guid');
    const pubDate = extractTag(itemXml, 'pubDate');
    const description = extractCDATA(itemXml, 'description') || extractTag(itemXml, 'description');

    if (!title) continue;

    // Extract location from description if available
    const location = extractLocationFromDescription(description || '');

    // Extract event date/time from description
    const eventDateTime = extractDateTimeFromDescription(description || '', pubDate);

    events.push({
      name: title.trim(),
      url: link ? link.trim() : '',
      guid: guid ? guid.trim() : '',
      date: eventDateTime,
      location: location || 'Philadelphia, PA',
      description: description ? stripHtml(description).slice(0, 200) : ''
    });
  }

  return events;
}

function extractLocationFromDescription(desc) {
  const plain = stripHtml(desc);
  // Meetup descriptions often contain location after certain patterns
  const locationPatterns = [
    /(?:Location|Where|Venue):\s*(.+?)(?:\n|$)/i,
    /(?:at|@)\s+([A-Z][^,\n]+(?:,\s*[A-Z][^,\n]+)?)/,
  ];
  for (const pattern of locationPatterns) {
    const match = plain.match(pattern);
    if (match) return match[1].trim().slice(0, 100);
  }
  return null;
}

function extractDateTimeFromDescription(desc, pubDate) {
  // Use pubDate as fallback - Meetup RSS pubDate is the event date
  if (pubDate) {
    const d = new Date(pubDate);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

// --- HTTP fetch with redirect following ---

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: { 'User-Agent': 'CodeAndCoffeePhilly/1.0 (Website Build)' }
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

// --- Seed data (shown until dispatch agents populate real data) ---

const SEED_PHILLY_NEWS = [
  { title: "Comcast RISE Awards $10K Grants to 100 Philly Small Businesses", source: "Technical.ly", url: "https://technical.ly/startups/", category: "Startup Funding", date: new Date().toISOString().slice(0, 10) },
  { title: "Drexel AI Lab Partners with Jefferson Health on Diagnostic Models", source: "Philadelphia Business Journal", url: "https://www.bizjournals.com/philadelphia/", category: "AI Research", date: new Date(Date.now() - 86400000).toISOString().slice(0, 10) },
  { title: "Philly Named Top 10 City for Tech Job Growth in 2026", source: "Built In", url: "https://builtin.com/", category: "Jobs & Careers", date: new Date(Date.now() - 172800000).toISOString().slice(0, 10) },
  { title: "UPenn CIS Launches Open-Source LLM Benchmark for Healthcare", source: "Penn Today", url: "https://penntoday.upenn.edu/", category: "Open Source", date: new Date(Date.now() - 259200000).toISOString().slice(0, 10) },
  { title: "Pennovation Works Welcomes 5 New Deep-Tech Startups", source: "Technical.ly", url: "https://technical.ly/startups/", category: "Startups", date: new Date(Date.now() - 345600000).toISOString().slice(0, 10) }
];

const SEED_GITHUB_TRENDING = [
  { name: "anthropics/claude-code", description: "An agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster.", language: "TypeScript", stars: 30200, todayStars: 1250, url: "https://github.com/anthropics/claude-code" },
  { name: "browser-use/browser-use", description: "Make websites accessible for AI agents.", language: "Python", stars: 18400, todayStars: 890, url: "https://github.com/browser-use/browser-use" },
  { name: "julep-ai/julep", description: "A new DSL and server for multi-step AI workflows.", language: "Python", stars: 9200, todayStars: 620, url: "https://github.com/julep-ai/julep" },
  { name: "pydantic/pydantic-ai", description: "Agent Framework / shim to use Pydantic with LLMs.", language: "Python", stars: 12800, todayStars: 450, url: "https://github.com/pydantic/pydantic-ai" },
  { name: "vercel/ai", description: "Build AI-powered applications with React, Svelte, Vue, and Solid.", language: "TypeScript", stars: 15600, todayStars: 380, url: "https://github.com/vercel/ai" }
];

const SEED_AI_PAPERS = [
  { title: "ReasonFlux: Hierarchical LLM Reasoning with Scaled Thought Templates", authors: "Yang et al.", summary: "Proposes a hierarchical reasoning framework that decomposes complex problems into structured thought templates, achieving state-of-the-art on MATH and AIME benchmarks.", url: "https://arxiv.org/", date: new Date().toISOString().slice(0, 10) },
  { title: "Scaling Test-Time Compute with Open Models Gives Better Results Than Scaling Parameters", authors: "Snell et al.", summary: "Demonstrates that smaller models with more test-time compute can outperform 14x larger models, challenging the scaling paradigm.", url: "https://arxiv.org/", date: new Date(Date.now() - 86400000).toISOString().slice(0, 10) },
  { title: "Multimodal Mixture-of-Experts for Real-Time Video Understanding", authors: "Chen et al.", summary: "A sparse MoE architecture that processes video streams in real-time by routing visual and temporal tokens to specialized experts.", url: "https://arxiv.org/", date: new Date(Date.now() - 172800000).toISOString().slice(0, 10) },
  { title: "Constitutional AI Without RLHF: Direct Preference Alignment at Scale", authors: "Park et al.", summary: "Shows that constitutional principles can be applied through supervised fine-tuning alone, matching RLHF quality with 10x less compute.", url: "https://arxiv.org/", date: new Date(Date.now() - 259200000).toISOString().slice(0, 10) }
];

// --- Main ---

async function generateLiveFeeds() {
  console.log('Fetching Meetup events from RSS...');

  let meetupEvents = [];
  try {
    const xml = await fetchUrl(MEETUP_RSS_URL);
    if (xml.includes('<item>')) {
      meetupEvents = parseMeetupRSS(xml);
      console.log(`✓ Fetched ${meetupEvents.length} events from Meetup RSS`);
    } else {
      console.warn('⚠ No items found in Meetup RSS feed');
    }
  } catch (err) {
    console.error('⚠ Failed to fetch Meetup RSS:', err.message);
    console.log('  Falling back to existing data if available...');

    // Try to preserve existing event data
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log('  Keeping existing live-feeds-data.js');
      return;
    }
  }

  // Sort events by date
  meetupEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Read existing file to preserve non-event feed data
  let existingData = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
      const jsonMatch = content.match(/window\.LIVE_FEEDS\s*=\s*(\{[\s\S]*\});?\s*$/);
      if (jsonMatch) {
        existingData = JSON.parse(jsonMatch[1]);
      }
    } catch (e) {
      // Ignore parse errors, will regenerate
    }
  }

  // Build the feeds data - update events, preserve other feeds
  const feedsData = {
    lastUpdated: new Date().toISOString(),
    upcomingEvents: meetupEvents.map(e => ({
      name: e.name,
      date: e.date,
      location: e.location,
      url: e.url,
      description: e.description
    })),
    // Preserve other feeds from existing data (agents update these separately)
    // Seed with sample data until agents are deployed
    phillyNews: existingData.phillyNews && existingData.phillyNews.length ? existingData.phillyNews : SEED_PHILLY_NEWS,
    githubTrending: existingData.githubTrending && existingData.githubTrending.length ? existingData.githubTrending : SEED_GITHUB_TRENDING,
    aiPapers: existingData.aiPapers && existingData.aiPapers.length ? existingData.aiPapers : SEED_AI_PAPERS
  };

  const jsContent = `// Live feeds data - events fetched from Meetup RSS, other feeds populated by dispatch agents
// Auto-generated by scripts/generate-live-feeds.js
window.LIVE_FEEDS = ${JSON.stringify(feedsData, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, jsContent);
  console.log(`✓ Wrote live feeds data to ${OUTPUT_FILE}`);
  console.log(`  Events: ${feedsData.upcomingEvents.length}`);
  console.log(`  File size: ${fs.statSync(OUTPUT_FILE).size} bytes`);
}

generateLiveFeeds().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
