'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, BookOpen, Check, ChevronRight, ImagePlus, Loader2, LockKeyhole, LogOut, Mic, Pencil, Plus, Search, ShieldCheck, Sparkles, Trash2, X } from 'lucide-react';
import type { Story } from '@/lib/types';
import styles from './admin.module.css';

type Session = { authenticated: boolean; configured: boolean };
type ApiError = { error?: string };

function mediaUrl(value: string) {
  return value.startsWith('storage://') ? `/api/admin/media?path=${encodeURIComponent(value)}` : value;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin', ...init });
  const result = await response.json().catch(() => ({})) as T & ApiError;
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status}). Please try again.`);
  return result;
}

function makeStory(): Story {
  return {
    id: crypto.randomUUID(), title: '', verse: '', description: '', theme: 'kindness', minutes: 3,
    ageGroup: '3–7', coverScene: 'ark', isFree: false, status: 'draft',
    pages: [{ text: '', scene: 'ark' }, { text: '', scene: 'ark' }],
    quiz: [0, 1].map(() => ({ question: '', answers: ['', '', ''], correctIndex: 0 })),
  };
}

function validate(story: Story): string | null {
  if (!story.title.trim()) return 'Give your story a title.';
  if (!story.verse.trim()) return 'Add a Bible verse reference.';
  if (!story.description.trim()) return 'Add a short description for parents.';
  if (story.pages.length < 2) return 'Add at least two story pages.';
  for (let i = 0; i < story.pages.length; i++) {
    const words = story.pages[i].text.trim().split(/\s+/).filter(Boolean).length;
    if (words < 1 || words > 10) return `Page ${i + 1} needs 1–10 words. It currently has ${words}.`;
  }
  if (story.quiz.length !== 2) return 'Add exactly two questions.';
  for (let i = 0; i < story.quiz.length; i++) {
    const quiz = story.quiz[i];
    if (!quiz.question.trim() || quiz.answers.length !== 3 || quiz.answers.some(answer => !answer.trim())) return `Complete question ${i + 1} and all three answers.`;
    if (quiz.correctIndex < 0 || quiz.correctIndex > 2) return `Choose the correct answer for question ${i + 1}.`;
  }
  return null;
}

export function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionError, setSessionError] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<{ story: Story; isNew: boolean } | null>(null);

  const loadStories = useCallback(async () => {
    setLoadingStories(true);
    setError('');
    try {
      const data = await request<{ stories: Story[] }>('/api/admin/stories');
      setStories(data.stories);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load stories.'); }
    finally { setLoadingStories(false); }
  }, []);

  const loadSession = useCallback(async () => {
    setSessionError('');
    try {
      const data = await request<Session>('/api/admin/session');
      setSession(data);
      if (data.authenticated) await loadStories();
    } catch (cause) { setSessionError(cause instanceof Error ? cause.message : 'Could not check your session.'); }
  }, [loadStories]);

  useEffect(() => { void loadSession(); }, [loadSession]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setLoggingIn(true); setError('');
    try {
      await request('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      setPassword('');
      await loadSession();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not sign in.'); }
    finally { setLoggingIn(false); }
  }

  async function logout() {
    setError('');
    try {
      await request('/api/admin/logout', { method: 'POST' });
      setSession(previous => ({ authenticated: false, configured: previous?.configured ?? true }));
      setStories([]); setEditor(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not sign out.'); }
  }

  const filteredStories = stories.filter(story => `${story.title} ${story.verse} ${story.ageGroup}`.toLowerCase().includes(query.toLowerCase()));

  return <div className={styles.screen}>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><span className={styles.logo}>✦</span><span>little lights<span className={styles.brandSub}>STORY STUDIO</span></span></Link>
      {session?.authenticated ? <button className={styles.smallButton} onClick={() => void logout()}><LogOut size={17} /> Sign out</button> : <Link href="/" className={styles.back}><ArrowLeft size={17} /> Back to adventures</Link>}
    </header>

    {(!session || !session.authenticated) ? <main className={styles.gate}>
      <div className={styles.gateStar} aria-hidden="true">✦<span>✧</span></div>
      <div className={styles.kicker}><LockKeyhole size={14} /> A LITTLE SPACE FOR GROWN-UPS</div>
      <h1>Good stories<br />start here.</h1>
      <p className={styles.gateIntro}>Welcome to the Story Studio. A cozy place to create tomorrow’s bedtime adventure.</p>
      {sessionError && <div className={styles.alert} role="alert">{sessionError}<button onClick={() => void loadSession()}>Try again</button></div>}
      {!session && !sessionError && <div className={styles.loading}><Loader2 className={styles.spin} /> Checking your studio session…</div>}
      {session && !session.configured && <div className={styles.setup}>
        <ShieldCheck size={28} /><h2>Your studio is safely locked.</h2>
        <p>To enable publishing, configure <code>ADMIN_PASSWORD</code>, <code>ADMIN_SESSION_SECRET</code>, and your Supabase service credentials on the server. Run the database migration in <code>supabase/</code>, then restart the app.</p>
        <p>Only server-side credentials can unlock this studio. Your family-facing app is available in demo mode.</p>
        <button className={styles.smallButton} onClick={() => void loadSession()}>Check configuration again</button>
      </div>}
      {session?.configured && <form onSubmit={login} className={styles.loginForm}>
        <label htmlFor="studio-password">Studio password</label>
        <input id="studio-password" type="password" autoComplete="current-password" placeholder="Your grown-up secret" value={password} onChange={event => setPassword(event.target.value)} required maxLength={256} />
        {error && <p className={styles.errorText} role="alert">{error}</p>}
        <button className={styles.primary} type="submit" disabled={loggingIn}>{loggingIn ? <Loader2 className={styles.spin} size={19} /> : <LockKeyhole size={19} />} {loggingIn ? 'Opening the studio…' : 'Enter the story studio'}<ChevronRight size={19} /></button>
        <p className={styles.security}><ShieldCheck size={14} /> Protected with a secure, server-verified session.</p>
      </form>}
    </main> : <main className={styles.workspace}>
      <div className={styles.breadcrumb}>STORY STUDIO <ChevronRight size={13} /> YOUR LIBRARY</div>
      <div className={styles.pageHeading}><div><div className={styles.kicker}>LITTLE STORIES. BIG WONDER.</div><h1>Your story shelf <span>✦</span></h1><p>A little kindness, a little courage, and a whole lot of bedtime magic.</p></div><button className={styles.primary} onClick={() => { setNotice(''); setEditor({ story: makeStory(), isNew: true }); }}><Plus size={20} /> Create a story</button></div>
      <div className={styles.stats}>
        <div><span className={styles.statIcon}><BookOpen size={22} /></span><div><strong>{stories.length}</strong><span>Stories on the shelf</span></div></div>
        <div><span className={`${styles.statIcon} ${styles.green}`}><Check size={22} /></span><div><strong>{stories.filter(story => story.status === 'published').length}</strong><span>Ready for little readers</span></div></div>
        <div><span className={`${styles.statIcon} ${styles.blue}`}><Pencil size={21} /></span><div><strong>{stories.filter(story => story.status === 'draft').length}</strong><span>Adventures in the making</span></div></div>
      </div>
      {error && <div className={styles.alert} role="alert">{error}<button onClick={() => void loadStories()}>Try again</button></div>}
      {notice && <div className={styles.success} role="status"><Check size={18} />{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={16} /></button></div>}
      <section className={styles.library} aria-label="Story library">
        <div className={styles.libraryHeader}><div><h2>All adventures <span>{stories.length}</span></h2><p>Every great bedtime starts with a good story.</p></div><label className={styles.search}><Search size={18} /><input aria-label="Search stories" placeholder="Find a little adventure…" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
        {loadingStories ? <div className={styles.empty}><Loader2 className={styles.spin} size={30} /><h3>Gathering your stories…</h3></div> : filteredStories.length ? <div className={styles.tableScroll}><table className={styles.table}><thead><tr><th>STORY</th><th>BIBLE VERSE</th><th>AGE GROUP</th><th>STATUS</th><th><span className={styles.srOnly}>Actions</span></th></tr></thead><tbody>{filteredStories.map((story, index) => <tr key={story.id}>
          <td><div className={styles.storyTitle}><span className={styles.storyIcon} style={{ background: ['#FFE4C4', '#C3E8BD', '#A8D8EA', '#F4D7ED'][index % 4] }}>✦</span><div><strong>{story.title}</strong><span>{story.minutes} min · {story.isFree ? 'Free adventure' : 'Little Lights Plus'}</span></div></div></td>
          <td>{story.verse}</td><td>Ages {story.ageGroup}</td><td><span className={`${styles.badge} ${story.status === 'published' ? styles.published : styles.draft}`}><span />{story.status === 'published' ? 'Published' : 'Draft'}</span></td>
          <td><button className={styles.editButton} aria-label={`Edit ${story.title}`} onClick={() => { setNotice(''); setEditor({ story: structuredClone(story), isNew: false }); }}><Pencil size={16} /><span>Edit</span></button></td>
        </tr>)}</tbody></table></div> : <div className={styles.empty}><span className={styles.emptyStar}>✦</span><h3>{query ? 'That adventure is hiding!' : 'A shelf full of possibility.'}</h3><p>{query ? 'Try another title or Bible verse.' : 'Create your first story and make a little reader’s night.'}</p>{!query && <button className={styles.smallButton} onClick={() => setEditor({ story: makeStory(), isNew: true })}><Plus size={17} /> Create your first adventure</button>}</div>}
      </section>
      <p className={styles.footerNote}><Sparkles size={16} /> Made with love. Read with wonder.</p>
    </main>}
    {editor && <StoryEditor initial={editor.story} isNew={editor.isNew} onClose={() => setEditor(null)} onSaved={async () => { setEditor(null); setNotice('Your story is saved. A little more wonder in the world!'); await loadStories(); }} />}
  </div>;
}

function StoryEditor({ initial, isNew, onClose, onSaved }: { initial: Story; isNew: boolean; onClose: () => void; onSaved: () => Promise<void> }) {
  const [story, setStory] = useState<Story>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'details' | 'pages' | 'quiz'>('details');
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  function field<K extends keyof Story>(name: K, value: Story[K]) { setDirty(true); setStory(previous => ({ ...previous, [name]: value })); }
  function page(index: number, value: Partial<Story['pages'][number]>) { field('pages', story.pages.map((item, i) => i === index ? { ...item, ...value } : item)); }
  function quiz(index: number, value: Partial<Story['quiz'][number]>) { field('quiz', story.quiz.map((item, i) => i === index ? { ...item, ...value } : item)); }
  function close() { if (dirty) setConfirmClose(true); else onClose(); }

  useEffect(() => {
    const previous = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLElement>('input, button')?.focus();
    return () => { document.body.style.overflow = previous; previouslyFocused?.focus(); };
  }, []);

  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving && !uploading) {
        event.preventDefault();
        if (confirmClose) setConfirmClose(false);
        else if (dirty) setConfirmClose(true);
        else onClose();
      }
      if (event.key !== 'Tab') return;
      const root = confirmClose ? dialogRef.current?.querySelector('[role="alertdialog"]') : dialogRef.current;
      const focusable = root?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]');
      const elements = Array.from(focusable || []).filter(element => element.offsetParent !== null);
      const first = elements[0]; const last = elements[elements.length - 1];
      if (!first) return;
      if (event.shiftKey && (document.activeElement === first || !root?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !root?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', keyboard);
    return () => document.removeEventListener('keydown', keyboard);
  }, [confirmClose, dirty, onClose, saving, uploading]);

  async function upload(index: number, kind: 'image' | 'audio', file?: File) {
    if (!file) return;
    const maxSize = kind === 'image' ? 5_000_000 : 20_000_000;
    if (file.size > maxSize) { setError(`${kind === 'image' ? 'Images' : 'Audio files'} must be smaller than ${kind === 'image' ? '5' : '20'} MB.`); return; }
    const supported = kind === 'image' ? ['image/png', 'image/jpeg', 'image/webp'] : ['audio/mpeg'];
    if (!supported.includes(file.type)) { setError(kind === 'image' ? 'Choose a PNG, JPG, or WebP image.' : 'Choose an MP3 audio file.'); return; }
    setUploading(`${index}-${kind}`); setError('');
    try {
      const form = new FormData(); form.append('file', file); form.append('kind', kind);
      const data = await request<{ url: string }>('/api/admin/upload', { method: 'POST', body: form });
      setDirty(true);
      setStory(previous => ({ ...previous, pages: previous.pages.map((item, i) => i === index ? { ...item, [kind === 'image' ? 'imageUrl' : 'audioUrl']: data.url } : item) }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Upload failed. Please try again.'); }
    finally { setUploading(null); }
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setError('');
    const message = validate(story);
    if (message) { setError(message); if (message.startsWith('Page') || message.includes('story page')) setTab('pages'); else if (message.includes('question') || message.includes('questions')) setTab('quiz'); else setTab('details'); return; }
    setSaving(true);
    try {
      await request('/api/admin/stories', { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(story) });
      await onSaved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Your story could not be saved.'); }
    finally { setSaving(false); }
  }

  return <div className={styles.overlay}><section ref={dialogRef} className={styles.editor} role="dialog" aria-modal="true" aria-labelledby="story-editor-title">
    <header className={styles.editorHeader}><div><div className={styles.kicker}>A LITTLE ADVENTURE IN THE MAKING</div><h2 id="story-editor-title">{isNew ? 'Create a bedtime story' : 'A little story polish'}</h2></div><button className={styles.close} onClick={close} aria-label="Close story editor" disabled={saving || !!uploading}><X size={23} /></button></header>
    <form onSubmit={save} className={styles.editorForm}>
      <nav className={styles.tabs} aria-label="Story editor sections">{(['details', 'pages', 'quiz'] as const).map((item, index) => <button type="button" key={item} className={tab === item ? styles.activeTab : ''} onClick={() => setTab(item)}><span>{index + 1}</span>{item === 'details' ? 'The story' : item === 'pages' ? 'Story pages' : 'Little lessons'}</button>)}</nav>
      <div className={styles.editorBody}>
        {error && <div className={styles.alert} role="alert">{error}</div>}
        {tab === 'details' && <div className={styles.fields}>
          <label>Story title<input value={story.title} onChange={event => field('title', event.target.value)} placeholder="A little title with a lot of heart" maxLength={100} /></label>
          <div className={styles.fieldRow}><label>Bible verse<input value={story.verse} onChange={event => field('verse', event.target.value)} placeholder="Genesis 6–9" maxLength={100} /></label><label>Reading time <span>(minutes)</span><input type="number" min={1} max={30} value={story.minutes} onChange={event => field('minutes', Number(event.target.value))} /></label></div>
          <label>Short description<textarea value={story.description} onChange={event => field('description', event.target.value)} placeholder="What little wonder will this story bring?" rows={3} maxLength={500} /><small>For the story shelf and parents. Keep it warm and welcoming.</small></label>
          <div className={styles.fieldRow}><label>Age group<select value={story.ageGroup} onChange={event => field('ageGroup', event.target.value)}><option value="3–7">Ages 3–7</option><option value="3–4">Ages 3–4</option><option value="5–7">Ages 5–7</option></select></label><label>Story theme<select value={story.theme} onChange={event => field('theme', event.target.value as Story['theme'])}>{['trust', 'kindness', 'courage', 'wonder', 'love', 'peace'].map(theme => <option key={theme} value={theme}>{theme[0].toUpperCase() + theme.slice(1)}</option>)}</select></label></div>
          <div className={styles.fieldRow}><label>Illustration scene<input value={story.coverScene} onChange={event => field('coverScene', event.target.value)} placeholder="ark, creation, shepherd…" maxLength={50} /><small>Used until you upload custom page illustrations.</small></label><label>Publishing status<select value={story.status} onChange={event => field('status', event.target.value as Story['status'])}><option value="draft">Draft — only in your studio</option><option value="published">Published — ready to read</option></select></label></div>
          <label className={styles.checkbox}><input type="checkbox" checked={story.isFree} onChange={event => field('isFree', event.target.checked)} /><span>Make this a free adventure<small>Available without a Little Lights Plus subscription.</small></span></label>
          <div className={styles.tip}><Sparkles size={19} /><p>Little readers love simple words and big feelings. Tell a faithful Bible story with a gentle, age-appropriate lesson.</p></div>
        </div>}
        {tab === 'pages' && <div className={styles.pageFields}><div className={styles.sectionIntro}><h3>A little wonder on every page.</h3><p>One short sentence per page. A maximum of 10 words keeps bedtime cozy.</p></div>{story.pages.map((item, index) => {
          const count = item.text.trim().split(/\s+/).filter(Boolean).length;
          return <article key={index} className={styles.pageCard}><div className={styles.pageTop}><h4><span>{index + 1}</span>Page {index + 1}{index === 0 && <small>Also used as the cover</small>}</h4><button type="button" className={styles.iconButton} aria-label={`Remove page ${index + 1}`} disabled={story.pages.length <= 2 || !!uploading} onClick={() => field('pages', story.pages.filter((_, i) => i !== index))}><Trash2 size={17} /></button></div>
            <label className={styles.pageText}>Story sentence<textarea value={item.text} maxLength={160} rows={2} placeholder="God filled the sky with twinkling little stars." onChange={event => page(index, { text: event.target.value })} /><span className={count > 10 ? styles.wordError : styles.wordCount}>{count}/10 words</span></label>
            <label className={styles.sceneField}>Fallback illustration scene<input value={item.scene} onChange={event => page(index, { scene: event.target.value })} placeholder={story.coverScene} maxLength={50} /></label>
            <div className={styles.uploadRow}><div className={styles.uploadBox}>{item.imageUrl ? <><img src={mediaUrl(item.imageUrl)} alt={`Illustration for page ${index + 1}`} className={styles.imagePreview} /><button type="button" className={styles.removeAsset} onClick={() => page(index, { imageUrl: undefined })} disabled={!!uploading} aria-label={`Remove page ${index + 1} image`}><X size={14} /></button></> : <ImagePlus size={26} />}<label className={styles.uploadLabel}>{uploading === `${index}-image` ? <><Loader2 size={16} className={styles.spin} /> Uploading…</> : item.imageUrl ? 'Replace illustration' : 'Upload illustration'}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={!!uploading} onChange={event => { void upload(index, 'image', event.target.files?.[0]); event.target.value = ''; }} /></label><small>PNG, JPG, WebP · up to 5 MB</small></div>
              <div className={styles.uploadBox}><Mic size={26} />{item.audioUrl && <><audio controls src={mediaUrl(item.audioUrl)} className={styles.audioPreview} preload="none" /><button type="button" className={styles.removeAsset} onClick={() => page(index, { audioUrl: undefined })} disabled={!!uploading} aria-label={`Remove page ${index + 1} narration`}><X size={14} /></button></>}<label className={styles.uploadLabel}>{uploading === `${index}-audio` ? <><Loader2 size={16} className={styles.spin} /> Uploading…</> : item.audioUrl ? 'Replace narration' : 'Upload warm narration'}<input type="file" accept="audio/mpeg,.mp3" disabled={!!uploading} onChange={event => { void upload(index, 'audio', event.target.files?.[0]); event.target.value = ''; }} /></label><small>MP3 · up to 20 MB · this page only</small></div></div>
          </article>;
        })}<button className={styles.addPage} type="button" disabled={!!uploading || story.pages.length >= 30} onClick={() => field('pages', [...story.pages, { text: '', scene: story.coverScene }])}><Plus size={19} /> Add another little page</button></div>}
        {tab === 'quiz' && <div className={styles.quizFields}><div className={styles.sectionIntro}><h3>Big lessons for little hearts.</h3><p>Two gentle questions, three choices each. Select the circle beside the correct answer.</p></div>{story.quiz.map((item, index) => <article className={styles.quizCard} key={index}><h4><span>{index + 1}</span>Little lesson {index + 1}</h4><label>Question<input value={item.question} onChange={event => quiz(index, { question: event.target.value })} placeholder="What did we learn about being kind?" maxLength={160} /></label><fieldset className={styles.answers}><legend>Answers <small>Choose the correct one</small></legend>{item.answers.map((answer, answerIndex) => <label key={answerIndex} className={item.correctIndex === answerIndex ? styles.correctAnswer : ''}><input type="radio" name={`correct-${index}`} checked={item.correctIndex === answerIndex} onChange={() => quiz(index, { correctIndex: answerIndex })} aria-label={`Answer ${answerIndex + 1} is correct for question ${index + 1}`} /><input aria-label={`Question ${index + 1}, answer ${answerIndex + 1}`} value={answer} onChange={event => quiz(index, { answers: item.answers.map((value, i) => i === answerIndex ? event.target.value : value) })} placeholder={`A little answer ${answerIndex + 1}`} maxLength={120} />{item.correctIndex === answerIndex && <Check size={18} />}</label>)}</fieldset></article>)}</div>}
      </div>
      <footer className={styles.editorFooter}><span><ShieldCheck size={15} />{story.status === 'published' ? 'Saving publishes this adventure.' : 'Drafts stay safely in the studio.'}</span><div><button type="button" className={styles.smallButton} disabled={saving || !!uploading} onClick={close}>Cancel</button><button type="submit" className={styles.primary} disabled={saving || !!uploading}>{saving ? <Loader2 className={styles.spin} size={18} /> : <Check size={18} />}{saving ? 'Saving your story…' : story.status === 'published' ? 'Save & publish' : 'Save story'}</button></div></footer>
    </form>
    {confirmClose && <div className={styles.confirmOverlay}><div className={styles.confirmBox} role="alertdialog" aria-modal="true" aria-labelledby="discard-title"><h3 id="discard-title">Leave this little story?</h3><p>Your unsaved changes will be lost. Uploaded media stays in your storage.</p><div><button className={styles.smallButton} onClick={() => setConfirmClose(false)}>Keep writing</button><button className={styles.primary} onClick={onClose}>Discard changes</button></div></div></div>}
  </section></div>;
}
