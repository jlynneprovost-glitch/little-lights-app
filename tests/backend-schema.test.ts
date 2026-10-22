import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const PARENT = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OTHER_PARENT = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const FREE_STORY = '11111111-1111-4111-8111-111111111111';
const SECOND_FREE_STORY = '22222222-2222-4222-8222-222222222222';
const PAID_STORY = '44444444-4444-4444-8444-444444444444';
type CompletionResult = {
  progressId: string;
  stickerId: string | null;
  completedAt: string;
  earnedAt: string | null;
  newCompletion: boolean;
};

function hasSqlState(code: string) {
  return (error: unknown) => error instanceof Error && 'code' in error && error.code === code;
}

// Real PostgreSQL execution, without a hosted Supabase project. The auth/storage
// schemas below reproduce only the platform objects our SQL depends on.
test('Supabase schema enforces story access and transactional rewards', { timeout: 60_000 }, async (t) => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create schema storage;
      create table auth.users (
        id uuid primary key,
        email text,
        raw_user_meta_data jsonb not null default '{}'
      );
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      grant usage on schema auth to anon, authenticated;
      create table storage.buckets (
        id text primary key,
        name text,
        public boolean,
        file_size_limit bigint,
        allowed_mime_types text[]
      );
    `);

    // PGlite includes gen_random_uuid(), but not the optional pgcrypto bundle.
    // Supabase installs the extension normally; every other statement is exact.
    const schema = (await readFile(resolve('supabase/schema.sql'), 'utf8'))
      .replace(/^create extension if not exists pgcrypto;$/m, '');
    const seed = await readFile(resolve('supabase/seed.sql'), 'utf8');
    const storyCount = async () => (await db.query<{ count: number }>(
      'select count(*)::int as count from public.stories',
    )).rows[0].count;
    const asParent = async () => db.exec(`
      set role authenticated;
      set request.jwt.claim.sub = '${PARENT}';
    `);
    const complete = async (storyId: string, coloring: string | null = null) => (
      await db.query<{ result: CompletionResult }>(
        'select public.complete_story($1::uuid, $2::text) as result', [storyId, coloring],
      )
    ).rows[0].result;

    await t.test('schema and seed are repeatable and contain six valid stories', async () => {
      await db.exec(schema);
      await db.exec(seed);
      await db.exec(schema);
      await db.exec(seed);
      assert.equal(await storyCount(), 6);
      const { rows } = await db.query<{ pages: Array<{ text: string }>; quiz: unknown[] }>(
        'select pages, quiz from public.stories',
      );
      for (const story of rows) {
        assert.equal(story.quiz.length, 2);
        assert(story.pages.length > 0);
        for (const page of story.pages) assert(page.text.trim().split(/\s+/).length <= 10);
      }
      const buckets = (await db.query<{ public: boolean }>('select public from storage.buckets')).rows;
      assert.equal(buckets.length, 2);
      assert(buckets.every((bucket) => !bucket.public));
    });

    await t.test('anonymous visitors can read only the three published free stories', async () => {
      await db.exec('set role anon');
      assert.equal(await storyCount(), 3);
      assert.equal((await db.query('select id from public.stories where id = $1', [PAID_STORY])).rows.length, 0);
      await assert.rejects(db.query('select * from public.users'), hasSqlState('42501'));
      await assert.rejects(db.query('select public.complete_story($1::uuid)', [FREE_STORY]), hasSqlState('42501'));
      await db.exec('reset role');
    });

    await t.test('signup metadata cannot forge a subscription or account identity', async () => {
      await db.query(`
        insert into auth.users(id, email, raw_user_meta_data) values
          ($1::uuid, 'parent@example.test', $2::jsonb),
          ($3::uuid, 'other@example.test', '{}'::jsonb)
      `, [PARENT, JSON.stringify({
        kid_name: 'A little reader', kid_age: 5, bedtime: '20:15',
        subscription_status: 'active', stripe_customer_id: 'forged_customer',
      }), OTHER_PARENT]);
      const profile = (await db.query<{
        subscription_status: string; stripe_customer_id: string | null;
        kid_age: number; bedtime: string;
      }>('select * from public.users where id = $1', [PARENT])).rows[0];
      assert.equal(profile.subscription_status, 'free');
      assert.equal(profile.stripe_customer_id, null);
      assert.equal(profile.kid_age, 5);
      assert.equal(profile.bedtime, '20:15:00');
      await asParent();
      assert.equal(await storyCount(), 3);
      assert.equal((await db.query('select id from public.users')).rows.length, 1);
      assert.equal((await db.query('select id from public.users where id = $1', [OTHER_PARENT])).rows.length, 0);
      await db.query('update public.users set kid_name = $1 where id = $2', ['Updated reader', PARENT]);
      await assert.rejects(
        db.query("update public.users set subscription_status = 'active'"), hasSqlState('42501'),
      );
      await assert.rejects(
        db.query("update public.users set stripe_customer_id = 'forged_customer'"), hasSqlState('42501'),
      );
      await assert.rejects(db.query(
        'insert into public.progress(user_id, story_id) values ($1, $2)', [PARENT, FREE_STORY],
      ), hasSqlState('42501'));
    });

    await t.test('completion is idempotent and cannot save another parent’s coloring', async () => {
      const first = await complete(FREE_STORY);
      const repeated = await complete(FREE_STORY);
      assert.equal(first.newCompletion, true);
      assert.equal(first.stickerId, '0');
      assert.equal(repeated.newCompletion, false);
      assert.equal(repeated.progressId, first.progressId);
      assert.equal(repeated.completedAt, first.completedAt);
      assert.equal((await db.query('select id from public.stickers')).rows.length, 1);
      await assert.rejects(
        complete(FREE_STORY, `storage://little-lights-coloring/${OTHER_PARENT}/picture.png`),
        hasSqlState('22023'),
      );
      await assert.rejects(
        complete(FREE_STORY, `storage://little-lights-coloring/${PARENT}/../${OTHER_PARENT}/picture.png`),
        hasSqlState('22023'),
      );
      const ownColoring = `storage://little-lights-coloring/${PARENT}/${FREE_STORY}/picture.png`;
      assert.equal((await complete(FREE_STORY, ownColoring)).newCompletion, false);
      assert.equal((await db.query<{ coloring_saved_url: string }>(
        'select coloring_saved_url from public.progress where id = $1', [first.progressId],
      )).rows[0].coloring_saved_url, ownColoring);
      assert.equal((await complete(SECOND_FREE_STORY)).stickerId, '1');
    });

    await t.test('paid access is enforced for direct reads and completion RPC', async () => {
      await assert.rejects(complete(PAID_STORY), hasSqlState('42501'));
      assert.equal((await db.query('select id from public.stories where id = $1', [PAID_STORY])).rows.length, 0);
      await db.exec('reset role');
      await db.query("update public.users set subscription_status = 'active' where id = $1", [PARENT]);
      await asParent();
      assert.equal(await storyCount(), 6);
      assert.equal((await complete(PAID_STORY)).stickerId, '2');
      await db.exec('reset role');
      await db.exec(`
        set role authenticated;
        set request.jwt.claim.sub = '${OTHER_PARENT}';
      `);
      assert.equal((await db.query('select id from public.progress')).rows.length, 0);
      assert.equal((await db.query('select id from public.stickers')).rows.length, 0);
      assert.equal(await storyCount(), 3);
      await db.exec('reset role');
    });

    await t.test('repeat-night progress is retained and malformed story content is rejected', async () => {
      await db.query(`
        insert into public.progress(user_id, story_id, completed_day) values
          ($1, $2, '2000-01-01'), ($1, $2, '2000-01-02')
      `, [PARENT, FREE_STORY]);
      assert.equal((await db.query<{ count: number }>(
        "select count(*)::int as count from public.progress where completed_day < '2000-01-03'",
      )).rows[0].count, 2);
      assert.equal((await db.query<{ valid: boolean }>(
        `select public.valid_story_pages('[{"text":"hello"}]'::jsonb) as valid`,
      )).rows[0].valid, false);
      assert.equal((await db.query<{ valid: boolean }>(
        `select public.valid_story_quiz('[{"question":"Hello?","answers":["a","b","c"]},{"question":"Hello?","answers":["a","b","c"]}]'::jsonb) as valid`,
      )).rows[0].valid, false);
    });

    await t.test('deletion locks prevent new awards and cannot be changed by the parent', async () => {
      await asParent();
      await assert.rejects(db.query('update public.users set deletion_pending_at = now() where id = $1', [PARENT]), hasSqlState('42501'));
      await db.exec('reset role');
      await db.query('update public.users set deletion_pending_at = now() where id = $1', [PARENT]);
      await asParent();
      await assert.rejects(complete(SECOND_FREE_STORY), hasSqlState('28000'));
      await db.exec('reset role');
      await db.query('update public.users set deletion_pending_at = null where id = $1', [PARENT]);
    });
  } finally {
    await db.close();
  }
});
