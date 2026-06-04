#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const MEETUP_EVENTS_URL = 'https://www.meetup.com/code-coffee-philly/events/';
const HN_TOP_URL = 'https://hacker-news.firebaseio.com/v0/topstories.json';
const HN_ITEM_URL = 'https://hacker-news.firebaseio.com/v0/item/';
const HN_ALGOLIA_URL = 'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=5';
const PH_FEED_URL = 'https://www.producthunt.com/feed';
const GITHUB_SEARCH_URL = 'https://api.github.com/search/repositories';
const GITHUB_TRENDING_URL = 'https://github.com/trending?since=daily';
const ARXIV_API_URL = 'https://export.arxiv.org/api/query';
const GOOGLE_NEWS_RSS_URL = 'https://news.google.com/rss/search';
const OUTPUT_FILE = path.join(__dirname, '..', 'static', 'js', 'live-feeds-data.js');
const PHILLY_NEWS_MAX_AGE_DAYS = 45;

// --- XML parsing helpers (for Product Hunt Atom feed) ---

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
    // Decode HTML entities first, before stripping tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, '')
    // Now strip HTML tags
    .replace(/<[^>]+>/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\\/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

// --- Meetup events page scraper (extracts Apollo GraphQL state) ---

function parseMeetupEventsPage(html) {
  const events = [];

  // Extract __NEXT_DATA__ script containing Apollo state
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!nextDataMatch) {
    console.warn('  Could not find __NEXT_DATA__ in Meetup page');
    return events;
  }

  let nextData;
  try {
    nextData = JSON.parse(nextDataMatch[1]);
  } catch (e) {
    console.warn('  Failed to parse __NEXT_DATA__:', e.message);
    return events;
  }

  const apolloState = nextData?.props?.pageProps?.__APOLLO_STATE__;
  if (!apolloState) {
    console.warn('  Could not find __APOLLO_STATE__ in __NEXT_DATA__');
    return events;
  }

  // Find all Event objects in the Apollo cache
  for (const [key, value] of Object.entries(apolloState)) {
    if (!key.startsWith('Event:') || value.__typename !== 'Event') continue;
    if (value.status !== 'ACTIVE') continue;

    const title = value.title || '';
    const dateTime = value.dateTime || '';
    const eventUrl = value.eventUrl || `https://www.meetup.com/code-coffee-philly/events/${value.id}/`;

    // Resolve venue reference
    let location = 'Philadelphia, PA';
    if (value.venue && value.venue.__ref) {
      const venue = apolloState[value.venue.__ref];
      if (venue && venue.name) {
        location = venue.name;
        if (venue.address) location += ', ' + venue.address;
      }
    } else if (value.venue && value.venue.name) {
      location = value.venue.name;
    }

    // Get RSVP count
    let rsvpCount = 0;
    if (value.going && value.going.totalCount != null) {
      rsvpCount = value.going.totalCount;
    }

    events.push({
      name: title,
      date: dateTime ? new Date(dateTime).toISOString() : new Date().toISOString(),
      location: location,
      url: eventUrl,
      rsvpCount: rsvpCount
    });
  }

  return events;
}

// --- HTTP fetch with redirect following ---

function fetchUrlOnce(url) {
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

async function fetchUrl(url, attempts) {
  attempts = attempts || 2;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fetchUrlOnce(url);
    } catch (e) {
      lastError = e;
      if (attempt < attempts) {
        console.warn(`  Request failed (${attempt}/${attempts}) for ${url}: ${e.message}`);
      }
    }
  }
  throw lastError;
}

// --- Hacker News fetcher (same approach as ccp-discord-daily) ---

