import { expect, test } from '@playwright/test';

const NOAH_ID = '11111111-1111-4111-8111-111111111111';
let browserErrors: string[] = [];

test.beforeEach(async ({ page }) => {
  browserErrors = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('little-lights-redesign-initialized')) {
      localStorage.clear();
      sessionStorage.setItem('little-lights-redesign-initialized', '1');
    }
  });
});
test.afterEach(() => expect(browserErrors, 'The redesign must not throw browser runtime errors.').toEqual([]));

test('shows an honest seven-night streak, bedtime buddies, and an empty treasure box', async ({ page }) => {
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Tonight’s Adventure', exact: true });
  await expect(hero.getByRole('heading', { name: 'Noah’s Big Adventure' })).toBeVisible();
  await expect(hero.getByTestId('hero-read-button')).toContainText('Let’s Read!');
  await expect(hero.locator('[aria-label="Lumo and Pip, your bedtime buddies"]')).toBeVisible();
  await expect(page.getByTestId('twinkle-star')).toHaveCount(10);
  await expect(page.getByTestId('twinkle-star').first().locator('..')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByTestId('streak-slot')).toHaveCount(7);
  await expect(page.locator('[data-testid="streak-slot"][data-filled="true"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="streak-slot"][data-filled="false"]')).toHaveCount(7);
  const todayLabel = await page.evaluate(() => new Date().toLocaleDateString() + ': not completed');
  await expect(page.getByTestId('streak-slot').last()).toHaveAttribute('aria-label', todayLabel);
  await expect(page.getByRole('heading', { name: 'Your Treasure Box', exact: true })).toBeVisible();
  await expect(page.locator('.treasure-copy > p')).toContainText('0 treasures');
  await page.getByRole('link', { name: /Let’s peek inside/ }).click();
  await expect(page).toHaveURL(/\/stickers$/);
  await expect(page.getByText('0 of 30 little treasures', { exact: true })).toBeVisible();
});

test('fills only the actual completed nights and reflects collected treasures', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const today = new Date(); today.setHours(12, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const older = new Date(today); older.setDate(older.getDate() - 8);
    localStorage.setItem('little-lights-family-v1', JSON.stringify({
      profile: { kidName: 'Oliver', kidAge: 4, email: 'parent@example.com', bedtime: '19:30' },
      progress: [
        { storyId: '11111111-1111-4111-8111-111111111111', completedAt: today.toISOString() },
        { storyId: '22222222-2222-4222-8222-222222222222', completedAt: today.toISOString() },
        { storyId: '11111111-1111-4111-8111-111111111111', completedAt: yesterday.toISOString() },
        { storyId: '11111111-1111-4111-8111-111111111111', completedAt: older.toISOString() },
      ],
      stickers: [{ stickerId: '0', earnedAt: yesterday.toISOString() }, { stickerId: '1', earnedAt: today.toISOString() }],
    }));
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: /Sweet adventures, Oliver\./ })).toBeVisible();
  await expect(page.getByTestId('streak-slot')).toHaveCount(7);
  await expect(page.locator('[data-testid="streak-slot"][data-filled="true"]')).toHaveCount(2);
  await expect(page.locator('[data-testid="streak-slot"][data-filled="false"]')).toHaveCount(5);
  await expect(page.getByText('2 nights of bedtime magic!', { exact: true })).toBeVisible();
  await expect(page.locator('.treasure-copy > p')).toContainText('2 treasures');
});

