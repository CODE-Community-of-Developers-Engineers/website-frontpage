const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..', '..');
const publicDir = path.join(repoRoot, 'public');
const basePath = process.env.SITE_BASE_PATH || '/website-frontpage';

const portArgIndex = process.argv.indexOf('--port');
const port = Number(
  portArgIndex >= 0 ? process.argv[portArgIndex + 1] : process.env.PLAYWRIGHT_TEST_PORT || 4173
);

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.ico')) return 'image/x-icon';
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

if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
  throw new Error('Missing public/index.html. Run the Hugo build before Playwright tests.');
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

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving ${publicDir} at http://127.0.0.1:${port}${basePath}/`);
});
