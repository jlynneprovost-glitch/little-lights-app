'use client';
import { Lumo } from '@/components/illustrations';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="empty-state"><Lumo mood="sad" className="w-36 h-36"/><h1 className="text-4xl">Oops! Let’s try again.</h1><p>That little adventure took a wrong turn.</p><button className="btn btn-yellow" onClick={reset}>Try again</button></div>;}
