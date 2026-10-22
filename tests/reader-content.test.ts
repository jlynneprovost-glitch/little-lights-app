import assert from 'node:assert/strict';
import test from 'node:test';
import { STORIES, STICKER_NAMES } from '../lib/stories';

test('three free adventures can be read and completed by young readers', () => {
  const freeStories = STORIES.filter(story => story.isFree);
  assert.equal(freeStories.length, 3, 'The free library must contain three complete adventures.');
  for (const story of freeStories) {
    assert.ok(story.pages.length >= 3, `${story.title} needs a complete beginning, middle, and end.`);
    for (const [index, page] of story.pages.entries()) {
      const words = page.text.trim().split(/\s+/);
      assert.ok(words.length > 0 && words.length <= 10, `${story.title}, page ${index + 1}: the reading limit is ten words.`);
      assert.ok(page.scene || page.imageUrl, `${story.title}, page ${index + 1} needs an illustration.`);
    }
    assert.equal(story.quiz.length, 2, `${story.title} needs two little wonders after reading.`);
    for (const question of story.quiz) {
      assert.ok(question.question.trim());
      assert.equal(question.answers.length, 3, 'Each quiz must offer three choices.');
      assert.equal(new Set(question.answers).size, 3, 'Children must be able to distinguish the answers.');
      assert.ok(Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex < 3, 'Every quiz needs an achievable correct answer.');
    }
  }
});

test('premium story text and answers are absent from the public client fixtures', () => {
  const premium = STORIES.filter(story => !story.isFree);
  assert.ok(premium.length > 0, 'The library should show previews of more adventures.');
  for (const story of premium) {
    assert.deepEqual(story.pages, [], `${story.title} must fetch its protected pages from the server.`);
    assert.deepEqual(story.quiz, [], `${story.title} must fetch its protected quiz from the server.`);
  }
});

test('story routes and all thirty sticker rewards have unique identities', () => {
  assert.equal(new Set(STORIES.map(story => story.id)).size, STORIES.length);
  for (const story of STORIES) assert.match(story.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(STICKER_NAMES.length, 30);
  assert.equal(new Set(STICKER_NAMES).size, 30);
});
