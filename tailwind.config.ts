import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { cream: '#FFF8E7', ink: '#423B32', sky: '#A8D8EA', peach: '#FFE4C4', sunshine: '#FFD93D', sage: '#C3E8BD' }, fontFamily: { display: ['var(--font-fredoka)', 'sans-serif'], sans: ['var(--font-nunito)', 'sans-serif'] } } },
  plugins: []
} satisfies Config;
