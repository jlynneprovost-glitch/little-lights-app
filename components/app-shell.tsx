'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, Heart, Home, Moon, Settings2, Star, Sticker, Volume2, VolumeX } from 'lucide-react';
import { Lumo } from './illustrations';
import { useApp } from './app-provider';

const links = [{href:'/',label:'Home',icon:Home},{href:'/stories',label:'Our stories',icon:BookOpen},{href:'/stickers',label:'Treasure box',icon:Sticker}];

export function AppShell({children}:{children:React.ReactNode}) {
  const path = usePathname();
  const { soundEnabled, toggleSound } = useApp();
  if (path.startsWith('/read/') || path.startsWith('/admin')) return <>{children}</>;
  return <div className="site-wrap">
    <header className="site-header">
      <Link href="/" aria-label="Little Lights home" className="brand"><Lumo className="w-14 h-14"/><span><span className="brand-name">little lights<span className="text-[#D7A431]">.</span></span><span className="brand-tagline">little stories. big love.</span></span></Link>
      <nav aria-label="Main navigation" className="desktop-nav">{links.map(({href,label,icon:Icon})=><Link key={href} href={href} className={path===href?'active':''}><Icon size={20}/>{label}</Link>)}</nav>
      <div className="header-bedtime"><span className="bedtime-moon"><Moon size={24} fill="#F5DA86"/></span><span>shhh…<br/><strong>bedtime time</strong></span><button className="sound-toggle" aria-label="Bedtime sounds" title={soundEnabled?'Turn bedtime sounds off':'Turn bedtime sounds on'} aria-pressed={soundEnabled} onClick={toggleSound}>{soundEnabled?<Volume2 size={20}/>:<VolumeX size={20}/>}</button></div>
      <Link href="/parent" className={'parent-link '+(path==='/parent'?'active':'')} aria-label="Grown-up corner"><Heart size={19}/><span>Grown-ups</span></Link>
    </header>
    <main className="site-main">{children}</main>
    <footer className="site-footer"><div className="flex items-center gap-2"><Lumo className="w-8 h-8"/><span>A little faith. A lot of wonder.</span></div><span className="hidden sm:block">Made for little hearts & the people who love them.</span><Link href="/parent" className="flex items-center gap-1"><Settings2 size={15}/> For parents</Link></footer>
    <nav className="mobile-nav" aria-label="Mobile navigation">{[{href:'/',label:'Home',icon:Home},{href:'/stories',label:'Stories',icon:BookOpen},{href:'/stickers',label:'Treasures',icon:Star},{href:'/parent',label:'Parent',icon:Heart}].map(({href,label,icon:Icon})=><Link key={href} href={href} className={path===href?'active':''}><Icon size={23}/><span>{label}</span></Link>)}</nav>
  </div>;
}

export function FamilyBar() {
  const {profile,progress,openOnboarding} = useApp();
  const [localToday,setLocalToday] = useState<Date|null>(null);
  useEffect(()=>{setLocalToday(new Date());},[]);
  const dates = new Set(progress.map(completion=>new Date(completion.completedAt).toLocaleDateString('en-CA')));
  const today = localToday || new Date(0);
  let streak = 0;
  const current = new Date(today);
  if (!dates.has(current.toLocaleDateString('en-CA'))) current.setDate(current.getDate()-1);
  while (dates.has(current.toLocaleDateString('en-CA'))) { streak++; current.setDate(current.getDate()-1); }
  const week = Array.from({length:7},(_,index)=>{const date=new Date(today);date.setDate(date.getDate()-6+index);return {date,complete:dates.has(date.toLocaleDateString('en-CA'))};});
  return <section className="weekly-streak" aria-label="Your seven-night bedtime streak">
    <div className="weekly-streak-copy"><span className="weekly-avatar"><Moon size={25} fill="#DCC7E5"/></span><div><strong>{profile?profile.kidName+'’s happy little week':'Your happy little week'}</strong><p>{streak?streak+' '+(streak===1?'night':'nights')+' of bedtime magic!':'One little story starts the magic.'}</p></div></div>
    <div className="streak-slots" aria-label="The last seven nights">{week.map(({date,complete},index)=>{const label=localToday?date.toLocaleDateString():'Night '+(index+1);return <span data-testid="streak-slot" data-filled={complete?'true':'false'} key={index} className={'streak-star-slot '+(complete?'filled':'')} title={label+': '+(complete?'Story completed':'A little star to earn')} aria-label={label+': '+(complete?'completed':'not completed')}><Star size={26} fill="currentColor" strokeWidth={1.6}/>{complete&&<i aria-hidden="true">✦</i>}</span>;})}</div>
    <button aria-label="Family settings" className="weekly-settings" onClick={()=>openOnboarding()}><Settings2 size={20}/></button>
  </section>;
}
