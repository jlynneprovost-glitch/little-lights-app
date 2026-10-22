'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Heart, LockKeyhole, Moon, Pause, Play, RotateCcw, Sparkles, Volume2, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/components/app-provider';
import { Lumo, Pip, StoryScene } from '@/components/illustrations';
import { STORIES } from '@/lib/stories';
import type { Story } from '@/lib/types';
import { ColoringCanvas } from './coloring-canvas';
import { forgetSavedFreeStory, readSavedFreeStory, rememberFreeStory } from './free-story-cache';

type Stage = 'read' | 'celebrate' | 'quiz' | 'color' | 'collected';
const confettiColors = ['#FFD93D', '#A8D8EA', '#F4A9BC', '#C3E8BD', '#CAB7E5'];

function Confetti() {
  const reduceMotion = useReducedMotion();
  return <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
    {!reduceMotion && Array.from({ length: 42 }, (_, i) => <motion.span key={i} className="absolute left-1/2 top-1/3 h-3 w-2 rounded-sm" style={{ background: confettiColors[i % confettiColors.length] }} initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }} animate={{ x: ((i * 137) % 1000) - 500, y: [0, -120 - i % 6 * 20, 650], rotate: (i % 2 ? 1 : -1) * (360 + i * 14), opacity: [1, 1, 0] }} transition={{ duration: 2.4 + i % 4 * 0.2, delay: i % 7 * 0.025, ease: 'easeOut' }} />)}
  </div>;
}

function PageIllustration({ page, fallback }: { page: Story['pages'][number]; fallback: string }) {
  const [failed, setFailed] = useState(false);
  return page.imageUrl && !failed
    ? <img src={page.imageUrl} alt={`Illustration: ${page.text}`} onError={() => setFailed(true)} className="h-full w-full object-cover" />
    : <StoryScene scene={page.scene || fallback} className="h-full w-full" />;
}