test('keeps the homepage and reader large, rounded, and usable at 320, 390, and 1440 pixels', async ({ page }) => {
  for (const width of [320, 390, 1440]) {
    await test.step(`${width}px homepage`, async () => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      const play = page.getByTestId('hero-read-button');
      await expect(play).toBeVisible();
      await expect(play).toHaveCSS('border-top-width', '4px');
      await expect(play).toHaveCSS('border-top-color', 'rgb(255, 255, 255)');
      await expect(play).toHaveCSS('border-top-left-radius', '28px');
      const playStyle = await play.evaluate(element => {
        const style = getComputedStyle(element);
        return { font: parseFloat(style.fontSize), height: element.getBoundingClientRect().height };
      });
      expect(playStyle.font, 'The primary reading action needs large child-friendly type.').toBeGreaterThanOrEqual(24);
      expect(playStyle.height, 'The primary reading action needs a generous touch target.').toBeGreaterThanOrEqual(72);
      await expect(page.getByRole('region', { name: 'Tonight’s Adventure', exact: true })).toHaveCSS('border-top-width', '4px');
      const storyCard = page.getByRole('button', { name: /Read The Little Lost Sheep/ });
      await expect(storyCard).toHaveCSS('border-top-width', '4px');
      await expect(storyCard).toHaveCSS('border-top-color', 'rgb(255, 255, 255)');
      expect(await storyCard.locator('h3').evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(24);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), { message: `${width}px homepage must fit its viewport.` }).toBeLessThanOrEqual(1);
    });

    await test.step(`${width}px reader`, async () => {
      await page.goto(`/read/${NOAH_ID}`);
      await expect(page.locator('.reader-story-frame')).toBeVisible();
      await expect(page.locator('.reader-story-frame')).toHaveCSS('border-top-width', '4px');
      await expect(page.locator('.reader-story-frame')).toHaveCSS('border-top-color', 'rgb(255, 255, 255)');
      const sentence = page.locator('.reader-story-sentence');
      await expect(sentence).toHaveText('God asked Noah to build a very big boat.');
      const sentenceStyle = await sentence.evaluate(element => {
        const style = getComputedStyle(element);
        return { font: parseFloat(style.fontSize), family: style.fontFamily, weight: Number(style.fontWeight) };
      });
      expect(sentenceStyle.font, 'Story sentences must stay legible on small screens.').toBeGreaterThanOrEqual(24);
      expect(sentenceStyle.family).toContain('Fredoka');
      expect(sentenceStyle.weight).toBeGreaterThanOrEqual(700);
      for (const name of ['Next page', 'Previous page', 'Play narration']) {
        const control = page.getByRole('button', { name, exact: true });
        await expect(control).toBeVisible();
        const bounds = await control.boundingBox();
        expect(bounds!.width, `${name} needs a finger-sized width.`).toBeGreaterThanOrEqual(44);
        expect(bounds!.height, `${name} needs a finger-sized height.`).toBeGreaterThanOrEqual(44);
      }
      await expect(page.getByRole('slider', { name: 'Narration progress for page 1', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Next page', exact: true }).click();
      await expect(sentence).toHaveText('Noah trusted God and got to work.');
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), { message: `${width}px reader must fit its viewport.` }).toBeLessThanOrEqual(1);
    });
  }
});

test('respects reduced motion while keeping the main adventure fully interactive', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const star = page.getByTestId('twinkle-star').first();
  await expect(star).toBeVisible();
  await expect(star).toHaveCSS('opacity', '0.6');
  const motionSamples = await star.evaluate(async element => {
    const before = getComputedStyle(element).transform;
    await new Promise(resolve => setTimeout(resolve, 350));
    return { before, after: getComputedStyle(element).transform };
  });
  expect(motionSamples.after, 'Decorative stars must stop moving when reduced motion is requested.').toBe(motionSamples.before);
  await expect(page.getByTestId('hero-read-button')).toBeEnabled();
  await page.getByTestId('hero-read-button').click();
  await expect(page.getByRole('dialog', { name: 'Welcome to Little Lights' })).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await expect(page.getByTestId('hero-read-button')).toBeVisible();
});

test('keeps bedtime sounds optional, keyboard accessible, and saved between visits', async ({ page }) => {
  await page.goto('/');
  const sound = page.getByRole('button', { name: 'Bedtime sounds', exact: true });
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await sound.focus();
  await page.keyboard.press('Enter');
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('little-lights-sound-v1'))).toBe('on');
  await page.reload();
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await sound.click();
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('little-lights-sound-v1'))).toBe('off');
  await page.reload();
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
});

test('brings Lumo, Pip, stars, and button hearts to life when motion is enabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const star = page.getByTestId('twinkle-star').first();
  const lumo = page.locator('.hero-buddy-lumo > g').first();
  const pipMouth = page.locator('.hero-buddy-pip ellipse[cx="90"][cy="119"]');
  const initialStar = await star.evaluate(element => getComputedStyle(element).opacity);
  const initialLumo = await lumo.evaluate(element => getComputedStyle(element).transform);
  const initialYawn = await pipMouth.evaluate(element => getComputedStyle(element).transform);
  await expect.poll(() => star.evaluate(element => getComputedStyle(element).opacity)).not.toBe(initialStar);
  await expect.poll(() => lumo.evaluate(element => getComputedStyle(element).transform)).not.toBe(initialLumo);
  await expect.poll(() => pipMouth.evaluate(element => getComputedStyle(element).transform), { timeout: 8000 }).not.toBe(initialYawn);
  await page.getByRole('button', { name: 'Bedtime sounds', exact: true }).click();
  await expect(page.locator('.pointer-events-none.fixed .lucide-heart')).toHaveCount(1);
});
