const test = require('node:test');
const assert = require('node:assert/strict');

const { isJoinLink } = require('../../static/js/join-conversion');

test('isJoinLink accepts Meetup groups and events with case-insensitive hosts', () => {
  assert.equal(isJoinLink('https://www.meetup.com/code-philly/'), true);
  assert.equal(isJoinLink('https://meetup.com/code-philly/events/123/'), true);
  assert.equal(isJoinLink('https://WWW.MEETUP.COM/code-philly/'), true);
  assert.equal(isJoinLink('http://meetup.com/code-philly/'), true);
});

test('isJoinLink accepts Discord invites only on the specified hosts and paths', () => {
  assert.equal(isJoinLink('https://discord.gg/ts75yERD5q'), true);
  assert.equal(isJoinLink('https://discord.com/invite/ts75yERD5q'), true);
  assert.equal(isJoinLink('https://discordapp.com/invite/ts75yERD5q'), true);
  assert.equal(isJoinLink('https://discord.com/channels/123'), false);
  assert.equal(isJoinLink('https://discordapp.com/'), false);
  assert.equal(isJoinLink('https://discord.gg.evil.com/invite/123'), false);
});

test('isJoinLink accepts hackathon registration and Google Forms sign-ups', () => {
  assert.equal(isJoinLink('https://tbd-hackathon.devpost.com/register?x=1'), true);
  assert.equal(isJoinLink('https://tbd-hackathon.devpost.com/'), false);
  assert.equal(isJoinLink('https://devpost.com/register'), false);
  assert.equal(isJoinLink('https://docs.google.com/forms/d/e/123/viewform'), true);
  assert.equal(isJoinLink('https://docs.google.com/document/d/123'), false);
});

test('isJoinLink rejects unrelated, internal, malformed, and non-http links', () => {
  for (const href of [
    'https://givebutter.com/code-philly',
    'https://linkedin.com/company/code-philly/',
    '/about/',
    'javascript:alert(1)',
    'mailto:hello@meetup.com',
    'ftp://meetup.com/code-philly/',
    'https://evilmeetup.com/',
    'https://meetup.com.evil.com/',
    'https://evildevpost.com/register',
    'https://docs.google.com.evil.com/forms/d/e/123/viewform',
    'https://[invalid',
  ]) {
    assert.equal(isJoinLink(href), false, href);
  }
});