function ReaderAudio({ page, label }: { page: Story['pages'][number]; label: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(Math.max(3, page.text.split(/\s+/).length / 1.8));
  const [error, setError] = useState('');
  const [canSpeak, setCanSpeak] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setPlaying(false); setElapsed(0); setError('');
    setDuration(Math.max(3, page.text.split(/\s+/).length / 1.8));
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setCanSpeak(true);
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    window.speechSynthesis.cancel();
    return () => { window.speechSynthesis.cancel(); window.speechSynthesis.removeEventListener('voiceschanged', updateVoices); };
  }, [page.text, page.audioUrl]);

  useEffect(() => {
    if (!playing || page.audioUrl) return;
    const timer = window.setInterval(() => setElapsed(old => Math.min(old + 0.2, duration * 0.95)), 200);
    return () => window.clearInterval(timer);
  }, [playing, page.audioUrl, duration]);

  const toggle = async () => {
    setError('');
    if (page.audioUrl && audio.current) {
      if (playing) audio.current.pause();
      else { try { await audio.current.play(); } catch { setError('Audio is unavailable. You can still read together.'); } }
      return;
    }
    if (!canSpeak) { setError('Read this page together. This browser does not support narration.'); return; }
    if (playing) { window.speechSynthesis.pause(); setPlaying(false); return; }
    if (window.speechSynthesis.paused && utterance.current) { window.speechSynthesis.resume(); setPlaying(true); return; }
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(page.text);
    const voice = voices.find(v => /samantha|karen|moira|google uk english female|susan|zira/i.test(v.name)) || voices.find(v => v.lang.startsWith('en'));
    if (voice) speech.voice = voice;
    speech.rate = 0.78; speech.pitch = 1.08; speech.volume = 0.9;
    speech.onstart = () => { setPlaying(true); setElapsed(0); };
    speech.onend = () => { setPlaying(false); setElapsed(duration); utterance.current = null; };
    speech.onerror = event => { if (event.error !== 'interrupted' && event.error !== 'canceled') setError('Narration paused. You can still read together.'); setPlaying(false); };
    utterance.current = speech;
    window.speechSynthesis.speak(speech);
  };

  const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  return <div className="rounded-[24px] border-[3px] border-[#E5D9C3] bg-[#FFF3DA] px-4 py-3 sm:px-6">
    {page.audioUrl && <audio ref={audio} src={page.audioUrl} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setElapsed(duration); }} onLoadedMetadata={() => { if (audio.current && Number.isFinite(audio.current.duration)) setDuration(audio.current.duration); }} onTimeUpdate={() => { if (audio.current) setElapsed(audio.current.currentTime); }} onError={() => { setPlaying(false); setError('Audio is unavailable. You can still read together.'); }} />}
    <div className="flex items-center gap-4">
      <button onClick={toggle} aria-label={playing ? 'Pause narration' : 'Play narration'} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#DEBE69] bg-[#FFD93D] text-[#61502E] shadow-[0_3px_0_#DEBE69] transition-transform hover:scale-105 active:translate-y-1 active:shadow-none">{playing ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" className="ml-0.5" />}</button>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-extrabold text-[#786B55]"><span className="flex items-center gap-1.5"><Volume2 size={14} />{page.audioUrl ? 'Listen along' : 'Read-aloud voice'}</span><span>{format(elapsed)} / {format(duration)}</span></div>
        {page.audioUrl ? <input aria-label={`Narration progress for ${label}`} type="range" min={0} max={duration || 1} step={0.1} value={elapsed} onChange={e => { if (audio.current) audio.current.currentTime = Number(e.target.value); setElapsed(Number(e.target.value)); }} className="block h-2 w-full cursor-pointer accent-[#8AAB8A]" /> : <div className="h-2 overflow-hidden rounded-full bg-[#E7DABF]" role="progressbar" aria-label="Narration progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(elapsed / duration * 100)}><div className="h-full rounded-full bg-[#8AAB8A] transition-[width] duration-200" style={{ width: `${Math.min(100, elapsed / duration * 100)}%` }} /></div>}
      </div>
    </div>
    <p className="mt-2 text-center text-[10px] font-bold text-[#8B7C64]">{error || (page.audioUrl ? 'A little moment to listen, wonder, and dream.' : 'Uses your device’s voice. Narrator recordings can be added by a grown-up.')}</p>
  </div>;
}

export function StoryExperience({ storyId }: { storyId: string }) {
  const { isDemo, hasAccess, openPaywall, completeStory, profile } = useApp();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('read');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [bounce, setBounce] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedFree, setSavedFree] = useState(false);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [retry, setRetry] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setLocked(false);
    setSavedFree(false); setOfflineSaved(false);
    setPageIndex(0); setStage('read'); setQuestionIndex(0); setSelectedAnswer(null); setCorrect(false); setSaveError('');
    if (!navigator.onLine) {
      const saved = readSavedFreeStory(storyId);
      if (saved) { setStory(saved); setSavedFree(true); setOfflineSaved(true); setLoading(false); return; }
      const preview = isDemo ? STORIES.find(item => item.id === storyId && item.isFree) : null;
      if (preview) { setStory(preview); setLoading(false); return; }
      setStory(null); setError('Only previously saved free stories are available offline. Reconnect for this adventure.'); setLoading(false); return;
    }
    if (isDemo) {
      const found = STORIES.find(item => item.id === storyId);
      setStory(found || null); setLoading(false);
      if (!found) setError('This little adventure could not be found.');
      return;
    }
    fetch(`/api/stories/${encodeURIComponent(storyId)}`).then(async response => {
      if (!active) return;
      if (response.status === 401 || response.status === 403) { forgetSavedFreeStory(storyId); setStory(null); setLocked(true); return; }
      const body = await response.json();
      if (!response.ok || !body.story) throw new Error(body.error || 'This adventure is taking a little rest. Try again.');
      setStory(body.story);
      if (body.story.isFree === true) setSavedFree(rememberFreeStory(body.story));
      else forgetSavedFreeStory(storyId);
    }).catch(err => {
      if (!active) return;
      const saved = !navigator.onLine ? readSavedFreeStory(storyId) : null;
      if (saved) { setStory(saved); setSavedFree(true); setOfflineSaved(true); }
      else setError(!navigator.onLine ? 'Only previously saved free stories are available offline. Reconnect for this adventure.' : err instanceof Error ? err.message : 'Oops! Let’s try again.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [storyId, isDemo, retry]);

  useEffect(() => { window.scrollTo(0, 0); }, [stage]);
  useEffect(() => () => { if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);
  useEffect(() => {
    const connected = () => setOfflineSaved(false);
    window.addEventListener('online', connected);
    return () => window.removeEventListener('online', connected);
  }, []);

  const turnPage = useCallback((direction: number) => {
    if (!story) return;
    setPageIndex(current => Math.max(0, Math.min(story.pages.length, current + direction)));
  }, [story]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (stage !== 'read' || event.defaultPrevented || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || document.querySelector('[aria-modal="true"]')) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); turnPage(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); turnPage(-1); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [stage, turnPage]);

  if (loading) return <main className="mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center"><motion.div animate={reduceMotion ? {} : { y: [0, -14, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><Lumo className="h-32 w-32" /></motion.div><h1 className="display text-2xl font-extrabold text-[#594D3A]">Finding your adventure…</h1><div className="h-6 w-48 animate-pulse rounded-full bg-[#EDDFC4]" /><div className="h-40 w-full animate-pulse rounded-[28px] bg-[#F4E9D0]" /></main>;
  if (locked || (story && !hasAccess(story))) return <main className="mx-auto flex min-h-[75vh] max-w-md flex-col items-center justify-center gap-5 px-6 text-center"><Lumo className="h-36 w-36" /><div className="flex items-center gap-2 rounded-full bg-[#FFE4C4] px-4 py-2 text-sm font-extrabold text-[#8B623E]"><LockKeyhole size={17} />A grown-up can help</div><h1 className="display text-3xl font-extrabold text-[#594D3A]">More little adventures await!</h1><p className="text-[#89765B]">Your three free stories are a beautiful beginning. Ask a grown-up to unlock the rest.</p><button onClick={openPaywall} className="btn w-full bg-[#FFD93D] px-6 py-4 font-extrabold">Explore Little Lights Plus</button><Link href="/" className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-[#7F725E]"><ChevronLeft size={17} />Back to free stories</Link></main>;
  if (error || !story || !story.pages.length) return <main className="mx-auto flex min-h-[75vh] max-w-md flex-col items-center justify-center gap-5 px-6 text-center"><Lumo className="h-32 w-32" /><h1 className="display text-3xl font-extrabold text-[#594D3A]">Oops! Let’s try again.</h1><p className="text-[#89765B]">{error || 'This story is not quite ready for bedtime yet.'}</p><button className="btn bg-[#FFD93D] px-6 py-3 font-bold" onClick={() => setRetry(old => old + 1)}><RotateCcw size={17} className="mr-2 inline" />Try again</button><Link href="/" className="rounded-2xl px-4 py-2 text-sm font-bold">Back to our stories</Link></main>;

  const lastPage = pageIndex === story.pages.length;
  const page = story.pages[Math.min(pageIndex, story.pages.length - 1)];
  const question = story.quiz[questionIndex];
  const name = profile?.kidName ? `, ${profile.kidName}` : '';

  return <main className="mx-auto min-h-screen max-w-[920px] px-4 pb-28 pt-5 sm:px-8 sm:pt-7">
    <header className="mb-7 flex items-center justify-between gap-3">
      <Link href="/" aria-label="Close story and return home" className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#E4D7BE] bg-[#FFF3DA] text-[#807158] transition-transform hover:scale-105 active:scale-95"><X size={21} /></Link>
      <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#9B896B]"><Moon size={15} className="text-[#B59853]" />A little light before sleep</span>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F8EDCD] text-[#C4A754]"><Sparkles size={20} /></span>
    </header>

    {savedFree && <p role="status" className="mb-4 text-center text-xs font-bold text-[#8B7A61]">{offlineSaved ? 'Saved free story · offline. Reconnect to save your star.' : 'Free story saved for offline bedtime.'}</p>}
    <AnimatePresence mode="wait">
      {stage === 'read' && <motion.section key="reading" initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <div className="sr-only" aria-live="polite" aria-atomic="true">{lastPage ? 'The End. God’s love goes with you.' : `Page ${pageIndex + 1} of ${story.pages.length}. ${page.text}`}</div>
        <div className="mb-5 text-center"><p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#A08966]">Tonight’s adventure</p><h1 className="display text-2xl font-extrabold text-[#594D3A] sm:text-3xl">{story.title}</h1><span className="mt-2 inline-block rounded-full bg-[#EAF0DE] px-3 py-1 text-xs font-bold text-[#73886D]">{story.verse}</span></div>
        <div className="overflow-hidden rounded-[32px] border-[3px] border-[#E2D7BF] bg-[#FFF5DE] shadow-[0_7px_0_#EBE0C8]">
          <AnimatePresence mode="wait">
            <motion.div key={pageIndex} drag={reduceMotion ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.16} onDragEnd={(_, info) => { if (info.offset.x < -70) turnPage(1); if (info.offset.x > 70) turnPage(-1); }} initial={{ opacity: 0, x: reduceMotion ? 0 : 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduceMotion ? 0 : -25 }} transition={{ duration: 0.2 }} className="touch-pan-y">
              <button aria-label="Make the illustration sparkle" className="relative block aspect-[1.6] w-full overflow-hidden bg-[#E6EFDE] sm:aspect-[1.9]" onClick={() => setBounce(old => old + 1)}>
                <motion.div key={bounce} className="h-full w-full" animate={bounce && !reduceMotion ? { scale: [1, 1.04, 0.99, 1] } : { scale: 1 }} transition={{ duration: 0.45 }}>
                  {lastPage ? <div className="relative flex h-full items-center justify-center bg-[#E8E9D4]"><div className="absolute inset-x-0 bottom-0 h-1/3 rounded-t-[70%] bg-[#D6E4C7]" /><Lumo className="relative z-10 -mr-7 h-[65%] w-[43%] rotate-[-10deg]" /><Pip className="relative z-10 h-[63%] w-[43%] rotate-[8deg]" /><Heart className="absolute left-1/2 top-[13%] h-8 w-8 -translate-x-1/2 fill-[#F0A5A4] text-[#D98F8A]" /></div> : <PageIllustration key={pageIndex} page={page} fallback={story.coverScene} />}
                </motion.div>
                {bounce > 0 && !reduceMotion && <motion.span key={`spark-${bounce}`} initial={{ scale: 0, y: 0, opacity: 1 }} animate={{ scale: [0, 1.4, 1], y: -50, opacity: 0 }} transition={{ duration: 0.7 }} className="pointer-events-none absolute left-1/2 top-1/2 text-4xl">✨</motion.span>}
                <span className="absolute bottom-3 right-3 rounded-full bg-[#FFF8E7]/90 px-3 py-1 text-[10px] font-extrabold text-[#8A7759]">Tap for a little magic ✨</span>
              </button>
              <div className="flex min-h-[133px] flex-col items-center justify-center px-6 py-6 text-center sm:min-h-[150px] sm:px-12"><p className="display text-[25px] font-extrabold leading-snug text-[#594D3A] sm:text-[34px]">{lastPage ? 'The End. God’s love goes with you.' : page.text}</p>{lastPage && <p className="mt-2 text-sm font-bold text-[#99866A]">Sweet dreams, little light.</p>}</div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="my-6 flex items-center justify-between gap-3">
          <button onClick={() => turnPage(-1)} disabled={pageIndex === 0} aria-label="Previous page" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#E1D5BC] bg-[#FFF3DA] text-[#837357] transition-transform hover:scale-105 active:scale-95 disabled:opacity-30"><ArrowLeft size={21} /></button>
          <div className="flex flex-wrap items-center justify-center gap-0.5" aria-label="Story pages">{Array.from({ length: story.pages.length + 1 }, (_, i) => <button key={i} onClick={() => setPageIndex(i)} aria-label={`Go to ${i === story.pages.length ? 'the end' : `page ${i + 1}`}`} aria-current={i === pageIndex ? 'step' : undefined} className="flex h-8 min-w-7 items-center justify-center rounded-full"><span className={`block h-3 rounded-full transition-all ${i === pageIndex ? 'w-6 bg-[#CCA54D]' : 'w-3 bg-[#E2D6BD] hover:bg-[#C8B58E]'}`} /></button>)}</div>
          {lastPage ? <button aria-label="Finish story" onClick={() => setStage('celebrate')} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#D9BC62] bg-[#FFD93D] text-[#6B5931] shadow-[0_3px_0_#D9BC62] transition-transform hover:scale-105 active:scale-95"><Check size={22} /></button> : <button onClick={() => turnPage(1)} aria-label="Next page" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#D9BC62] bg-[#FFD93D] text-[#6B5931] shadow-[0_3px_0_#D9BC62] transition-transform hover:scale-105 active:scale-95"><ArrowRight size={21} /></button>}
        </div>
        {lastPage ? <button onClick={() => setStage('celebrate')} className="btn w-full bg-[#FFD93D] px-5 py-4 text-lg font-extrabold text-[#61502E]">I finished my story! <Sparkles size={20} className="ml-2 inline" /></button> : <ReaderAudio key={pageIndex} page={page} label={`page ${pageIndex + 1}`} />}
        <p className="mt-4 text-center text-xs font-bold text-[#A0927B]">{lastPage ? 'A tiny story. A whole lot of love.' : `Page ${pageIndex + 1} of ${story.pages.length} · Swipe or use the arrows`}</p>
      </motion.section>}

      {stage === 'celebrate' && <motion.section key="celebrate" initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-lg py-8 text-center">
        <Confetti />
        <div className="relative mx-auto mb-7 flex h-60 w-60 items-center justify-center rounded-full bg-[#FAEDBD]"><motion.div animate={reduceMotion ? {} : { y: [0, -16, 0], rotate: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 1.7 }}><Lumo className="h-52 w-52" /></motion.div><span className="absolute -right-1 top-8 text-4xl">✨</span><span className="absolute bottom-4 left-0 text-3xl">⭐</span></div>
        <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.17em] text-[#A18A58]">One lovely bedtime moment</p><h1 className="display text-4xl font-extrabold text-[#594D3A]">You did it{name}!</h1><p className="mt-4 text-xl font-extrabold text-[#A1853E]">You earned a star! ⭐</p><p className="mx-auto mb-8 mt-3 max-w-xs leading-relaxed text-[#8B7A61]">Lumo is doing a happy dance. Let’s remember what made this story special.</p><button onClick={() => { setStage(story.quiz.length ? 'quiz' : 'color'); }} className="btn w-full bg-[#FFD93D] px-6 py-4 text-lg font-extrabold text-[#61502E]">Let’s wonder together <ArrowRight size={19} className="ml-2 inline" /></button>
      </motion.section>}

      {stage === 'quiz' && question && <motion.section key={`quiz-${questionIndex}`} initial={{ opacity: 0, y: reduceMotion ? 0 : 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto max-w-lg pt-3">
        <div className="mb-5 flex items-center justify-center gap-3">{story.quiz.map((_, i) => <span key={i} className={`flex h-9 w-9 items-center justify-center rounded-full border-[3px] text-sm font-extrabold ${i < questionIndex ? 'border-[#A1BD8E] bg-[#C3E8BD] text-[#638457]' : i === questionIndex ? 'border-[#D9BB64] bg-[#FFD93D] text-[#80682E]' : 'border-[#E5D8BD] bg-[#F5EAD3] text-[#AB9B7D]'}`}>{i < questionIndex ? <Check size={17} /> : i + 1}</span>)}</div>
        <div className="mb-4 text-center"><motion.div className="mx-auto h-32 w-32" animate={correct && !reduceMotion ? { y: [0, -16, 0], rotate: [-5, 5, 0] } : { y: 0 }} transition={{ duration: 0.5 }}><Pip className="h-full w-full" /></motion.div><p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#A08B6B]">What did we learn?</p><h1 className="display text-3xl font-extrabold leading-tight text-[#594D3A]">{question.question}</h1></div>
        <div className="mt-7 space-y-3">{question.answers.map((answer, i) => <motion.button key={i} whileHover={{ scale: reduceMotion ? 1 : 1.015 }} whileTap={{ scale: reduceMotion ? 1 : 0.98 }} disabled={correct} onClick={() => { setSelectedAnswer(i); setCorrect(i === question.correctIndex); }} className={`flex min-h-[72px] w-full items-center gap-4 rounded-[24px] border-[3px] px-5 py-4 text-left text-lg font-extrabold shadow-[0_4px_0_#E8DDC7] transition-colors ${selectedAnswer === i ? correct ? 'border-[#9DBE92] bg-[#DDF0CF] text-[#577B4D]' : 'border-[#E2BA9B] bg-[#FFE4C4] text-[#916F50]' : 'border-[#E2D7C0] bg-[#FFF3DA] text-[#756348]'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm ${selectedAnswer === i && correct ? 'border-[#8CAB80] bg-[#C3E8BD]' : 'border-[#DAD0B9] bg-[#FFF8E7]'}`}>{selectedAnswer === i && correct ? <Check size={19} /> : String.fromCharCode(65 + i)}</span>{answer}</motion.button>)}</div>
        <div aria-live="polite" className="min-h-20 py-5 text-center font-extrabold">{selectedAnswer !== null && (correct ? <p className="text-[#739566]">That’s it! Pip is cheering for you. 💚</p> : <p className="text-[#AA825A]">Good thinking! Let’s try another one. 🌷</p>)}</div>
        {correct && <button onClick={() => { if (questionIndex + 1 < story.quiz.length) { setQuestionIndex(i => i + 1); setSelectedAnswer(null); setCorrect(false); } else setStage('color'); }} className="btn w-full bg-[#FFD93D] px-6 py-4 text-lg font-extrabold text-[#61502E]">{questionIndex + 1 < story.quiz.length ? 'One more little wonder' : 'Time for a little coloring'} <ArrowRight size={19} className="ml-2 inline" /></button>}
      </motion.section>}

      {stage === 'color' && <motion.section key="color" initial={{ opacity: 0, y: reduceMotion ? 0 : 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto max-w-2xl">
        <div className="mb-6 text-center"><p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#A08B6B]">A colorful little keepsake</p><h1 className="display text-3xl font-extrabold text-[#594D3A]">Make a little masterpiece</h1><p className="mt-2 text-sm text-[#8B7A61]">{story.coverScene === 'ark' ? 'A little boat and a rainbow promise. All the colors are yours!' : story.coverScene === 'stars' ? 'A cozy tent beneath a sky of promises. Let your colors shine!' : story.coverScene === 'sea' ? 'A big friendly fish and a sea of wonder. Make a colorful splash!' : ['garden', 'kindness'].includes(story.coverScene) ? 'A garden full of wonderful things. Help every flower bloom!' : 'A peaceful meadow and your friend Pip. All the colors are yours!'}</p></div>
        <ColoringCanvas storyTitle={story.title} scene={story.coverScene} busy={saving} onFinish={async dataUrl => { setSaveError(''); if ((offlineSaved || !isDemo) && !navigator.onLine) { setSaveError('Reconnect to save your star and add your sticker. Your drawing is still here.'); return; } setSaving(true); try { await completeStory(story.id, dataUrl); setStage('collected'); } catch (saveFailure) { setSaveError(saveFailure instanceof Error ? saveFailure.message : 'We couldn’t save your sticker. Please try again.'); } finally { setSaving(false); } }} />
        {saveError && <p role="alert" className="mt-3 text-center text-sm font-bold text-[#A06B4E]">{saveError}</p>}
      </motion.section>}

      {stage === 'collected' && <motion.section key="collected" initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-lg py-8 text-center"><Confetti /><div className="relative mx-auto mb-7 flex h-60 w-60 items-center justify-center rounded-[48px] border-[3px] border-dashed border-[#D9BD75] bg-[#F8EDC5]"><Lumo className="h-44 w-44" /><span className="absolute -bottom-3 -right-3 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#9DBD8F] bg-[#C3E8BD] text-[#66835B]"><Check size={28} /></span></div><p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#A18A58]">A little light to keep forever</p><h1 className="display text-4xl font-extrabold text-[#594D3A]">Your sticker is home!</h1><p className="mb-8 mt-4 leading-relaxed text-[#8B7A61]">A story, a star, and a beautiful memory.<br />Sleep well{name}. You are so loved.</p><Link href="/stickers" className="btn block w-full bg-[#FFD93D] px-6 py-4 text-lg font-extrabold text-[#61502E]">Open my sticker book <Sparkles size={19} className="ml-2 inline" /></Link><Link href="/" className="mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-[#8B7A61]"><ChevronLeft size={17} />Back to our little home</Link></motion.section>}
    </AnimatePresence>
  </main>;
}
