'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Eraser, RotateCcw, Undo2 } from 'lucide-react';

const PALETTE = ['#FFD93D', '#F7A281', '#F49AB3', '#B4A4DE', '#A8D8EA', '#7EBCD2', '#A2CEA0', '#C99A73'];
const PAPER = '#FFF8E7';
const WIDTH = 900;
const HEIGHT = 580;

function paintOutline(ctx: CanvasRenderingContext2D, scene: string) {
  ctx.strokeStyle = '#615344';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const line = (draw: () => void) => { ctx.beginPath(); draw(); ctx.stroke(); };
  // Big, friendly shapes leave plenty of room for little fingers.
  line(() => { ctx.moveTo(0, 470); ctx.bezierCurveTo(160, 340, 285, 480, 450, 433); ctx.bezierCurveTo(650, 350, 760, 405, 900, 470); });
  if (scene !== 'stars') {
    for (const radius of [145, 120, 95]) line(() => ctx.arc(260, 245, radius, Math.PI, 0));
    line(() => { ctx.moveTo(114, 245); ctx.lineTo(165, 245); });
    line(() => { ctx.moveTo(355, 245); ctx.lineTo(407, 245); });
  }
  line(() => {
    ctx.moveTo(635, 103); ctx.lineTo(653, 145); ctx.lineTo(699, 150); ctx.lineTo(663, 181);
    ctx.lineTo(674, 227); ctx.lineTo(635, 203); ctx.lineTo(596, 227); ctx.lineTo(607, 181);
    ctx.lineTo(571, 150); ctx.lineTo(617, 145); ctx.closePath();
  });
  ctx.fillStyle = '#615344';
  for (const x of [622, 648]) { ctx.beginPath(); ctx.arc(x, 168, 3.5, 0, Math.PI * 2); ctx.fill(); }
  line(() => ctx.arc(635, 177, 10, 0.2, Math.PI - 0.2));
  line(() => { ctx.moveTo(606, 340); ctx.bezierCurveTo(585, 304, 548, 330, 565, 353); ctx.lineTo(605, 390); ctx.lineTo(647, 351); ctx.bezierCurveTo(666, 320, 624, 305, 606, 340); });

  if (scene === 'ark') {
    // A big boat, three round animal faces, and a rainbow promise.
    line(() => { ctx.moveTo(228, 366); ctx.lineTo(559, 366); ctx.quadraticCurveTo(537, 465, 476, 470); ctx.lineTo(312, 470); ctx.quadraticCurveTo(251, 458, 228, 366); ctx.closePath(); });
    line(() => { ctx.moveTo(283, 365); ctx.lineTo(283, 326); ctx.quadraticCurveTo(283, 316, 294, 316); ctx.lineTo(493, 316); ctx.quadraticCurveTo(505, 316, 505, 328); ctx.lineTo(505, 365); });
    line(() => { ctx.moveTo(255, 316); ctx.lineTo(394, 269); ctx.lineTo(532, 316); });
    for (const x of [320, 393, 466]) {
      line(() => ctx.arc(x, 398, 17, 0, Math.PI * 2));
      line(() => { ctx.moveTo(x - 24, 291); ctx.quadraticCurveTo(x - 43, 260, x - 19, 267); });
      line(() => { ctx.moveTo(x + 24, 291); ctx.quadraticCurveTo(x + 43, 260, x + 19, 267); });
      line(() => ctx.ellipse(x, 293, 26, 25, 0, 0, Math.PI * 2));
      for (const eye of [x - 9, x + 9]) { ctx.beginPath(); ctx.arc(eye, 290, 3, 0, Math.PI * 2); ctx.fill(); }
      line(() => ctx.arc(x, 296, 8, 0.2, Math.PI - 0.2));
    }
    for (const [y, start] of [[491, 169], [515, 228]]) {
      line(() => { ctx.moveTo(start, y); ctx.bezierCurveTo(start + 80, y - 20, start + 160, y + 20, start + 240, y); ctx.bezierCurveTo(start + 320, y - 20, start + 400, y + 20, start + 480, y); });
    }
    return;
  }

  if (scene === 'stars') {
    // A cozy desert tent under Abraham's wide, wonderful sky.
    line(() => { ctx.moveTo(224, 100); ctx.bezierCurveTo(105, 88, 103, 246, 229, 237); ctx.bezierCurveTo(151, 221, 149, 125, 224, 100); ctx.closePath(); });
    line(() => { ctx.moveTo(250, 448); ctx.lineTo(410, 251); ctx.lineTo(561, 448); ctx.closePath(); });
    line(() => { ctx.moveTo(410, 251); ctx.lineTo(407, 448); });
    line(() => { ctx.moveTo(333, 448); ctx.lineTo(407, 351); ctx.lineTo(481, 448); });
    line(() => { ctx.moveTo(250, 448); ctx.lineTo(214, 457); ctx.lineTo(214, 471); });
    line(() => { ctx.moveTo(561, 448); ctx.lineTo(594, 457); ctx.lineTo(594, 471); });
    for (const [x, y] of [[390, 130], [457, 202], [767, 285], [705, 93], [128, 336]]) {
      line(() => { ctx.moveTo(x, y - 17); ctx.quadraticCurveTo(x + 3, y - 3, x + 17, y); ctx.quadraticCurveTo(x + 3, y + 3, x, y + 17); ctx.quadraticCurveTo(x - 3, y + 3, x - 17, y); ctx.quadraticCurveTo(x - 3, y - 3, x, y - 17); });
    }
    return;
  }

  if (scene === 'sea') {
    line(() => ctx.ellipse(365, 370, 125, 75, 0, 0, Math.PI * 2));
    line(() => { ctx.moveTo(484, 347); ctx.lineTo(560, 302); ctx.lineTo(551, 432); ctx.lineTo(484, 393); });
    line(() => { ctx.moveTo(350, 303); ctx.quadraticCurveTo(347, 261, 403, 300); });
    line(() => { ctx.moveTo(350, 442); ctx.quadraticCurveTo(378, 490, 410, 438); });
    ctx.beginPath(); ctx.arc(298, 356, 6, 0, Math.PI * 2); ctx.fill();
    line(() => ctx.arc(300, 373, 19, 0.2, Math.PI - 0.2));
    for (const [x, y, radius] of [[185, 365, 15], [152, 310, 20], [183, 258, 11], [691, 454, 15]]) line(() => ctx.arc(x, y, radius, 0, Math.PI * 2));
    line(() => { ctx.moveTo(105, 494); ctx.bezierCurveTo(230, 455, 322, 529, 447, 492); ctx.bezierCurveTo(550, 462, 680, 523, 795, 490); });
    return;
  }

  if (scene === 'garden' || scene === 'kindness') {
    for (const [x, y, radius] of [[305, 335, 30], [451, 304, 36], [720, 390, 24]]) {
      line(() => { ctx.moveTo(x, y + radius * 1.7); ctx.lineTo(x, 486); });
      line(() => { ctx.moveTo(x, 456); ctx.quadraticCurveTo(x - 60, 416, x - 65, 444); ctx.quadraticCurveTo(x - 38, 475, x, 456); });
      line(() => { ctx.moveTo(x, 435); ctx.quadraticCurveTo(x + 55, 390, x + 59, 423); ctx.quadraticCurveTo(x + 37, 451, x, 435); });
      for (let i = 0; i < 5; i++) {
        const angle = i * Math.PI * 2 / 5 - Math.PI / 2;
        line(() => ctx.arc(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, radius * 0.7, 0, Math.PI * 2));
      }
      line(() => ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2));
    }
    return;
  }

  // A very fluffy Pip.
  line(() => {
    ctx.moveTo(332, 385); ctx.bezierCurveTo(305, 380, 307, 347, 330, 339);
    ctx.bezierCurveTo(316, 313, 340, 294, 362, 302); ctx.bezierCurveTo(368, 275, 400, 270, 416, 291);
    ctx.bezierCurveTo(443, 271, 469, 290, 468, 313); ctx.bezierCurveTo(503, 311, 516, 340, 498, 360);
    ctx.bezierCurveTo(519, 384, 498, 413, 473, 409); ctx.bezierCurveTo(451, 432, 429, 416, 421, 411);
    ctx.bezierCurveTo(390, 432, 369, 418, 365, 405); ctx.bezierCurveTo(343, 416, 322, 404, 332, 385);
  });
  line(() => { ctx.moveTo(365, 407); ctx.lineTo(361, 453); ctx.quadraticCurveTo(375, 462, 388, 453); ctx.lineTo(391, 420); });
  line(() => { ctx.moveTo(447, 420); ctx.lineTo(454, 453); ctx.quadraticCurveTo(469, 464, 482, 452); ctx.lineTo(477, 408); });
  line(() => ctx.ellipse(416, 355, 51, 49, 0, 0, Math.PI * 2));
  line(() => ctx.ellipse(361, 345, 19, 34, -0.7, 0, Math.PI * 2));
  line(() => ctx.ellipse(471, 345, 19, 34, 0.7, 0, Math.PI * 2));
  for (const x of [400, 432]) { ctx.beginPath(); ctx.arc(x, 354, 4, 0, Math.PI * 2); ctx.fill(); }
  line(() => { ctx.moveTo(410, 371); ctx.quadraticCurveTo(416, 378, 423, 371); });
  for (const x of [130, 725, 790]) {
    line(() => { ctx.moveTo(x, 503); ctx.lineTo(x, 465); });
    line(() => { ctx.moveTo(x, 484); ctx.quadraticCurveTo(x - 21, 466, x - 23, 487); ctx.quadraticCurveTo(x - 9, 493, x, 484); });
    line(() => ctx.arc(x, 454, 12, 0, Math.PI * 2));
  }
}

