const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const yaml = require('js-yaml');

const workflow = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../../.github/workflows/hugo.yml'), 'utf8'));
const deploy = workflow.jobs.deploy.steps.find(step => step.name === 'Deploy and verify tested artifact');
const commit = 'a'.repeat(40);

function runDeploy(t, { remoteCommit = commit, gitStatus = 0, responses = ['match'], checkStatus = 0, token = 'test-token' } = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'deployment-workflow-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.mkdirSync(path.join(directory, 'bin'));
  fs.mkdirSync(path.join(directory, 'public'));
  fs.mkdirSync(path.join(directory, 'temp'));
  fs.writeFileSync(path.join(directory, 'calls'), '');
  const manifest = { commit, runId: '123', builtAt: '2026-10-25T12:00:00Z' };
  fs.writeFileSync(path.join(directory, 'public/deployment.json'), JSON.stringify(manifest));
  fs.writeFileSync(path.join(directory, 'old-deployment.json'), JSON.stringify({ ...manifest, runId: '122', builtAt: '2026-10-24T12:00:00Z' }));
  const mock = String.raw`#!${process.execPath}
const fs = require('node:fs');
const command = require('node:path').basename(process.argv[1]);
const calls = fs.readFileSync('calls', 'utf8').trim().split('\n').filter(Boolean);
fs.appendFileSync('calls', command + '\n');
switch (command) {
  case 'git':
    process.stdout.write(process.env.MOCK_REMOTE_COMMIT + '\trefs/heads/main\n');
    process.exit(Number(process.env.MOCK_GIT_STATUS));
  case 'curl': {
    const poll = calls.filter(call => call === 'curl').length;
    const responses = process.env.MOCK_RESPONSES.split(',');
    const response = responses[poll] || responses.at(-1);
    fs.appendFileSync('urls', process.argv.at(-1) + '\n');
    if (response === 'http-error') process.exit(22);
    const output = process.argv[process.argv.indexOf('--output') + 1];
    require('node:assert/strict').equal(output, process.env.RUNNER_TEMP + '/deployment.json');
    fs.copyFileSync(response === 'match' ? 'public/deployment.json' : 'old-deployment.json', output);
    break;
  }
  case 'npm': process.exit(Number(process.env.MOCK_CHECK_STATUS));
  case 'npx':
  case 'sleep': break;
  default: throw new Error('Unexpected command: ' + command);
}
`;
  for (const command of ['git', 'npx', 'npm', 'curl', 'sleep']) {
    fs.writeFileSync(path.join(directory, 'bin', command), mock, { mode: 0o755 });
  }
  const result = spawnSync('/bin/bash', ['-e', '-o', 'pipefail', '-c', deploy.run], {
    cwd: directory,
    encoding: 'utf8',
    timeout: 30000,
    env: {
      ...process.env,
      PATH: `${path.join(directory, 'bin')}${path.delimiter}${process.env.PATH}`,
      GITHUB_SHA: commit,
      GITHUB_RUN_ID: '123',
      GITHUB_RUN_ATTEMPT: '2',
      RUNNER_TEMP: path.join(directory, 'temp'),
      SITE_URL: workflow.jobs.deploy.env.SITE_URL,
      CLOUDFLARE_API_TOKEN: token,
      MOCK_REMOTE_COMMIT: remoteCommit,
      MOCK_GIT_STATUS: String(gitStatus),
      MOCK_RESPONSES: responses.join(','),
      MOCK_CHECK_STATUS: String(checkStatus)
    }
  });
  assert.ifError(result.error);
  return { ...result, directory, calls: fs.readFileSync(path.join(directory, 'calls'), 'utf8').trim().split('\n') };
}

test('deploys current main and checks the exact artifact once', t => {
  const result = runDeploy(t);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, ['git', 'npx', 'curl', 'npm']);
  assert.equal(fs.readFileSync(path.join(result.directory, 'urls'), 'utf8'), 'https://code-philly-community.pages.dev/deployment.json?run=123&attempt=2&poll=1\n');
});

test('superseded commits skip upload and verification before requiring credentials', t => {
  const result = runDeploy(t, { remoteCommit: 'b'.repeat(40), token: '' });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, ['git']);
  assert.match(result.stdout, /Skipping superseded commit/);
});

test('remote main lookup failure aborts rather than appearing superseded', t => {
  const result = runDeploy(t, { gitStatus: 2 });
  assert.equal(result.status, 2);
  assert.deepEqual(result.calls, ['git']);
  assert.doesNotMatch(result.stdout, /Skipping superseded commit/);
});

test('rejects an older manifest for the same commit until the exact run appears', t => {
  const result = runDeploy(t, { responses: ['stale', 'match'] });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, ['git', 'npx', 'curl', 'sleep', 'curl', 'npm']);
  const urls = fs.readFileSync(path.join(result.directory, 'urls'), 'utf8').trim().split('\n');
  assert.match(urls[1], /&poll=2$/);
});

test('retries an HTTP failure before checking the matching artifact', t => {
  const result = runDeploy(t, { responses: ['http-error', 'match'] });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, ['git', 'npx', 'curl', 'sleep', 'curl', 'npm']);
});

for (const response of ['stale', 'http-error']) {
  test(`persistent ${response} fails after bounded polling without running the site check`, t => {
    const result = runDeploy(t, { responses: [response] });
    assert.equal(result.status, 1);
    assert.equal(result.calls.filter(call => call === 'curl').length, 12);
    assert.equal(result.calls.filter(call => call === 'sleep').length, 11);
    assert.equal(result.calls.filter(call => call === 'npx').length, 1);
    assert.ok(!result.calls.includes('npm'));
    assert.match(result.stdout, /::error::Production did not serve the tested deployment manifest/);
  });
}

test('site check failure fails the deployment without retrying the checker', t => {
  const result = runDeploy(t, { checkStatus: 17 });
  assert.equal(result.status, 17);
  assert.deepEqual(result.calls, ['git', 'npx', 'curl', 'npm']);
});
