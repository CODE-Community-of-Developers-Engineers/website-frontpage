#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { setTimeout: delay } = require('node:timers/promises');

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
    throw new Error('Missing __NEXT_DATA__ in Meetup page');
  }

  const nextData = JSON.parse(nextDataMatch[1]);
  const apolloState = nextData?.props?.pageProps?.__APOLLO_STATE__;
  if (!apolloState || typeof apolloState !== 'object' || Array.isArray(apolloState)) {
    throw new Error('Missing __APOLLO_STATE__ in Meetup page');
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
      date: new Date(dateTime).toISOString(),
      location: location,
      url: eventUrl,
      rsvpCount: rsvpCount
    });
  }

  return events;
}

// --- HTTP fetch with redirect following ---

function fetchUrlOnce(url, signal) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      signal,
      headers: { 'User-Agent': 'CodePhilly/1.0 (Website Build)' }
    }, (res) => {
      res.on('error', reject);
      if (res.statusCode !== 200) {
        resolve({ status: res.statusCode, headers: res.headers });
        res.destroy();
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
  });
}

async function fetchUrl(url, attempts = 2, timeoutMs = 15000) {
  const controller = new AbortController();
  const deadline = Date.now() + timeoutMs;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let redirects = 0;
  try {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        let currentUrl = new URL(url);
        while (true) {
          if (!['http:', 'https:'].includes(currentUrl.protocol)) throw new Error('Unsupported redirect protocol');
          const response = await fetchUrlOnce(currentUrl.href, controller.signal);
          if (response.status === 200) return response.body;
          if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.location) {
            if (++redirects > 5) throw new Error('Too many redirects');
            currentUrl = new URL(response.headers.location, currentUrl);
            continue;
          }
          const error = new Error(`HTTP ${response.status} from ${currentUrl.href}`);
          error.status = response.status;
          error.retryAfter = response.headers['retry-after'];
          throw error;
        }
      } catch (e) {
        if (controller.signal.aborted) throw new Error(`Request deadline exceeded for ${url}`, { cause: e });
        const transient = [408, 429, 500, 502, 503, 504].includes(e.status)
          || ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', 'EPIPE'].includes(e.code);
        if (!transient || attempt === attempts) throw e;
        const retryAfter = e.retryAfter && (Number.isFinite(Number(e.retryAfter))
          ? Number(e.retryAfter) * 1000 : Date.parse(e.retryAfter) - Date.now());
        const waitMs = Math.max(250 * attempt, retryAfter || 0);
        if (waitMs >= deadline - Date.now()) throw e;
        console.warn(`  Request failed (${attempt}/${attempts}) for ${url}: ${e.message}`);
        await delay(waitMs, undefined, { signal: controller.signal });
      }
    }
  } finally {
    clearTimeout(timer);
  }
}

// --- Hacker News fetcher (same approach as ccp-discord-daily) ---

