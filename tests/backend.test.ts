import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHmac } from 'node:crypto';
import { adminConfigured, makeAdminSession, passwordMatches, validAdminSession } from '../lib/server/admin';
import { validateStory, toRow, toStory } from '../lib/server/stories';
import { ApiError, body, rateLimit } from '../lib/server/http';
import { performAccountDeletion } from '../lib/server/account-deletion';

const story = () => ({
  title: 'A Little Light', verse: 'Matthew 5:16', description: 'Kindness shines.', theme: 'kindness', minutes: 3,
  ageGroup: '3–7', coverScene: 'stars', isFree: true, status: 'published' as const,
  pages: [{ text: 'Your little light can shine with kindness.', scene: 'stars' }, { text: 'God loves you every single day.', scene: 'stars' }],
  quiz: [{ question: 'What can shine?', answers: ['Kindness', 'An old shoe', 'A sleepy sock'], correctIndex: 0 }, { question: 'Who loves you?', answers: ['God', 'A chair', 'A hat'], correctIndex: 0 }],
});

test('story validation rejects long pages, unsafe media, and invalid quiz answers', () => {
  assert.equal(validateStory(story()).title, 'A Little Light');
  const long = story(); long.pages[0].text = 'one two three four five six seven eight nine ten eleven';
  assert.throws(() => validateStory(long), /1–10 words/);
  const unsafe = story(); Object.assign(unsafe.pages[0], { imageUrl: 'javascript:alert(1)' });
  assert.throws(() => validateStory(unsafe), /secure HTTPS/);
  const quiz = story(); quiz.quiz[0].correctIndex = 3;
  assert.throws(() => validateStory(quiz), /one correct answer/);
});

test('story database mapping preserves content and premium flags', () => {
  const input = { ...story(), isFree: false, id: '11111111-1111-4111-8111-111111111111' };
  const output = toStory(toRow(input));
  assert.equal(output.id, input.id); assert.equal(output.isFree, false);
  assert.deepEqual(output.pages, input.pages); assert.deepEqual(output.quiz, input.quiz);
});

test('signed admin sessions reject tampering and expired sessions', () => {
  const oldPassword = process.env.ADMIN_PASSWORD; const oldSecret = process.env.ADMIN_SESSION_SECRET;
  process.env.ADMIN_PASSWORD = 'a-long-test-password-only'; process.env.ADMIN_SESSION_SECRET = 'test-session-secret-at-least-thirty-two-characters';
  try {
    assert.equal(adminConfigured(), true);
    assert.equal(passwordMatches('a-long-test-password-only'), true);
    assert.equal(passwordMatches('incorrect'), false);
    const token = makeAdminSession(); assert.equal(validAdminSession(token), true);
    const [payload, signature] = token.split('.');
    assert.equal(validAdminSession(`${payload}a.${signature}`), false);
    assert.equal(validAdminSession(`${payload}.bad`), false);
    const expired = Buffer.from(JSON.stringify({ expires: Date.now() - 1000 })).toString('base64url');
    const signedExpired = `${expired}.${createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(expired).digest('base64url')}`;
    assert.equal(validAdminSession(signedExpired), false);
  } finally {
    if (oldPassword === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = oldPassword;
    if (oldSecret === undefined) delete process.env.ADMIN_SESSION_SECRET; else process.env.ADMIN_SESSION_SECRET = oldSecret;
  }
});

test('request parser bounds payload size and rejects arrays', async () => {
  const request = (content: string) => new Request('http://localhost', { method: 'POST', body: content });
  await assert.rejects(body(request('[1,2]')), (error: unknown) => error instanceof ApiError && error.status === 400);
  await assert.rejects(body(request(JSON.stringify({ data: 'x'.repeat(100) })), 30), (error: unknown) => error instanceof ApiError && error.status === 413);
  assert.deepEqual(await body(request('{"plan":"yearly"}')), { plan: 'yearly' });
});

test('rate limiter prevents repeated attempts within a window', () => {
  const key = `test-${Date.now()}`;
  rateLimit(key, 2, 60_000); rateLimit(key, 2, 60_000);
  assert.throws(() => rateLimit(key, 2, 60_000), (error: unknown) => error instanceof ApiError && error.status === 429);
});

test('account deletion preserves the account when billing cancellation fails', async () => {
  const actions: string[] = [];
  await assert.rejects(performAccountDeletion({
    cancelBilling: async () => { actions.push('billing'); throw new Error('Stripe unavailable'); },
    removePictures: async () => { actions.push('pictures'); },
    removeAccount: async () => { actions.push('account'); },
  }), /account is still here/);
  assert.deepEqual(actions, ['billing']);
});

test('account deletion never removes identity before private files are cleared', async () => {
  const actions: string[] = [];
  await assert.rejects(performAccountDeletion({
    cancelBilling: async () => { actions.push('billing'); },
    removePictures: async () => { actions.push('pictures'); throw new Error('Storage unavailable'); },
    removeAccount: async () => { actions.push('account'); },
  }), /saved picture/);
  assert.deepEqual(actions, ['billing', 'pictures']);
  actions.length = 0;
  await performAccountDeletion({
    cancelBilling: async () => { actions.push('billing'); },
    removePictures: async () => { actions.push('pictures'); },
    removeAccount: async () => { actions.push('account'); },
  });
  assert.deepEqual(actions, ['billing', 'pictures', 'account']);
});
