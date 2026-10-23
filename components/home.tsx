'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, Check, ChevronRight, Clock3, Headphones, Heart, LockKeyhole, Moon, Play, Sparkles } from 'lucide-react';
import { STORIES } from '@/lib/stories';
import type { Story } from '@/lib/types';
import { FamilyBar } from './app-shell';
import { useApp } from './app-provider';
import { Lumo, Pip, StoryScene, TreasureChest } from './illustrations';

function useCatalogue() {
  const { isDemo } = useApp();
  const [catalog, setCatalog] = useState<Story[]>(STORIES);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (isDemo) { setCatalog(STORIES); setError(''); return; }
    const controller = new AbortController();
    fetch('/api/stories', { signal: controller.signal }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Our stories are taking a little rest.');
      setCatalog(data.stories || []); setError('');
    }).catch(error => { if (error.name !== 'AbortError') setError(error.message); });
    return () => controller.abort();
  }, [isDemo, attempt]);
  return { catalog, error, retry: () => setAttempt(value => value + 1) };
}

export function HomePage() {
  const { profile, stickers, startStory, openOnboarding } = useApp();
  const { catalog, error, retry } = useCatalogue();
  const reduced = useReducedMotion();
  const tonight = catalog.find(story => story.isFree) || catalog[0] || STORIES[0];

  return <div className="home-redesign">
    <FamilyBar />
    {error && <div role="alert" className="error-message flex items-center justify-between gap-3">{error}<button className="underline" onClick={retry}>Try again</button></div>}

    <section className="cozy-welcome">
      <div>
        <span className="cozy-kicker"><span /> LITTLE STORIES. BIG LOVE.</span>
        <h1>{profile ? 'Sweet adventures, ' + profile.kidName + '.' : 'Big stories. Little hearts.'}<span aria-hidden="true">✦</span></h1>
        <p>A little faith. A big cuddle. The sweetest goodnight.</p>
      </div>
      <div className="welcome-doodle" aria-hidden="true">made for your<br/><strong>little dreamer</strong><svg viewBox="0 0 80 35"><path d="M8 6Q34 40 68 13m-12-2 15 1-2 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg></div>
    </section>

    <motion.section aria-label="Tonight’s Adventure" className="adventure-hero"
      initial={reduced ? false : { opacity: 0, y: 32, scale: .97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={reduced ? {} : { y: -3 }} whileTap={{ scale: .95 }}
      transition={{ type: 'spring', stiffness: 150, damping: 17 }}>
      <div className="hero-paper-cloud hero-paper-cloud-one" aria-hidden="true" />
      <div className="hero-paper-cloud hero-paper-cloud-two" aria-hidden="true" />
      <div className="adventure-copy">
        <span className="adventure-label"><Moon size={16} fill="currentColor" /> TONIGHT’S ADVENTURE</span>
        <h2>{tonight.title}</h2>
        <p>{tonight.id === STORIES[0].id ? 'A big boat. A rainbow promise. And a whole lot of love.' : tonight.description}</p>
        <div className="adventure-badges">
          <span><BookOpen size={16} />{tonight.verse}</span>
          <span><Clock3 size={16} />{tonight.minutes} cozy minutes</span>
        </div>
        <motion.button data-testid="hero-read-button" className="cozy-play" onClick={() => startStory(tonight)}
          whileHover={reduced ? {} : { y: -4, rotate: -1 }} whileTap={{ scale: .95 }}>
          <Lumo className="play-button-lumo" />
          <span>Let’s Read!</span><ArrowRight size={29} strokeWidth={3} />
        </motion.button>
        <span className="read-together-note"><Headphones size={17} /> Listen, wonder & snuggle together</span>
      </div>

      <div className="adventure-picture">
        <motion.div className="adventure-picture-frame" animate={reduced ? {} : { y: [0, -5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
          <StoryScene scene={tonight.coverScene} className="adventure-scene" />
          <span className="picture-spark picture-spark-one" aria-hidden="true">✦</span>
          <span className="picture-spark picture-spark-two" aria-hidden="true">✧</span>
        </motion.div>
        <div className="hero-buddy-bubble">Ready, little light?<span aria-hidden="true">♡</span></div>
        <div className="hero-buddies" aria-label="Lumo and Pip, your bedtime buddies">
          <Lumo className="hero-buddy-lumo" />
          <Pip className="hero-buddy-pip" mood="sleeping" />
        </div>
      </div>
      <div className="hero-bottom-label"><Heart size={14} fill="currentColor" /><span>A little adventure before a big, cozy sleep.</span></div>
    </motion.section>

    <div className="cozy-reassurance">
      <span><span className="reassurance-icon">♡</span> Made for little hearts</span>
      <span><span className="reassurance-icon"><Moon size={17} /></span> Gentle, happy bedtimes</span>
      <span><span className="reassurance-icon">✦</span> No ads. Just wonder.</span>
    </div>

    <section className="treasure-and-tip">
      <motion.div className="treasure-box-card" whileHover={reduced ? {} : { y: -5 }} whileTap={{ scale: .95 }}>
        <div className="treasure-chest-wrap"><TreasureChest className="treasure-chest-art" /><span aria-hidden="true" className="treasure-spark">✧</span></div>
        <div className="treasure-copy"><span className="cozy-kicker">LITTLE WINS. BIG HAPPY FEELINGS.</span><h2>Your Treasure Box</h2><p><strong>{stickers.length}</strong> {stickers.length === 1 ? 'treasure' : 'treasures'} <span aria-hidden="true">✦</span></p><Link className="treasure-link" href="/stickers">Let’s peek inside <ArrowRight size={22} /></Link></div>
        <div className="treasure-sticker-peek" aria-hidden="true">{['★', '♡', '✿'].map((shape, index) => <span key={shape} className={stickers.length > index ? 'collected' : ''}>{shape}</span>)}</div>
      </motion.div>
      <motion.aside className="pip-tip-card" whileHover={reduced ? {} : { y: -5 }} whileTap={{ scale: .95 }}>
        <div className="pip-speech"><span>PIP’S COZY LITTLE TIP</span><p>“One more cuddle<br/>makes every story<br/><strong>even better.</strong>”</p><span className="speech-heart" aria-hidden="true">♡</span></div>
        <Pip className="tip-pip" mood="sleeping" />
      </motion.aside>
    </section>

    <section className="story-section cozy-stories">
      <div className="section-heading"><div><span className="cozy-kicker">MORE LITTLE WORLDS TO EXPLORE</span><h2>A little more wonder <span aria-hidden="true">✧</span></h2></div><Link href="/stories" className="all-stories-link">All stories <ArrowRight size={21} /></Link></div>
      <div className="story-grid">{catalog.filter(story => story.id !== tonight.id).slice(0, 3).map((story, index) => <StoryCard key={story.id} story={story} index={index} />)}</div>
    </section>

    {!profile && <div className="cozy-setup-strip"><div className="setup-buddies"><Lumo className="w-16 h-16" /><Pip className="w-14 h-14 -ml-4" /></div><div><strong>A bedtime as special as your little one.</strong><p>A happy little place to grow in love.</p></div><button className="btn btn-cream" onClick={() => openOnboarding()}>Meet your buddies <ChevronRight size={21} /></button></div>}
  </div>;
}

export function StoryCard({ story, index = 0 }: { story: Story; index?: number }) {
  const { startStory, progress } = useApp();
  const completed = progress.some(completion => completion.storyId === story.id);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();
  return <motion.button initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * .08, duration: .4 }} whileHover={reduced ? {} : { y: -7, rotate: index % 2 ? 1 : -1 }} whileTap={{ scale: .95 }}
    className={'story-card scene-' + story.coverScene} onClick={() => startStory(story)} aria-label={'Read ' + story.title + (story.isFree ? ' · free' : ' · members')}>
    <div className="story-card-art">{story.coverImageUrl && !failed ? <img src={story.coverImageUrl} alt={story.title} onError={() => setFailed(true)} className="w-full h-full object-cover" /> : <StoryScene scene={story.coverScene} className="w-full h-full" />}
      {story.isFree ? <span className="free-badge">{completed ? <><Check size={13} /> READ WITH LOVE</> : <><Sparkles size={13} /> FREE LITTLE STORY</>}</span> : <span className="free-badge premium"><LockKeyhole size={13} /> LITTLE LIGHTS PLUS</span>}
    </div>
    <div className="story-card-copy"><div className="flex items-center justify-between gap-2"><span className="story-theme">{story.theme === 'love' ? 'YOU ARE SO LOVED' : story.theme === 'wonder' ? 'A LITTLE WONDER' : story.theme.toUpperCase()}</span><span className="story-card-time"><Clock3 size={13} />{story.minutes} min</span></div>
      <h3>{story.title}</h3><p>{story.description}</p><div className="card-bottom"><span><BookOpen size={15} />{story.verse}</span><span className="card-play"><Play size={18} fill="currentColor" /></span></div></div>
  </motion.button>;
}

export function StoriesPage() {
  const [filter, setFilter] = useState('All adventures');
  const [search, setSearch] = useState('');
  const { catalog, error, retry } = useCatalogue();
  const stories = catalog.filter(story => (filter === 'All adventures' || filter === 'Free stories' && story.isFree || story.theme.toLowerCase() === filter.toLowerCase()) && (story.title + ' ' + story.description).toLowerCase().includes(search.toLowerCase()));
  return <><FamilyBar />{error && <div className="error-message flex items-center justify-between gap-3">{error}<button className="underline" onClick={retry}>Try again</button></div>}
    <section className="welcome-heading"><div><span className="eyebrow">A whole little world of wonder</span><h1>Find your next adventure<span className="heading-spark">✦</span></h1><p>Big promises, brave little hearts, and love on every page.</p></div><Lumo className="w-24 h-24 hidden sm:block" /></section>
    <div className="library-toolbar"><div className="filter-chips">{['All adventures', 'Free stories', 'Love', 'Wonder', 'Courage', 'Kindness'].map(value => <button key={value} onClick={() => setFilter(value)} className={filter === value ? 'active' : ''}>{value}</button>)}</div><input aria-label="Search stories" placeholder="Find a little story…" value={search} onChange={event => setSearch(event.target.value)} className="max-w-xs" /></div>
    {stories.length ? <div className="story-grid library-grid">{stories.map((story, index) => <StoryCard key={story.id} story={story} index={index} />)}</div> : <div className="empty-state"><Pip className="h-32 w-32" /><h2>No little stories here… yet!</h2><p>Try another word or explore all adventures.</p><button className="btn btn-yellow" onClick={() => { setSearch(''); setFilter('All adventures'); }}>Show all stories</button></div>}
    <div className="library-footnote"><Moon size={18} />Three free adventures to start a lovely little habit. More stories with Little Lights Plus.</div>
  </>;
}
