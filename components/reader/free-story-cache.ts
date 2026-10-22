import type { Story } from '@/lib/types';

export const FREE_STORY_CACHE_KEY = 'little-lights-free-stories-v1';
type StoryStorage = Pick<Storage, 'getItem' | 'setItem'>;
function browserStorage(): StoryStorage | null { try { return localStorage; } catch { return null; } }

function isFreeStory(value: unknown): value is Story {
  if (!value || typeof value !== 'object') return false;
  const story = value as Partial<Story>;
  return story.isFree === true && story.status === 'published' && typeof story.id === 'string' && typeof story.title === 'string'
    && Array.isArray(story.pages) && story.pages.length > 0
    && story.pages.every(page => page && typeof page.text === 'string' && typeof page.scene === 'string')
    && Array.isArray(story.quiz) && story.quiz.every(question => question && typeof question.question === 'string' && Array.isArray(question.answers) && question.answers.every(answer => typeof answer === 'string') && Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex < question.answers.length);
}

function savedStories(storage: StoryStorage | null): Story[] {
  if (!storage) return [];
  try {
    const value: unknown = JSON.parse(storage.getItem(FREE_STORY_CACHE_KEY) || '[]');
    return Array.isArray(value) ? value.filter(isFreeStory).slice(0, 20) : [];
  } catch { return []; }
}

export function readSavedFreeStory(id: string, storage: StoryStorage | null = browserStorage()): Story | null {
  return savedStories(storage).find(story => story.id === id) || null;
}

export function rememberFreeStory(story: Story, storage: StoryStorage | null = browserStorage()): boolean {
  if (!storage || !isFreeStory(story)) return false;
  try {
    const next = [story, ...savedStories(storage).filter(saved => saved.id !== story.id)].slice(0, 20);
    storage.setItem(FREE_STORY_CACHE_KEY, JSON.stringify(next));
    return true;
  } catch { return false; }
}

export function forgetSavedFreeStory(id: string, storage: StoryStorage | null = browserStorage()): void {
  if (!storage) return;
  try { storage.setItem(FREE_STORY_CACHE_KEY, JSON.stringify(savedStories(storage).filter(story => story.id !== id))); } catch { /* Storage can be disabled. */ }
}
