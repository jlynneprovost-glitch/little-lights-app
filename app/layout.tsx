import type { Metadata, Viewport } from 'next';
import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-600.css';
import '@fontsource/fredoka/latin-700.css';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import './globals.css';
import { AppProvider } from '@/components/app-provider';
import { AppShell } from '@/components/app-shell';
export const metadata:Metadata={title:'Little Lights - Bedtime Bible Stories for Kids',description:'A little faith. A lot of wonder. Cozy, interactive Bible stories, coloring, and happy little bedtime moments for children ages 3–7.',manifest:'/manifest.json',icons:{icon:'/icons/icon-192.png',apple:'/icons/icon-192.png'},appleWebApp:{capable:true,statusBarStyle:'default',title:'Little Lights'},openGraph:{title:'Little Lights · Big stories. Little hearts.',description:'Faith-filled bedtime adventures for little dreamers.',type:'website'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#FFF8E7'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><AppProvider><AppShell>{children}</AppShell></AppProvider></body></html>;}
