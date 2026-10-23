"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

type MascotProps = { className?: string; mood?: string };
const ink = "#65513F";
const cream = "#FFF8E7";

function Eye({ x, y, happy = false }: { x: number; y: number; happy?: boolean }) {
  return happy ? <path d={`M${x - 4} ${y + 1}q4 -6 8 0`} fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" /> : <g><ellipse cx={x} cy={y} rx="4" ry="5.5" fill={ink} /><circle cx={x + 1} cy={y - 2} r="1.2" fill={cream} /></g>;
}

/** Lumo's two-second hello is part of the bedtime ritual. */
export function Lumo({ className = "", mood = "happy" }: MascotProps) {
  const uid = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const sad = mood === "sad";
  return <svg viewBox="0 0 180 180" className={`mascot-lumo ${className}`} role="img" aria-label={`Lumo, a ${sad ? "gentle" : "happy"} little golden star`}>
    <defs>
      <radialGradient id={`${uid}-glow`}><stop stopColor="#FFDB62" stopOpacity=".6" /><stop offset="1" stopColor="#FFDB62" stopOpacity="0" /></radialGradient>
      <linearGradient id={`${uid}-gold`} x2="0" y2="1"><stop stopColor="#FFEB80" /><stop offset=".6" stopColor="#FFDA45" /><stop offset="1" stopColor="#FBCB44" /></linearGradient>
    </defs>
    <circle cx="89" cy="89" r="87" fill={`url(#${uid}-glow)`} />
    <ellipse cx="91" cy="165" rx="40" ry="6" fill="#D7B16E" opacity=".2" />
    <motion.g initial={{ y: 0 }} animate={reduced ? { y: 0 } : { y: [0, -6, 0] }} transition={reduced ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}>
      <path d="M64 132q-5 18 3 23 6 4 13-1m27-22q4 20 12 20 8 0 12-6" fill="none" stroke="#8D6949" strokeWidth="6" strokeLinecap="round" />
      <path d="M36 94Q14 94 14 80q0-8 7-9m-7 9-5-4" fill="none" stroke="#8D6949" strokeWidth="5" strokeLinecap="round" />
      <motion.g initial={{ rotate: 0 }} animate={reduced ? { rotate: 0 } : { rotate: [0, -14, 9, -8, 0] }} transition={reduced ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ originX: 0, originY: 1 }}>
        <path d="M143 96q20-8 20-25m0 1 6-6m-6 6-5-8" fill="none" stroke="#8D6949" strokeWidth="5" strokeLinecap="round" />
      </motion.g>
      <path d="M84 23q7-14 15 0l17 33q3 6 10 7l31 6q17 3 5 16l-24 25q-5 5-3 12l5 31q3 17-12 9l-30-16q-7-4-14 0l-31 16q-15 8-12-9l6-31q2-8-4-14L20 84q-12-12 5-15l33-6q7-1 10-8Z" fill={`url(#${uid}-gold)`} stroke="#AD7D3C" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="m85 37-13 27q-2 6-9 7l-25 5" fill="none" stroke="#FFF4BC" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="61" cy="108" rx="12" ry="7.5" fill="#F7AE8D" opacity=".8" /><ellipse cx="118" cy="108" rx="12" ry="7.5" fill="#F7AE8D" opacity=".8" />
      {mood === "sleeping" ? <path d="M65 91q9 8 18 0m15 0q9 8 18 0" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" /> : <g>
        <ellipse cx="75" cy="91" rx="9" ry="12.5" fill="#574536" /><ellipse cx="106" cy="91" rx="9" ry="12.5" fill="#574536" />
        <ellipse cx="72.5" cy="87" rx="3.7" ry="4.5" fill="#FFFDFA" /><ellipse cx="103.5" cy="87" rx="3.7" ry="4.5" fill="#FFFDFA" />
        <circle cx="79" cy="96" r="2.2" fill="#FFFDFA" /><circle cx="110" cy="96" r="2.2" fill="#FFFDFA" />
      </g>}
      {sad ? <path d="M82 116q9-9 18 0" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" /> : <><path d="M80 111q11 19 23 0Z" fill="#75503C" /><path d="M85 119q6-5 12 0-5 7-12 0Z" fill="#F1A18E" /></>}
    </motion.g>
    <motion.g initial={{ opacity: .5, scale: .9 }} animate={reduced ? { opacity: .5, scale: .9 } : { opacity: [.5, 1, .5], scale: [.9, 1.1, .9] }} transition={reduced ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ originX: .5, originY: .5 }}>
      <Sparkle x={151} y={29} size={11} color="#E5B648" /><Sparkle x={25} y={40} size={7} color="#F0C755" /><Sparkle x={156} y={133} size={5} color="#E9BD54" />
    </motion.g>
  </svg>;
}

