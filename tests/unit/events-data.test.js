const test = require('node:test');
const assert = require('node:assert/strict');

const { filenameToName } = require('../../scripts/generate-events-data');

test('filenameToName converts event image filenames into display names', () => {
  assert.equal(filenameToName('AI_Paper_Talks.jpg'), 'AI Paper Talks');
  assert.equal(filenameToName('Claude_Code_Philly.jpeg'), 'Claude Code Philly');
  assert.equal(filenameToName('Web3_Workshops.jpg'), 'Web 3 Workshops');
  assert.equal(filenameToName('WeekendCodingCrew.webp'), 'Weekend Coding Crew');
});