async function fetchHackerNews(count) {
  count = count || 5;
  let stories = [];

  // Try Firebase first
  try {
    const topJson = await fetchUrl(HN_TOP_URL);
    const topIds = JSON.parse(topJson).slice(0, count);
    for (const id of topIds) {
      try {
        const itemJson = await fetchUrl(`${HN_ITEM_URL}${id}.json`);
        const item = JSON.parse(itemJson);
        if (item && item.title) {
          stories.push({
            title: item.title,
            url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
            score: item.score || 0,
            comments: item.descendants || 0,
            author: item.by || 'unknown',
            hnId: item.id,
            hnUrl: `https://news.ycombinator.com/item?id=${item.id}`
          });
        }
      } catch (e) { /* skip individual item failures */ }
    }
    return stories;
  } catch (e) {
    console.warn('  Firebase HN failed:', e.message, '— trying Algolia');
  }

  // Fallback to Algolia
  try {
    const algoliaJson = await fetchUrl(HN_ALGOLIA_URL);
    const data = JSON.parse(algoliaJson);
    for (const hit of (data.hits || []).slice(0, count)) {
      stories.push({
        title: hit.title || '',
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        score: hit.points || 0,
        comments: hit.num_comments || 0,
        author: hit.author || 'unknown',
        hnId: hit.objectID,
        hnUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`
      });
    }
  } catch (e) {
    console.warn('  Algolia HN also failed:', e.message);
  }

  return stories;
}

// --- Product Hunt fetcher (Atom feed, same as ccp-discord-daily) ---

function parseAtomFeed(xml, count) {
  count = count || 5;
  const products = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null && products.length < count) {
    const entry = match[1];
    const title = extractTag(entry, 'title') || extractCDATA(entry, 'title') || 'Untitled';
    const linkMatch = entry.match(/<link[^>]*href="([^"]*)"[^>]*\/?\s*>/);
    const url = linkMatch ? linkMatch[1] : '';
    const authorMatch = entry.match(/<author>\s*<name>([^<]*)<\/name>/);
    const author = authorMatch ? authorMatch[1] : 'Unknown';
    const published = extractTag(entry, 'published') || '';
    const content = extractCDATA(entry, 'content') || extractTag(entry, 'content') || '';
    const description = stripHtml(content)
      .replace(/\s*Discussion\s*\|\s*Link.*$/s, '')
      .trim()
      .slice(0, 200);

    products.push({ title: title.trim(), url, author, published, description });
  }

  return products;
}

async function fetchProductHunt(count) {
  count = count || 5;
  try {
    const xml = await fetchUrl(PH_FEED_URL);
    if (!xml.includes('<entry>')) return [];
    return parseAtomFeed(xml, count);
  } catch (e) {
    console.warn('  Product Hunt fetch failed:', e.message);
    return [];
  }
}

// --- GitHub Trending fetcher (same approach as ccp-discord-daily agent) ---

function parseNumber(text) {
  const normalized = String(text || '').replace(/[^\d]/g, '');
  return normalized ? Number(normalized) : 0;
}

function parseGithubTrendingHtml(html, count) {
  count = count || 5;
  const repos = [];
  const articleRegex = /<article[\s\S]*?<\/article>/g;
  let match;

  while ((match = articleRegex.exec(html)) !== null && repos.length < count) {
    const article = match[0];
    const repoMatch = article.match(/<h2[\s\S]*?<a[^>]*href="\/([^"]+)"[\s\S]*?<\/a>/);
    if (!repoMatch) continue;
    const repoPath = repoMatch[1].replace(/^\/+|\/+$/g, '');
    if (repoPath.split('/').length !== 2) continue;

    const descMatch = article.match(/<p[^>]*class="[^"]*col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/);
    const languageMatch = article.match(/itemprop="programmingLanguage"[^>]*>([^<]*)<\/span>/);
    const starsMatch = article.match(/href="\/[^"]+\/stargazers"[\s\S]*?>([\s\S]*?)<\/a>/);
    const todayMatch = article.match(/(\d[\d,]*)\s+stars?\s+today/i);

    repos.push({
      name: repoPath,
      description: descMatch ? stripHtml(descMatch[1]).slice(0, 200) : 'No description',
      language: languageMatch ? stripHtml(languageMatch[1]) : 'Unknown',
      stars: parseNumber(starsMatch ? stripHtml(starsMatch[1]) : ''),
      todayStars: parseNumber(todayMatch ? todayMatch[1] : ''),
      url: `https://github.com/${repoPath}`
    });
  }

  return repos;
}

async function fetchGithubTrending(count) {
  count = count || 5;
  try {
    const html = await fetchUrl(GITHUB_TRENDING_URL);
    const repos = parseGithubTrendingHtml(html, count);
    if (repos.length) return repos;
    console.warn('  GitHub Trending page returned no repos; trying Search API fallback');
  } catch (e) {
    console.warn('  GitHub Trending page failed:', e.message, '— trying Search API fallback');
  }

  try {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const query = encodeURIComponent(`pushed:>${yesterday} stars:>1000 archived:false`);
    const url = `${GITHUB_SEARCH_URL}?q=${query}&sort=updated&order=desc&per_page=${count * 3}`;
    const json = await fetchUrl(url);
    const data = JSON.parse(json);
    return (data.items || [])
      .filter(item => item && item.html_url && item.full_name)
      .slice(0, count)
      .map(item => ({
      name: item.full_name || '',
      description: (item.description || 'No description').slice(0, 200),
      language: item.language || 'Unknown',
      stars: item.stargazers_count || 0,
      todayStars: item.stargazers_count || 0,
      url: item.html_url || ''
    }));
  } catch (e) {
    console.warn('  GitHub Trending fetch failed:', e.message);
    return [];
  }
}

// --- arXiv AI Papers fetcher (same approach as ccp-discord-daily agent) ---

function parseArxivXml(xml, count) {
  count = count || 5;
  const papers = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null && papers.length < count) {
    const entry = match[1];
    const title = (extractTag(entry, 'title') || 'Untitled').replace(/\s+/g, ' ').trim();
    const id = extractTag(entry, 'id') || '';
    const url = id.replace('http://', 'https://');
    const published = (extractTag(entry, 'published') || '').slice(0, 10);
    const summary = (extractTag(entry, 'summary') || '').replace(/\s+/g, ' ').trim().slice(0, 300);

    // Extract authors
    const authorRegex = /<author>\s*<name>([^<]*)<\/name>/g;
    const authors = [];
    let authorMatch;
    while ((authorMatch = authorRegex.exec(entry)) !== null && authors.length < 5) {
      authors.push(authorMatch[1].trim());
    }
    const authorsStr = authors.length > 3
      ? authors.slice(0, 1).join(', ') + ' et al.'
      : authors.join(', ');

    papers.push({ title, authors: authorsStr, summary, url, date: published });
  }

  return papers;
}

