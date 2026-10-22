import type { SupabaseClient } from '@supabase/supabase-js';
import type { QuizQuestion, Story, StoryPage } from '@/lib/types';
import { ApiError, UUID } from './http';

export type StoryInput = {
  id?: string; title: string; verse: string; description: string; theme: string; minutes: number;
  ageGroup: string; coverScene: string; isFree: boolean; status: 'draft' | 'published';
  pages: { text: string; scene: string; imageUrl?: string; audioUrl?: string }[];
  quiz: { question: string; answers: string[]; correctIndex: number }[];
};

type StoryRow = {
  id?: string; title: string; verse: string; description: string; theme: string;
  minutes: number; age_group: string; cover_scene: string; is_free: boolean;
  status: 'draft' | 'published'; pages?: StoryPage[]; quiz?: QuizQuestion[];
  cover_image_url?: string | null;
};

export function validateStory(input: unknown): StoryInput {
  if (!input || typeof input !== 'object') throw new ApiError(400, 'Please complete the story form.');
  const s = input as StoryInput;
  for (const field of ['title', 'verse', 'description', 'theme', 'ageGroup', 'coverScene'] as const) if (typeof s[field] !== 'string' || !s[field].trim() || s[field].length > (field === 'description' ? 1000 : 160)) throw new ApiError(400, `Please check the ${field} field.`);
  if (s.id && !UUID.test(s.id)) throw new ApiError(400, 'Invalid story ID.');
  if (!['trust', 'kindness', 'courage', 'wonder', 'love', 'peace'].includes(s.theme)) throw new ApiError(400, 'Please choose a story theme.');
  if (!['draft', 'published'].includes(s.status) || typeof s.isFree !== 'boolean') throw new ApiError(400, 'Please choose a valid story status.');
  if (!Number.isInteger(s.minutes) || s.minutes < 1 || s.minutes > 30) throw new ApiError(400, 'Story length must be 1–30 minutes.');
  if (!Array.isArray(s.pages) || s.pages.length < 2 || s.pages.length > 30) throw new ApiError(400, 'Add 2–30 story pages.');
  for (const page of s.pages) {
    if (typeof page.text !== 'string' || !page.text.trim() || page.text.trim().split(/\s+/).length > 10 || page.text.length > 200) throw new ApiError(400, 'Each page needs 1–10 words.');
    if (typeof page.scene !== 'string' || page.scene.length > 100) throw new ApiError(400, 'Choose an illustration for every page.');
    for (const value of [page.imageUrl, page.audioUrl]) if (value && (typeof value !== 'string' || value.length > 2000 || !/^(https:\/\/|storage:\/\/little-lights-media\/)/.test(value))) throw new ApiError(400, 'Media must be an uploaded asset or a secure HTTPS URL.');
  }
  if (!Array.isArray(s.quiz) || s.quiz.length !== 2) throw new ApiError(400, 'Each story needs exactly two questions.');
  for (const q of s.quiz) if (typeof q.question !== 'string' || !q.question.trim() || q.question.length > 300 || !Array.isArray(q.answers) || q.answers.length !== 3 || q.answers.some(a => typeof a !== 'string' || !a.trim() || a.length > 200) || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 2) throw new ApiError(400, 'Every question needs three answers and one correct answer.');
  return s;
}

export function toStory(row: StoryRow): Story {
  return { id: row.id || '', title: row.title, verse: row.verse, description: row.description, theme: row.theme,
    minutes: row.minutes, ageGroup: row.age_group, coverScene: row.cover_scene, isFree: row.is_free,
    status: row.status, pages: row.pages || [], quiz: row.quiz || [], coverImageUrl: row.cover_image_url || undefined };
}

export function toRow(s: StoryInput) {
  return { ...(s.id ? { id: s.id } : {}), title: s.title.trim(), verse: s.verse.trim(), description: s.description.trim(),
    theme: s.theme, minutes: s.minutes, age_group: s.ageGroup, cover_scene: s.coverScene, is_free: s.isFree,
    status: s.status, pages: s.pages.map(p => ({ text: p.text.trim(), scene: p.scene, ...(p.imageUrl ? { imageUrl: p.imageUrl } : {}), ...(p.audioUrl ? { audioUrl: p.audioUrl } : {}) })), quiz: s.quiz };
}

export async function signedMedia(client: SupabaseClient, value?: string | null): Promise<string | undefined> {
  if (!value) return undefined;
  if (!value.startsWith('storage://')) return value;
  const match = /^storage:\/\/(little-lights-media|little-lights-coloring)\/(.+)$/.exec(value);
  if (!match || match[2].includes('..')) return undefined;
  const { data, error } = await client.storage.from(match[1]).createSignedUrl(match[2], 3600);
  if (error) throw new ApiError(502, 'An illustration is taking a little longer. Please try again.');
  return data.signedUrl;
}

export async function resolveStoryMedia(client: SupabaseClient, story: ReturnType<typeof toStory>) {
  const pages = await Promise.all(story.pages.map(async page => ({ ...page, imageUrl: await signedMedia(client, page.imageUrl), audioUrl: await signedMedia(client, page.audioUrl) })));
  return { ...story, pages, coverImageUrl: await signedMedia(client, story.coverImageUrl) };
}