/** Pip has pillow-soft wool, little waving hooves, and an occasional sleepy yawn. */
export function Pip({ className = "", mood = "happy" }: MascotProps) {
  const uid = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const sleeping = mood === "sleeping";
  return <svg viewBox="0 0 180 180" className={`mascot-pip ${className}`} role="img" aria-label="Pip, a cuddly little lamb">
    <defs><linearGradient id={`${uid}-wool`} x2="0" y2="1"><stop stopColor="#FFFDFA" /><stop offset="1" stopColor="#F5ECD9" /></linearGradient><linearGradient id={`${uid}-face`} x2="0" y2="1"><stop stopColor="#F5DCC0" /><stop offset="1" stopColor="#EBC9AB" /></linearGradient></defs>
    <ellipse cx="91" cy="166" rx="41" ry="6" fill="#C8AA82" opacity=".19" />
    <motion.g initial={{ y: 0, rotate: 0 }} animate={reduced ? { y: 0, rotate: 0 } : { y: [0, -3, 0], rotate: [0, -1.2, 0] }} transition={reduced ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ originX: .5, originY: 1 }}>
      <path d="M65 132v22q0 8 11 8h3v-24m25-2v18q0 8 11 8h5v-28" fill="#D9B795" stroke="#947759" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M47 87q-18-1-20 14-1 13 10 18-4 17 12 21 7 18 25 11 12 13 25 2 18 6 27-8 19 0 20-18 15-7 9-22 7-15-8-25-1-16-17-17-9-16-25-8-15-11-27 0-20-1-21 17Z" fill={`url(#${uid}-wool)`} stroke="#A08A6D" strokeWidth="3" />
      <motion.g initial={{ rotate: 0 }} animate={reduced ? { rotate: 0 } : { rotate: [0, 15, -6, 0] }} transition={reduced ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut", delay: .2 }} style={{ originX: 1, originY: 1 }}>
        <path d="M41 117Q19 110 20 93q0-8 6-9 7 0 8 9l5 6" fill="#E7C9AB" stroke="#947759" strokeWidth="3" strokeLinecap="round" /><path d="m24 90 8 3" stroke="#947759" strokeWidth="2.5" strokeLinecap="round" />
      </motion.g>
      <path d="M53 67Q25 49 22 69q-2 23 27 30m78-32q28-18 32 2 2 23-27 30" fill="#E8C8AC" stroke="#A08A6D" strokeWidth="3" />
      <path d="M45 75q-11-9-15-5 1 12 15 18m90-13q11-9 15-5-1 12-15 18" fill="#EFAFAD" />
      <path d="M51 66q0-27 39-27t39 27v34q-2 34-39 34t-39-34Z" fill={`url(#${uid}-face)`} stroke="#A08A6D" strokeWidth="3" />
      <path d="M47 62q-9-17 7-25-1-19 17-19 15-15 29-2 20-7 27 10 18 2 15 20 12 17-4 25-13 9-25-2-13 9-25-1-15 8-24-3-10 6-17-3Z" fill={`url(#${uid}-wool)`} stroke="#A08A6D" strokeWidth="3" />
      <path d="M61 40q-4-10 6-12m18 1q5-8 12-4m21 12q10 1 10 10" fill="none" stroke="#FFFDF9" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="64" cy="104" rx="12" ry="7.5" fill="#EFA9A1" opacity=".85" /><ellipse cx="116" cy="104" rx="12" ry="7.5" fill="#EFA9A1" opacity=".85" />
      {mood === "cheering" ? <><Eye x={74} y={89} happy /><Eye x={106} y={89} happy /></> : <path d="M65 87q9 9 18 0m15 0q9 9 18 0m-49 3-3 4m51-4 3 4" fill="none" stroke={ink} strokeWidth="3.3" strokeLinecap="round" />}
      <path d="m85 104 5 4 5-4q-5-4-10 0Z" fill="#A57468" /><path d="M90 108v4" stroke={ink} strokeWidth="2" />
      {sleeping ? <motion.ellipse cx="90" cy="119" rx="5" ry="6" fill="#8E6856" initial={{ scaleY: .6 }} animate={reduced ? { scaleY: .6 } : { scaleY: [.6, .6, 1.35, 1, .6] }} transition={reduced ? { duration: 0 } : { duration: 6, repeat: Infinity, times: [0, .35, .6, .8, 1] }} style={{ originX: .5, originY: .5 }} /> : <>
        <motion.path d="M82 114q8 9 16 0" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" initial={{ opacity: 1 }} animate={reduced ? { opacity: 1 } : { opacity: [1, 1, 0, 0, 1] }} transition={reduced ? { duration: 0 } : { duration: 6, repeat: Infinity, times: [0, .5, .65, .85, 1] }} />
        <motion.ellipse cx="90" cy="119" rx="5.5" ry="7" fill="#966B5B" initial={{ opacity: 0, scaleY: .65 }} animate={reduced ? { opacity: 0, scaleY: .65 } : { opacity: [0, 0, 1, 1, 0], scaleY: [.65, .65, 1, 1, .65] }} transition={reduced ? { duration: 0 } : { duration: 6, repeat: Infinity, times: [0, .5, .65, .85, 1] }} />
      </>}
      <path d="M44 132q5-11 14-7m70 4q10-6 15 1" fill="none" stroke="#E8DBC5" strokeWidth="4" strokeLinecap="round" />
    </motion.g>
    <Sparkle x={39} y={29} size={7} color="#EDC85E" />
    {sleeping && <g fill="#A7ADB8" fontFamily="sans-serif" fontWeight="bold"><text x="144" y="37" fontSize="15">z</text><text x="158" y="23" fontSize="20">z</text></g>}
  </svg>;
}

