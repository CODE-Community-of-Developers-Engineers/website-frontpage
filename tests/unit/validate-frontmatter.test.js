const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const script = path.join(__dirname, '..', '..', 'scripts', 'validate-frontmatter.js');

function validate(posts) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-'));
  for (const [name, body] of Object.entries(posts)) {
    fs.mkdirSync(path.join(directory, name));
    fs.writeFileSync(path.join(directory, name, 'index.md'), `---\ntitle: "Post"\ndate: 2026-11-08\n---\n${body}\n`);
  }
  const result = spawnSync(process.execPath, [script, directory], { encoding: 'utf8' });
  fs.rmSync(directory, { recursive: true });
  return result;
}

test('Gofylo footer and JSON-LD pass the raw HTML check', () => {
  const result = validate({
    gofylo: '<p class="powered-by">Powered by <a href="https://gofylo.io?utm_source=codephilly.com" rel="sponsored">gofylo.io</a></p>\n' +
      '<script type="application/ld+json">[{"@type":"Article","headline":"Post"}]</script>'
  });
  assert.equal(result.status, 0, result.stderr);
});

test('executable raw HTML in a post fails validation', () => {
  const result = validate({
    script: '<script>alert(1)</script>',
    breakout: '<script type="application/ld+json">{}</script><script src="https://evil.example/x.js"></script>',
    iframe: '<iframe src="https://evil.example"></iframe>',
    handler: '<img src="cover.webp" onerror="alert(1)">',
    link: '[Click](javascript:alert(1))'
  });
  assert.equal(result.status, 1);
  for (const name of ['script', 'breakout', 'iframe', 'handler', 'link']) {
    assert.match(result.stderr, new RegExp(`${name}/index\\.md: Unsafe raw HTML`));
  }
});
