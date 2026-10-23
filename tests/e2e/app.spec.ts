import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const NOAH_ID = '11111111-1111-4111-8111-111111111111';
const PREMIUM_ID = '44444444-4444-4444-8444-444444444444';

// Run against the local preview without Supabase/Stripe credentials. Each test
// gets a fresh browser context; the marker permits reload/persistence checks.
let browserErrors: string[] = [];
test.beforeEach(async ({ page }) => {
  browserErrors = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('little-lights-e2e-initialized')) {
      localStorage.clear();
      sessionStorage.setItem('little-lights-e2e-initialized', '1');
    }
  });
});
test.afterEach(() => expect(browserErrors, 'The app must not throw browser runtime errors.').toEqual([]));

test('welcomes a family with working story cards, SEO, and install assets', async ({ page, request }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Little Lights - Bedtime Bible Stories for Kids');
  await expect(page.getByRole('heading', { name: /Big stories\. Little hearts\./ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Let’s Read!/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Read The Little Lost Sheep/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Little Lights home' })).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 248, 231)');
  const manifestResponse = await request.get('/manifest.json');
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest = await manifestResponse.json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.some((icon: { sizes: string }) => icon.sizes === '192x192')).toBeTruthy();
  expect(manifest.icons.some((icon: { sizes: string }) => icon.sizes === '512x512')).toBeTruthy();
  for (const icon of manifest.icons) expect((await request.get(icon.src)).ok()).toBeTruthy();
});

test('keeps every main screen within the viewport and filters the story library', async ({ page }) => {
  for (const path of ['/', '/stories', '/stickers', '/parent', `/read/${NOAH_ID}`, '/admin']) {
    await page.goto(path);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), { message: `${path} must not scroll sideways.` }).toBeLessThanOrEqual(1);
  }
  await page.goto('/stories');
  await page.getByRole('button', { name: 'Free stories', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Read / })).toHaveCount(3);
  await page.getByRole('textbox', { name: 'Search stories' }).fill('a story that is not here');
  await expect(page.getByRole('heading', { name: 'No little stories here… yet!' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all stories' }).click();
  await expect(page.getByRole('button', { name: /^Read / })).toHaveCount(6);
});

test('completes onboarding, reading, quiz, drawing, rewards, and parent settings', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Let’s Read!/ }).click();
  const welcome = page.getByRole('dialog', { name: 'Welcome to Little Lights' });
  await expect(welcome.getByRole('heading', { name: 'Ready for tonight’s adventure?' })).toBeVisible();
  await welcome.getByLabel('Little one’s first name').fill('Oliver');
  await welcome.getByLabel('Their age').selectOption('4');
  await welcome.getByRole('button', { name: 'Meet your bedtime buddies' }).click();
  await welcome.getByLabel('Bedtime', { exact: true }).fill('19:45');
  await welcome.getByLabel('Parent’s email').fill('parent@example.com');
  await welcome.getByRole('button', { name: 'Let the adventures begin' }).click();
  await expect(page).toHaveURL(new RegExp(`/read/${NOAH_ID}$`));
  await expect(page.getByRole('heading', { name: 'Noah’s Big Adventure' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play narration' })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('Noah trusted God and got to work.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Previous page', exact: true }).click();
  await expect(page.getByText('God asked Noah to build a very big boat.', { exact: true })).toBeVisible();
  for (let i = 0; i < 7; i++) await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await page.getByRole('button', { name: /I finished my story!/ }).click();
  await expect(page.getByRole('heading', { name: 'You did it, Oliver!' })).toBeVisible();
  await page.getByRole('button', { name: /Let’s wonder together/ }).click();
  await expect(page.getByRole('heading', { name: 'What did Noah build?' })).toBeVisible();
  await page.getByRole('button', { name: /A tall castle/ }).click();
  await expect(page.getByText(/Good thinking! Let’s try another one/)).toBeVisible();
  await page.getByRole('button', { name: /A big boat/ }).click();
  await expect(page.getByText(/Pip is cheering for you/)).toBeVisible();
  await page.getByRole('button', { name: /One more little wonder/ }).click();
  await expect(page.getByRole('heading', { name: 'What did the rainbow remind Noah of?' })).toBeVisible();
  await page.getByRole('button', { name: /God’s loving promise/ }).click();
  await page.getByRole('button', { name: /Time for a little coloring/ }).click();
  const canvas = page.getByRole('img', { name: 'Coloring canvas. Draw with your finger or mouse.' });
  await expect(canvas).toBeVisible();
  const original = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await page.getByRole('button', { name: 'Select sky blue', exact: true }).click();
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.45, box!.y + box!.height * 0.4, { steps: 10 });
  await page.mouse.up();
  expect(await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).not.toBe(original);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  expect(await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).toBe(original);
  await page.mouse.click(box!.x + box!.width * 0.3, box!.y + box!.height * 0.4);
  const pngDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save art', exact: true }).click();
  const png = await pngDownload;
  expect(png.suggestedFilename()).toMatch(/^little-lights-.*\.png$/);
  const pngPath = await png.path();
  expect(pngPath).not.toBeNull();
  const picture = await readFile(pngPath!);
  expect(picture.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(picture.length).toBeGreaterThan(1000);
  await page.getByRole('button', { name: /Add to my sticker book/ }).click();
  await expect(page.getByRole('heading', { name: 'Your sticker is home!' })).toBeVisible();
  await page.getByRole('link', { name: /Open my sticker book/ }).click();
  await expect(page.getByText('1 of 30 little treasures', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Rainbow promise, earned', exact: true }).click();
  const reward = page.getByRole('dialog', { name: 'Rainbow promise' });
  await expect(reward.getByText(/A lovely little memory from/)).toBeVisible();
  await expect(reward.getByRole('link', { name: 'My little masterpiece' })).toBeVisible();
  await reward.getByRole('button', { name: 'A happy little memory' }).click();
  await page.getByRole('link', { name: 'For parents', exact: true }).click();
  await expect(page.getByText('Stories read with love').locator('..').locator('.stat-number')).toHaveText('1');
  await expect(page.locator('.calendar .read')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Noah’s Big Adventure' })).toBeVisible();
  await page.getByLabel('Bedtime', { exact: true }).fill('20:15');
  await page.getByRole('button', { name: 'Save family settings' }).click();
  await expect(page.getByRole('status')).toContainText('Your family settings are saved.');
  const reminderDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Add a bedtime reminder' }).click();
  const reminder = await reminderDownload;
  expect(reminder.suggestedFilename()).toBe('little-lights-bedtime.ics');
  const reminderPath = await reminder.path();
  const calendar = await readFile(reminderPath!, 'utf8');
  expect(calendar).toContain('RRULE:FREQ=DAILY');
  expect(calendar).toMatch(/DTSTART:\d{8}T201500/);
  expect(calendar).toContain('BEGIN:VALARM');
  await page.reload();
  await expect(page.getByLabel('Little one’s name')).toHaveValue('Oliver');
  await expect(page.getByLabel('Bedtime', { exact: true })).toHaveValue('20:15');
  await expect(page.getByText('Stories read with love').locator('..').locator('.stat-number')).toHaveText('1');
});

test('gates premium adventures and explains that checkout needs owner configuration', async ({ page }) => {
  await page.goto('/stories');
  await page.getByRole('button', { name: /Read A World Full of Wonder/ }).click();
  const paywall = page.getByRole('dialog', { name: 'Unlock more bedtime adventures' });
  await expect(paywall.getByRole('heading', { name: 'More wonder. Every night.' })).toBeVisible();
  await expect(paywall.getByRole('button', { name: /^YEARLY/ })).toHaveClass(/selected/);
  await expect(paywall.getByRole('button', { name: /^MONTHLY/ })).toContainText('$7.99');
  await expect(paywall.getByRole('button', { name: /^YEARLY/ })).toContainText('$49');
  await expect(paywall.getByRole('button', { name: 'Checkout needs owner setup' })).toBeDisabled();
  await expect(paywall.getByText(/No payment will be taken here/)).toBeVisible();
  await paywall.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await page.goto(`/read/${PREMIUM_ID}`);
  await expect(page.getByRole('heading', { name: 'More little adventures await!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next page', exact: true })).toHaveCount(0);
});

test('keeps two same-day sticker drawings attached to their own reading', async ({ page }) => {
  await page.goto('/stickers');
  await page.evaluate(() => {
    const first = new Date(); first.setHours(18, 30, 0, 0);
    const second = new Date(first); second.setMinutes(40);
    localStorage.setItem('little-lights-family-v1', JSON.stringify({
      profile: { kidName: 'Oliver', kidAge: 4, email: 'parent@example.com', bedtime: '19:30' },
      progress: [
        { storyId: '11111111-1111-4111-8111-111111111111', completedAt: first.toISOString(), coloringDataUrl: 'data:image/png;base64,Zmlyc3Q=' },
        { storyId: '22222222-2222-4222-8222-222222222222', completedAt: second.toISOString(), coloringDataUrl: 'data:image/png;base64,c2Vjb25k' },
      ],
      stickers: [{ stickerId: '0', earnedAt: first.toISOString() }, { stickerId: '1', earnedAt: second.toISOString() }],
    }));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Rainbow promise, earned', exact: true }).click();
  await expect(page.getByRole('link', { name: 'My little masterpiece' })).toHaveAttribute('href', 'data:image/png;base64,Zmlyc3Q=');
  await page.getByRole('button', { name: 'A happy little memory' }).click();
  await page.getByRole('button', { name: 'Little lamb, earned', exact: true }).click();
  await expect(page.getByRole('link', { name: 'My little masterpiece' })).toHaveAttribute('href', 'data:image/png;base64,c2Vjb25k');
});

test('keeps the unconfigured content studio locked on both UI and API', async ({ page, request }) => {
  const session = await request.get('/api/admin/session');
  expect(await session.json()).toEqual({ configured: false, authenticated: false });
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Your studio is safely locked.' })).toBeVisible();
  await expect(page.getByLabel('Studio password')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Create a story' })).toHaveCount(0);
  const stories = await request.get('/api/admin/stories');
  expect(stories.status()).toBe(503);
  expect(await stories.json()).toHaveProperty('configured', false);
});

test('unlocks printable certificates at ten, twenty, and thirty earned stickers', async ({ page }) => {
  await page.goto('/stickers');
  await page.getByRole('button', { name: '10 sticker certificate locked', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A little celebration is coming!' })).toBeVisible();
  await page.getByRole('button', { name: 'One little story at a time' }).click();
  for (const count of [10, 20, 30]) {
    await page.evaluate(earnedCount => {
      const now = new Date().toISOString();
      localStorage.setItem('little-lights-family-v1', JSON.stringify({ profile: { kidName: 'Oliver', kidAge: 4, email: 'parent@example.com', bedtime: '19:30' }, progress: [], stickers: Array.from({ length: earnedCount }, (_, index) => ({ stickerId: String(index), earnedAt: now })) }));
    }, count);
    await page.reload();
    await page.getByRole('button', { name: `${count} sticker certificate available`, exact: true }).click();
    const certificate = page.getByRole('dialog', { name: 'Reader certificate' });
    await expect(certificate.getByRole('heading', { name: count === 10 ? 'Little Dreamer!' : count === 20 ? 'Bright Believer!' : 'Super Reader!' })).toBeVisible();
    await expect(certificate.getByText('Oliver', { exact: true })).toBeVisible();
    await page.evaluate(() => { window.print = () => { document.documentElement.dataset.printRequested = 'true'; }; });
    await certificate.getByRole('button', { name: 'Print my certificate' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-print-requested', 'true');
    await certificate.getByRole('button', { name: 'Close dialog', exact: true }).click();
  }
});
