'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight, Heart, LoaderCircle, Mail, Moon, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import type { Completion, Profile, Story } from '@/lib/types';
import { Lumo, Pip } from './illustrations';

type Context = {
  profile: Profile | null; progress: Completion[]; isDemo: boolean; subscribed: boolean;
  stickers: {stickerId: string; earnedAt: string}[];
  completeStory: (id: string, coloringDataUrl?: string) => Promise<void>;
  hasAccess: (story: Story) => boolean; openPaywall: () => void;
  openOnboarding: (next?: string) => void; updateProfile: (profile: Profile) => Promise<void>;
  startStory: (story: Story) => void; notify: (message: string) => void;
};
const AppContext = createContext<Context | null>(null);
const STORAGE_KEY = 'little-lights-family-v1';
export function useApp() { const context = useContext(AppContext); if (!context) throw new Error('AppProvider is required'); return context; }

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Completion[]>([]);
  const [stickers, setStickers] = useState<{stickerId: string; earnedAt: string}[]>([]);
  const [isDemo, setIsDemo] = useState(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const [subscribed, setSubscribed] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [nextRoute, setNextRoute] = useState<string>();
  const [paywall, setPaywall] = useState(false);
  const [toast, setToast] = useState('');
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const notify = useCallback((message: string) => { setToast(message); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(()=>setToast(''),4500); }, []);

  useEffect(()=>{
    const loadPreview=()=>{try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { const data=JSON.parse(saved); setProfile(data.profile || null); setProgress(Array.isArray(data.progress)?data.progress:[]); setStickers(Array.isArray(data.stickers)?data.stickers:[]); } } catch { /* A fresh family can still start when storage is unavailable. */ }};
    if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)loadPreview();
    setReady(true);
    fetch('/api/account').then(async r=>{
      if (r.status===503) {setIsDemo(true);loadPreview();return;}
      setIsDemo(false);
      if (!r.ok) {if(r.status===401){setProfile(null);setProgress([]);setStickers([]);setSubscribed(false);}return;}
      const data=await r.json(); const user=data.user;
      if (user) {
        setProfile({kidName:user.kid_name||user.kidName||'Little light',kidAge:user.kid_age||user.kidAge||5,email:user.email||'',bedtime:(user.bedtime||'19:30').slice(0,5)});
        setSubscribed(['active','trialing'].includes(user.subscriptionStatus));
        setProgress(data.progress||[]);
        setStickers(data.stickers||[]);
      }
    }).catch(()=>notify('You’re offline. Your saved adventures are still here.'));
    if ('serviceWorker' in navigator && process.env.NODE_ENV==='production') navigator.serviceWorker.register('/sw.js').catch(()=>{});
    return ()=>clearTimeout(toastTimer.current);
  },[notify]);
  useEffect(()=>{
    if (!ready || !isDemo) return;
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify({profile,progress,stickers})); }
    catch { notify('Your browser couldn’t save this drawing. Download it to keep it.'); }
  },[profile,progress,stickers,ready,isDemo,notify]);
  useEffect(()=>{
    if(new URLSearchParams(window.location.search).get('checkout')!=='success')return;
    let attempts=0;
    notify('Confirming your plan securely. Your adventures unlock when Stripe confirms payment.');
    const timer=setInterval(async()=>{
      attempts++;
      try{const response=await fetch('/api/account');if(response.ok){const data=await response.json();if(['active','trialing'].includes(data.user?.subscriptionStatus)){setSubscribed(true);clearInterval(timer);notify('Little Lights Plus is ready. Let the adventures begin!');}}}catch{/* A later retry can finish payment confirmation. */}
      if(attempts>=15){clearInterval(timer);notify('Payment confirmation is still pending. Refresh your parent dashboard in a moment.');}
    },2000);
    return()=>clearInterval(timer);
  },[notify]);

  async function updateProfile(value:Profile) {
    if (!isDemo) {
      const response=await fetch('/api/account',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
      if (!response.ok) { const data=await response.json(); throw new Error(data.error||'Please sign in to save your family settings.'); }
    }
    setProfile(value);
  }
  const completeStory = async (id:string,coloringDataUrl?:string) => {
    if (!isDemo) {
      const response=await fetch('/api/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({storyId:id,coloringDataUrl})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'We couldn’t sync your star. Please try again.');
      const account=await fetch('/api/account');if(!account.ok)throw new Error('Your star was saved. Please reconnect to refresh your sticker book.');
      const data=await account.json();setProgress(data.progress||[]);setStickers(data.stickers||[]);
      if(!subscribed&&new Set(progress.map(p=>p.storyId)).size<3&&new Set((data.progress||[]).map((p:Completion)=>p.storyId)).size>=3)setTimeout(()=>setPaywall(true),2000);
      return;
    }
    const today=new Date().toLocaleDateString('en-CA');
    const existing=progress.find(p=>p.storyId===id&&new Date(p.completedAt).toLocaleDateString('en-CA')===today);
    if(existing)setProgress(previous=>previous.map(p=>p===existing?{...p,coloringDataUrl:coloringDataUrl||p.coloringDataUrl}:p));
    else setProgress(previous=>[...previous,{storyId:id,completedAt:new Date().toISOString(),coloringDataUrl}]);
    if(!existing&&stickers.length<30)setStickers(previous=>[...previous,{stickerId:String(previous.length),earnedAt:new Date().toISOString()}]);
    if(new Set(progress.map(p=>p.storyId)).size<3&&new Set([...progress.map(p=>p.storyId),id]).size>=3)setTimeout(()=>setPaywall(true),2000);
  };
  const hasAccess=(story:Story)=>story.isFree||subscribed;
  const openOnboarding=(next?:string)=>{setNextRoute(next);setOnboarding(true);};
  const startStory=(story:Story)=>{
    if (!hasAccess(story)) {setPaywall(true);return;}
    if (!profile) {openOnboarding('/read/'+story.id);return;}
    router.push('/read/'+story.id);
  };
  return <AppContext.Provider value={{profile,progress,stickers,isDemo,subscribed,completeStory,hasAccess,openPaywall:()=>setPaywall(true),openOnboarding,updateProfile,startStory,notify}}>
    {children}
    <HeartPops />
    <AnimatePresence>{onboarding&&<Onboarding onClose={()=>setOnboarding(false)} onSave={async value=>{
      if(isDemo) {await updateProfile(value);setOnboarding(false);if(nextRoute)router.push(nextRoute);}
      else {const r=await fetch('/api/auth/sign-in',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:value.email,kidName:value.kidName,kidAge:value.kidAge,bedtime:value.bedtime})}); const data=await r.json();if(!r.ok)throw new Error(data.error||'Couldn’t send your sign-in link.');setProfile(value);notify('Check your parent email for a secure sign-in link.');setOnboarding(false);}
    }} />}</AnimatePresence>
    <AnimatePresence>{paywall&&<Paywall onClose={()=>setPaywall(false)} />}</AnimatePresence>
    <AnimatePresence>{toast&&<motion.div role="status" initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} exit={{y:50,opacity:0}} className="toast"><Lumo className="h-9 w-9 shrink-0"/>{toast}<button onClick={()=>setToast('')} aria-label="Dismiss message"><X size={16}/></button></motion.div>}</AnimatePresence>
  </AppContext.Provider>;
}