async function fetchArxivPapers(count) {
  count = count || 5;
  try {
    const query = 'cat:cs.AI+OR+cat:cs.CL+OR+cat:cs.LG';
    const url = `${ARXIV_API_URL}?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=${count * 2}`;
    const xml = await fetchUrl(url);
    if (!xml.includes('<entry>')) return [];
    return parseArxivXml(xml, count);
  } catch (e) {
    console.warn('  arXiv fetch failed:', e.message);
    return [];
  }
}

// --- Philly Tech News fetcher (Google News RSS, same as philly-tech-news agent) ---

const PHILLY_NEWS_QUERIES = [
  'Philadelphia technology startup when:30d',
  'Philadelphia AI machine learning when:30d',
  'Philly tech scene innovation when:30d',
];

const PHILLY_CATEGORY_MAP = {
  'startup': 'Startups', 'funding': 'Startup Funding', 'venture': 'Startup Funding',
  'ai ': 'AI Research', 'machine learning': 'AI Research', 'research': 'AI Research',
  'job': 'Jobs & Careers', 'hiring': 'Jobs & Careers', 'career': 'Jobs & Careers',
  'open source': 'Open Source', 'github': 'Open Source',
  'biotech': 'Biotech', 'health': 'Biotech',
};

const PHILLY_TECH_KEYWORDS = [
  'technology', 'tech', 'startup', 'start-up', 'software', 'developer',
  'ai ', 'artificial intelligence', 'machine learning', 'data', 'cyber',
  'innovation', 'biotech', 'digital', 'venture', 'funding'
];