async function fetchHackerNews(count, request = fetchUrl) {
  count = count || 5;
  let stories = [];

  // Try Firebase first
  try {
    const topJson = await request(HN_TOP_URL);
    const topIds = JSON.parse(topJson);
    if (!Array.isArray(topIds)) throw new Error('Invalid Hacker News story list');
    for (const id of topIds.slice(0, count)) {
      const itemJson = await request(`${HN_ITEM_URL}${id}.json`);
      const item = JSON.parse(itemJson);
      if (!item || !item.title || !item.id) throw new Error('Invalid Hacker News item');
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
    return stories;
  } catch (e) {
    console.warn('  Firebase HN failed:', e.message, '— trying Algolia');
  }

  // Fallback to Algolia
  stories = [];
  const algoliaJson = await request(HN_ALGOLIA_URL);
  const data = JSON.parse(algoliaJson);
  if (!Array.isArray(data.hits)) throw new Error('Invalid Algolia story list');
  for (const hit of data.hits.slice(0, count)) {
    if (!hit.title || !hit.objectID) throw new Error('Invalid Algolia story');
    stories.push({
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      score: hit.points || 0,
      comments: hit.num_comments || 0,
      author: hit.author || 'unknown',
      hnId: hit.objectID,
      hnUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`
    });
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

async function fetchProductHunt(count, request = fetchUrl) {
  count = count || 5;
  const xml = await request(PH_FEED_URL);
  if (!/<feed[\s>]/.test(xml) || !xml.includes('</feed>')) throw new Error('Invalid Product Hunt feed');
  const products = parseAtomFeed(xml, count);
  if ((/<entry\b/.test(xml) && !products.length) || products.some(product => !product.url)) {
    throw new Error('Invalid Product Hunt entries');
  }
  return products;
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
      ...(todayMatch ? { todayStars: parseNumber(todayMatch[1]) } : {}),
      url: `https://github.com/${repoPath}`
    });
  }

  return repos;
}

async function fetchGithubTrending(count, request = fetchUrl) {
  count = count || 5;
  try {
    const html = await request(GITHUB_TRENDING_URL);
    const repos = parseGithubTrendingHtml(html, count);
    if (repos.length) return repos;
    console.warn('  GitHub Trending page returned no repos; trying Search API fallback');
  } catch (e) {
    console.warn('  GitHub Trending page failed:', e.message, '— trying Search API fallback');
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const query = encodeURIComponent(`pushed:>${yesterday} stars:>1000 archived:false`);
  const url = `${GITHUB_SEARCH_URL}?q=${query}&sort=updated&order=desc&per_page=${count * 3}`;
  const json = await request(url);
  const data = JSON.parse(json);
  if (!Array.isArray(data.items) || data.items.some(item => !item?.html_url || !item.full_name)) {
    throw new Error('Invalid GitHub Search response');
  }
  return data.items
    .slice(0, count)
    .map(item => ({
      name: item.full_name || '',
      description: (item.description || 'No description').slice(0, 200),
      language: item.language || 'Unknown',
      stars: item.stargazers_count || 0,
      url: item.html_url || ''
    }));
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

async function fetchArxivPapers(count, request = fetchUrl) {
  count = count || 5;
  const query = 'cat:cs.AI+OR+cat:cs.CL+OR+cat:cs.LG';
  const url = `${ARXIV_API_URL}?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=${count * 2}`;
  const xml = await request(url);
  if (!/<feed[\s>]/.test(xml) || !xml.includes('</feed>')) throw new Error('Invalid arXiv feed');
  const papers = parseArxivXml(xml, count);
  if ((/<entry\b/.test(xml) && !papers.length) || papers.some(paper => !paper.url)) {
    throw new Error('Invalid arXiv entries');
  }
  return papers;
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

async function fetchPhillyNews(count, request = fetchUrl) {
  count = count || 5;
  const seen = new Set();
  const articles = [];
  const newestAllowed = Date.now() - (PHILLY_NEWS_MAX_AGE_DAYS * 86400000);
  let successes = 0;
  let lastError;

  for (const query of PHILLY_NEWS_QUERIES) {
    if (articles.length >= count) break;
    try {
      const encoded = encodeURIComponent(query);
      const url = `${GOOGLE_NEWS_RSS_URL}?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
      const xml = await request(url);
      if (!/<rss[\s>]/.test(xml) || !xml.includes('</rss>')) throw new Error('Invalid Google News feed');
      const items = parseGoogleNewsRss(xml);
      if (/<item\b/.test(xml) && !items.length) throw new Error('Invalid Google News entries');
      for (const item of items) {
        if (articles.length >= count) break;
        const publishedAt = new Date(item.pubDate);
        if (Number.isNaN(publishedAt.getTime())) throw new Error('Invalid Google News publication date');
        if (publishedAt.getTime() < newestAllowed) continue;
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
      successes++;
    } catch (e) {
      lastError = e;
      console.warn(`  Google News RSS failed for "${query}":`, e.message);
    }
  }

  if (!successes) throw lastError;
  return articles;
}

// --- Main ---

async function generateLiveFeeds({ outputFile = OUTPUT_FILE, request = fetchUrl } = {}) {
  console.log('Fetching live feeds...\n');
  const names = ['upcomingEvents', 'hackerNews', 'productHunt', 'githubTrending', 'aiPapers', 'phillyNews'];
  const results = await Promise.allSettled([
    request(MEETUP_EVENTS_URL).then(parseMeetupEventsPage),
    fetchHackerNews(5, request),
    fetchProductHunt(5, request),
    fetchGithubTrending(5, request),
    fetchArxivPapers(5, request),
    fetchPhillyNews(5, request)
  ]);
  const lastUpdated = new Date().toISOString();
  const feedsData = { lastUpdated, sources: {} };
  for (const [index, result] of results.entries()) {
    const name = names[index];
    const ok = result.status === 'fulfilled';
    feedsData[name] = ok ? result.value : [];
    feedsData.sources[name] = { status: ok ? 'ok' : 'error', lastSuccessAt: ok ? lastUpdated : null };
    if (ok) console.log(`✓ ${name}: ${result.value.length} items`);
    else console.warn(`⚠ ${name}: ${result.reason.message}`);
  }
  if (results.every(result => result.status === 'rejected')) {
    throw new Error('All live feed sources failed; existing output was not replaced');
  }

  // A valid Meetup response with no future events is a successful empty feed.
  feedsData.upcomingEvents = feedsData.upcomingEvents
    .filter(event => new Date(event.date) >= new Date(lastUpdated))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const jsContent = `// Live feeds data - all feeds fetched from real APIs at build time
// Auto-generated by scripts/generate-live-feeds.js
window.LIVE_FEEDS = ${JSON.stringify(feedsData, null, 2)};
`;
  fs.writeFileSync(outputFile, jsContent);
  console.log(`\n✓ Wrote live feeds data to ${outputFile}`);
  return feedsData;
}

module.exports = { fetchUrl, generateLiveFeeds, parseMeetupEventsPage, fetchGithubTrending };

if (require.main === module) {
  generateLiveFeeds().catch(err => {
    console.error('Fatal error:', err);
    process.exitCode = 1;
  });
}