function Onboarding({onClose,onSave}:{onClose:()=>void;onSave:(value:Profile)=>Promise<void>}) {
  const [step,setStep]=useState(0); const [form,setForm]=useState<Profile>({kidName:'',kidAge:5,email:'',bedtime:'19:30'}); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  return <Modal onClose={onClose} label="Welcome to Little Lights">
    <div className="flex justify-center items-end h-36"><Lumo className="h-36 w-36 animate-float"/><Pip className="h-28 w-28 -ml-5"/></div>
    <span className="eyebrow text-center block">A little ritual. A lifetime of love.</span>
    <h2 className="text-center text-4xl mt-2">{step===0?'Ready for tonight’s adventure?':'Make bedtime their time.'}</h2>
    <p className="text-center text-muted my-4">{step===0?'Meet Lumo & Pip, your new bedtime buddies. Let’s get to know your little light.':'A few little details for a more magical bedtime.'}</p>
    <form onSubmit={async e=>{e.preventDefault();if(!step){setStep(1);return;}setBusy(true);setError('');try{await onSave(form);}catch(error){setError(error instanceof Error?error.message:'Oops! Let’s try again.');}finally{setBusy(false);}}} className="space-y-4">
      {step===0?<><label className="field-label">Little one’s first name<input autoFocus required maxLength={30} placeholder="e.g. Oliver" value={form.kidName} onChange={e=>setForm({...form,kidName:e.target.value})}/></label><label className="field-label">Their age<select value={form.kidAge} onChange={e=>setForm({...form,kidAge:Number(e.target.value)})}>{[3,4,5,6,7].map(age=><option key={age} value={age}>{age} years old</option>)}</select></label></>:<><label className="field-label"><span className="flex gap-2"><Moon size={17}/> Bedtime</span><input required type="time" value={form.bedtime} onChange={e=>setForm({...form,bedtime:e.target.value})}/></label><label className="field-label"><span className="flex gap-2"><Mail size={17}/> Parent’s email</span><input required type="email" placeholder="grownup@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><p className="text-xs text-muted flex gap-2"><ShieldCheck size={25}/> Grown-ups only. No ads, no public profiles, just a little wonder. By continuing you confirm you’re the parent or guardian.</p></>}
      {error&&<p role="alert" className="error-message">{error}</p>}
      <button disabled={busy} className="btn btn-yellow w-full" type="submit">{busy?<LoaderCircle className="animate-spin"/>:step===0?'Meet your bedtime buddies':'Let the adventures begin'}<ChevronRight size={20}/></button>
      {step===1&&<button type="button" className="text-sm underline w-full" onClick={()=>setStep(0)}>Back</button>}
    </form>
  </Modal>;
}

export function Modal({children,onClose,label,wide=false}:{children:React.ReactNode;onClose:()=>void;label:string;wide?:boolean}) {
  const dialogRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const active=document.activeElement as HTMLElement|null;
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
    const handler=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const focusables=dialogRef.current?.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href]');if(!focusables?.length)return;const first=focusables[0],last=focusables[focusables.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
    document.addEventListener('keydown',handler);dialogRef.current?.focus();
    return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',handler);active?.focus();};
  },[onClose]);
  return <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}><motion.div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} initial={{y:30,scale:.95}} animate={{y:0,scale:1}} exit={{y:30,opacity:0}} className={`modal-panel ${wide?'max-w-2xl':'max-w-md'}`} onClick={e=>e.stopPropagation()}><button className="icon-btn absolute right-4 top-4 z-10" onClick={onClose} aria-label="Close dialog"><X size={20}/></button>{children}</motion.div></motion.div>;
}