/** A tiny treasure box for a very big sticker collection. */
export function TreasureChest({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  return <svg viewBox="0 0 220 190" className={className} role="img" aria-label="A little treasure chest full of golden stars and stickers">
    <defs><linearGradient id={`${uid}-chest`} x2="0" y2="1"><stop stopColor="#F5C887" /><stop offset="1" stopColor="#DB9E65" /></linearGradient><linearGradient id={`${uid}-lid`} x2="0" y2="1"><stop stopColor="#F6DAAC" /><stop offset="1" stopColor="#E7AE78" /></linearGradient><radialGradient id={`${uid}-shine`}><stop stopColor="#FFE58C" stopOpacity=".65" /><stop offset="1" stopColor="#FFE58C" stopOpacity="0" /></radialGradient></defs>
    <circle cx="110" cy="91" r="87" fill={`url(#${uid}-shine)`} />
    <ellipse cx="112" cy="173" rx="78" ry="10" fill="#C8AA82" opacity=".16" />
    <g stroke="#9A714E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M35 91V62q0-34 34-34h75q33 0 37 34l4 29Z" fill={`url(#${uid}-lid)`} /><path d="M37 73h146M62 31v58m92-56v57" fill="none" stroke="#ECC16B" strokeWidth="12" /><path d="M36 90q74-31 150 0l-10 29H44Z" fill="#9E7057" />
    </g>
    <g transform="translate(0 3)">
      <path d="m91 62 8 13 15 2-11 11 2 15-14-7-14 7 3-15-12-11 16-2Z" fill="#FFDC62" stroke="#B18A41" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M131 84q-23-17-11-29 10-9 18 1 9-8 17 1 11 14-24 27Z" fill="#F3B7A9" stroke="#B98976" strokeWidth="2.5" />
      <circle cx="60" cy="91" r="17" fill="#C9E0B4" stroke="#91AF7C" strokeWidth="2.5" /><path d="m52 91 5 5 10-12" fill="none" stroke="#718A5F" strokeWidth="3" strokeLinecap="round" />
      <path d="m160 78 8 13 15 2-11 11 2 15-14-7-14 7 3-15-12-11 16-2Z" fill="#FFE193" stroke="#B18A41" strokeWidth="2.5" strokeLinejoin="round" />
    </g>
    <g stroke="#9A714E" strokeWidth="3" strokeLinejoin="round">
      <path d="M32 99q1-10 10-10h136q10 0 10 10l-7 57q-1 12-14 12H53q-13 0-14-12Z" fill={`url(#${uid}-chest)`} /><path d="M39 119h143m-140 24h137" fill="none" stroke="#BD8559" strokeWidth="2" /><path d="m53 90 7 78m103-78-6 78" fill="none" stroke="#F8DA83" strokeWidth="13" /><path d="m53 90 7 78m103-78-6 78" fill="none" stroke="#BE9652" strokeWidth="1.5" /><rect x="93" y="106" width="35" height="41" rx="11" fill="#FFE095" stroke="#B08A49" />
      <path d="m110 114 4 7 8 1-6 6 1 8-7-4-8 4 2-8-6-6 8-1Z" fill="#DCA64B" stroke="#C18F42" strokeWidth="1.5" />
      <circle cx="110" cy="126" r="3.3" fill="#96704B" stroke="none" /><path d="M108 128h4l1 7h-6Z" fill="#96704B" stroke="none" />
    </g>
    <path d="M44 103h34m69 0h28" fill="none" stroke="#FFE7B3" strokeWidth="3.5" strokeLinecap="round" opacity=".8" />
    <motion.g initial={{ opacity: .5, scale: .9 }} animate={reduced ? { opacity: .5, scale: .9 } : { opacity: [.5, 1, .5], scale: [.9, 1.06, .9] }} transition={reduced ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ originX: .5, originY: .5 }}><Sparkle x={24} y={57} size={10} color="#E4B453" /><Sparkle x={188} y={34} size={9} color="#EBC15E" /><Sparkle x={201} y={122} size={7} color="#E6B75B" /><Sparkle x={53} y={15} size={6} color="#EDC95F" /></motion.g>
  </svg>;
}

function Cloud({ x, y, scale = 1, color = "#FFF6E2" }: { x: number; y: number; scale?: number; color?: string }) {
  return <path transform={`translate(${x} ${y}) scale(${scale})`} d="M3 27Q-3 8 18 9 25-8 43 1 62-5 66 13 88 10 88 28Z" fill={color} opacity=".93" />;
}
function Sparkle({ x, y, size = 8, color = "#FFD76F" }: { x: number; y: number; size?: number; color?: string }) {
  return <path d={`m${x} ${y - size} ${size * .29} ${size * .71} ${size * .71} ${size * .29}-${size * .71} ${size * .29}-${size * .29} ${size * .71}-${size * .29}-${size * .71}-${size * .71}-${size * .29} ${size * .71}-${size * .29}Z`} fill={color} />;
}
function TinyFlower({ x, y, scale = 1, color = "#F3AD9E" }: { x: number; y: number; scale?: number; color?: string }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}><path d="M0 0v23m0-5q-12 0-9-8 9 0 9 8m0-4q12 0 9-8-9 0-9 8" fill="#8EBB87" stroke="#719F6E" strokeWidth="1.5" /><g fill={color}><circle cy="-6" r="6" /><circle cx="6" r="6" /><circle cy="6" r="6" /><circle cx="-6" r="6" /></g><circle r="4" fill="#FFD96D" /></g>;
}
function SmallSheep({ x, y, scale = 1, sleep = false }: { x: number; y: number; scale?: number; sleep?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M-24 25v18m14-18v18m29-18v18m13-20v20" strokeWidth="6" />
    <path d="M-35-1q-10-15 5-20 2-17 18-13 12-13 24-2 17-5 21 11 17 0 17 16 15 12 1 25 0 17-18 17-12 12-25 3-18 9-24-7-21-1-19-17Z" fill={cream} />
    <path d="m16-20-18-8q-10-4-8 7 4 11 21 11m28-9 14-8q10-4 8 7-3 11-18 11" fill="#DBC09C" />
    <ellipse cx="26" cy="-4" rx="22" ry="26" fill="#E9D1B2" />
    <path d="M5-20q-5-12 7-14 7-10 17-4 13-5 17 7 9 2 5 12-11 5-18-2-9 7-17-1-6 6-11 2Z" fill={cream} />
    {sleep ? <path d="m14-5q4 5 8 0m10 0q4 5 8 0" fill="none" /> : <g fill={ink} stroke="none"><circle cx="18" cy="-4" r="2.5" /><circle cx="35" cy="-4" r="2.5" /></g>}
    <path d="m23 7 4 3 4-3m-4 3v5" fill="none" strokeWidth="2" /><ellipse cx="12" cy="6" rx="5" ry="3" fill="#EBAC98" stroke="none" /><ellipse cx="41" cy="6" rx="5" ry="3" fill="#EBAC98" stroke="none" />
  </g>;
}
function Tree({ x, y, scale = 1, color = "#97BF8B" }: { x: number; y: number; scale?: number; color?: string }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}><path d="M0 5v87m0-51-19-20m19 39 21-23" stroke="#A3835D" strokeWidth="12" strokeLinecap="round" /><path d="M-4-44q-29-11-38 16-30 4-22 32-10 31 22 39 21 25 44 6 29 17 45-7 30-5 24-32 12-26-15-38-8-32-38-16Z" fill={color} /><path d="M-25-18q-18 8-16 25m53-26q20-2 23 11" fill="none" stroke="#D5E6B9" strokeWidth="7" strokeLinecap="round" opacity=".55" /></g>;
}
function Birds({ x = 80, y = 100 }: { x?: number; y?: number }) {
  return <g fill="none" stroke="#8B9C90" strokeWidth="3" strokeLinecap="round"><path d={`M${x} ${y}q8-10 16 0 8-10 16 0m27-21q6-7 12 0 6-7 12 0`} /></g>;
}

