const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..', '..');
const publicDir = path.join(repoRoot, 'public');
const basePath = process.env.SITE_BASE_PATH || '/website-frontpage';

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  return 'application/octet-stream';
}

function publicPathFor(requestUrl) {
  const url = new URL(requestUrl, 'http://127.0.0.1');
  let pathname = decodeURIComponent(url.pathname);
  if (basePath && pathname.startsWith(`${basePath}/`)) {
    pathname = pathname.slice(basePath.length);
  } else if (basePath && pathname === basePath) {
    pathname = '/';
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  return path.normalize(path.join(publicDir, pathname));
}

function startServer() {
  if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
    throw new Error('Missing public/index.html. Build the site before running e2e tests.');
  }

  const server = http.createServer((req, res) => {
    const filePath = publicPathFor(req.url);
    if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'content-type': contentType(filePath) });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

test('built site exposes critical user routes and assets', async (t) => {
  const server = await startServer();
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const home = await fetch(`${origin}${basePath}/`);
  assert.equal(home.status, 200);
  const homeHtml = await home.text();
  assert.match(homeHtml, /https:\/\/givebutter\.com\/c_o_d_e/);
  assert.doesNotMatch(homeHtml, /hcb\.hackclub\.com\/donations\/start\/code-and-coffee-philadelphia/);

  const search = await fetch(`${origin}${basePath}/search/`);
  assert.equal(search.status, 200);
  const searchHtml = await search.text();
  assert.match(searchHtml, /\/index\.json/);
  assert.doesNotMatch(searchHtml, /\/search\.json/);

  const indexResponse = await fetch(`${origin}${basePath}/index.json`);
  assert.equal(indexResponse.status, 200);
  const searchIndex = await indexResponse.json();
  assert.ok(searchIndex.some(item => item.type === 'blog'));
  assert.ok(searchIndex.every(item => item.url.startsWith(`${basePath}/`)));

  const blog = await fetch(`${origin}${basePath}/blog/`);
  assert.equal(blog.status, 200);
  const blogHtml = await blog.text();
  assert.match(blogHtml, new RegExp(`${basePath}/images/blog/hackathon-cover\\.jpg`));
  assert.doesNotMatch(blogHtml, /src=["']?\/images\//);
});