function categorizeArticle(title) {
  const lower = title.toLowerCase();
  for (const [keyword, category] of Object.entries(PHILLY_CATEGORY_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return 'Innovation';
}

function isPhillyTechArticle(item) {
  const text = `${item.title || ''} ${item.source || ''}`.toLowerCase();
  return PHILLY_TECH_KEYWORDS.some(keyword => text.includes(keyword));
}

function parseGoogleNewsRss(xml) {
  const articles = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = extractTag(item, 'title') || '';
    const link = extractTag(item, 'link') || '';
    const pubDate = extractTag(item, 'pubDate') || '';
    const sourceMatch = item.match(/<source[^>]*>([^<]*)<\/source>/);
    const source = sourceMatch ? sourceMatch[1] : '';

    if (!link || !title) continue;
    articles.push({ title, url: link, source, pubDate });
  }

  return articles;
}

async function fetchPhillyNews(count) {
  count = count || 5;
  const seen = new Set();
  const articles = [];
  const newestAllowed = Date.now() - (PHILLY_NEWS_MAX_AGE_DAYS * 86400000);

  for (const query of PHILLY_NEWS_QUERIES) {
    if (articles.length >= count) break;
    try {
      const encoded = encodeURIComponent(query);
      const url = `${GOOGLE_NEWS_RSS_URL}?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
      const xml = await fetchUrl(url);
      const items = parseGoogleNewsRss(xml);
      for (const item of items) {
        if (articles.length >= count) break;
        const publishedAt = item.pubDate ? new Date(item.pubDate) : null;
        if (!publishedAt || Number.isNaN(publishedAt.getTime()) || publishedAt.getTime() < newestAllowed) continue;
        if (!isPhillyTechArticle(item)) continue;
        // Deduplicate by title similarity
        const key = item.title.toLowerCase().slice(0, 60);
        if (seen.has(key)) continue;
        seen.add(key);
        articles.push({
          title: item.title,
          source: item.source || new URL(item.url).hostname.replace('www.', ''),
          url: item.url,
          category: categorizeArticle(item.title),
          date: publishedAt.toISOString().slice(0, 10)
        });
      }
    } catch (e) {
      console.warn(`  Google News RSS failed for "${query}":`, e.message);
    }
  }

  return articles;
}

function requireItems(name, items) {
  if (!Array.isArray(items) || items.length === 0) {
    console.warn(`  ⚠ ${name} returned no items; continuing with an empty feed`);
    return false;
  }
  return true;
}

// --- Main ---

async function generateLiveFeeds() {
  console.log('Fetching live feeds...\n');

  // Fetch all sources in parallel
  const [meetupResult, hnResult, phResult, ghResult, arxivResult, phillyResult] = await Promise.allSettled([
    fetchUrl(MEETUP_EVENTS_URL).then(html => parseMeetupEventsPage(html)),
    fetchHackerNews(5),
    fetchProductHunt(5),
    fetchGithubTrending(5),
    fetchArxivPapers(5),
    fetchPhillyNews(5)
  ]);

  let meetupEvents = [];
  if (meetupResult.status === 'fulfilled') {
    meetupEvents = meetupResult.value;
    console.log(`✓ Meetup: ${meetupEvents.length} events`);
  } else {
    console.warn('⚠ Meetup events page failed:', meetupResult.reason?.message);
  }

  let hnStories = [];
  if (hnResult.status === 'fulfilled') {
    hnStories = hnResult.value;
    console.log(`✓ Hacker News: ${hnStories.length} stories`);
  } else {
    console.warn('⚠ HN fetch failed:', hnResult.reason?.message);
  }

  let phProducts = [];
  if (phResult.status === 'fulfilled') {
    phProducts = phResult.value;
    console.log(`✓ Product Hunt: ${phProducts.length} products`);
  } else {
    console.warn('⚠ Product Hunt fetch failed:', phResult.reason?.message);
  }

  let githubTrending = [];
  if (ghResult.status === 'fulfilled') {
    githubTrending = ghResult.value;
    console.log(`✓ GitHub Trending: ${githubTrending.length} repos`);
  } else {
    console.warn('⚠ GitHub Trending fetch failed:', ghResult.reason?.message);
  }

  let aiPapers = [];
  if (arxivResult.status === 'fulfilled') {
    aiPapers = arxivResult.value;
    console.log(`✓ arXiv Papers: ${aiPapers.length} papers`);
  } else {
    console.warn('⚠ arXiv fetch failed:', arxivResult.reason?.message);
  }

  let phillyNews = [];
  if (phillyResult.status === 'fulfilled') {
    phillyNews = phillyResult.value;
    console.log(`✓ Philly News: ${phillyNews.length} articles`);
  } else {
    console.warn('⚠ Philly News fetch failed:', phillyResult.reason?.message);
  }

  // Keep only future events, sorted soonest first, limit to 5
  const now = new Date();
  meetupEvents = meetupEvents
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  requireItems('Meetup', meetupEvents);
  requireItems('Hacker News', hnStories);
  requireItems('Product Hunt', phProducts);
  requireItems('Philly News', phillyNews);
  requireItems('GitHub Trending', githubTrending);
  requireItems('arXiv Papers', aiPapers);

  // Build the feeds data - all feeds fetched live
  const feedsData = {
    lastUpdated: new Date().toISOString(),
    upcomingEvents: meetupEvents.map(e => ({
      name: e.name,
      date: e.date,
      location: e.location,
      url: e.url,
      rsvpCount: e.rsvpCount || 0
    })),
    hackerNews: hnStories,
    productHunt: phProducts,
    phillyNews: phillyNews,
    githubTrending: githubTrending,
    aiPapers: aiPapers
  };

  const jsContent = `// Live feeds data - all feeds fetched from real APIs at build time
// Auto-generated by scripts/generate-live-feeds.js
window.LIVE_FEEDS = ${JSON.stringify(feedsData, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, jsContent);
  console.log(`\n✓ Wrote live feeds data to ${OUTPUT_FILE}`);
  console.log(`  Events: ${feedsData.upcomingEvents.length}`);
  console.log(`  File size: ${fs.statSync(OUTPUT_FILE).size} bytes`);
}

generateLiveFeeds().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