function Paywall({onClose}:{onClose:()=>void}) {
  const {isDemo,profile,openOnboarding}=useApp(); const [plan,setPlan]=useState<'monthly'|'yearly'>('yearly');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  return <Modal onClose={onClose} label="Unlock more bedtime adventures" wide>
    <Lumo className="h-24 w-24 mx-auto" mood="sad"/><p className="eyebrow text-center">For your grown-up</p><h2 className="text-center text-4xl mt-2">More wonder. Every night.</h2><p className="text-center text-muted my-3">Want more adventures? Ask a grown-up to unlock the story library!</p>
    <div className="grid grid-cols-2 gap-3 mt-6">{(['monthly','yearly'] as const).map(p=><button key={p} onClick={()=>setPlan(p)} className={`plan-card ${plan===p?'selected':''}`}><span className="text-sm font-extrabold">{p==='yearly'?'YEARLY · SAVE 49%':'MONTHLY'}</span><span className="block font-display text-4xl my-2">{p==='yearly'?'$49':'$7.99'}<span className="text-base">/{p==='yearly'?'year':'mo'}</span></span><span className="text-xs">{p==='yearly'?'Just $4.08 a month':'A little joy, month by month'}</span>{plan===p&&<Check className="absolute right-2 top-2" size={17}/>}</button>)}</div>
    <div className="grid grid-cols-2 gap-2 my-5 text-sm">{['Every published story','New adventures as added','Story audio support','Coloring & sticker book','Offline saved free stories','Cancel any time'].map(feature=><span className="flex gap-2 items-center" key={feature}><Check size={16} className="text-green-700 shrink-0"/>{feature}</span>)}</div>
    <div className="grid grid-cols-3 gap-2 my-5">{[['“Our favorite bedtime ritual.”','Sarah, mom of 2'],['“Little stories, big conversations.”','Emily, mom of 1'],['“A calmer end to the day.”','Jess, mom of 3']].map(([quote,name])=><div key={name} className="rounded-2xl bg-[#F5EEDB] p-3 text-center"><p className="text-amber-600 tracking-widest text-xs">★★★★★</p><p className="text-xs font-bold mt-1">{quote}</p><p className="text-[10px] text-muted mt-2">{name}</p></div>)}</div><p className="text-[10px] text-center text-muted">Illustrative testimonials · replaced with verified reviews before launch</p>
    {isDemo&&<p className="text-xs text-muted my-3 bg-[#FFF0CC] rounded-xl p-3">Preview mode: explore 3 free stories. Paid checkout becomes available once the owner connects Supabase and Stripe. No payment will be taken here.</p>}
    {error&&<p role="alert" className="error-message mb-3">{error}</p>}
    <button className="btn btn-yellow w-full mt-4" disabled={busy||isDemo} onClick={async()=>{if(!profile){onClose();openOnboarding();return;}setBusy(true);setError('');try{const r=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan})});const data=await r.json();if(!r.ok)throw new Error(data.error||'Checkout could not be opened.');if(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY&&data.sessionId){const stripe=await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);if(!stripe)throw new Error('Stripe could not be loaded. Please try again.');const result=await stripe.redirectToCheckout({sessionId:data.sessionId});if(result.error)throw new Error(result.error.message);return;}window.location.assign(data.url);}catch(e){setError(e instanceof Error?e.message:'Oops! Let’s try again.');setBusy(false);}}}>{busy?<LoaderCircle className="animate-spin"/>:<Sparkles size={20}/>} {isDemo?'Checkout needs owner setup':'Unlock our next chapter'}</button><p className="text-xs text-center text-muted mt-3">Secure checkout with Stripe. Renews until canceled.</p>
  </Modal>;
}

function HeartPops() {
  const [pops,setPops]=useState<{id:number;x:number;y:number}[]>([]);
  useEffect(()=>{const handler=(e:PointerEvent)=>{if(e.pointerType==='mouse'&&e.button!==0||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const id=Date.now();setPops(p=>[...p.slice(-4),{id,x:e.clientX,y:e.clientY}]);setTimeout(()=>setPops(p=>p.filter(item=>item.id!==id)),700);};document.addEventListener('pointerdown',handler);return()=>document.removeEventListener('pointerdown',handler);},[]);
  return <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">{pops.map(p=><motion.span key={p.id} className="absolute text-[#E89C99]" style={{left:p.x-8,top:p.y-8}} initial={{scale:.3,opacity:1,y:0}} animate={{scale:1.2,opacity:0,y:-55}} transition={{duration:.7}}><Heart size={19} fill="currentColor"/></motion.span>)}</div>;
}