export function ColoringCanvas({ onFinish, storyTitle, scene = 'sheep', busy = false }: { onFinish: (dataUrl: string) => void; storyTitle: string; scene?: string; busy?: boolean }) {
  const drawing = useRef<HTMLCanvasElement>(null);
  const outline = useRef<HTMLCanvasElement>(null);
  const pointer = useRef<number | null>(null);
  const previous = useRef<{ x: number; y: number } | null>(null);
  const undo = useRef<ImageData[]>([]);
  const [color, setColor] = useState(PALETTE[0]);
  const [brushSize, setBrushSize] = useState(28);
  const [undoCount, setUndoCount] = useState(0);
  const [saved, setSaved] = useState(false);

  const reset = useCallback(() => {
    const ctx = drawing.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }, []);

  useEffect(() => {
    reset();
    const ctx = outline.current?.getContext('2d');
    if (ctx) { ctx.clearRect(0, 0, WIDTH, HEIGHT); paintOutline(ctx, scene); }
    undo.current = []; setUndoCount(0); setSaved(false);
  }, [reset, scene]);

  const snapshot = () => {
    const ctx = drawing.current?.getContext('2d');
    if (!ctx) return;
    undo.current.push(ctx.getImageData(0, 0, WIDTH, HEIGHT));
    if (undo.current.length > 25) undo.current.shift();
    setUndoCount(undo.current.length);
    setSaved(false);
  };

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * WIDTH, y: ((e.clientY - rect.top) / rect.height) * HEIGHT };
  };

  const stroke = (p: { x: number; y: number }) => {
    const ctx = drawing.current?.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = brushSize;
    ctx.beginPath();
    if (previous.current) { ctx.moveTo(previous.current.x, previous.current.y); ctx.lineTo(p.x, p.y); ctx.stroke(); }
    else { ctx.arc(p.x, p.y, brushSize / 2, 0, Math.PI * 2); ctx.fill(); }
    previous.current = p;
  };

  const getPicture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH; canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');
    if (ctx && drawing.current && outline.current) { ctx.drawImage(drawing.current, 0, 0); ctx.drawImage(outline.current, 0, 0); }
    return canvas.toDataURL('image/png');
  };

  const download = () => {
    const link = document.createElement('a');
    link.download = `little-lights-${storyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    link.href = getPicture(); link.click(); setSaved(true);
  };

  return <div className="space-y-5">
    <div className="relative overflow-hidden rounded-[28px] border-[3px] border-[#D9CCB8] bg-[#FFF8E7] shadow-[0_5px_0_#E9DFCC]">
      <canvas ref={drawing} width={WIDTH} height={HEIGHT} aria-label="Coloring canvas. Draw with your finger or mouse." role="img" className="block w-full cursor-crosshair touch-none"
        onPointerDown={e => { if (e.button !== 0 || pointer.current !== null) return; e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); pointer.current = e.pointerId; snapshot(); previous.current = null; stroke(point(e)); }}
        onPointerMove={e => { if (pointer.current === e.pointerId) { e.preventDefault(); stroke(point(e)); } }}
        onPointerUp={e => { if (pointer.current === e.pointerId) { pointer.current = null; previous.current = null; } }}
        onPointerCancel={e => { if (pointer.current === e.pointerId) { pointer.current = null; previous.current = null; } }}
        onLostPointerCapture={e => { if (pointer.current === e.pointerId) { pointer.current = null; previous.current = null; } }} />
      <canvas ref={outline} width={WIDTH} height={HEIGHT} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
    <div className="flex flex-wrap items-center justify-center gap-3" role="group" aria-label="Color palette">
      {PALETTE.map(c => <button key={c} aria-label={`Select ${({ '#FFD93D': 'sunshine yellow', '#F7A281': 'peach', '#F49AB3': 'pink', '#B4A4DE': 'lilac', '#A8D8EA': 'sky blue', '#7EBCD2': 'blue', '#A2CEA0': 'sage green', '#C99A73': 'warm brown' } as Record<string, string>)[c]}`} aria-pressed={color === c} onClick={() => setColor(c)} style={{ backgroundColor: c }} className={`h-10 w-10 rounded-full border-[3px] transition-transform hover:-translate-y-1 active:scale-90 ${color === c ? 'scale-110 border-[#5E5548] ring-4 ring-[#FFD93D]/30' : 'border-[#776956]/20'}`} />)}
      <button type="button" title="Eraser" aria-label="Eraser" aria-pressed={color === PAPER} onClick={() => setColor(PAPER)} className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] ${color === PAPER ? 'border-[#5E5548] bg-[#FFE4C4]' : 'border-[#D9CCB8] bg-[#FFF8E7]'}`}><Eraser size={19} /></button>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-[#756B5D]">
      <div className="flex items-center gap-2"><span>Brush</span><input aria-label="Brush size" type="range" min={10} max={55} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-24 accent-[#91B797]" /></div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1 rounded-2xl px-3 py-2 hover:bg-[#FFE4C4] disabled:opacity-30" disabled={!undoCount} onClick={() => { const state = undo.current.pop(); const ctx = drawing.current?.getContext('2d'); if (state && ctx) ctx.putImageData(state, 0, 0); setUndoCount(undo.current.length); setSaved(false); }}><Undo2 size={16} />Undo</button>
        <button className="flex items-center gap-1 rounded-2xl px-3 py-2 hover:bg-[#FFE4C4]" onClick={() => { snapshot(); reset(); }}><RotateCcw size={16} />Reset</button>
        <button className="flex items-center gap-1 rounded-2xl px-3 py-2 hover:bg-[#FFE4C4]" onClick={download}><Download size={16} />{saved ? 'Saved!' : 'Save art'}</button>
      </div>
    </div>
    <button disabled={busy} onClick={() => onFinish(getPicture())} className="btn w-full bg-[#FFD93D] px-6 py-4 text-lg font-extrabold text-[#55492F] disabled:opacity-60">{busy ? 'Saving your little masterpiece…' : 'Add to my sticker book ✨'}</button>
    <p className="text-center text-xs text-[#887B69]">Use Save art to download a copy for your family’s fridge.</p>
  </div>;
}
