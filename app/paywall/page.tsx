'use client';
import { Sparkles } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { Lumo, Pip } from '@/components/illustrations';
export default function Page(){const {openPaywall}=useApp();return <div className="empty-state"><div className="flex items-end"><Lumo className="w-36 h-36"/><Pip className="w-28 h-28 -ml-6"/></div><span className="eyebrow">There’s a whole little world waiting</span><h1 className="page-title">A new adventure. Every bedtime.</h1><p>Choose your next chapter with Little Lights Plus.<br/>Your three free stories are always here for you.</p><button className="btn btn-yellow" onClick={openPaywall}><Sparkles size={19}/>Explore our family plans</button></div>;}
