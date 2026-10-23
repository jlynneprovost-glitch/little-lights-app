'use client';

import { motion, useReducedMotion } from 'framer-motion';

const stars = [
  [4, 17, 23], [15, 37, 15], [28, 11, 18], [39, 62, 15], [48, 24, 19],
  [62, 9, 25], [73, 44, 17], [85, 19, 21], [94, 59, 23], [9, 84, 20],
];

export function BedtimeBackground() {
  const reduced = useReducedMotion();
  return <div className="bedtime-background" aria-hidden="true">
    <span className="bedtime-blob bedtime-blob-peach" />
    <span className="bedtime-blob bedtime-blob-blue" />
    <span className="bedtime-blob bedtime-blob-yellow" />
    {stars.map(([left, top, size], index) => <motion.span
      key={index} data-testid="twinkle-star" className="world-twinkle"
      style={{ left: left + '%', top: top + '%', width: size, height: size }}
      initial={{ opacity: .6, scale: 1, rotate: 0 }} animate={reduced ? { opacity: .6, scale: 1, rotate: 0 } : { opacity: [.25, .85, .25], scale: [.8, 1.15, .8], rotate: [-8, 8, -8] }}
      transition={reduced ? { duration: 0 } : { duration: 2 + index % 3, repeat: Infinity, delay: index * .25 }}
    ><svg viewBox="0 0 30 30"><path d="m15 1 4 9 10 1-7 7 2 11-9-5-9 5 2-11-7-7 10-1Z" fill="currentColor" /></svg></motion.span>)}
    {[0, 1, 2].map(index => <motion.svg key={index} viewBox="0 0 160 70" className={'bedtime-cloud bedtime-cloud-' + index}
      initial={{ x: 0, y: 0 }} animate={reduced ? { x: 0, y: 0 } : { x: [0, 35, 0], y: [0, -10, 0] }}
      transition={reduced ? { duration: 0 } : { duration: 18 + index * 6, repeat: Infinity, ease: 'easeInOut' }}>
      <path d="M17 58C-2 58-1 31 17 28c-3-25 33-32 45-12C80-6 117 3 119 29c31-7 44 29 18 30Z" fill="#FFFDFA" stroke="#E9DECA" strokeWidth="2" />
    </motion.svg>)}
  </div>;
}
