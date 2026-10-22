import assert from 'node:assert/strict';
import test from 'node:test';
import { FREE_STORY_CACHE_KEY, forgetSavedFreeStory, readSavedFreeStory, rememberFreeStory } from '../components/reader/free-story-cache';
import { STORIES } from '../lib/stories';

function storage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
test('offline cache accepts only published free content and ignores paid entries on read', () => {
  const store = storage();
  const free = STORIES.find(story => story.isFree)!;
  const paid = { ...free, id: 'paid', isFree: false };
  assert.equal(rememberFreeStory(paid, store), false);
  assert.equal(rememberFreeStory({ ...free, status: 'draft' }, store), false);
  assert.equal(rememberFreeStory(free, store), true);
  assert.equal(readSavedFreeStory(free.id, store)?.title, free.title);
  store.setItem(FREE_STORY_CACHE_KEY, JSON.stringify([paid]));
  assert.equal(readSavedFreeStory('paid', store), null);
});
test('offline cache retains twenty recent unique free stories and can revoke one', () => {
  const store = storage();
  const free = STORIES.find(story => story.isFree)!;
  for (let index = 0; index < 21; index++) rememberFreeStory({ ...free, id: String(index) }, store);
  assert.equal(JSON.parse(store.getItem(FREE_STORY_CACHE_KEY)!).length, 20);
  assert.equal(readSavedFreeStory('0', store), null);
  assert.ok(readSavedFreeStory('20', store));
  rememberFreeStory({ ...free, id: '20', title: 'Updated story' }, store);
  assert.equal(JSON.parse(store.getItem(FREE_STORY_CACHE_KEY)!).length, 20);
  assert.equal(readSavedFreeStory('20', store)?.title, 'Updated story');
  forgetSavedFreeStory('20', store);
  assert.equal(readSavedFreeStory('20', store), null);
});
test('corrupt or unavailable storage cannot break reading', () => {
  const store = storage();
  store.setItem(FREE_STORY_CACHE_KEY, '{broken');
  assert.equal(readSavedFreeStory('missing', store), null);
  assert.equal(readSavedFreeStory('missing', null), null);
  assert.equal(rememberFreeStory(STORIES[0], null), false);
});