const labels: Record<string, string> = {
  ark: "A cozy wooden ark carries smiling animals beneath a pastel rainbow",
  sheep: "Pip the little lamb explores a peaceful meadow full of flowers",
  stars: "Thousands of gentle stars shine over Abraham’s cozy desert tent",
  garden: "A colorful garden full of trees, flowers, butterflies, and a sparkling stream",
  sea: "A friendly little whale swims in a sparkling blue sea",
  courage: "A little shepherd and his lamb under a sunny sky",
  kindness: "Two little lambs share a flower in a sunny meadow",
  peace: "A sleepy lamb rests under the moon and twinkling stars",
};

export function StoryScene({ scene = "ark", className = "" }: { scene?: string; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const normalized = /noah|rainbow|boat/.test(scene) ? "ark" : /creation|eden/.test(scene) ? "garden" : /abraham|night/.test(scene) ? "stars" : /jonah|whale/.test(scene) ? "sea" : /david/.test(scene) ? "courage" : /lost|lamb/.test(scene) ? "sheep" : scene;
  const kind = labels[normalized] ? normalized : "garden";
  const night = kind === "stars" || kind === "peace";
  return <svg viewBox="0 0 640 420" preserveAspectRatio="xMidYMid slice" className={`story-scene ${className}`} role="img" aria-label={labels[kind]} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`${uid}-sky`} x2="0" y2="1"><stop stopColor={night ? "#8595BE" : "#B9E0E8"} /><stop offset="1" stopColor={night ? "#C9BDD2" : "#F7EED4"} /></linearGradient>
      <linearGradient id={`${uid}-sea`} x2="0" y2="1"><stop stopColor="#9ED2D5" /><stop offset="1" stopColor="#77B6C7" /></linearGradient>
      <linearGradient id={`${uid}-meadow`} x2="0" y2="1"><stop stopColor="#C5DCA5" /><stop offset="1" stopColor="#A9CF98" /></linearGradient>
      <linearGradient id={`${uid}-wood`} x2="0" y2="1"><stop stopColor="#DDB082" /><stop offset="1" stopColor="#C28D65" /></linearGradient>
    </defs>
    <rect width="640" height="420" rx="24" fill={`url(#${uid}-sky)`} />
    {night ? <>
      <circle cx="515" cy="74" r="35" fill="#FFF1B3" /><circle cx="529" cy="62" r="32" fill="#91A0C1" />
      {[ [54,54,6], [118,98,9], [181,44,5], [249,86,8], [322,38,6], [386,113,8], [443,40,5], [589,135,7], [566,33,4], [47,154,4], [207,145,5], [333,154,4] ].map(([x,y,size], i) => <Sparkle key={i} x={x} y={y} size={size} color="#FFF1B8" />)}
      <g fill="#FFF1C7" opacity=".65">{Array.from({length:25},(_,i)=><circle key={i} cx={24+(i*113)%590} cy={22+(i*67)%173} r={i%3===0?2:1.1} />)}</g>
      <Cloud x={12} y={107} scale={1.2} color="#B7B8D1" /><Cloud x={365} y={149} scale={1.1} color="#D4C8D6" />
    </> : <>
      <circle cx="528" cy="76" r="39" fill="#FFE19A" /><circle cx="528" cy="76" r="29" fill="#FFE7A9" />
      <path d="M528 22v-8m0 118v8m-56-64h-9m121 0h9m-105-40-6-6m91 91 6 6m-91-12-6 6m91-91 6-6" stroke="#EFC874" strokeWidth="3" strokeLinecap="round" />
      <Cloud x={30} y={49} scale={1.2} /><Cloud x={402} y={115} scale={.8} /><Cloud x={229} y={35} scale={.8} /><Birds x={375} y={84} />
    </>}
    {kind === "ark" && <>
      <g fill="none" strokeWidth="17" opacity=".85"><path d="M98 237a222 222 0 0 1 444 0" stroke="#EFB6A6" /><path d="M116 237a204 204 0 0 1 408 0" stroke="#F4D382" /><path d="M134 237a186 186 0 0 1 372 0" stroke="#BED9A8" /><path d="M152 237a168 168 0 0 1 336 0" stroke="#A0CBD3" /></g>
      <path d="M0 277q70-51 144-17 74-52 161-9 78-53 167-17 94-32 168 28v158H0Z" fill="#AEC7AA" />
      <path d="M0 310q80-33 161-7 77-26 158-1 91-28 168-4 84-28 153 5v117H0Z" fill={`url(#${uid}-sea)`} />
      <g stroke={ink} strokeWidth="3.5" strokeLinejoin="round"><path d="M166 264h309q-19 100-150 101-128-1-159-101Z" fill={`url(#${uid}-wood)`} /><path d="M180 288q142 33 281 0m-265 26q122 28 249 0m-219 24q103 18 189-1" fill="none" stroke="#A97956" strokeWidth="2" /><path d="M204 259V190q0-14 14-14h207q14 0 14 14v69Z" fill="#E8C09A" /><path d="m185 186 128-72q8-4 16 0l128 72Z" fill="#C9916D" /><path d="m206 179 112-59q7-3 11 0l108 59" fill="none" stroke="#E8BA8F" strokeWidth="4" /><rect x="292" y="208" width="52" height="53" rx="24" fill="#967354" /><circle cx="243" cy="220" r="18" fill="#B5DDE1" /><circle cx="393" cy="220" r="18" fill="#B5DDE1" /><path d="M243 202v36m-18-18h36m132-18v36m-18-18h36" fill="none" strokeWidth="2.5" /></g>
      <g transform="translate(387 171)" stroke={ink} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-11 11v-41q0-18 15-18t15 18v41" fill="#F2CE8D" />
        <path d="m-13-53-5-13m36 13 6-13" stroke="#B28C5D" strokeWidth="5" /><circle cx="-18" cy="-67" r="4" fill="#BD9566" stroke="none" /><circle cx="24" cy="-67" r="4" fill="#BD9566" stroke="none" />
        <path d="M-18-49q-22-17-24-5 2 13 23 13m42-8q23-17 25-5-3 13-24 13" fill="#E9BC7D" />
        <ellipse cx="4" cy="-43" rx="28" ry="24" fill="#F4D69F" /><path d="M-11-60q13-11 26 0" fill="none" stroke="#FFE6B5" strokeWidth="4" />
        <ellipse cx="-6" cy="-45" rx="4" ry="5.5" fill={ink} stroke="none" /><ellipse cx="13" cy="-45" rx="4" ry="5.5" fill={ink} stroke="none" /><circle cx="-7" cy="-47" r="1.4" fill="#FFFDFA" stroke="none" /><circle cx="12" cy="-47" r="1.4" fill="#FFFDFA" stroke="none" />
        <ellipse cx="4" cy="-28" rx="21" ry="12" fill="#EDC090" stroke="none" /><circle cx="-4" cy="-31" r="1.5" fill="#A27E55" stroke="none" /><circle cx="12" cy="-31" r="1.5" fill="#A27E55" stroke="none" /><path d="M0-23q5 4 9 0" fill="none" strokeWidth="2" />
        <ellipse cx="-17" cy="-35" rx="5" ry="3" fill="#EDB19D" stroke="none" /><ellipse cx="25" cy="-35" rx="5" ry="3" fill="#EDB19D" stroke="none" /><path d="M-9-9h7M9 5h7" stroke="#D1A268" strokeWidth="7" />
      </g>
      <g transform="translate(251 168)" stroke={ink} strokeWidth="2.8" strokeLinecap="round">
        <ellipse cx="-31" cy="-14" rx="18" ry="23" fill="#AED1D7" /><ellipse cx="31" cy="-14" rx="18" ry="23" fill="#AED1D7" /><ellipse cx="-31" cy="-14" rx="11" ry="15" fill="#D5DADB" stroke="none" /><ellipse cx="31" cy="-14" rx="11" ry="15" fill="#D5DADB" stroke="none" />
        <ellipse cy="-17" rx="31" ry="28" fill="#B9D7DC" /><path d="M-13-34q12-8 25 0" fill="none" stroke="#E2ECE6" strokeWidth="4" />
        <path d="M-6-4V18q1 14 14 10l10-8q4-7-3-9-4 0-8 5V-4" fill="#B9D7DC" /><path d="m-3 8 7 1m-6 6 6 1" fill="none" stroke="#8EB5BF" strokeWidth="2" />
        <ellipse cx="-11" cy="-18" rx="4" ry="5.5" fill={ink} stroke="none" /><ellipse cx="11" cy="-18" rx="4" ry="5.5" fill={ink} stroke="none" /><circle cx="-12" cy="-20" r="1.5" fill="#FFFDFA" stroke="none" /><circle cx="10" cy="-20" r="1.5" fill="#FFFDFA" stroke="none" />
        <ellipse cx="-19" cy="-5" rx="7" ry="4.5" fill="#EDB4AB" stroke="none" /><ellipse cx="20" cy="-5" rx="7" ry="4.5" fill="#EDB4AB" stroke="none" />
      </g>
      <g transform="translate(318 170)" stroke={ink} strokeWidth="2.4" strokeLinecap="round"><ellipse cx="-9" cy="-38" rx="7" ry="20" fill="#FFF6E5" transform="rotate(-12)" /><ellipse cx="9" cy="-38" rx="7" ry="20" fill="#FFF6E5" transform="rotate(12)" /><path d="m-12-48 2 20m22-20-2 20" stroke="#F0BAB2" strokeWidth="4" /><ellipse cy="-12" rx="22" ry="20" fill="#FFF6E5" /><g fill={ink} stroke="none"><ellipse cx="-7" cy="-15" rx="2.5" ry="3.5" /><ellipse cx="7" cy="-15" rx="2.5" ry="3.5" /></g><path d="m-3-6 3 2 3-2m-3 2v4" fill="none" strokeWidth="1.5" /><ellipse cx="-13" cy="-7" rx="5" ry="3" fill="#F0BBB2" stroke="none" /><ellipse cx="13" cy="-7" rx="5" ry="3" fill="#F0BBB2" stroke="none" /></g>
      <SmallSheep x={179} y={249} scale={.65} />
      <g fill="none" stroke="#D4EBDF" strokeWidth="4" strokeLinecap="round"><path d="M51 338q24 8 49 0m402 17q27 7 56-2M169 389q24 7 49 0m110 3q24 8 49 0M20 384q17 6 34 0m485-53q25 8 49 0" /></g>
      <g transform="translate(529 293)"><path d="M0 0q18-19 36 0-18 15-36 0Z" fill={cream} stroke={ink} strokeWidth="2.5" /><path d="m13-3 8-17 6 18" fill={cream} stroke={ink} strokeWidth="2" /><circle cx="30" cy="-2" r="1.5" fill={ink} /><path d="m36-2 7 3-7 2" fill="#E1A65E" /></g>
      <Sparkle x={95} y={282} size={9} /><Sparkle x={558} y={225} size={8} />
    </>}
    {(kind === "sheep" || kind === "courage" || kind === "kindness" || kind === "garden") && <>
      <path d="M0 252Q100 151 230 240q117-115 246-25 100-52 164-5v210H0Z" fill="#C0D6AE" />
      <path d="M0 290q122-100 263-20 135-91 377-4v154H0Z" fill={`url(#${uid}-meadow)`} />
      <path d="M0 379q176-54 326-12 188-72 314-32v85H0Z" fill="#95BF8B" />
      <Tree x={87} y={229} scale={.75} /><Tree x={559} y={238} scale={.9} color="#8BB98C" />
      <path d="M14 331q14 8 28 0m159 61q14 8 28 0m268-77q14 8 28 0m-220 11q14 8 28 0" fill="none" stroke="#7DAA77" strokeWidth="3" strokeLinecap="round" />
      {kind === "garden" ? <>
        <path d="M325 253q-110 51-1 89 106 36-28 78h131q95-66-48-101-80-21-31-66Z" fill="#AFD9DB" />
        <Tree x={224} y={252} scale={.85} color="#B5C890" /><g fill="#E7A28C"><circle cx="205" cy="240" r="7" /><circle cx="245" cy="227" r="8" /><circle cx="235" cy="263" r="6" /></g>
        <SmallSheep x={469} y={317} scale={.85} />
        <g transform="translate(384 203)"><ellipse cx="-9" cy="-5" rx="10" ry="13" fill="#EAAE9D" transform="rotate(-20)" /><ellipse cx="9" cy="-5" rx="10" ry="13" fill="#F1CE8C" transform="rotate(20)" /><path d="M0-8v24m0-18-5-6m5 6 5-6" stroke={ink} strokeWidth="2" strokeLinecap="round" /></g>
      </> : kind === "kindness" ? <>
        <SmallSheep x={243} y={294} scale={1.33} /><SmallSheep x={400} y={290} scale={1.07} />
        <TinyFlower x={345} y={282} scale={1.9} color="#F4AF9C" /><path d="M315 244q-19-14-12-25 8-10 17 0 9-10 17 0 7 11-22 25Z" fill="#EAA594" />
      </> : kind === "courage" ? <>
        <SmallSheep x={422} y={311} scale={1.13} />
        <g stroke={ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M269 313v37m29-37v37" strokeWidth="11" /><path d="m267 350-13 2m47-2 12 2" strokeWidth="9" /><path d="m259 253-15 57q42 16 77-1l-18-56Z" fill="#EBC69B" /><path d="m260 267-21 23m65-22 24 20" stroke="#C29978" strokeWidth="10" /><ellipse cx="282" cy="225" rx="30" ry="33" fill="#E9BC98" /><path d="M252 225q-15-44 24-42 37-6 41 35-14-1-20-15-8 17-24 10-9 13-21 12Z" fill="#90745A" /><circle cx="272" cy="228" r="2.5" fill={ink} /><circle cx="294" cy="228" r="2.5" fill={ink} /><path d="M277 240q6 6 13 0" fill="none" strokeWidth="2" /><path d="M340 347v-93q0-23 16-18 11 4 6 16" fill="none" stroke="#B28E66" strokeWidth="6" /><path d="M263 284h42" stroke="#BC9970" strokeWidth="5" /></g>
      </> : <>
        <SmallSheep x={340} y={282} scale={1.85} /><SmallSheep x={165} y={322} scale={.57} />
        <path d="M410 248q14-22 23-12-2 13-23 12Z" fill="#F1C56E" /><path d="M411 247q-1-24-14-17-4 12 14 17Z" fill="#EDAD9B" /><path d="m411 247 3 8" stroke={ink} strokeWidth="2" />
      </>}
      {[ [68,350,1.1], [138,388,.8], [536,341,1], [584,378,1.2], [216,367,.8], [464,386,.75], [55,285,.55], [509,280,.65] ].map(([x,y,scale],i)=><TinyFlower key={i} x={x} y={y} scale={scale} color={i%2 ? "#F3C874" : "#EEB2A2"} />)}
      <Sparkle x={412} y={170} size={10} /><Sparkle x={172} y={216} size={7} />
    </>}
    {kind === "stars" && <>
      <path d="M0 248q113-60 219-8 135-80 262-7 95-42 159-3v190H0Z" fill="#B5ACB4" /><path d="M0 315q112-74 265-11 191-85 375-4v120H0Z" fill="#D2BAB1" /><path d="M0 387q144-66 297-20 202-53 343-13v66H0Z" fill="#DFC6AC" />
      <g stroke={ink} strokeWidth="3" strokeLinejoin="round"><path d="m204 330 110-146 126 146Z" fill="#F1C697" /><path d="m314 184 7 146h119Z" fill="#E1AF87" /><path d="m255 330 59-113 38 113" fill="#826E69" /><path d="m314 184-4-20m-106 166-22 18m258-18 20 18" stroke="#9A8272" /></g>
      <path d="M291 329q16 12 32 0" fill="none" stroke="#F8DEB0" strokeWidth="4" strokeLinecap="round" /><SmallSheep x={477} y={340} scale={.8} sleep />
      <g stroke="#9D8F80" strokeWidth="3" strokeLinecap="round"><path d="M104 345v-46m-9 12 9 8 10-13m-10 27-12-6m456 16v-39m-9 8 9 8 9-7" /></g><g fill="#B69A8D"><ellipse cx="55" cy="377" rx="18" ry="6" /><ellipse cx="397" cy="385" rx="24" ry="8" /><ellipse cx="567" cy="375" rx="15" ry="5" /></g>
      <Sparkle x={163} y={193} size={13} /><Sparkle x={430} y={197} size={10} /><path d="m184 74 31 11-9 3" fill="none" stroke="#FFF0B9" strokeWidth="3" strokeLinecap="round" />
    </>}
    {kind === "sea" && <>
      <path d="M0 236q73-32 143-2 91-30 167 0 79-33 156-1 93-34 174-1v188H0Z" fill="#B9DDE0" /><path d="M0 292q84-28 155-1 77-30 155 0 84-29 164-1 90-27 166-2v132H0Z" fill={`url(#${uid}-sea)`} />
      <g stroke={ink} strokeWidth="3.5" strokeLinejoin="round"><path d="M174 261q0-80 100-86 108-4 131 89 51 4 72-39 28 41 1 69 41 3 52 31-69 24-121-14-54 67-144 29-81-4-91-79Z" fill="#9EBBC9" /><path d="M177 283q35 31 83 14 57 60 138 14-48 64-133 29-69-4-88-57Z" fill="#D9E4DD" stroke="none" /><path d="M312 292q-12 40 20 47 18 1 24-14" fill="#8BABBD" /><path d="M200 280q15 15 30 0" fill="none" strokeWidth="3" /><circle cx="221" cy="253" r="5" fill={ink} stroke="none" /><ellipse cx="244" cy="275" rx="12" ry="6" fill="#DDB4AF" stroke="none" /></g>
      <path d="M286 167v-33q-1-24-23-15m23 27q12-36 30-20m-30 14q-16-41-28-36" fill="none" stroke="#8DBDCA" strokeWidth="7" strokeLinecap="round" />
      <g fill="#D2E9E6"><circle cx="159" cy="218" r="8" /><circle cx="132" cy="190" r="5" /><circle cx="472" cy="357" r="7" /><circle cx="494" cy="341" r="4" /></g>
      <g fill="none" stroke="#C9E6DF" strokeWidth="4" strokeLinecap="round"><path d="M31 324q28 8 54 0m31 46q24 7 49 0m342-8q31 7 62-2M259 392q29 8 58 0" /></g>
      <g fill="#E9BD97" stroke={ink} strokeWidth="2"><path d="M71 285q19-22 41 0-22 20-41 0Zm41 0 11-10v21Z" /><path d="M523 265q20-21 41 0-21 19-41 0Zm41 0 11-10v21Z" /></g><g fill={ink}><circle cx="80" cy="282" r="2" /><circle cx="532" cy="262" r="2" /></g>
      <Sparkle x={118} y={245} size={9} /><Sparkle x={447} y={183} size={10} />
    </>}
    {kind === "peace" && <>
      <path d="M0 265q133-95 284-14 176-85 356-12v181H0Z" fill="#99B4A0" /><path d="M0 342q153-84 295-19 169-71 345-13v110H0Z" fill="#7EAA94" />
      <Tree x={87} y={264} scale={1.15} color="#87A899" /><Tree x={552} y={269} scale={.8} color="#91B09B" />
      <ellipse cx="328" cy="349" rx="130" ry="31" fill="#6C9885" /><path d="M205 345q118-46 243 0-28 42-124 42-95-4-119-42Z" fill="#E8C5A1" stroke={ink} strokeWidth="3" />
      <SmallSheep x={319} y={287} scale={1.65} sleep /><path d="M245 315q83-45 166 9l-12 29q-75 26-159-1Z" fill="#E3B4A5" stroke={ink} strokeWidth="2.5" /><g fill="none" stroke="#F6D4BD" strokeWidth="3"><path d="m265 318 12 35m15-43 13 50m15-51 10 52m18-49 10 43m18-33 7 27" /></g>
      <g fill="#FFF0BD" fontFamily="sans-serif" fontWeight="bold"><text x="387" y="242" fontSize="23" transform="rotate(12 387 242)">z</text><text x="414" y="217" fontSize="29" transform="rotate(12 414 217)">z</text><text x="450" y="189" fontSize="35" transform="rotate(12 450 189)">z</text></g>
      <TinyFlower x={151} y={356} scale={.8} color="#D2B4BD" /><TinyFlower x={497} y={367} scale={1} color="#D9B9B2" />
    </>}
  </svg>;
}

const stickerGlyphs = ["star", "rainbow", "sheep", "heart", "moon", "sun", "flower", "boat", "fish", "tree", "star", "heart", "rainbow", "flower", "sun", "sheep", "boat", "moon", "tree", "fish", "heart", "rainbow", "star", "sun", "flower", "boat", "sheep", "fish", "moon", "tree"];

export function StickerArt({ index = 0, className = "" }: { index?: number; className?: string }) {
  const glyph = stickerGlyphs[index % stickerGlyphs.length];
  if (glyph === "star") return <Lumo className={className} mood="cheering" />;
  if (glyph === "sheep") return <Pip className={className} mood="cheering" />;
  return <svg viewBox="0 0 180 180" className={className} role="img" aria-label={`A cheerful ${glyph} sticker`}><g stroke={ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    {glyph === "heart" && <><path d="M90 147Q24 107 28 65q4-36 35-29 17 3 27 22 14-25 38-23 33 1 27 35-2 35-65 77Z" fill="#F2AF9D" /><path d="M45 64q2-16 17-13" fill="none" stroke="#FFD7BC" strokeWidth="6" /></>}
    {glyph === "rainbow" && <><g fill="none" strokeWidth="17"><path d="M27 125a63 63 0 0 1 126 0" stroke="#EDAC9D" /><path d="M44 125a46 46 0 0 1 92 0" stroke="#F3D17E" /><path d="M61 125a29 29 0 0 1 58 0" stroke="#A6CEAC" /></g><Cloud x={10} y={111} scale={.65} /><Cloud x={112} y={111} scale={.65} /></>}
    {glyph === "moon" && <><path d="M119 30q-30 42 2 70 15 13 38 10-26 57-76 32-51-27-29-75 20-35 65-37Z" fill="#FBE097" /><Sparkle x={133} y={51} size={13} /><Sparkle x={155} y={80} size={7} /></>}
    {glyph === "sun" && <><path d="M90 17v14m0 118v14M17 90h14m118 0h14M38 38l10 10m84 84 10 10M38 142l10-10m84-84 10-10" stroke="#DDB364" strokeWidth="7" /><circle cx="90" cy="90" r="45" fill="#FFD96F" /></>}
    {glyph === "flower" && <><path d="M90 103v55m0-22q-40-4-32-27 30-2 32 27m0 9q40-4 32-27-30-2-32 27" fill="#AACDA0" /><g fill="#F4B9A6"><circle cx="90" cy="36" r="24" /><circle cx="120" cy="57" r="24" /><circle cx="109" cy="91" r="24" /><circle cx="71" cy="91" r="24" /><circle cx="60" cy="57" r="24" /></g><circle cx="90" cy="65" r="24" fill="#FFDA7C" /></>}
    {glyph === "boat" && <><path d="M32 110h119l-22 35H58Z" fill="#D3A17B" /><path d="M88 28v82m-2-74L41 98h45m8-57 47 57H94" fill="#F8D99C" /><path d="M25 157q15 9 30 0 16 9 31 0 16 9 31 0 16 9 31 0" fill="none" stroke="#93BFCC" /></>}
    {glyph === "fish" && <><path d="M27 89q58-69 112 0-54 68-112 0Zm112 0 21-26v52Z" fill="#A8D4DB" /><path d="m72 44 22-15 11 20m-27 84 23 13 4-19" fill="#8ABBC9" /><path d="M78 61q17 28 0 58" fill="none" stroke="#7EAEBD" strokeWidth="3" /></>}
    {glyph === "tree" && <><path d="M88 93v65m0-27-22-19m22 9 21-21" fill="none" stroke="#B48E68" strokeWidth="12" /><path d="M40 88q-22-20-6-40 2-29 31-26 21-24 43-3 28-8 34 21 26 12 8 37 0 27-30 28-25 19-43-1-26 12-37-16Z" fill="#B5D7A5" /><circle cx="60" cy="59" r="8" fill="#E9AD8F" strokeWidth="2" /><circle cx="117" cy="71" r="8" fill="#E9AD8F" strokeWidth="2" /></>}
    {["heart", "moon", "sun", "fish"].includes(glyph) && <g strokeWidth="3"><Eye x={glyph === "fish" ? 51 : glyph === "moon" ? 70 : 76} y={glyph === "moon" ? 95 : 84} /><Eye x={glyph === "fish" ? 66 : glyph === "moon" ? 94 : 104} y={glyph === "moon" ? 95 : 84} /><path d={glyph === "moon" ? "M75 108q8 9 16 0" : glyph === "fish" ? "M50 100q7 7 13 0" : "M81 99q9 11 18 0"} fill="none" /></g>}
  </g><Sparkle x={22} y={28} size={7} /><Sparkle x={157} y={145} size={6} /></svg>;
}
