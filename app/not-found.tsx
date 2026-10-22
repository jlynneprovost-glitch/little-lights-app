import Link from 'next/link';
import { Pip } from '@/components/illustrations';
export default function NotFound(){return <div className="empty-state"><Pip className="h-36 w-36"/><h1 className="text-4xl">This little sheep got lost.</h1><p>Let’s find our way back to the stories.</p><Link className="btn btn-yellow" href="/">Back to our little world</Link></div>;}
