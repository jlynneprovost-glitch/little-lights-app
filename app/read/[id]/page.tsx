import { StoryExperience } from '@/components/reader/story-experience';

export default function ReadStoryPage({ params }: { params: { id: string } }) {
  return <StoryExperience storyId={params.id} />;
}
