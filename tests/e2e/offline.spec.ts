import { expect, test } from '@playwright/test';
import { STORIES } from '../../lib/stories';

const KEY = 'little-lights-free-stories-v1';
const FREE_ID = '77777777-7777-4777-8777-777777777777';
const PAID_ID = '88888888-8888-4888-8888-888888888888';
const free = { ...STORIES[0], id: FREE_ID, title: 'A Saved Little Adventure', pages: [
  { text: 'A gentle promise lights the night.', scene: 'stars' },
  { text: 'Every little heart is held in love.', scene: 'stars' },
  { text: 'Sleep peacefully, little one. You are loved.', scene: 'stars' },
] };
const paid = { ...free, id: PAID_ID, title: 'A Private Adventure', isFree: false, pages: [{ text: 'This paid page must never be saved.', scene: 'garden' }] };

test('reopens a live free story offline while paid payloads stay uncached', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/account', route => route.fulfill({ status: 401, json: { error: 'Please sign in.' } }));
  await page.route(`**/api/stories/${FREE_ID}`, route => route.fulfill({ json: { story: free } }));
  await page.route(`**/api/stories/${PAID_ID}`, route => route.fulfill({ json: { story: paid } }));
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  await page.goto(`/read/${FREE_ID}`);
  await expect(page.getByRole('heading', { name: free.title })).toBeVisible();
  await expect(page.getByText('Free story saved for offline bedtime.', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) || '[]').length, KEY)).toBe(1);
  const paidResponse = page.waitForResponse(response => response.url().endsWith(`/api/stories/${PAID_ID}`));
  await page.goto(`/read/${PAID_ID}`);
  await paidResponse;
  await expect(page.getByRole('heading', { name: 'More little adventures await!' })).toBeVisible();
  const records = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '[]'), KEY);
  expect(records.map((story: { id: string }) => story.id)).toEqual([FREE_ID]);
  expect(JSON.stringify(records)).not.toContain(paid.pages[0].text);
  expect(await page.evaluate(async path => Boolean(await caches.match(path)), `/read/${FREE_ID}`)).toBe(true);
  expect(await page.evaluate(async () => {
    const requests = (await Promise.all((await caches.keys()).map(async key => (await caches.open(key)).keys()))).flat();
    return requests.filter(request => new URL(request.url).pathname.startsWith('/api/')).length;
  })).toBe(0);

  await context.setOffline(true);
  await page.goto(`/read/${FREE_ID}`);
  await expect(page.getByRole('heading', { name: free.title })).toBeVisible();
  await expect(page.getByText('A gentle promise lights the night.', { exact: true })).toBeVisible();
  await expect(page.getByText(/Saved free story · offline/)).toBeVisible();
  for (let i = 0; i < free.pages.length; i++) await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await page.getByRole('button', { name: /I finished my story!/ }).click();
  await page.getByRole('button', { name: /Let’s wonder together/ }).click();
  await page.getByRole('button', { name: /A big boat/ }).click();
  await page.getByRole('button', { name: /One more little wonder/ }).click();
  await page.getByRole('button', { name: /God’s loving promise/ }).click();
  await page.getByRole('button', { name: /Time for a little coloring/ }).click();
  await page.getByRole('button', { name: /Add to my sticker book/ }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Reconnect to save your star' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your sticker is home!' })).toHaveCount(0);
  await page.goto(`/read/${PAID_ID}`);
  await expect(page.getByText('Only previously saved free stories are available offline. Reconnect for this adventure.', { exact: true })).toBeVisible();
  await expect(page.getByText(paid.pages[0].text, { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('a server denial revokes a saved free story instead of falling back to it', async ({ page }) => {
  let denial = 0;
  await page.route('**/api/account', route => route.fulfill({ status: 401, json: { error: 'Please sign in.' } }));
  await page.route(`**/api/stories/${FREE_ID}`, route => route.fulfill(denial ? { status: denial, json: { error: 'Access denied.' } } : { json: { story: free } }));
  await page.goto(`/read/${FREE_ID}`);
  await expect(page.getByRole('heading', { name: free.title })).toBeVisible();
  for (const status of [401, 403]) {
    await page.evaluate(({ key, story }) => localStorage.setItem(key, JSON.stringify([story])), { key: KEY, story: free });
    denial = status;
    await page.reload();
    await expect(page.getByRole('heading', { name: 'More little adventures await!' })).toBeVisible();
    await expect(page.getByText(free.pages[0].text, { exact: true })).toHaveCount(0);
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '[]').length, KEY)).toBe(0);
  }
});
