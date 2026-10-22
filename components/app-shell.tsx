'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ChevronRight, Heart, Home, Moon, Settings2, Star, Sticker } from 'lucide-react';
import { Lumo } from './illustrations';
import { useApp } from './app-provider';

const links=[{href:'/',label:'Home',icon:Home},{href:'/stories',label:'Our stories',icon:BookOpen},{href:'/stickers',label:'Sticker book',icon:Sticker}];
export function AppShell({children}:{children:React.ReactNode}) {
  const path=usePathname();
  if(path.startsWith('/read/')||path.startsWith('/admin'))return <>{children}</>;
  return <div className="site-wrap">
    <header className="site-header"><Link href="/" aria-label="Little Lights home" className="brand"><Lumo className="w-14 h-14"/><span><span className="brand-name">little lights<span className="text-[#D7A431]">.</span></span><span className="brand-tagline">little stories. big love.</span></span></Link>
      <nav aria-label="Main navigation" className="desktop-nav">{links.map(({href,label,icon:Icon})=><Link key={href} href={href} className={path===href?'active':''}><Icon size={17}/>{label}</Link>)}</nav>
      <Link href="/parent" className={`parent-link ${path==='/parent'?'active':''}`}><Heart size={16}/> Grown-up corner <ChevronRight size={15}/></Link>
    </header>
    <main className="site-main">{children}</main>
    <footer className="site-footer"><div className="flex items-center gap-2"><Lumo className="w-7 h-7"/><span>A little faith. A lot of wonder.</span></div><span className="hidden sm:block">Made for little hearts & the people who love them.</span><Link href="/parent" className="flex items-center gap-1"><Settings2 size={14}/> For parents</Link></footer>
    <nav className="mobile-nav" aria-label="Mobile navigation">{[{href:'/',label:'Home',icon:Home},{href:'/stories',label:'Stories',icon:BookOpen},{href:'/stickers',label:'Stickers',icon:Star},{href:'/parent',label:'Parent',icon:Heart}].map(({href,label,icon:Icon})=><Link key={href} href={href} className={path===href?'active':''}><Icon size={21}/><span>{label}</span></Link>)}</nav>
  </div>;
}

export function FamilyBar() {
  const {profile,progress,openOnboarding}=useApp();
  const dates=[...new Set(progress.map(p=>new Date(p.completedAt).toLocaleDateString('en-CA')))];
  let streak=0;const day=new Date();if(!dates.includes(day.toLocaleDateString('en-CA')))day.setDate(day.getDate()-1);
  while(dates.includes(day.toLocaleDateString('en-CA'))){streak++;day.setDate(day.getDate()-1);}
  return <div className="family-bar"><div className="flex items-center gap-3"><div className="avatar"><Moon size={20} fill="#D9C6EF"/></div><div><span className="text-sm font-extrabold">{profile?`${profile.kidName}’s little world`:'Your happy little bedtime place'}</span><p className="text-[11px] text-muted">{profile?'A new adventure is waiting for you.':'Big wonder for ages 3–7'}</p></div></div><div className="flex items-center gap-3"><span className="streak-pill"><Star size={16} fill="#F1BC40"/>{streak?`${streak} ${streak===1?'night':'nights'} of wonder!`:'Let’s start a little streak'}</span><button aria-label="Family settings" className="icon-btn" onClick={()=>openOnboarding()}><Settings2 size={18}/></button></div></div>;
}
