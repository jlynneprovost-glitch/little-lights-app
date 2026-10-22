export type StoryPage = { text: string; scene: string; imageUrl?: string; audioUrl?: string };
export type QuizQuestion = { question: string; answers: string[]; correctIndex: number };
export type Story = {
  id: string;
  title: string;
  verse: string;
  description: string;
  theme: string;
  minutes: number;
  ageGroup: string;
  coverScene: string;
  coverImageUrl?: string;
  isFree: boolean;
  status: 'published' | 'draft';
  pages: StoryPage[];
  quiz: QuizQuestion[];
};
export type Profile = { kidName: string; kidAge: number; email: string; bedtime: string };
export type Completion = { storyId: string; completedAt: string; coloringDataUrl?: string };
